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
var cpAir = 1.5;//1.005; // kJ/ (kg*K)
var Dair = 1.204; // kg/m^3
var fanRadius = 0.0225;// m --> 4.5 cm diameter
var fanArea = Math.PI * Math.pow(fanRadius,2); // m^2
var Tin = 20 + 273.15; // K
var R = 8.3145; // m^3*Pa/(mol*K)
var P = 101.325; // kPa
var Vair = Tin * R / (P * 1000); //m^3/mol
var mwAir = 29; // g/mol
var Q = 0;
var efficiency = 0.15;
var maxHigh = 12.5; // m/s
var maxLow = 8.8; // m/s

// Variables
var vWind; // velocity of wind in m/s
var pFan; // Power fan setting
var power; //Power of the fan in watts
var massFlow;
var KE; // Kinetic Energy
var Tout; // Temperature of outgoing air
var coolOn;
var currentPos;
var currentWind;
var currentHeat;
var onMobile;


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
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
 		onMobile = 1;
	} else onMobile = 0;
	
	$("#powerSlide").slider({ min:0, max: 2, range: "min", orientation: "vertical", step: 1,
		change: changePower,
    		slide: changePower 
	});
	
	pFan = 0;
	power = 0;
	vWind = 0;
	massFlow = 0;
	coolOn = 1;
	inOuterBox = 0;
	inInnerBox = 0;
	
	$("#coolSwitch").hide();

	$(".wind").draggable({
		containment: '#dragBox',
		drag: function(event, ui) {
		// Show the current dragged position of image
        	currentPos = $(this).position();
        	//$("#position").html("CURRENT: \nLeft: " + currentPos.left + "\nTop: " + currentPos.top);
		trackWind();
	},
		revert:function(){
			$("#anemometer").html('<img src="anemometerOff.png">');
			$("#anemometer").animate({top:"316px", left:"-160px"}, 500, "linear");
		}
	});

	$(".heat").draggable({
		containment: '#dragBox',
		drag: function(event, ui) {
		// Show the current dragged position of image
        	currentPos = $(this).position();
        	$("#position").html("CURRENT: \nLeft: " + currentPos.left + "\nTop: " + currentPos.top);
		trackHeat();
	},
		revert:function(){
			$("#thermocouple").animate({top:"575px", left:"135px"}, 500, "linear");
		}
	});

	if (onMobile == 0) {
		$(".windMed").droppable({
			tolerance: "fit",
			greedy:false,
			accept: ".wind",
			over: function (event,ui) {
				if (pFan == 1) $("#anemometer").html('<img src="anemometerLow.gif">');
				else if (pFan == 2) $("#anemometer").html('<img src="anemometerMed.gif">');
				else $("#anemometer").html('<img src="anemometerOff.png">');
			},
			out: function (event,ui) {
				$("#anemometer").html('<img src="anemometerOff.png">');
			}
		});
	
		$(".windHigh").droppable({
			tolerance: "fit",
			greedy: true,
			accept: ".wind",
			over: function (event,ui) {
				if (pFan == 1) $("#anemometer").html('<img src="anemometerMed.gif">');
				else if (pFan == 2) $("#anemometer").html('<img src="anemometerHigh.gif">');
				else $("#anemometer").html('<img src="anemometerOff.png">');
			},
			out: function (event,ui) {
				if (pFan == 1) $("#anemometer").html('<img src="anemometerLow.gif">');
				else if (pFan == 2) $("#anemometer").html('<img src="anemometerMed.gif">');
				else $("#anemometer").html('<img src="anemometerOff.png">');
			}
		});
	}

	// register event handlers
	$("#infoButton").on('click', displayInfo);
	$("#helpButton").on('click', displayHelp);
}
/*
 * Event Handler Function: changePower
 * Called when the user clicks on or drags the slider
 *
 * Changes the power of the fan
*/
function changePower() {
	pFan = $( "#powerSlide" ).slider( "option", "value" );
	if (pFan == 1) {
		power = 156;
		$("#coolOff").hide();
	}
	else if (pFan == 2) {
		power = 290;
		$("#coolOff").hide();
	}
	else {
		power = 0;
		$("#coolOff").show();
	}
	
	$("#powerLabel").html(power + " W");
}

function changeCool() {
	if (coolOn == 0) {
		coolOn = 1;
		$("#coolOff").hide();
		$("#coolSwitch").hide();
	} else {
		coolOn = 0;
		$("#coolOff").show();
		$("#coolSwitch").show();
		alert("For this experiment the cool setting on the hairdyer must be on");
		changeCool();
	}
}

function trackWind() {
	if (currentPos.top <= 142 && currentPos.left > 580) {
		if (pFan == 1) {
			currentWind = -0.0006*(currentPos.top*currentPos.top) + 0.0311*currentPos.top + 8.1952;
		} else if (pFan == 2) {
			currentWind = -0.0009*(currentPos.top*currentPos.top) + 0.0442*currentPos.top + 11.953;
		}
	} else currentWind = 0;
	$("#windReading").html(Math.round(currentWind*100)/100 + " m/s");
}


function trackHeat() {
	//var vWind;
	if (currentPos.top >= 22 && currentPos.top <= 258 && currentPos.left >= 543 && currentPos.left <= 800) {
		if (pFan == 1) {
			//vWind = -0.0006*(currentPos.top*currentPos.top) + 0.1693*currentPos.top - 3.331;
			Tout = -0.0004*(currentPos.top*currentPos.top) + 0.1181*currentPos.top + 17.705;
		} else if (pFan == 2) {
			//vWind = -0.0009*(currentPos.top*currentPos.top) + 0.251*currentPos.top - 4.988;
			Tout = -0.0005*(currentPos.top*currentPos.top) + 0.1456*currentPos.top + 17.548;
		}
	} else {
		//vWind = 0;
		Tout = 20;
	}
	
	//$("#windSpeed").html((Math.round(vWind*10)/10) + " m/s");
	$("#heatReading").html((Math.round(Tout*10)/10) + " \xB0C");
}

/*
 * Event Handler Method: displayInfo
 * Displays a dialog box containing information about the program when the user clicks the "i" glyphicon button.
*/
function displayInfo() {
	alert("Produced through the efforts of Daniel Prudente\n\n" +
		  "Supported by NSF DUE-1225031\n\n" +
		  "Questions? Contact Dr. Margot Vigeant, Bucknell University Department of Chemical Engineering " +
		  "at mvigeant@bucknell.edu.\n\n" +
		  "\u00A9 Margot Vigeant and Michael Prince 2013");
	return false;
}

/*
 * Event Handler Method: displayHelp
 * Displays a dialog box containing information about how to use the program when the user clicks the "?" glyphicon
 * button.
 */
function displayHelp() {

	alert("Select a setting on the hairdryer (low or high) by dragging the black switch. Click and hold the " +
		"anemometer to drag it in front of the hairdryer and get a measurement reading for the wind speed. " +
		"Repeating this for the thermocouple will give a temperature reading.");
}
