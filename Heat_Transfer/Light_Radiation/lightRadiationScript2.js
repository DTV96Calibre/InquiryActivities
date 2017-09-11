/*
 * File: lightRadiationScript.js
 * Purpose: To provide the animations and interactivity for the Light Radiation Activity
 * Author: Daniel Prudente (September 2012)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2012
*/


/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/


$(document).ready(init);

// Constants
var minOvenTemp = 50; //C
var maxOvenTemp = 100;
var graphWidth = 328;
var graphHeight = 270;
var startLeft = 403;
var startTop = 307;

// Pipe Constants
var circumference = 0.01; // in m, saying 1 cm circumference
var length = 0.05; // in m, saying 5 cm length
var surfaceArea = circumference * length; // in m^2
var pipeMass = 270 * length; // in g, saying 270 g/m (taken from Mueller copper tubing)
var cp = 0.385; // J/(g*K) taken from http://chemed.chem.wisc.edu/chempaths/GenChem-Textbook/Heat-Capacities-715.html
var hTCoeff = 5; // W/(m^2*K), Originally taken from textbook as 5 but changed to 3 to fit lab data
var sigma = 0.005; // Percentage of how much energy comes from the lamp and onto the pipe
var emissivityCopper = 0.03;
var emissivityBlackPaint = 0.98;
var emissivityWhitePaint = 0.9;
var absorptivityCopper = 0.32;
var absorptivityBlackPaint = 0.75;
var absorptivityWhitePaint = 0.38;
var timeStep = 2; // seconds
var roomTemp = 20; // Celsius

var ovenTemp;
var currentStep;
var light;
var lampWattage;
var isHeating;
var pause;

var equationPart1;
var equationPart2;
var y1Previous;
var y2Previous;
var y3Previous;
/*
*************************************************************************
*						Initialization Functions						*
*************************************************************************
*/

/*
 * Function: init
 * Sets up the page when it is loaded, hiding elements that aren't supposed to be visible right away, and
 * attaching event handlers. Also initializes input values, both in the program and in the display.
*/
function init() {
	$("#startPrompt").show();
	$("#promptDiv").hide();
	$("#startButton").hide();
	$("#finishButton").hide();

	$("#slider").slider({ min:0, max: 3, orientation: "vertical", step: 1,
		change: changeLighting,
    	slide: changeLighting });

	$("#ovenTemp").val("");
	ovenTemp = NaN;

	generateGraphPoints();

	$("#heatingButton").live('click', changeToHeat);
	$("#coolingButton").live('click', changeToCool);
	$("#startButton").live('click', startSimulation);
	$("#finishButton").live('click', finishSimulation);
	$("#ovenTemp").live('change', getOvenTemp);

	selectMode();
}

/*
 * Function: generateGraphPoints
 * Adds 480 images (160 for each Situation) to the HTML page to represent points on the graph. This is
 * done only when the page is first loaded. Done dynamically to keep the saved HTML document concise.
*/
function generateGraphPoints() {
	var sit1HTML = "";
	var sit2HTML = "";
	var sit3HTML = "";

	for(var i=1; i<=160; i++) {
		sit1HTML += '<img id="sit1Point' + i + '" class="sit1Point" src="blank_img.png" />';
		sit2HTML += '<img id="sit2Point' + i + '" class="sit2Point" src="blank_img.png" />';
		sit3HTML += '<img id="sit3Point' + i + '" class="sit3Point" src="blank_img.png" />';
	}

	$("#graphBase").after('<div id="graphPointsDiv">' + sit1HTML + sit2HTML + sit3HTML + '</div>');
}

/*
 * Function: selectMode
 * Asks which part of the activity (heating the pipes or cooling the pipes) they want to do.
*/
function selectMode() {
	//Hide all the cooling components
	$("#coolingComponents").hide();

	//Hide proper heating components
	$("#heatingComponents").hide();
	$("#lampLightLow").hide();
	$("#lampLightMed").hide();
	$("#lampLightHigh").hide();

	//Ask what activity user wants to do
	$("#promptDiv").show();
}

/*
 * Event Handler Function: changeToHeat
 * Changes the activity to heating up the pipes. Called when "heating" button is clicked.
*/
function changeToHeat() {
	//Removes prompt
	$("#promptDiv").hide();

	//Sets the slider of the lamp to 0
	$( "#slider" ).slider( "option", "value", 0);

	//Shows the heating components
	$("#heatingComponents").fadeIn(1000, function() {
		$("#startButton").fadeIn(1000);
	});

	light = 0;
	isHeating = true;
}

/*
 * Event Handler Function: changeToCool
 * Changes the activity to cooling down the pipes. Called when "cooling" button is clicked.
*/
function changeToCool() {
	//Removes prompt
	$("#promptDiv").hide();

	//Shows the cooling components
	$("#coolingComponents").fadeIn(1000, function() {
		$("#coolingComponents").animate({top:"290px"}, 2000, function () {
			$("#startButton").fadeIn(1000);
		});
	});

	isHeating = false;
}

/*
 * Event Handler Function: getSteamTemp
 * Called when the user inputs a new value into the steamTemp field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getOvenTemp() {
	var input = $("#ovenTemp").val();

	// if the entered value is not a valid number, keep the current steam temperature and display that number in the input field.
	// if no valid pump rate as been entered, clear the input field
	if(isNaN(input) || input == "") {
		if(!isNaN(ovenTemp)) {
			$("#ovenTemp").val(ovenTemp);
		}
		else {
			$("#ovenTemp").val("");
		}
	}
	// if the input is outside the valid range, set the steam temperature to the highest/lowest valid value
	// and update the display accordingly
	else if(input > maxOvenTemp) {
		ovenTemp = maxOvenTemp;
		$("#ovenTemp").val(maxOvenTemp);
	}
	else if(input < minOvenTemp) {
		ovenTemp = minOvenTemp;
		$("#ovenTemp").val(minOvenTemp);
	}
	// if input is valid, set pumpRate
	else {
		ovenTemp = input;
	}
}

/*
 * Event Handler Function: startSimulation
 * Called when the user clicks on start button
 *
 * Starts the simulation
*/
function startSimulation(){
	if(isHeating) {
		if (light == 0)
			alert("The light must be on in order to carry out the experiment");
		else {
			if (light == 1) lampWattage = 25;
			else if (light == 2) lampWattage = 50;
			else lampWattage = 100;

			$("#startButton").fadeOut(1000);
			$("#slider").fadeOut(1000);
			currentStep = 1;
			setTimeout(heatingSetup, 1000);
		}
	}
	else {
		if (isNaN(ovenTemp))
			alert("The oven must be set to a temperature between 200 and 300 degrees Celsius");
		else {
			$("#startButton").fadeOut(1000);
			$("#coolingComponents").fadeOut(1000);
			$("#coolingComponents").animate({"top": "700px"}, 1000);
			currentStep = 1;
			setTimeout(coolingSetup, 1000);
		}
	}

}

/*
 * Event Handler Function: changeLighting
 * Called when the user clicks on or drags the slider
 *
 * Changes the lamp lighting
*/
function changeLighting() {
	light = $( "#slider" ).slider( "option", "value" );
	if (light == 0) {
		$("#lampLightLow").hide();
		$("#lampLightMed").hide();
		$("#lampLightHigh").hide();
	} else if (light == 1) {
		$("#lampLightLow").show();
		$("#lampLightMed").hide();
		$("#lampLightHigh").hide();
	} else if (light == 2) {
		$("#lampLightLow").hide();
		$("#lampLightMed").show();
		$("#lampLightHigh").hide();
	} else if (light == 3) {
		$("#lampLightLow").hide();
		$("#lampLightMed").hide();
		$("#lampLightHigh").show();
	}
}

/*
 * Function: heatingSetup
 * Called when the user clicks on the start button for the heating experiment
 *
 * Gives initial values for the pipes and calculates parts of the equation that only uses constants in order to speed
 * up calculation time. Then calls measureHeating().
 *
 * Uses the equation timeStep*lampWattage*emissivity*sigma = m*Cp*(Tnow-Tthen)+timeStep*hTCoeff*surfaceArea*(Tnow-Troom)
*/
function heatingSetup() {
	equationPart1 = surfaceArea*hTCoeff*(roomTemp+274)*timeStep;

	equationPart2 = surfaceArea*hTCoeff*timeStep+cp*pipeMass;

	y1Previous = roomTemp;
	y2Previous = roomTemp;
	y3Previous = roomTemp;

	measureHeating();
}

/*
 * Function: measureHeating
 * Calculates the temperature of the pipe and displays it on the plot
 * Uses the equation timeStep*lampWattage*absorptivity*sigma = m*Cp*(Tnow-Tthen)+timeStep*hTCoeff*surfaceArea*(Tnow-Troom)
*/
function measureHeating() {
	if (currentStep < 160) {
		x = currentStep * 2 + "px";

		//alert("Equation Part 1: " + equationPart1);
		//alert("Equation Part 2: " + equationPart2);

		y1 = ((equationPart1+absorptivityBlackPaint*sigma*lampWattage*timeStep+cp*pipeMass*(y1Previous+274))/equationPart2)-274;
		y2 = ((equationPart1+absorptivityWhitePaint*sigma*lampWattage*timeStep+cp*pipeMass*(y2Previous+274))/equationPart2)-274;
		y3 = ((equationPart1+absorptivityCopper*sigma*lampWattage*timeStep+cp*pipeMass*(y3Previous+274))/equationPart2)-274;

		//alert(y1 + "  " + y2 + "  " + y3 + "  ");

		y1Previous = y1;
		y2Previous = y2;
		y3Previous = y3;

		y1 = graphHeight - y1*(graphHeight/maxOvenTemp);
		y2 = graphHeight - y2*(graphHeight/maxOvenTemp);
		y3 = graphHeight - y3*(graphHeight/maxOvenTemp);

		y1 = y1 + "px";
		y2 = y2 + "px";
		y3 = y3 + "px";

		//alert(y1 + "  " + y2 + "  " + y3 + "  ");

		var dot1 = "#sit1Point" + currentStep;
		var dot2 = "#sit2Point" + currentStep;
		var dot3 = "#sit3Point" + currentStep;
		$(dot1).css({top:y1, left:x});
		$(dot2).css({top:y2, left:x});
		$(dot3).css({top:y3, left:x});
		$(dot1).show();
		$(dot2).show();
		$(dot3).show();

		currentStep++;
		setTimeout(measureHeating, 100);
	}
	else {
		$("#finishButton").fadeIn(1000);
	}
}

/*
 * Function: coolingSetup
 * Called when the user clicks on the start button for the cooling experiment
 *
 * Gives initial values for the pipes and calculates parts of the equation that only uses constants in order to speed
 * up calculation time. Then calls measureCooling().
 *
 * Uses the equation m*Cp*(Tnow-Tthen) = timeStep*emissivity*sigma*surfaceArea*(Told^4-Troom^4)+ timestep*hTCoeff*surfaceArea*(Told-Troom)
 * Where all temperatures are in kelvin
*/
function coolingSetup() {
	y1Previous = ovenTemp;
	y2Previous = ovenTemp;
	y3Previous = ovenTemp;

	measureCooling();
}

/*
 * Function: measureCooling
 * Called when the user clicks on the start button for the cooling experiment
 *
 * Calculates the temperature of the pipe and displays it on the plot
 *
 * Uses the equation m*Cp*(Tnow-Tthen) = timeStep*emissivity*sigma*surfaceArea*(Told^4-Troom^4)+ timestep*hTCoeff*surfaceArea*(Told-Troom)
 * Where all temperatures are in kelvin
*/
function measureCooling() {
	if (currentStep < 160) {
		x = currentStep * 2 + "px";

		y1 = y1Previous-(timeStep*emissivityBlackPaint*surfaceArea*(Math.pow(y1Previous+274, 4)-Math.pow(roomTemp+274, 4))+timeStep*hTCoeff*surfaceArea*(y1Previous-roomTemp))/(pipeMass*cp);
		y2 = y2Previous-(timeStep*emissivityWhitePaint*surfaceArea*(Math.pow(y2Previous+274, 4)-Math.pow(roomTemp+274, 4))+timeStep*hTCoeff*surfaceArea*(y2Previous-roomTemp))/(pipeMass*cp);
		y3 = y3Previous-(timeStep*emissivityCopper*surfaceArea*(Math.pow(y3Previous+274, 4)-Math.pow(roomTemp+274, 4))+timeStep*hTCoeff*surfaceArea*(y3Previous-roomTemp))/(pipeMass*cp);

		alert(y1 + "  " + y2 + "  " + y3 + "  ");

		y1Previous = y1;
		y2Previous = y2;
		y3Previous = y3;

		y1 = graphHeight - y1*(graphHeight/maxOvenTemp);
		y2 = graphHeight - y2*(graphHeight/maxOvenTemp);
		y3 = graphHeight - y3*(graphHeight/maxOvenTemp);

		y1 = y1 + "px";
		y2 = y2 + "px";
		y3 = y3 + "px";

		//alert(y1 + "  " + y2 + "  " + y3 + "  ");

		var dot1 = "#sit1Point" + currentStep;
		var dot2 = "#sit2Point" + currentStep;
		var dot3 = "#sit3Point" + currentStep;
		$(dot1).css({top:y1, left:x});
		$(dot2).css({top:y2, left:x});
		$(dot3).css({top:y3, left:x});
		$(dot1).show();
		$(dot2).show();
		$(dot3).show();

		currentStep++;
		setTimeout(measureCooling, 100);
	}
	else {
		$("#finishButton").fadeIn(1000);
	}
}

function finishSimulation() {
	$("#finishButton").fadeOut(500);
	$(".sit1Point").hide();
	$(".sit2Point").hide();
	$(".sit3Point").hide();
	if (isHeating) {
		$("#slider").show();
	}
	else {

	}

	selectMode();
}
