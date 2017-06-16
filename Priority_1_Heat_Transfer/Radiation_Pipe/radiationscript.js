/*
 * File: radiationscript.js
 * Purpose: To provide the animations and interactivity for the Radiation Activity
 * Author: Daniel Prudente (June 2012)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2012
*/


/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/

$(document).ready(init);

// constants
var minSteamTemp = 100;
var maxSteamTemp = 200;
var minRoomTemp = 10;
var maxRoomTemp = 30;
var minHeatTransferCoeff = 1;
var maxHeatTransferCoeff = 50;
var maxEmissivity = 1;
var minEmissivity = 0.01;
var waterDensity = 1000; //kg/m^3
var stefanBoltzConst = 5.670373 * Math.pow(10,-8);
var QVapWater = 2260; // J/g or kJ/kg

var circumference = .1016; // meters, pipes in basement had a measurement of 4 inch circumference
var length = 1; // m
var radius = circumference / (2 * Math.PI);
var volume = Math.PI * radius * radius * length;
var mass = waterDensity * volume;
var energyNeeded = QVapWater * mass * 1000; // in joules

var emissivityCopper = .03;
var emissivityBlackPaint = .98;
var emissivityWhitePaint = .9;

// variables to hold inputs and calculation results
var advanced;
var steamTemp;
var roomTemp;
var heatTransferCoeff;
var customEmissivity;
var pipeType;
var pipeType2;
var simulationTime; // in milliseconds; used for animation purposes
var simulationTime2; // in milliseconds; used for animation purposes

/*
*************************************************************************************************************************
*													Initialization														*
*************************************************************************************************************************
*/

/*
 * Function: init
 * Sets up the page when it is loaded, hiding elements that aren't supposed to be visible right away, and
 * attaching event handlers. Also clears all input and output fields.
*/
function init() {
	// Initializes both pipes to be black
	$("#whiteUpperPipe").hide();
	$("#goldUpperPipe").hide();
	$("#whiteUpperPipe2").hide();
	$("#goldUpperPipe2").hide();
	$("#whiteBottomPipe").hide();
	$("#goldBottomPipe").hide();
	$("#whiteBottomPipe2").hide();
	$("#goldBottomPipe2").hide();
	$("#customUpperPipe").hide();
	$("#customBottomPipe").hide();
	$("#fullSign").hide();
	$("#fullSign2").hide();
	pipeType = "black";
	pipeType2 = "black";

	// clear input fields
	$("#steamTemp").val("");
	$("#roomTemp").val("");
	$("#heatTransferCoeff").val("");
	steamTemp = NaN;
	roomTemp = NaN;
	heatTransferCoeff = NaN;

	// clear output fields
	$("#timeFill").html("");
	$("#timeFill2").html("");

	// make sure reset, skip, and black button selectors are disabled (in case the user refreshes the page while some elements are enabled)
	$("#resetButton").attr("disabled", "disabled");
  	$("#skipButton").attr("disabled", "disabled");
	$("#blackButton").attr("disabled", "disabled");
	$("#blackButton2").attr("disabled", "disabled");

	// sets up and hides the customization options
	advanced = false;
	$("#customButton").hide();
	$("#emissivity").hide();
	$("#emissivity").attr("disabled", "disabled");
	$("#emissivity").val(".98");
	customEmissivity = .98;
	$("#funFactsDiv").hide();
	$("#basicButton").hide();
	$("#emissivityLimit").hide();

	// updates text underneath the select buttons
	$("#pipeTypeText").html("Black (Parsons) Paint");
	$("#pipeTypeText2").html("Black (Parsons) Paint");

	// make sure at start both white and both gold buttons are enabled as well as the input boxes (in case the user refreshes the page while some elements are disabled)
	$("#startButton").removeAttr("disabled");
	$("#whiteButton").removeAttr("disabled");
	$("#goldButton").removeAttr("disabled");
	$("#whiteButton2").removeAttr("disabled");
	$("#goldButton2").removeAttr("disabled");
	$("#steamTemp").removeAttr("disabled");
	$("#roomTemp").removeAttr("disabled");
	$("#heatTransferCoeff").removeAttr("disabled");
	$("#customButton").removeAttr("disabled");

	// register event handlers
	$("#help").on('click', displayHelp);
	$("#steamTemp").on('change', getSteamTemp);
	$("#roomTemp").on('change', getRoomTemp);
	$("#heatTransferCoeff").on('change', getHeatTransferCoeff);
	$("#emissivity").on('change', getEmissivity);
	$("#resetButton").on('click', resetSimulation);
	$("#skipButton").on('click', skip);
	$("#startButton").on('click', startSimulation);
	$("#blackButton").on('click', changeToBlack);
	$("#whiteButton").on('click', changeToWhite);
	$("#goldButton").on('click', changeToGold);
	$("#customButton").on('click', changeToCustom);
	$("#blackButton2").on('click', changeToBlack2);
	$("#whiteButton2").on('click', changeToWhite2);
	$("#goldButton2").on('click', changeToGold2);
	$("#advancedButton").on('click', changeToAdvanced);
	$('#infoButton').on('click', displayAboutInfo);
	$('#helpButton').on('click', displayHelp);
}

/*
*************************************************************************************************************************
*													Event Handlers														*
*************************************************************************************************************************
*/

/*
 * Event Handler Function: getSteamTemp
 * Called when the user inputs a new value into the steamTemp field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getSteamTemp() {
	var input = $("#steamTemp").val();

	// if the entered value is not a valid number, keep the current steam temperature and display that number in the input field.
	// if no valid pump rate as been entered, clear the input field
	if(isNaN(input) || input == "") {
		if(!isNaN(steamTemp)) {
			$("#steamTemp").val(steamTemp);
		}
		else {
			$("#steamTemp").val("");
		}
	}
	// if the input is outside the valid range, set the steam temperature to the highest/lowest valid value
	// and update the display accordingly
	else if(input > maxSteamTemp) {
		steamTemp = maxSteamTemp;
		$("#steamTemp").val(maxSteamTemp);
	}
	else if(input < minSteamTemp) {
		steamTemp = minSteamTemp;
		$("#steamTemp").val(minSteamTemp);
	}
	// if input is valid, set pumpRate
	else {
		steamTemp = input;
	}
}

/*
 * Event Handler Function: getRoomTemp
 * Called when the user inputs a new value into the roomTemp field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getRoomTemp() {
	var input = $("#roomTemp").val();

	// if the entered value is not a valid number, keep the current room temperature and display that number in the input field.
	// if no valid pump rate as been entered, clear the input field
	if(isNaN(input) || input == "") {
		if(!isNaN(roomTemp)) {
			$("#roomTemp").val(roomTemp);
		}
		else {
			$("#roomTemp").val("");
		}
	}
	// if the input is outside the valid range, set the room temperature to the highest/lowest valid value
	// and update the display accordingly
	else if(input > maxRoomTemp) {
		roomTemp = maxRoomTemp;
		$("#roomTemp").val(maxRoomTemp);
	}
	else if(input < minRoomTemp) {
		roomTemp = minRoomTemp;
		$("#roomTemp").val(minRoomTemp);
	}
	// if input is valid, set pumpRate
	else {
		roomTemp = input;
	}
}

/*
 * Event Handler Function: getHeatTransferCoeff
 * Called when the user inputs a new value into the heatTransferCoeff field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getHeatTransferCoeff() {
	var input = $("#heatTransferCoeff").val();

	// if the entered value is not a valid number, keep the current heat transfer coefficient and display that number in the input field.
	// if no valid pump rate as been entered, clear the input field
	if(isNaN(input) || input == "") {
		if(!isNaN(heatTransferCoeff)) {
			$("#heatTransferCoeff").val(heatTransferCoeff);
		}
		else {
			$("#heatTransferCoeff").val("");
		}
	}
	// if the input is outside the valid range, set the heat transfer coefficient to the highest/lowest valid value
	// and update the display accordingly
	else if(input > maxHeatTransferCoeff) {
		heatTransferCoeff = maxHeatTransferCoeff;
		$("#heatTransferCoeff").val(maxHeatTransferCoeff);
	}
	else if(input < minHeatTransferCoeff) {
		heatTransferCoeff = minHeatTransferCoeff;
		$("#heatTransferCoeff").val(minHeatTransferCoeff);
	}
	// if input is valid, set the heat transfer coefficient
	else {
		heatTransferCoeff = input;
	}
}

/*
 * Event Handler Function: getEmissivity
 * Called when the user inputs a new value into the emissivity field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getEmissivity() {
	var input = $("#emissivity").val();

	// if the entered value is not a valid number, keep the current emissivity and display that number in the input field.
	// if no valid pump rate as been entered, clear the input field
	if(isNaN(input) || input == "") {
		if(!isNaN(customEmissivity)) {
			$("#emissivity").val(customEmissivity);
		}
		else {
			$("#emissivity").val("");
		}
	}
	// if the input is outside the valid range, set the heat transfer coefficient to the highest/lowest valid value
	// and update the display accordingly
	else if(input > maxEmissivity) {
		customEmissivity = maxEmissivity;
		$("#emissivity").val(maxEmissivity);
	}
	else if(input < minEmissivity) {
		customEmissivity = minEmissivity;
		$("#emissivity").val(minEmissivity);
	}
	// if input is valid, set the heat transfer coefficient
	else {
		customEmissivity = input;
	}
	if (customEmissivity < .05) {
		$("#funFact").html("At this temperature, this emissivity is around the range of polished gold and silver");
	} else if (customEmissivity < .15) {
		$("#funFact").html("At this temperature, this emissivity is around the range of polished chromium.")
	} else if (customEmissivity < .25) {
		$("#funFact").html("At this temperature, this emissivity is around the range of stainless steel.");
	} else if (customEmissivity < .55) {
		$("#funFact").html("At this temperature, there aren't really many materials that have this emissivity.");
	} else if (customEmissivity < .75) {
		$("#funFact").html("At this temperature, this emissivity is around the range of anodized aluminum, a material that is greatly used as the outer shell of Apple products such as the iPad and Macbook Pro.");
	} else if (customEmissivity < .95) {
		$("#funFact").html("At this temperature, this emissivity is around the range of Teflon.");
	} else if (customEmissivity < 1) {
		$("#funFact").html("At this temperature, this emissivity is around the range of human skin which is not recommended as a material for piping.");
	} else {
		$("#funFact").html("The only thing to have an emissivity value of 1 is a true black body. This ideal object would absorb all incident electromagnetic radiation.");
	}
	$("#funFactsDiv").show();
	$("#funFact").show();
	$("#funFactTitle").show();
}

/*
 * Event Handler Function: changeToBlack
 * Called when the user clicks the left "black" button
 *
 * Changes the case 1 pipe to a black pipe
*/
function changeToBlack() {
	// enables the vision of the black upper and bottom pipe
	$("#blackUpperPipe").show();
	$("#blackBottomPipe").show();

	// disables the vision of the white and gold upper and bottom pipes
	$("#whiteUpperPipe").hide();
	$("#goldUpperPipe").hide();
	$("#whiteBottomPipe").hide();
	$("#goldBottomPipe").hide();
	$("#funFactsDiv").hide();
	$("#customUpperPipe").hide();
	$("#customBottomPipe").hide();

	// disables the black button
	$("#blackButton").attr("disabled", "disabled");

	// enables the white, gold, and custom buttons
	$("#whiteButton").removeAttr("disabled");
	$("#goldButton").removeAttr("disabled");
	$("#customButton").removeAttr("disabled");

	// gives the attribute of the pipe type to black
	pipeType = "black";

	// updates text underneath the button
	$("#pipeTypeText").html("Black (Parsons) Paint");

	// changes the value of the box but then disables it
	customEmissivity = .98;
	$("#emissivity").val(".98");
	$("#emissivity").attr("disabled", "disabled");
}

/*
 * Event Handler Function: changeToWhite
 * Called when the user clicks the left "white" button
 *
 * Changes the case 1 pipe to a white pipe
*/
function changeToWhite() {
	// enables the vision of the white upper and bottom pipe
	$("#whiteUpperPipe").show();
	$("#whiteBottomPipe").show();

	// disables the vision of the white and gold upper and bottom pipes
	$("#blackUpperPipe").hide();
	$("#goldUpperPipe").hide();
	$("#blackBottomPipe").hide();
	$("#goldBottomPipe").hide();
	$("#funFactsDiv").hide();
	$("#customUpperPipe").hide();
	$("#customBottomPipe").hide();

	// disables the white button
	$("#whiteButton").attr("disabled", "disabled");

	// enables the black, gold, and custom buttons
	$("#blackButton").removeAttr("disabled");
	$("#goldButton").removeAttr("disabled");
	$("#customButton").removeAttr("disabled");

	// gives the attribute of the pipe type to white
	pipeType = "white";

	// updates text underneath the button
	$("#pipeTypeText").html("White Acrylic Paint");

	// disables emissivity box (but also shows the value)
	customEmissivity = .9;
	$("#emissivity").val(".9");
	$("#emissivity").attr("disabled", "disabled");
}


/*
 * Event Handler Function: changeToGold
 * Called when the user clicks the left "gold" button
 *
 * Changes the case 1 pipe to a gold pipe
*/
function changeToGold() {
	// enables the vision of the gold upper and bottom pipe
	$("#goldUpperPipe").show();
	$("#goldBottomPipe").show();

	// disables the vision of the white and gold upper and bottom pipes
	$("#whiteUpperPipe").hide();
	$("#blackUpperPipe").hide();
	$("#whiteBottomPipe").hide();
	$("#blackBottomPipe").hide();
	$("#funFactsDiv").hide();
	$("#customUpperPipe").hide();
	$("#customBottomPipe").hide();

	// disables the gold button
	$("#goldButton").attr("disabled", "disabled");

	// enables the white, black, and custom buttons
	$("#whiteButton").removeAttr("disabled");
	$("#blackButton").removeAttr("disabled");
	$("#customButton").removeAttr("disabled");

	// gives the attribute of the pipe type to gold
	pipeType = "gold";

	// updates text underneath the button
	$("#pipeTypeText").html("Highly Polished Copper");

	// disables emissivity box (but also shows the value)
	customEmissivity = .03;
	$("#emissivity").val(".03");
	$("#emissivity").attr("disabled", "disabled");
}

/*
 * Event Handler Function: changeToCustom
 * Called when the user clicks the "custom emissivity" button
 *
 * Changes the case 1 pipe to a gold pipe
*/
function changeToCustom() {
	// disables the custom button
	$("#customButton").attr("disabled", "disabled");

	// hides all the other piping
	$("#whiteUpperPipe").hide();
	$("#blackUpperPipe").hide();
	$("#goldUpperPipe").hide();
	$("#goldBottomPipe").hide();
	$("#whiteBottomPipe").hide();
	$("#blackBottomPipe").hide();

	// shows the custom piping
	$("#customUpperPipe").show();
	$("#customBottomPipe").show();

	// enables the white, black, and gold buttons
	$("#whiteButton").removeAttr("disabled");
	$("#blackButton").removeAttr("disabled");
	$("#goldButton").removeAttr("disabled");

	pipeType = "custom";

	// updates text underneath the button
	$("#pipeTypeText").html("Custom Piping");

	// enables the input box for a custom emissivity
	$("#emissivity").removeAttr("disabled");
}


/*
 * Event Handler Function: changeToBlack2
 * Called when the user clicks the right "black" button
 *
 * Changes the case 2 pipe to a black pipe
*/
function changeToBlack2() {
	// enables the vision of the black upper and bottom pipe
	$("#blackUpperPipe2").show();
	$("#blackBottomPipe2").show();

	// disables the vision of the white and gold upper and bottom pipes
	$("#whiteUpperPipe2").hide();
	$("#goldUpperPipe2").hide();
	$("#whiteBottomPipe2").hide();
	$("#goldBottomPipe2").hide();

	// disables the black button
	$("#blackButton2").attr("disabled", "disabled");

	// enables the white and gold buttons
	$("#whiteButton2").removeAttr("disabled");
	$("#goldButton2").removeAttr("disabled");

	// gives the attribute of the pipe type to black
	pipeType2 = "black";

	// updates text underneath the button
	$("#pipeTypeText2").html("Black (Parsons) Paint");
}

/*
 * Event Handler Function: changeToWhite2
 * Called when the user clicks the right "white" button
 *
 * Changes the case 2 pipe to a white pipe
*/
function changeToWhite2() {
	// enables the vision of the white upper and bottom pipe
	$("#whiteUpperPipe2").show();
	$("#whiteBottomPipe2").show();

	// disables the vision of the white and gold upper and bottom pipes
	$("#blackUpperPipe2").hide();
	$("#goldUpperPipe2").hide();
	$("#blackBottomPipe2").hide();
	$("#goldBottomPipe2").hide();

	// disables the black button
	$("#whiteButton2").attr("disabled", "disabled");

	// enables the black and gold buttons
	$("#blackButton2").removeAttr("disabled");
	$("#goldButton2").removeAttr("disabled");

	// gives the attribute of the pipe type to white
	pipeType2 = "white";

	// updates text underneath the button
	$("#pipeTypeText2").html("White Acrylic Paint");
}

/*
 * Event Handler Function: changeToGold2
 * Called when the user clicks the right "gold" button
 *
 * Changes the case 2 pipe to a gold pipe
*/
function changeToGold2() {
	// enables the vision of the gold upper and bottom pipe
	$("#goldUpperPipe2").show();
	$("#goldBottomPipe2").show();

	// disables the vision of the white and gold upper and bottom pipes
	$("#whiteUpperPipe2").hide();
	$("#blackUpperPipe2").hide();
	$("#whiteBottomPipe2").hide();
	$("#blackBottomPipe2").hide();

	// disables the black button
	$("#goldButton2").attr("disabled", "disabled");

	// enables the white and black buttons
	$("#whiteButton2").removeAttr("disabled");
	$("#blackButton2").removeAttr("disabled");

	// gives the attribute of the pipe type to gold
	pipeType2 = "gold";

	// updates text underneath the button
	$("#pipeTypeText2").html("Highly Polished Copper");
}

/*
 * Event Handler Function: changeToAdvanced
 * Called when the user clicks the "Show advanced customization" button
 *
 * Allows the user to customize the constants
*/
function changeToAdvanced() {
	// Don't do anything if this button has been disabled
	if ($('#advancedButton').attr('disabled')) {
		return;
	}

	if (!advanced) {
		$("#customButton").show();
		$("#emissivity").show();
		$("#emissivityLimit").show();
		$("#advancedButton").html("Hide Advanced Customization");
	}
	else {
		$("#customButton").hide();
		$("#emissivity").hide();
		$("#funFactsDiv").hide();
		$("#funFactTitle").hide();
		$("#funFact").hide();
		$("#emissivityLimit").hide();
		$("#advancedButton").html("Show Advanced Customization");
		if (pipeType === "custom")
			changeToBlack();
	}

	advanced = !advanced;
}

/*
 * Event Handler Function: startSimulation
 * Called when the user clicks the "Start" button
 *
 * If a valid steam temperature, room temperature and heat transfer coefficient has been entered, initiates the animation sequence
*/
function startSimulation() {
	if(isNaN(steamTemp)) {
		alert("A steam temperature is required");
		return;
	}
	if(isNaN(roomTemp)) {
		alert("A room temperature is required");
		return;
	}
	if(isNaN(heatTransferCoeff)) {
		alert("A heat transfer coefficient is required");
		return;
	}

	simulationTime = calculateRunTime(pipeType);
	simulationTime2 = calculateRunTime(pipeType2);
	// disable input fields as well as the "Start" and "Reset" button while animation is running
	$("#startButton").attr("disabled", "disabled");
	$("#resetButton").attr("disabled", "disabled");
	$("#steamTemp").attr("disabled", "disabled");
	$("#roomTemp").attr("disabled", "disabled");
	$("#heatTransferCoeff").attr("disabled", "disabled");
	$("#emissivity").attr("disabled", "disabled");
	$("#blackButton").attr("disabled", "disabled");
	$("#blackButton2").attr("disabled", "disabled");
	$("#whiteButton").attr("disabled", "disabled");
	$("#whiteButton2").attr("disabled", "disabled");
	$("#goldButton").attr("disabled", "disabled");
	$("#goldButton2").attr("disabled", "disabled");
	$("#customButton").attr("disabled", "disabled");
	$("#advancedButton").attr("disabled", "disabled");

	// enable the skip button
	$("#skipButton").removeAttr("disabled");

	// begin the animation
	fillPipes();

}

/*
 * Event Handler Function: resetSimulation
 * Called when the user clicks the "Reset" button
 *
 * Returns animation pictures to their initial state, and clears all output fields
*/
function resetSimulation() {
	// return animation components to their initial state
	$("#fillingWater").css("top", "375px");
	$("#fillingWater2").css("top", "375px");
	$("#fullSign").hide();
	$("#fullSign2").hide();

	// clear output fields
	$("#timeFill").html("");
	$("#timeFill2").html("");

	// enables the start button
	$("#startButton").removeAttr("disabled");

	// disables reset button
	$("#resetButton").attr("disabled", "disabled");

	// enables the advanced/basic button
	$("#advancedButton").removeAttr("disabled");
	$("#basicButton").removeAttr("disabled");

	//enables the input boxes and clears the calculated heat transfer for basic users
	$("#steamTemp").removeAttr("disabled");
	$("#roomTemp").removeAttr("disabled");
	$("#heatTransferCoeff").removeAttr("disabled");
	$("#basicHeatTransferCoeff").html("");

	// enables the color buttons that the pipe isn't currently
	if (pipeType === "black") {
		$("#whiteButton").removeAttr("disabled");
		$("#goldButton").removeAttr("disabled");
		$("#customButton").removeAttr("disabled");
	} else if (pipeType === "white") {
		$("#blackButton").removeAttr("disabled");
		$("#goldButton").removeAttr("disabled");
		$("#customButton").removeAttr("disabled");
	} else if (pipeType === "gold") {
		$("#whiteButton").removeAttr("disabled");
		$("#blackButton").removeAttr("disabled");
		$("#customButton").removeAttr("disabled");
	} else {
		$("#blackButton").removeAttr("disabled");
		$("#whiteButton").removeAttr("disabled");
		$("#goldButton").removeAttr("disabled");
		$("#emissivity").removeAttr("disabled");
	}

	if (pipeType2 === "black") {
		$("#whiteButton2").removeAttr("disabled");
		$("#goldButton2").removeAttr("disabled");
	} else if (pipeType2 === "white") {
		$("#blackButton2").removeAttr("disabled");
		$("#goldButton2").removeAttr("disabled");
	} else {
		$("#whiteButton2").removeAttr("disabled");
		$("#blackButton2").removeAttr("disabled");
	}

	$("#steamGraphic").show();
	$("#steamGraphic2").show();
}


/*
*************************************************************************************************************************
*													Animation Functions													*
*************************************************************************************************************************
*/

/*
 * Function: easePipe
 * Runs quickly in the start and the end and slowly in the middle, similar to how liquid would fill a pipe at a constant rate
*/
$.easing.easePipe = function (x, t, b, c, d) {
	var ts=(t/=d)*t;
	var tc=ts*t;
	return b+c*(tc*ts + -2.5*ts*ts + 4*tc + -3.5*ts + 2*t);
}

/*
 * Function: fillPipes
 * Runs the portion of the animation for water starting to fill the pipes
*/
function fillPipes() {

	// animate the water level rising in both pipes



	if (simulationTime > simulationTime2) {
		$("#steamGraphic").fadeOut(simulationTime/4);
		$("#steamGraphic2").fadeOut(simulationTime2/4);
		$("#fillingWater").animate({top:"155px"}, simulationTime, "easePipe", finishSimulation);
		$("#fillingWater2").animate({top:"155px"}, simulationTime2, "easePipe", finishFill);
	} else {
		$("#steamGraphic").fadeOut(simulationTime/4);
		$("#steamGraphic2").fadeOut(simulationTime2/4);
		$("#fillingWater2").animate({top:"155px"}, simulationTime2, "easePipe", finishSimulation);
		$("#fillingWater").animate({top:"155px"}, simulationTime, "easePipe", finishFill);
	}
}

/*
 * Function: skip
 * Skips the current animation and removes the animation from the queue
*/
function skip() {
	// for the animation to look correct the animation that is longer needs to be skipped last
	if (simulationTime > simulationTime2) {
		$("#fillingWater2").stop(true,true);
		$("#fillingWater").stop(true,true);
	} else {
		$("#fillingWater").stop(true,true);
		$("#fillingWater2").stop(true,true);
	}
	$("#steamGraphic").stop(true,true);
	$("#steamGraphic2").stop(true,true);
}


/*
 * Function: finishFill
 * Puts the FULL sign on the pipe and shows the amount of time it took to fill the pipe
*/
function finishFill(){
	if (simulationTime < simulationTime2) {
		$("#fullSign").show();
		$("#timeFill").html(Math.round(simulationTime/10)/ 100 + " s");
	} else {
		$("#fullSign2").show();
		$("#timeFill2").html(Math.round(simulationTime2/10)/ 100 + " s");
	}
}

/*
 * Function: finishSimulation
 * Cleans up after the draining animation, re-enables inputs, and displays outputs
*/
function finishSimulation() {
	// displays the stats of the pipe that took longer to fill, or both if it took the same time
	if (simulationTime > simulationTime2) {
		$("#fullSign").show();
		$("#timeFill").html(Math.round(simulationTime/10)/ 100 + " s");
	} else if (simulationTime < simulationTime2) {
		$("#fullSign2").show();
		$("#timeFill2").html(Math.round(simulationTime2/10)/ 100 + " s");
	} else {
		$("#fullSign").show();
		$("#timeFill").html(Math.round(simulationTime/10)/ 100 + " s");
		$("#fullSign2").show();
		$("#timeFill2").html(Math.round(simulationTime2/10)/ 100 + " s");
	}

	// enables the reset and re-enable the input
	$("#resetButton").removeAttr("disabled");

	// disable the skip button
	$("#skipButton").attr("disabled", "disabled");
}


/*
*************************************************************************************************************************
*													Calculations														*
*************************************************************************************************************************
*/



/*
 * Function: calculateRunTime
 * Calculates the amount of time it takes for a pipe to fill with water given the properties
*/
function calculateRunTime(type) {
	var emissivity;
	if (type === "black")
		emissivity = emissivityBlackPaint;
	if (type === "white")
		emissivity = emissivityWhitePaint;
	if (type === "gold")
		emissivity = emissivityCopper;
	if (type === "custom")
		emissivity = customEmissivity;

	// finds the steam temperature and room temperature in kelvin
	var steamTempKelvin = parseInt(steamTemp) + 273.15;
	var roomTempKelvin = parseInt(roomTemp) + 273.15;

	// finds the power from both black body radiation and convection
	powerBlackBody = emissivity * stefanBoltzConst * circumference * length * (Math.pow(steamTempKelvin,4)  - Math.pow(roomTempKelvin,4));
	powerConvection = heatTransferCoeff * circumference * length * (steamTempKelvin - roomTempKelvin);

	var totalPower = powerBlackBody + powerConvection;


	return energyNeeded / totalPower;
}

/*
 * Function: calculateHeatTransferCoeff
 * Calculates the heat transfer coefficient for basic users
*/
function calculateHeatTransferCoeff() {
	var g = 9.8; // m/s^2
	var k = .0313
	var b = 1 / (parseInt(roomTemp) + 273.15); // K^-1
	var d = radius * 2; // m
	var v = 22.8 * Math.pow(10,-6); // m^2/s
	var a = 32.8 * Math.pow(10,-6); // m^2/s
	var pr = .697;

	var Rad = g * b * (steamTemp-roomTemp) * Math.pow(d, 3) / (v * a);

	var Nud = Math.pow(.6 + .387 * Math.pow(Rad, 1/6) / Math.pow(1 + Math.pow(.559/pr, 9/16), 8/27), 2);

	return k / d * Nud;
}

function displayHelp() {
	alert("Change the values of the room temperature and steam temperature. Decide on which material to use " +
		"for the pipes' coating before running the simulation. " +
		"\n\nTo resize the window, press ctrl and +/- to zoom in/out for Windows and Linux users. " +
		"For Mac users, press command and +/-.");
	return false;
}

function displayAboutInfo() {
	alert("Produced through the efforts of Daniel Prudente\n\n" + 
	"Based off of the previous work of Matthew Koppenhaver\n\n" +
	"Emissivity values referenced from Fundamentals of Heat and Mass Transfer, " +
	"Third Edition by Frank P. Incropera and David P. De Witt\n\n" + 
	"Supported by NSF DUE-0717536 and NSF DUE-0442234\n\n" +
	"Questions? Contact Dr. Margot Vigeant, Bucknell University Department of Chemical Engineering " +
	"at mvigeant@bucknell.edu.\n\n\u00A9 Margot Vigeant and Michael Prince 2012");
	return false;
}
