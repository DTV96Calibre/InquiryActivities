/*
 * File: steadystatescript.js
 * Purpose: To provide the animations and interactivity for the Steady State
 * Author: Brooke Bullek (2017), Daniel Prudente (July 2012)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
*/

/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/

$(document).ready(init);

var	flowRate,
	previousFlowRate,
	numCoughDrops,
	currentBeaker,
	currentConc,
	beakerConc0,
	beakerConc1,
	beakerConc2,
	beakerConc3,
	beakerConc4,
	beakerConc5;

var helpBoxPopUp;
var enableFolding;
	
// An array cannot be used since the opacities will not update correctly while the cough drops are dissolving while in an array
var	opacityDrop0,
	opacityDrop1,
	opacityDrop2,
	opacityDrop3,
	opacityDrop4,
	opacityDrop5,
	opacityDrop6,
	opacityDrop7,
	opacityDrop8,
	opacityDrop9,
	opacityDrop10;

// constants
var beakerVol = 25; // mL or cm^3
var maxFlowRate = 10;
var minFlowRate = 0;
var concLimit0 = 4;
var concLimit1 = 20;
var concLimit2 = 30;
var concLimit3 = 50;
var concLimit4 = 80;
var k = 120;
var beakerSpacing = 21;

// An array that holds the concentrations of all 5 beakers as they're measured
var concentrations = [];

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
	// Hides all water flow since the faucet should start off
	$("#faucetFlow0").hide();
	$("#faucetFlow1").hide();
	$("#faucetFlow2").hide();
	$("#faucetFlow3").hide();
	$("#solutionFlow").hide();
	
	// Hides all the beakers with the solutions
	$("#beakerSoln00").hide();
	$("#beakerSoln10").hide();
	$("#beakerSoln20").hide();
	$("#beakerSoln30").hide();
	$("#beakerSoln40").hide();
	$("#beakerSoln50").hide();
	$("#beakerSoln01").hide();
	$("#beakerSoln11").hide();
	$("#beakerSoln21").hide();
	$("#beakerSoln31").hide();
	$("#beakerSoln41").hide();
	$("#beakerSoln51").hide();
	$("#beakerSoln02").hide();
	$("#beakerSoln12").hide();
	$("#beakerSoln22").hide();
	$("#beakerSoln32").hide();
	$("#beakerSoln42").hide();
	$("#beakerSoln52").hide();
	$("#beakerSoln03").hide();
	$("#beakerSoln13").hide();
	$("#beakerSoln23").hide();
	$("#beakerSoln33").hide();
	$("#beakerSoln43").hide();
	$("#beakerSoln53").hide();
	$("#beakerSoln04").hide();
	$("#beakerSoln14").hide();
	$("#beakerSoln24").hide();
	$("#beakerSoln34").hide();
	$("#beakerSoln44").hide();
	$("#beakerSoln54").hide();

	placeBeakers();
	
	// Resets stopwatch and split times on reload
	startstop();
	startstop();
	resetclock();
	
	// Enables the take measurement and empty beakers button
	$("#getMeasurementButton").removeAttr("disabled");
	$("#emptyBeakerButton").removeAttr("disabled");
	$("#addDropButton").removeAttr("disabled");
	$("#faucetFlowRate").removeAttr("disabled");
		
	// Makes all the cough drops pretty much invisible (uses opacity rather than hide/show in order to be able to change the dissolve rate of the cough drops when changing water flow
	opacityDrop0 = 0,
	opacityDrop1 = 0,
	opacityDrop2 = 0,
	opacityDrop3 = 0,
	opacityDrop4 = 0,
	opacityDrop5 = 0,
	opacityDrop6 = 0,
	opacityDrop7 = 0,
	opacityDrop8 = 0,
	opacityDrop9 = 0,
	opacityDrop10 = 0;
	
	$("#coughDrop0").css({ opacity: 0 }),
	$("#coughDrop1").css({ opacity: 0 }),
	$("#coughDrop2").css({ opacity: 0 }),
	$("#coughDrop3").css({ opacity: 0 }),
	$("#coughDrop4").css({ opacity: 0 }),
	$("#coughDrop5").css({ opacity: 0 }),
	$("#coughDrop6").css({ opacity: 0 }),
	$("#coughDrop7").css({ opacity: 0 }),
	$("#coughDrop8").css({ opacity: 0 }),
	$("#coughDrop9").css({ opacity: 0 }),
	$("#coughDrop10").css({ opacity: 0 }),
	
	// Sets the next beaker to be measured the first beaker
	currentBeaker = 0;
	
	// Sets the original flow rate to 0 with no cough drops in the container
	$("#faucetFlowRate").val("0");
	flowRate = 0;
	previousFlowRate = 0;
	numCoughDrops = 0;

	// For enabling web transitions on help tooltip
  helpBoxPopUp = document.getElementById('help_box');

  enableFolding = $(window).width() < $(window).height();
  setLeftMargin();
	
	// Adds functionality to the buttons
	$("#faucetFlowRate").on('change', getFlowRate);
	$("#addDropButton").on('click', addCoughDrop);
	$("#getMeasurementButton").on('click', getMeasurement);
	$("#emptyBeakerButton").on('click', emptyBeakers);
	$("#beakerSaturated").on('click', displaySaturatedText);
	$("#infoButton").on('click', displayInfoAlert);
	$("#startstopbutton").on('click', startstop);
	$("#splitbutton").on('click', splittime);
	$("#resetbutton").on('click', resetclock);
	setHelpBtnEvent();
}

/*
*************************************************************************************************************************
*													Event Handlers														*
*************************************************************************************************************************
*/

/*
 * Event Handler Function: getFlowRate
 * Called when the user inputs a new value into the faucetFlowRate field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getFlowRate() {
	var input = $("#faucetFlowRate").val();
	
	// if the entered value is not a valid number, keep the current flow rate and display that number in the input field.
	// if no valid pump rate as been entered, clear the input field
	if(isNaN(input) || input == "") {
		if(!isNaN(flowRate)) {
			$("#faucetFlowRate").val(flowRate);	
		}
		else {
			$("#faucetFlowRate").val("");	
		}
	}
	// if the input is outside the valid range, set the flow rate to the highest/lowest valid value
	// and update the display accordingly
	else if(input > maxFlowRate) {
		flowRate = maxFlowRate;
		$("#faucetFlowRate").val(maxFlowRate);
	}
	else if(input < minFlowRate) {
		flowRate = minFlowRate;
		$("#faucetFlowRate").val(minFlowRate);
	}
	// if input is valid, set flowRate
	else {
		flowRate = input;	
	}
	
	var previousImg;
	var currentImg;
	
	// Finds the previous image of the flow rate
	if ($("#faucetFlow0").is(":visible"))
		previousImg = 1;
	else if ($("#faucetFlow1").is(":visible"))
		previousImg = 2;
	else if ($("#faucetFlow2").is(":visible"))
		previousImg = 3;
	else if ($("#faucetFlow3").is(":visible"))
		previousImg = 4;
	else
		previousImg = 0;
	
	// Finds what the current image of the flow rate should be
	if (flowRate == 0)
		currentImg = 0;
	else if (flowRate < 6)
		currentImg = 1;
	else if (flowRate < 12)
		currentImg = 2;
	else if (flowRate < 16)
		currentImg = 3;
	else
		currentImg = 4;
	
	// Finds out if the image needs to be replaced. If so there will be a fade in and fade out of the two images
	if (!(previousImg === currentImg)) {
		if (previousImg === 1)
			$("#faucetFlow0").fadeOut(1000);
		else if (previousImg === 2)
			$("#faucetFlow1").fadeOut(1000);
		else if (previousImg === 3)
			$("#faucetFlow2").fadeOut(1000);
		else if (previousImg === 4)
			$("#faucetFlow3").fadeOut(1000);
		else {}
			
		if (currentImg === 1)
			$("#faucetFlow0").fadeIn(1000);
		else if (currentImg === 2)
			$("#faucetFlow1").fadeIn(1000);
		else if (currentImg === 3)
			$("#faucetFlow2").fadeIn(1000);
		else if (currentImg === 4)
			$("#faucetFlow3").fadeIn(1000);
		else {}
	}
	
	// Find how high the water level should be in the funnel
	waterHeight = 58 - flowRate / 2.5;
	
	// Shows a stream flowing out of the funnel if there is a faucet flow rate greater than 0 and hides it if the flow rate is 0
	if (flowRate > 0 && !$("#solutionFlow").is(":visible"))
		$("#solutionFlow").fadeIn(1000);
	else if (flowRate == 0)
		$("#solutionFlow").fadeOut(1000);
	else {}
	
	// Animates the height of the water level
	$("#faucetWaterBox").animate({top: "" + waterHeight + "%"}, 1000, "linear");
	
	// Animates the faucet handle rotation
	var angle = -1 * Math.round(110 * flowRate / maxFlowRate); 
	$("#faucetHandle").rotate({animateTo:angle, duration:1000});
	
	// Changes the dissolve rate of all the cough drops currently in the funnel
	setFadeGlobalTime();
}

/*
 * Event Handler Function: addCoughDrop
 * Called when the user clicks on the "Add a Cough Drop" button
 *
 * Adds a cough drop to the funnel and determines how long it takes for it to dissolve
*/
function addCoughDrop() {
	// Don't do anything if this button has been disabled
	if ($('#addDropButton').attr('disabled')) {
		return;
	}

	var coughDrop = -1;
	
	// Finds out which cough drop to place into the funnel. The order goes from the middle to the outside
	if (opacityDrop2 == 0){
			coughDrop = 2;
			$("#coughDrop2").css({ opacity: 1 });
			opacityDrop2 = 1;
	} else if (opacityDrop3 == 0){
			coughDrop = 3;
			$("#coughDrop3").css({ opacity: 1 });
			opacityDrop3 = 1;
	} else if (opacityDrop1 == 0){
			coughDrop = 1;
			$("#coughDrop1").css({ opacity: 1 });
			opacityDrop1 = 1;
	} else if (opacityDrop4 == 0){
			coughDrop = 4;
			$("#coughDrop4").css({ opacity: 1 });
			opacityDrop4 = 1;
	} else if (opacityDrop0 == 0){
			coughDrop = 0;
			$("#coughDrop0").css({ opacity: 1 });
			opacityDrop0 = 1;
	} else if (opacityDrop5 == 0){
			coughDrop = 5;
			$("#coughDrop5").css({ opacity: 1 });
			opacityDrop5 = 1;
	} else if (opacityDrop8 == 0){
			coughDrop = 8;
			$("#coughDrop8").css({ opacity: 1 });
			opacityDrop8 = 1;
	} else if (opacityDrop9 == 0){
			coughDrop = 9;
			$("#coughDrop9").css({ opacity: 1 });
			opacityDrop9 = 1;
	} else if (opacityDrop7 == 0){
			coughDrop = 7;
			$("#coughDrop7").css({ opacity: 1 });
			opacityDrop7 = 1;
	} else if (opacityDrop10 == 0){
			coughDrop = 10;
			$("#coughDrop10").css({ opacity: 1 });
			opacityDrop10 = 1;
	} else if (opacityDrop6 == 0){
			coughDrop = 6;
			$("#coughDrop6").css({ opacity: 1 });
			opacityDrop6 = 1;
	}
	// If a cough drop was added, find out how long it needs for it to dissolve
	if (coughDrop != -1)
		setFadeTime(coughDrop)
}

/*
 * Event Handler Function: getMeasurement
 * Called when the user clicks on the "Take a Measurement" button
 *
 * Takes an empty beaker and moves it under the funnel, fills it up, and returns it to the original place
*/
function getMeasurement() {
	// Don't do anything if this button has been disabled
	if ($('#getMeasurementButton').attr('disabled')) {
		return;
	}

	// Disables any input that can change the outcome
	$("#getMeasurementButton").attr("disabled", "disabled");
	$("#emptyBeakerButton").attr("disabled", "disabled");
	$("#addDropButton").attr("disabled", "disabled");
	$("#faucetFlowRate").attr("disabled", "disabled");

	// Does not allow any measurement to be made with no water flowing
	if (flowRate == 0) {
		$("#getMeasurementButton").removeAttr("disabled");
		$("#emptyBeakerButton").removeAttr("disabled");
		$("#addDropButton").removeAttr("disabled");
		$("#faucetFlowRate").removeAttr("disabled");
		alert("You can't take a measurement without any solution flowing.");
	}
	// Takes the measurement if there are any empty beakers
	else if (currentBeaker < 5) {
		var topPct = "-172%";
		$("#beaker" + currentBeaker).animate({top: topPct, left:"58%"}, 1000, "linear", getConcentration);
		// Begin timer
		forceStart();
	}
	else {
		$("#getMeasurementButton").removeAttr("disabled");
		$("#emptyBeakerButton").removeAttr("disabled");
		$("#addDropButton").removeAttr("disabled");
		$("#faucetFlowRate").removeAttr("disabled");
		alert("All the beakers already have a solution in it. You must empty all beakers in order to take another measurement.");
	}
}

/*
 * Event Handler Function: emptyBeakers
 * Called when the user clicks on the "Empty all Beakers" button
 *
 * Empties out all the beakers
*/
function emptyBeakers() {
	concentrations = []; // Reset array of concentrations
	placeBeakers();
	currentBeaker = 0;	
}

/*
 * Positions the beakers at their original locations.
 */
function placeBeakers() {
	var leftPct = 0; /* Start at the farthest left corner of the div */
	for (var beaker = 0; beaker < 5; beaker++) {
		for (var conc = 0; conc < 6; conc++) {
			$("#beakerSoln" + conc + beaker).hide();
			$("#beakerSoln" + conc + beaker).css({"left": leftPct + "%", "top": "0%"});
		}
		$("#beaker" + beaker).css({"left": leftPct + "%", "top": "0%"});
		$("#beaker" + beaker).show();
		leftPct += beakerSpacing;
	}
}

/*
 * Displays a help tooltip to the left of the experiment (only possible when
 * the user isn't on a mobile device).
 */
function displayHelpAlertDesktop() {
	if (enableFolding) return;
	helpBoxPopUp.classList.toggle("appear");
}

/*
 * Displays a help alert for mobile (not enough room onscreen to show the
 * help tooltip).
 */
function displayHelpAlertMobile() {
	if (!enableFolding) return;
	alert("The objective of this activity is to achieve steady state by measuring " +
			" the same shade of red with all five beakers. " +
			"However, measuring white five times does not count.\n\n" +
			"Instructions:\nYou may control both the addition of cough drops " +
			"and the water flow rate in this system. Start by getting a feel " +
			"for the controls by adding several cough drops and starting the " +
			"water flow by typing in a flow rate between 1-10 mL/s.\n\n" +
			"a. Start with at least 2 (but up to 12) cough drops in the funnel.\n" +
			"b. Allow water to flow into the funnel. Adjust the flow rate to the " +
			"desired level (note you may change this as the experiement progresses " +
			"or you may leave it constant).\n" +
			"c. As needed, add cough drops to the system (note that you do not " +
			"have to completely dissolve a cough drop before an additional cough " +
			"drop is needed\u2014think about this).\n" +
			"d. Collect samples from the outflow using the 'Take a Measurement' " +
			"button. Examine the resulting shade of pink, and make adjustments " +
			"as needed. The color bar at the bottom of the screen is there to " +
			"help you track the concentration (you may use the numbers 1-6 to " +
			"refer to the deepness of the red color).\n" +
			"e. Adjust cough drop addition and flow rate until you can achieve " +
			"your goal of producing a color that is consistent over at " +
			"least five samples. You can use the blue stopwatch to help your " +
			"timing."
		  );
	return false;
}

function displayInfoAlert() {
	var str = "Produced through the efforts of Daniel Prudente (2012). Adapted by Brooke Bullek (2017).\n\n";
	str += "Supported by NSF DUE-0717536\n\n";
	str += "Stopwatch JavaScript code created by Kare Byberg \u00A9 01.21.2005\n\n";
	str += "Questions? Contact Dr. Margot Vigeant, Bucknell University Department of Chemical Engineering\n\n";
	str += "\u00A9 Margot Vigeant 2017";
	alert(str);
	return false;
}

/*
 * Event Handler Function: displaySaturatedText
 * Displays text about the saturated beaker
 *
*/
function displaySaturatedText() {
	alert("This beaker has had cough drops in water for over 12 hours. When a cough drop was completely " +
		"dissolved, a new one was added. This process continued until newly added cough drops did not dissolve.")
}

/*
*************************************************************************************************************************
*													Animation Functions													*
*************************************************************************************************************************
*/

/*
 * Animation Function: returnBeaker
 * Returns the beaker from under the funnel back to its given place.
 *
*/
function returnBeaker() {
	// Show the image with the beaker and the solution in it
	$("#beakerSoln" + currentConc + "" + currentBeaker).css({"top": "-172%", "left": "58%"});
	$("#beakerSoln" + currentConc + "" + currentBeaker).show();

	concentrations.push(currentConc);

	// Stop timer and record time elapsed
	splittime();
	forceStop();
	
	// Each beaker is positioned approx. 21% of the div's width apart
	var leftPct = currentBeaker * beakerSpacing + "%";
	
	// Hide the empty beaker and solution by itself and return it to the original spot
	$("#beaker" + currentBeaker).hide();
	$("#solution" + currentConc).css({"top" : "95%"});
	$("#beaker" + currentBeaker).css({"top": "0%", "left": leftPct});
	$("#beakerSoln" + currentConc + "" + currentBeaker).animate({top: "0%", left: leftPct}, 1000, "linear");
	
	// Updates beaker counter
	currentBeaker++;
	
	// Re-enables the inputs
	$("#getMeasurementButton").removeAttr("disabled");
	$("#emptyBeakerButton").removeAttr("disabled");
	$("#addDropButton").removeAttr("disabled");
	$("#faucetFlowRate").removeAttr("disabled");
	
	// If all 5 beakers have solution in it, checks to see if they are all the same color
	if (currentBeaker == 5)
		measureWin();
}

/*
*************************************************************************************************************************
*													Calculations														*
*************************************************************************************************************************
*/

/*
 * Function: setFadeTime
 * Calculates the amount of time it takes for a newly added cough drop to dissolve
*/
function setFadeTime(coughDropNum) {
	// Finds the amount of time it takes for a cough drop to dissolve. If there is no flow, fadeTime should be NaN
	var fadeTime = (k / (flowRate)) * 1000;
	if (fadeTime == Infinity)
		fadeTime = Number.NaN;
		
	// If a valid time was calculated, set the time of the newly added cough drop to dissolve, 
	// along with having each animation update the opacity of the cough drop in case the user 
	// changes the flow rate, which will affect the dissolve rate of the remaining cough drop
	if (!isNaN(fadeTime)) {
		if (coughDropNum == 0)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop0 = now;
  					}
				},	"linear");
		else if (coughDropNum == 1)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop1 = now;
  					}
				},	"linear");
		else if (coughDropNum == 2)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop2 = now;
  					}
				},	"linear");
		else if (coughDropNum == 3)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop3 = now;
  					}
				},	"linear");
		else if (coughDropNum == 4)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop4 = now;
  					}
				},	"linear");
		else if (coughDropNum == 5)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop5 = now;
  					}
				},	"linear");
		else if (coughDropNum == 6)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop6 = now;
  					}
				},	"linear");
		else if (coughDropNum == 7)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop7 = now;
  					}
				},	"linear");
		else if (coughDropNum == 8)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop8 = now;
  					}
				},	"linear");
		else if (coughDropNum == 9)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop9 = now;
  					}
				},	"linear");
		else if (coughDropNum == 10)
			$("#coughDrop" + coughDropNum).animate({opacity: 0},
				{
					 duration: fadeTime,
					 step: function(now, fx) {
   						opacityDrop10 = now;
  					}
				},	"linear");
	} 
	// If a valid time wasn't found, simply have the cough drop appear and not dissolve
	else {
		if (coughDropNum == 0)
			opacityDrop0 = 1;
		else if (coughDropNum == 1)
			opacityDrop1 = 1;
		else if (coughDropNum == 2)
			opacityDrop2 = 1;
		else if (coughDropNum == 3)
			opacityDrop3 = 1;
		else if (coughDropNum == 4)
			opacityDrop4 = 1;
		else if (coughDropNum == 5)
			opacityDrop5 = 1;
		else if (coughDropNum == 6)
			opacityDrop6 = 1;
		else if (coughDropNum == 7)
			opacityDrop7 = 1;
		else if (coughDropNum == 8)
			opacityDrop8 = 1;
		else if (coughDropNum == 9)
			opacityDrop9 = 1;
		else if (coughDropNum == 10)
			opacityDrop10 = 1;
	}
}

/*
 * Function: setFadeGlobalTime
 * Calculates the amount of time it takes for all the cough drops in the funnel to dissolve.
 * Only called after the flow rate has been changed
*/
function setFadeGlobalTime() {
	// Finds the base time it takes for a cough drop to dissolve. If there is no flow, fadeTime should be NaN
	var fadeTime = (k / (flowRate)) * 1000;
	if (fadeTime == Infinity)
		fadeTime = Number.NaN;
	
	// If the cough drop is in the funnel (opacity > 0), then it will stop the current animation and start a new one based on the newly found time
	// The new time is the amount of time for a new cough drop multiplied by the amount of cough drop there is left
	// Also has the animation constantly update the opacity in case the user changes the flow rate again
	for (var x = 0; x < 11; x++) {
		$("#coughDrop" + x).stop();	
	}
	if (!isNaN(fadeTime)) {
		if (opacityDrop0 > 0)
			$("#coughDrop0").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop0,
			 		step: function(now, fx) {
						opacityDrop0 = now;
  					}
				},	"linear");
		if (opacityDrop1 > 0)
			$("#coughDrop1").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop1,
			 		step: function(now, fx) {
						opacityDrop1 = now;
  					}
				},	"linear");
		if (opacityDrop2 > 0)
			$("#coughDrop2").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop2,
			 		step: function(now, fx) {
						opacityDrop2 = now;
  					}
				},	"linear");
		if (opacityDrop3 > 0)
			$("#coughDrop3").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop3,
			 		step: function(now, fx) {
						opacityDrop3 = now;
  					}
				},	"linear");
		if (opacityDrop4 > 0)
			$("#coughDrop4").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop4,
			 		step: function(now, fx) {
						opacityDrop4 = now;
  					}
				},	"linear");
		if (opacityDrop5 > 0)
			$("#coughDrop5").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop5,
			 		step: function(now, fx) {
						opacityDrop5 = now;
  					}
				},	"linear");
		if (opacityDrop6 > 0)
			$("#coughDrop6").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop6,
			 		step: function(now, fx) {
						opacityDrop6 = now;
  					}
				},	"linear");
		if (opacityDrop7 > 0)
			$("#coughDrop7").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop7,
			 		step: function(now, fx) {
						opacityDrop7 = now;
  					}
				},	"linear");
		if (opacityDrop8 > 0)
			$("#coughDrop8").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop8,
			 		step: function(now, fx) {
						opacityDrop8 = now;
  					}
				},	"linear");
		if (opacityDrop9 > 0)
			$("#coughDrop9").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop9,
			 		step: function(now, fx) {
						opacityDrop9 = now;
  					}
				},	"linear");
		if (opacityDrop10 > 0)
			$("#coughDrop10").animate({opacity: 0},
				{
					duration: fadeTime * opacityDrop10,
			 		step: function(now, fx) {
						opacityDrop10 = now;
  					}
				},	"linear");		
	}
}

/*
 * Function: getConcentration
 * Calculates the concentration of the solution and what shade of red to use for the animation
 * This calculation assumes that cough drops dissolve linearly and the "Pinkness" a cough drop gives off is the
 * integral of the percentage of cough drop left in the water over time measured from the beginning time when the beaker
 * is under the funnel to the time when the beaker is full.
*/
function getConcentration() {
	var sum = 0;
	var tFill = beakerVol / flowRate;

	var opacityEnd = opacityDrop0 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop0 + opacityEnd);

	opacityEnd = opacityDrop1 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop1 + opacityEnd);

	opacityEnd = opacityDrop2 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop2 + opacityEnd);

	opacityEnd = opacityDrop3 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop3 + opacityEnd);

	opacityEnd = opacityDrop4 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop4 + opacityEnd);

	opacityEnd = opacityDrop5 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop5 + opacityEnd);

	opacityEnd = opacityDrop6 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop6 + opacityEnd);

	opacityEnd = opacityDrop7 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop7 + opacityEnd);

	opacityEnd = opacityDrop8 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop8 + opacityEnd);

	opacityEnd = opacityDrop9 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop9 + opacityEnd);

	opacityEnd = opacityDrop10 - (beakerVol / k)
	if (opacityEnd < 0)
		opacityEnd = 0;	
	sum += (1 / 2) * tFill * (opacityDrop10 + opacityEnd);

	//alert(sum);

	if (sum < concLimit0)
		currentConc = 0;
	else if (sum < concLimit1)
		currentConc = 1;
	else if (sum < concLimit2)
		currentConc = 2;
	else if (sum < concLimit3)
		currentConc = 3;
	else if (sum < concLimit4)
		currentConc = 4;
	else
		currentConc = 5;

	$("#solution" + currentConc).animate({top: "84.5%"}, (beakerVol / flowRate) * 1000, "linear", returnBeaker);
	
}

/*
 * Function: measureWin
 * Tells whether or not the user has completed the task
*/
function measureWin() {
	var numMatching = findNumMatchingBeakers();
	if (numMatching == 5) {
		// The user doesn't win if their 5 matching shades were all white
		if (concentrations[0] == 0) {
			displayAllWhiteLoseMessage();
		} else {
			displayWinMessage();
		}
	} else {
		displayDefaultLoseMessage(numMatching);
	}
}

function displayWinMessage() {
	alert("Congratulations! You achieved steady state. You can empty the beakers to try again, " +
	"perhaps with a different shade.");
}

function displayDefaultLoseMessage(numMatching) {
	alert("You lose! You were unable to achieve steady state, as you only had " +
		numMatching + " out of 5 beakers with identical concentrations. You " +
		"can empty the beakers to try again.");
}

function displayAllWhiteLoseMessage() {
	alert("You lose! Although you measured five beakers with the same concentration, this " +
		"concentration was zero! Add cough drops to the funnel in order to measure a non-zero " +
		"concentration. You can empty the beakers to try again.");
}

/*
 * Returns the largest number of beakers that share a concentration.
 * Used for alerting the user to how many matching shades they got out of five.
 */
function findNumMatchingBeakers() {
	var maxNum = 1;
	var currNum = 1;
	for (var i = 0; i < concentrations.length; i++) {
		for (var j = i + 1; j < concentrations.length; j++) {
			if (concentrations[i] == concentrations[j])
				currNum++;
		}
		if (currNum > maxNum)
			maxNum = currNum;
		currNum = 1;
	}

	return maxNum;
}

/*
 * Configures whether a browser pop-up or a tooltip embedded in the HTML appears when
 * the user clicks the help button. On mobile devices, a screen folding effect occurs
 * so there's no room for a tooltip.
 */
function setHelpBtnEvent() {
	if (enableFolding) {
		$("#helpButton").on("click", function(e) {
	    e.stopImmediatePropagation(); // Prevent multiple inadvertent pop-ups
	    e.preventDefault();
	    displayHelpAlertMobile();
	  });
	} else {
		$("#helpButton").on('click', displayHelpAlertDesktop);
	}
}

/*
 * Because the experiment's dimensions have a minimum width, it's possible for the 
 * user to shrink the window enough to make the graphics appear off-center.
 * This function recalculates the proper left offset of the simulation.
 */
function setLeftMargin() {
	var experimentWidthRatio = $("#experiment").width() / $(window).width() * 100;
	var leftPct = (100 - experimentWidthRatio) / 2 + "%";
	$("#experiment").css({ "left" : leftPct });
	$("#head").css({ "left" : leftPct });
	$("#panel_container").css({ "left" : leftPct });
}

/*
 * If the window is resized and its width reaches < 1024 pixels (the
 * threshold for when mobile folding is used), change the event handler
 * for the help button to an alert instead of a tooltip.
 */
$(window).resize(function() {
	enableFolding = $(window).width() < $(window).height();

	// Hide the help box if it's active and the window has folded
	if (enableFolding && $("#help_box").hasClass("appear")) {
		helpBoxPopUp.classList.toggle("appear");
	}

	// Reassign the function toggled by the help button
	setHelpBtnEvent();

	// Change the left offset of the experiment
	setLeftMargin();
});
