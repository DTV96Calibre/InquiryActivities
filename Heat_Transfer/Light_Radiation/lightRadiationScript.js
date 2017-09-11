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
var minOvenTemp = 200; //C
var maxOvenTemp = 300;
var graphWidth = 328;
var graphHeight = 270;
var startLeft = 403;
var startTop = 307;
var numPoints = 320;

// Pipe Constants
var circumference = 0.01; // in m, saying 1 cm circumference
var length = 0.13; // in m, saying 13 cm length
var surfaceArea = circumference * length; // in m^2
var pipeMass = 270 * length; // in g, saying 270 g/m (taken from Mueller copper tubing)
var cp = 0.385; // J/(g*K) taken from http://chemed.chem.wisc.edu/chempaths/GenChem-Textbook/Heat-Capacities-715.html
var hTCoeff = 30; // W/(m^2*K)
var sigma = 0.06; // Percentage of how much energy comes from the lamp and onto the pipe
var emissivityCopper = 0.25;
var emissivityBlackPaint = 0.98;
var emissivityWhitePaint = 0.9;
var absorptivityCopper = 0.32;
var absorptivityBlackPaint = 0.75;
var absorptivityWhitePaint = 0.38;
var timeStep = 2; // seconds
var roomTemp = 20; // Celsius
var boltz = 5.67 * Math.pow(10, -8);

var ovenTemp;
var currentStep;
var light;
var lampWattage;
var isHeating;
var pause;
var maxGraphTemp;

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

	$("#heatingButton").on('click', changeToHeat);
	$("#coolingButton").on('click', changeToCool);
	$("#startButton").on('click', startSimulation);
	$("#finishButton").on('click', finishSimulation);
	$("#helpButton").on('click', displayHelp);
	$("#infoButton").on('click', displayInfo);
	$("#ovenTemp").on('change', getOvenTemp);

	// Set up an event handler that updates the oven temp value as the user moves the slider
	$("#ovenTemp").mousemove(function () {
	    $("#ovenTempValue").text($("#ovenTemp").val())
	})

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

	for(var i=1; i<=numPoints; i++) {
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

	maxGraphTemp = 100;
	$("#ygraph1").html('&nbsp;&nbsp;50');
	$("#ygraph2").html('100');
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

	maxGraphTemp = 300;
	$("#ygraph1").html('150');
	$("#ygraph2").html('300');
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
	$("#ovenTempValue").html(input);

	// if the entered value isn't valid, keep the current steam temperature and display that number in the input field.
	// if no valid pump rate as been entered, clear the input field
	if(isNaN(input) || input == "") {
		if(!isNaN(ovenTemp)) {
			$("#ovenTemp").val(ovenTemp);
		}
		else {
			$("#ovenTemp").val("");
		}
	}

	ovenTemp = input;
}

/*
 * Event Handler Function: startSimulation
 * Called when the user clicks on start button
 *
 * Starts the simulation
*/
function startSimulation(){
	if (isHeating) {
		if (light == 0)
			alert("The light must be on in order to carry out the experiment");
		else {
			if (light == 1) lampWattage = 15;
			else if (light == 2) lampWattage = 25;
			else lampWattage = 45;

			$("#startButton").fadeOut(1000);
			$("#slider").fadeOut(1000);
			currentStep = 1;
			setTimeout(heatingSetup, 1000);
		}
	}
	else {
		if (isNaN(ovenTemp) || ovenTemp > maxOvenTemp || ovenTemp < minOvenTemp)
			alert("The oven must be set to a temperature between 200 and 300 degrees Celsius");
		else {
			$("#startButton").fadeOut(1000);
			$("#coolingComponents").animate({top:"700px"}, 1000, function () {
				$("#coolingComponents").fadeOut(1000);
				$("#startButton").fadeOut(1000);
			});
			currentStep = 1;
			setTimeout(coolingSetup, 2000);
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
	if (currentStep < numPoints*2) {

		y1 = ((equationPart1+absorptivityBlackPaint*sigma*lampWattage*timeStep+cp*pipeMass*(y1Previous+274))/equationPart2)-274;
		y2 = ((equationPart1+absorptivityWhitePaint*sigma*lampWattage*timeStep+cp*pipeMass*(y2Previous+274))/equationPart2)-274;
		y3 = ((equationPart1+absorptivityCopper*sigma*lampWattage*timeStep+cp*pipeMass*(y3Previous+274))/equationPart2)-274;

		y1Previous = y1;
		y2Previous = y2;
		y3Previous = y3;

		if (currentStep % 2 == 0) {
			x = (currentStep/2) + "px";
			y1 = graphHeight - y1*(graphHeight/maxGraphTemp);
			y2 = graphHeight - y2*(graphHeight/maxGraphTemp);
			y3 = graphHeight - y3*(graphHeight/maxGraphTemp);

			y1 = y1 + "px";
			y2 = y2 + "px";
			y3 = y3 + "px";

			var dot1 = "#sit1Point" + (currentStep/2);
			var dot2 = "#sit2Point" + (currentStep/2);
			var dot3 = "#sit3Point" + (currentStep/2);
			$(dot1).css({top:y1, left:x});
			$(dot2).css({top:y2, left:x});
			$(dot3).css({top:y3, left:x});
			$(dot1).show();
			$(dot2).show();
			$(dot3).show();
		}

		currentStep++;
		setTimeout(measureHeating, 30);
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
	y1Previous = ovenTemp * 1;
	y2Previous = ovenTemp * 1;
	y3Previous = ovenTemp * 1;
	currentStep = 0;
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
	if (currentStep <= numPoints*2) {
		y1 = y1Previous - timeStep*surfaceArea*( (emissivityBlackPaint*boltz*(Math.pow(y1Previous+274, 4)-Math.pow(roomTemp+274,4)) + hTCoeff*(y1Previous-roomTemp)) )/(pipeMass*cp);
		y2 = y2Previous - timeStep*surfaceArea*( (emissivityWhitePaint*boltz*(Math.pow(y2Previous+274, 4)-Math.pow(roomTemp+274,4)) + hTCoeff*(y2Previous-roomTemp)) )/(pipeMass*cp);
		y3 = y3Previous - timeStep*surfaceArea*( (emissivityCopper*boltz*(Math.pow(y3Previous+274, 4)-Math.pow(roomTemp+274,4)) + hTCoeff*(y3Previous-roomTemp)) )/(pipeMass*cp);

		y1Previous = y1;
		y2Previous = y2;
		y3Previous = y3;

		if (currentStep % 2 == 0) {
			x = (currentStep/2) + "px";
			y1 = graphHeight - y1*(graphHeight/maxGraphTemp);
			y2 = graphHeight - y2*(graphHeight/maxGraphTemp);
			y3 = graphHeight - y3*(graphHeight/maxGraphTemp);

			y1 = y1 + "px";
			y2 = y2 + "px";
			y3 = y3 + "px";

			var dot1 = "#sit1Point" + (currentStep/2);
			var dot2 = "#sit2Point" + (currentStep/2);
			var dot3 = "#sit3Point" + (currentStep/2);
			$(dot1).css({top:y1, left:x});
			$(dot2).css({top:y2, left:x});
			$(dot3).css({top:y3, left:x});
			$(dot1).show();
			$(dot2).show();
			$(dot3).show();
		}

		currentStep++;
		setTimeout(measureCooling, 30);
	}
	else {
		//alert(y1Previous + "  " + y2Previous + "  " + y3Previous + "  ");
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

/*
 * Displays a pop-up alert containing information pertaining to the use of this
 * simulation. Called when the user presses the help button.
 */
function displayHelp() {
	alert("Select either heating or cooling to begin. When heating, drag the slider to select the " +
		"intensity of the light. When cooling, set the starting temperature on the oven.\n\nPress start to see " +
		"how the copper rods heat or cool with respect to their surface characteristics.");
}

/*
 * Displays a pop-up alert containing information pertaining to the licensing of
 * this simulation. Called when the user presses the info button.
 */
function displayInfo() {
	alert("Produced through the efforts of Daniel Prudente\n\n" +
		"Emissivity values referenced from Fundamentals of Heat and Mass Transfer, Third Edition " +
		"by Frank P. Incropera and David P. De Witt\n\n" +
		"Supported by NSF DUE-1225031\n\n" +
		"Questions? Contact Dr. Margot Vigeant, Bucknell University Department of Chemical " +
		"Engineering at mvigeant@bucknell.edu.\n\n" +
		"\u00A9 Margot Vigeant and Michael Prince 2012");
}
