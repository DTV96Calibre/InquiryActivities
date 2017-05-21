/*
 * File: MISscript.js
 * Purpose: To provide the animations and interactivity for the Melting Ice Simulation (melting-ice.html)
 * Author: Emily Ehrenberger (July 2011)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 *		   Based on Flash simulation by Matt Koppenhaver under Professor Michael Prince
 * (c) Margot Vigeant 2011
*/


/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/


$(document).ready(init);

// Global constants
var icewaterTemp = 0;
var tauNumber = 5; // a scaling factor
var graphWidth = 811; // The width of the graph in pixels; used for scaling
var graphHeight = 453; // The height of the graph in pixels; used for scaling

// Variables to keep track of state
var graphInfoShowing = false;
var experimentRunning = false;
var sit1BlockTop;
var sit2BlockTop;
var sit1BlockHeight;
var sit2BlockHeight;
var currentStep;

// Variables to hold input values
var initialTemp1;
var heatCapacity1;
var mass1;
var area1;
var numBlocks1;
var stirFactor1;

var initialTemp2;
var heatCapacity2;
var mass2;
var area2;
var numBlocks2;
var stirFactor2;

// Variables that will be necessary for calculations
var currentBlockTemp1;
var currentBlockTemp2;
var tau; // total "time" to simulate (depends on user's inputs; is NOT the number of steps to run)
var initialQ1;
var initialQ2;
var q1;
var q2;
var secondsPerStep;
var iceMeltHeight1;  // iceMeltHeight and iceMeltWidth represent the amount the ice's size should change in each dimension,
var iceMeltWidth1;   // such that, for example, the ice's full size minus iceMeltHeight1 will give you the height the ice
var iceMeltHeight2;  // should be at the end of a given experiment.
var iceMeltWidth2;
var currentIceWidth1;
var currentIceHeight1;
var currentIceWidth2;
var currentIceHeight2;
var xScale; // Used to store pixels/second for the x-axis of the graph
var yScale; // Used to store pixels/gram for the x-axis of the graph



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
	$("#stirBar1").hide();
	$("#stirBar2").hide();
	$("#graphHeightInfo").hide();
	$("#graphSlopeInfo").hide();
	
	resetSituation1(); // restore Situation 1 parameters to default values (in program and on display)
	resetSituation2();
	generateGraphPoints(); // must initialize the objects used as points on the graph
	resetExperiment(); // the experiment animations must be reset AFTER the graph points are initialized
	
	// register event handlers for Situation 1 input fields
	$("#temp1").live('change', getTemps);
	$("#heatCapacity1").live('change', getHeatCapacities);
	$("#mass1").live('change', getMasses);
	$("#area1").live('change', getAreas);
	$("#numBlocks1").live('change', getNumBlocks);
	$("#stirBarCheck1").click(toggleStirBar1); // check box must be registered with "click" to work correctly in IE
	$("#sit1DefaultButton").live('click', resetSituation1);
	
	// register event handlers for Situation 1 input fields
	$("#temp2").live('change', getTemps);
	$("#heatCapacity2").live('change', getHeatCapacities);
	$("#mass2").live('change', getMasses);
	$("#area2").live('change', getAreas);
	$("#numBlocks2").live('change', getNumBlocks);
	$("#stirBarCheck2").click(toggleStirBar2); // check box must be registered with "click" to work correctly in IE
	$("#sit2DefaultButton").live('click', resetSituation2);
	
	// register event handlers for control buttons (start, pause, reset)
	$("#startButton").live('click', startMelting);
	$("#pauseButton").live('click', pauseMelting);
	$("#resetButton").live('click', resetExperiment);
	$("#helpButton").live('click', showHelp);
	
	// register event handlers for links to display more info
	$("#graphInfo").live('click', displayGraphInfo);
	$("#about").live('click', displayAboutInfo);
	$("#IEexp").live('click', displayIEexp);	
}

/*
 * Function: generateGraphPoints
 * Adds 400 images (200 for each Situation) to the HTML page to represent points on the graph. This is
 * done only when the page is first loaded. Done dynamically to keep the saved HTML document concise.
*/
function generateGraphPoints() {
	var sit1HTML = "";
	var sit2HTML = "";
	
	for(var i=1; i<=200; i++) {
		sit1HTML += '<img id="sit1Point' + i + '" class="sit1Point" src="blank_img.png" />';
		sit2HTML += '<img id="sit2Point' + i + '" class="sit2Point" src="blank_img.png" />';
	}
	
	$("#graphBase").after('<div id="graphPointsDiv">' + sit1HTML + sit2HTML + '</div>');
}

/* 
 * Function: resetExperiment
 * Resets the visual display to what it should look like before an experiment is run. Largely consists
 * of enabling input fields (which are disabled while an experiment is running). It is also necessary
 * to reset the temperature of the blocks, because that temperature changes while an experiment
 * is running.
*/
function resetExperiment() {
	
	experimentRunning = false;
	
	// Re-enable the input fields, and change all the colors back to their original
	// reds and blues. (Many are grayed out manually in the startMelting function.)
	$(".input1").removeAttr("disabled");
	$(".input1").css("color", "blue");
	$("#stirBarCheck1").removeAttr("disabled");
	$("#sit1DefaultButton").removeAttr("disabled");
	$("#sit1DefaultButton").css("border-color", "#B90000");
	
	$(".input2").removeAttr("disabled");
	$(".input2").css("color", "red");
	$("#stirBarCheck2").removeAttr("disabled");
	$("#sit2DefaultButton").removeAttr("disabled");
	$("#sit2DefaultButton").css("border-color", "#2011D0");
	
	$("#startButton").removeAttr("disabled");
	$("#startButton").css("border-color", "#093");
	
	
	// Make sure the Pause button reads "PAUSE" rather than "RESET", and disable the Pause button
	$("#pauseButton").html("PAUSE");
	$("#pauseButton").attr("value", "pause");
	$("#pauseButton").attr("disabled", "disabled");
	$("#pauseButton").css("border-color", "gray");
	
	// Return the blocks to their original positions and the ice cubes to their
	// original sizes. Hide all data points and labels on the graph.
	getAreas(); //getAreas automatically returns the blocks to the correct height based on their size
	$(".sit1Ice").css({height:"42px", width:"85px"});
	$(".sit2Ice").css({height:"42px", width:"85px"});
	$(".sit1Point").hide();
	$(".sit2Point").hide();
	$(".graphLabel").hide();
	
	// reset currentBlockTemp1 and currentBlockTemp2 by simply re-reading in the initial
	// temperature inputs
	getTemps();
	
	// Clears the display of initial ice that the beakers start with, since this number is not
	// calculated until the Start button is pressed
	$("#initialIce").html("");
}



/*
*************************************************************************
*					Event Handlers for Input Fields						*
*************************************************************************
*/

/*
 * Event Handler Function: getTemps
 * Called when the "initial block temperature" value is changed in the user input field, in either Situation.
 *
 * Reads in the values for "initial block temperature" in both Situation 1 and Situation 2, and updates the
 * "current block temperature" display and the color of the blocks according to the new temperature for each Situation.
*/
function getTemps() {
	initialTemp1 = $("#temp1").val();
	if(initialTemp1 == "") initialTemp1 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset initialTemp1 to its default value
	if(isNaN(initialTemp1)) {
		$("#temp1").val(200);
		initialTemp1 = 200;
	}
	// If initialTemp1 is less than 0, set it to 0
	if(initialTemp1 < 0) {
		$("#temp1").val(0);
		initialTemp1 = 0;
	}
	
	// Now that initialTemp1 is sure to have a valid value, change the "current temperature"
	// label to reflect the new temperature
	currentBlockTemp1 = initialTemp1;
	$("#currentBlockTemp1").html(currentBlockTemp1);
	
	
	initialTemp2 = $("#temp2").val();
	if(initialTemp2 == "") initialTemp2 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset initialTemp2 to its default value
	if(isNaN(initialTemp2)) {
		$("#temp2").val(200);
		initialTemp2 = 200;
	}
	// If initialTemp2 is less than 0, set it to 0
	if(initialTemp2 < 0) {
		$("#temp2").val(0);
		initialTemp2 = 0;
	}
	
	// Now that initialTemp2 is sure to have a valid value, change the "current temperature"
	// label to reflect the new temperature
	currentBlockTemp2 = initialTemp2;
	$("#currentBlockTemp2").html(currentBlockTemp2);

	updateBlockColors();
}

/*
 * Function: updateBlockColors
 * Auxiliary function for getTemps. Updates the colors of the blocks on display, according to the
 * current temperature of the blocks for each situation. (Is also called to update the blocks
 * while an experiment is running.)
*/
function updateBlockColors() {
	// Change situation 1 blocks' color to reflect the temperature
	if(currentBlockTemp1 < 40) {
		$(".sit1block").css("background", "url('blocks.png') 0 0"); // black
	}
	else if(currentBlockTemp1 < 180) {
		$(".sit1block").css("background", "url('blocks.png') -48px 0"); // blue
	}
	else if(currentBlockTemp1 < 400) {
		$(".sit1block").css("background", "url('blocks.png') -96px 0"); // purple/dark red
	}
	else {
		$(".sit1block").css("background", "url('blocks.png') -144px 0"); // bright red
	}
	
	// Change situation 2 blocks' color to reflect the temperature
	if(currentBlockTemp2 < 40) {
		$(".sit2block").css("background", "url('blocks.png') 0 0"); // black
	}
	else if(currentBlockTemp2 < 180) {
		$(".sit2block").css("background", "url('blocks.png') -48px 0"); // blue
	}
	else if(currentBlockTemp2 < 400) {
		$(".sit2block").css("background", "url('blocks.png') -96px 0"); // purple/dark red
	}
	else {
		$(".sit2block").css("background", "url('blocks.png') -144px 0"); // bright red
	}
}

/*
 * Event Handler Function: getHeatCapacities
 * Called when the user enters a new value for "block heat capacity" for either Situation
 *
 * Reads in and validates both heat capacity values, and updates global variables accordingly
*/
function getHeatCapacities() {
	heatCapacity1 = $("#heatCapacity1").val();
	if(heatCapacity1=="") heatCapacity1 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset heatCapacity1 to its default value
	if(isNaN(heatCapacity1)) {
		$("#heatCapacity1").val(1);
		heatCapacity1 = 1;
	}
	// If the value entered is less than 0, set it to 0
	else if(heatCapacity1 <= 0) {
		$("#heatCapacity1").val(0.1);
		heatCapacity1 = 0.1;
	}
	
	
	heatCapacity2 = $("#heatCapacity2").val();
	if(heatCapacity2=="") heatCapacity2 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset heatCapacity2 to its default value
	if(isNaN(heatCapacity2)) {
		$("#heatCapacity2").val(1);
		heatCapacity2 = 1;
	}
	// If the value entered is less than 0, set it to 0
	else if(heatCapacity2 <= 0) {
		$("#heatCapacity2").val(0.1);
		heatCapacity2 = 0.1;
	}
}

/*
 * Event Handler Function: getMasses
 * Called when the user enters a new value for "mass of each block" for either Situation
 *
 * Reads in and validates both mass values, and updates global variables accordingly
*/
function getMasses() {
	mass1 = $("#mass1").val();
	if(mass1=="") mass1 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset mass1 to its default value
	if(isNaN(mass1)) {
		$("#mass1").val(40);
		mass1 = 40;
	}
	// If the value entered is less than 0, set it to 0
	else if(mass1 <= 0) {
		$("#mass1").val(1);
		mass1 = 1;
	}
	
	
	mass2 = $("#mass2").val();
	if(mass2=="") mass2 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset mass2 to its default value
	if(isNaN(mass2)) {
		$("#mass2").val(40);
		mass2 = 40;
	}
	// If the value entered is less than 0, set it to 0
	else if(mass2 <= 0) {
		$("#mass2").val(1);
		mass2 = 1;
	}
}

/*
 * Event Handler Function: getAreas
 * Called when the user enters a new value for "area of each block" for either Situation
 *
 * Reads in and validates both area values, and updates global variables accordingly. Also changes
 * the size of the block pictures on the display, according to the current area values.
*/
function getAreas() {
	area1 = $("#area1").val();
	if(area1=="") area1 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset area1 to its default value
	if(isNaN(area1)) {
		$("#area1").val(4);
		area1 = 4;
	}
	
	// Change the blocks' size according to the input surface area
	switch(area1*1) { // must multiply by 1 to make sure area1 is treated as an integer
	case 0: $("#area1").val(1);
			area1 = 1;
			// If the entered area is 0, reset the area to 1, and then fall through to case 1
	case 1: $(".sit1block").css({height:"17px", width:"17px", top:"76px"}); // "top" must be changed also to keep the blocks the same distance from
			sit1BlockTop = 76;												// the beakers as their size increases
			sit1BlockHeight = 17;
			break;
	case 2: $(".sit1block").css({height:"23px", width:"23px", top:"70px"});
			sit1BlockTop = 70;
			sit1BlockHeight = 23;
			break;
	case 3: $(".sit1block").css({height:"28px", width:"28px", top:"65px"});
			sit1BlockTop = 65;
			sit1BlockHeight = 28;
			break;
	case 4: $(".sit1block").css({height:"33px", width:"32px", top:"60px"});
			sit1BlockTop = 60;
			sit1BlockHeight = 33;
			break;
	case 5: $(".sit1block").css({height:"36px", width:"36px", top:"57px"});
			sit1BlockTop = 57;
			sit1BlockHeight = 36;
			break;
	case 6: $(".sit1block").css({height:"39px", width:"40px", top:"54px"});
			sit1BlockTop = 54;
			sit1BlockHeight = 39;
			break;
	case 7: $(".sit1block").css({height:"43px", width:"42px", top:"50px"});
			sit1BlockTop = 50;
			sit1BlockHeight = 43;
			break;
	case 8: $(".sit1block").css({height:"45px", width:"46px", top:"48px"});
			sit1BlockTop = 48;
			sit1BlockHeight = 45;
			break;
	case 9: $(".sit1block").css({height:"48px", width:"48px", top:"45px"});
			sit1BlockTop = 45;
			sit1BlockHeight = 48;
			break;
	default: // This case should never run, but if it does, reset area1 to its default value
			area1 = 4;
			$("#area1").val(4);
			$(".sit1block").css({height:"33px", width:"32px", top:"60px"});
			sit1BlockTop = 60;
			sit2BlockHeight = 33;
			break;
	}
	
	
	// Now read in and process area2
	
	area2 = $("#area2").val();
	if(area2=="") area2 = NaN; // Ensure a blank text field is read as "no value", not as a value of 0
	
	// If the value entered is not a number, reset area1 to its default value
	if(isNaN(area2)) {
		$("#area2").val(4);
		area1 = 4;
	}
	
	// Change the blocks' size according to the input surface area
	switch(area2*1) { // must multiply by 1 to make sure area2 is treated as an integer
	case 0: $("#area2").val(1);
			area2 = 1;
			// If the entered area is 0, reset the area to 1, and then fall through to case 1
	case 1: $(".sit2block").css({height:"17px", width:"17px", top:"76px"});
			sit2BlockTop = 76;
			sit2BlockHeight = 17;
			break;
	case 2: $(".sit2block").css({height:"23px", width:"23px", top:"70px"});
			sit2BlockTop = 70;
			sit2BlockHeight = 23;
			break;
	case 3: $(".sit2block").css({height:"28px", width:"28px", top:"65px"});
			sit2BlockTop = 65;
			sit2BlockHeight = 28;
			break;
	case 4: $(".sit2block").css({height:"33px", width:"32px", top:"60px"});
			sit2BlockTop = 60;
			sit2BlockHeight = 33;
			break;
	case 5: $(".sit2block").css({height:"36px", width:"36px", top:"57px"});
			sit2BlockTop = 57;
			sit2BlockHeight = 36;
			break;
	case 6: $(".sit2block").css({height:"39px", width:"40px", top:"54px"});
			sit2BlockTop = 54;
			sit2BlockHeight = 39;
			break;
	case 7: $(".sit2block").css({height:"43px", width:"42px", top:"50px"});
			sit2BlockTop = 50;
			sit2BlockHeight = 43;
			break;
	case 8: $(".sit2block").css({height:"45px", width:"46px", top:"48px"});
			sit2BlockTop = 48;
			sit2BlockHeight = 45;
			break;
	case 9: $(".sit2block").css({height:"48px", width:"48px", top:"45px"});
			sit2BlockTop = 45;
			sit2BlockHeight = 48;
			break;
	default: // This case should never run, but if it does, reset area2 to its default value
			area2 = 4;
			$("#area2").val(4);
			$(".sit2block").css({height:"33px", width:"32px", top:"60px"});
			sit2BlockTop = 60;
			sit2BlockHeight = 33;
			break;
	}
}

/*
 * Event Handler Function: getNumBlocks
 * Called when the user enters a new value for "number of blocks" for either Situation
 *
 * Reads in and both values, and updates global variables accordingly. Also shows or hides
 * blocks in the display so that the numbers the user entered determine the number of blocks they see.
*/
function getNumBlocks() {
	numBlocks1 = $("#numBlocks1").val(); // no need for validation because this is a drop-down box, so entering an illegal value is impossible
	
	switch(numBlocks1*1) {
	case 1:
			$("#sit1block1").hide();
			$("#sit1block2").hide();
			$("#sit1block3").show();
			$("#sit1block4").hide();
			break;
	case 2:
			$("#sit1block1").hide();
			$("#sit1block2").show();
			$("#sit1block3").show();
			$("#sit1block4").hide();
			break;
	case 3:
			$("#sit1block1").show();
			$("#sit1block2").show();
			$("#sit1block3").show();
			$("#sit1block4").hide();
			break;
	case 4:
			$("#sit1block1").show();
			$("#sit1block2").show();
			$("#sit1block3").show();
			$("#sit1block4").show();
			break;
	}
	
	
	numBlocks2 = $("#numBlocks2").val();
	
	switch(numBlocks2*1) {
	case 1:
			$("#sit2block1").hide();
			$("#sit2block2").hide();
			$("#sit2block3").show();
			$("#sit2block4").hide();
			break;
	case 2:
			$("#sit2block1").hide();
			$("#sit2block2").show();
			$("#sit2block3").show();
			$("#sit2block4").hide();
			break;
	case 3:
			$("#sit2block1").show();
			$("#sit2block2").show();
			$("#sit2block3").show();
			$("#sit2block4").hide();
			break;
	case 4:
			$("#sit2block1").show();
			$("#sit2block2").show();
			$("#sit2block3").show();
			$("#sit2block4").show();
			break;
	}
}

/*
 * Event Handler Function: toggleStirBar1
 * Called when the user clicks the checkbox to toggle the stir bar in Situation 1
 *
 * Determines whether the checkbox is now checked or unchecked, and updates global variables
 * accordingly. Displays or hides the stir bar animation accordingly as well.
*/
function toggleStirBar1() {
	var isChecked = $("#stirBarCheck1").is(":checked");
	
	if(isChecked) {
		$("#stirBar1").show();
		stirFactor1 = 0.1;
	}
	else {
		$("#stirBar1").hide();
		stirFactor1 = 0.03;
	}
}

/*
 * Event Handler Function: toggleStirBar2
 * Called when the user clicks the checkbox to toggle the stir bar in Situation 2
 *
 * Determines whether the checkbox is now checked or unchecked, and updates global variables
 * accordingly. Displays or hides the stir bar animation accordingly as well.
*/
function toggleStirBar2() {
	var isChecked = $("#stirBarCheck2").is(":checked");
	
	if(isChecked) {
		$("#stirBar2").show();
		stirFactor2 = 0.1;
	}
	else {
		$("#stirBar2").hide();
		stirFactor2 = 0.03;
	}
}

/*
 * Event Handler Function: resetSituation1
 * Called when the user clicks the "Default" button for Situation 1
 * 
 * Restores all parameters for Situation 1 to default values, both in the program
 * and in the display.
*/
function resetSituation1() {
	$("#temp1").val(200);
	$("#heatCapacity1").val(1);
	$("#mass1").val(40);
	$("#area1").val(4);
	$("#numBlocks1Default").attr("selected", "selected");
	$("#stirBarCheck1").removeAttr("checked");
	
	// Calls the event handler functions to read in the new values rather than setting them directly, because
	// some of these parameters require other side effects to happen as well (such as changes in the display)
	getTemps();
	getHeatCapacities();
	getMasses();
	getAreas();
	getNumBlocks();
	toggleStirBar1();
}

/*
 * Event Handler Function: resetSituation2
 * Called when the user clicks the "Default" button for Situation 2
 * 
 * Restores all parameters for Situation 2 to default values, both in the program
 * and in the display.
*/
function resetSituation2() {
	$("#temp2").val(200);
	$("#heatCapacity2").val(1);
	$("#mass2").val(40);
	$("#area2").val(4);
	$("#numBlocks2Default").attr("selected", "selected");
	$("#stirBarCheck2").removeAttr("checked");
	
	// Calls the event handler functions to read in the new values rather than setting them directly, because
	// some of these parameters require other side effects to happen as well (such as changes in the display)
	getTemps();
	getHeatCapacities();
	getMasses();
	getAreas();
	getNumBlocks();
	toggleStirBar2();
}


/*
*************************************************************************
*					Starting/Stopping the Simulation					*
*************************************************************************
*/

/*
 * Function: pauseMelting
 * Called when the user clicks the Pause button while an experiment is running
 *
 * Pauses the experiment by setting experimentRunning to false (so values/display do not keep updating) without
 * resetting or changing any other aspects of the display or state. Also changes the Pause button to read "RESUME" instead.
*/
function pauseMelting() {
	if(experimentRunning) {
		experimentRunning = false;
		$("#pauseButton").html("RESUME");
		$("#pauseButton").attr("value", "resume");
	}
	else {
		experimentRunning = true;
		$("#pauseButton").html("PAUSE");
		$("#pauseButton").attr("value", "pause");
		calculateStep();
	}
}

/*
 * Function: startMelting
 * Called when the user clicks the Start button
 *
 * Performs all setup/initialization that needs to occur at the beginning of every experiment, and
 * then begins the execution of the experiment.
*/
function startMelting() {
	// Reset experiment to the beginning (ex. unmelt ice cubes, move blocks back to their starting location, etc.) just
	// in case the user re-starts the experiment without explicitly clicking the Reset button first
	resetExperiment();
	
	// Disable all input fields. Also change the blues and reds back to grays and blacks,
	// to make it visually clearer that they're disabled.
	$(".input1").attr("disabled", "disabled");
	$(".input1").css("color", "black");
	$("#stirBarCheck1").attr("disabled", "disabled");
	$("#sit1DefaultButton").attr("disabled", "disabled");
	$("#sit1DefaultButton").css("border-color", "gray");
	
	$(".input2").attr("disabled", "disabled");
	$(".input2").css("color", "black");
	$("#stirBarCheck2").attr("disabled", "disabled");
	$("#sit2DefaultButton").attr("disabled", "disabled");
	$("#sit2DefaultButton").css("border-color", "gray");
	
	// Disable "start" button and enable "pause" button
	$("#startButton").attr("disabled", "disabled");
	$("#startButton").css("border-color", "gray");
	$("#pauseButton").removeAttr("disabled");
	$("#pauseButton").css("border-color", "#F00");
	
	// Initialize starting values for the calculations
	calculateGraphLabels();
	initializeCalculationVars();
	
	// Start the experiment
	experimentRunning = true;
	dropBlocks();
}

/*
 * Function: calculateGraphLabels
 * Determines the appropriate max values for the x and y axes on the graph for the current experiment (essentially, adjusts
 * the "zoom" of the graph to make it most readable). Also updates the display of how much ice each beaker starts with,
 * since this is where that number is calculated.
 *
 * To calculate appropriate max for the y-axis (amount of ice melted), the function must essentially run the whole simulation
 * mathematically before the simulation is run for the user, to determine how much ice should melt in 200 steps. Although it is
 * computationally redundant to run the experiment twice, the alternatives are to leave the y-axis unlabeled until the very end
 * of the experiment (not ideal for the user), or to store several data points for each of the 200 steps of calculation in order
 * to reuse them when running the experiment "for real". The computer can run the experiment quickly enough that the user does
 * not notice the lag produced by doing it twice, so this is the most effective alternative.
 *
 * The max value for the x-axis depends on tau, which is calculated in initializeCalculationVars, and represents the amount of time
 * it will take for the fastest Situation to melt all of the ice
*/
function calculateGraphLabels() {
	// Because we're essentially pre-running the whole experiment to find yMax, we need to initialize the variables here, too
	initializeCalculationVars();
	var qInstant1;
	var qInstant2;
	var xMax;
	var yMax;
	
	for(var i=1; i<=200; i++) {
		// Calculate heat transfer and new block temperatures for this step for the blocks of situation 1
		qInstant1 = stirFactor1 * area1 * numBlocks1 * (currentBlockTemp1 - icewaterTemp) * secondsPerStep;
		if (qInstant1 > initialQ1)
			qInstant1 = initialQ1;
		q1 = q1 - qInstant1;
		currentBlockTemp1 = q1/(numBlocks1 * mass1 * heatCapacity1) + icewaterTemp;

		// Calculate heat transfer and new block temperatures for this step for the blocks of situation 2
		qInstant2 = stirFactor2 * area2 * numBlocks2 * (currentBlockTemp2 - icewaterTemp) * secondsPerStep;
		if (qInstant2 > initialQ2)
			qInstant2 = initialQ2;
		q2 = q2 - qInstant2;
		currentBlockTemp2 = q2/(numBlocks2 * mass2 * heatCapacity2) + icewaterTemp;
	}
	
	var iceMelt1 = (initialQ1 - q1) / 2.01; // The heat capacity for ice is 2.01 j/gC
	var iceMelt2 = (initialQ2 - q2) / 2.01;
	var maxIceMelt;
	
	if(iceMelt1 > iceMelt2)
		maxIceMelt = Math.floor(iceMelt1);
	else
		maxIceMelt = Math.floor(iceMelt2);
		
	// Now that we know the amount of ice that both beakers will start with (i.e. the max ice that will
	// be melted) we can update that amount on the display
	$("#initialIce").html(maxIceMelt);
		
	// We only want the order of magnitude for y, so separate out the first digit
	// and fill in the rest with 0's
	if(maxIceMelt >= 100000)
		yMax = Math.ceil(maxIceMelt/100000) * 100000;
	else if(maxIceMelt >= 10000)
		yMax = Math.ceil(maxIceMelt/10000) * 10000;
	else if(maxIceMelt >= 1000)
		yMax = Math.ceil(maxIceMelt/1000) * 1000;
	else if(maxIceMelt >= 100)
		yMax = Math.ceil(maxIceMelt/100) * 100;
	else if(maxIceMelt >= 10)
		yMax = Math.ceil(maxIceMelt/10) * 10;
	else
		yMax = Math.ceil(maxIceMelt);
		
		
	// Having calculated yMax, fill in the values of the 4 labels on the y-axis accordingly
	$("#yLabel1").html(yMax / 4);
	$("#yLabel2").html(yMax / 2);
	$("#yLabel3").html(yMax * 3/4);
	$("#yLabel4").html(yMax);
	
	
	// Now label the x-axis
	xMax = Math.floor(tau);
	$("#xLabel1").html(xMax / 4);
	$("#xLabel2").html(xMax / 2);
	$("#xLabel3").html(xMax * 3/4);
	$("#xLabel4").html(xMax);
	
	$(".graphLabel").show();
	
	// Finally, calculate xScale and yScale
	xScale = graphWidth / xMax;
	yScale = graphHeight / yMax;
}

/* 
 * Function: initializeCalculationVars
 * 
*/
function initializeCalculationVars() {
	currentStep = 1;
	
	// Ensure all input values are current
	getTemps();
	getHeatCapacities();
	getMasses();
	getAreas();
	getNumBlocks();
	toggleStirBar1();
	toggleStirBar2();
	
	var tau1 = mass1 * heatCapacity1/(numBlocks1 * stirFactor1 * area1);
	var tau2 = mass2 * heatCapacity2/(numBlocks2 * stirFactor2 * area2);
	if(tau1 > tau2)
		tau = tau1 * tauNumber;
	else
		tau  = tau2 * tauNumber;
		
	secondsPerStep = tau/200;

	initialQ1 = mass1 * heatCapacity1 * (currentBlockTemp1-icewaterTemp) * numBlocks1;
	q1 = initialQ1;
	initialQ2 = mass2 * heatCapacity2 * (currentBlockTemp2-icewaterTemp) * numBlocks2;
	q2 = initialQ2;
	
	currentIceHeight1 = 42;
	currentIceWidth1 = 85;
	currentIceHeight2 = 42;
	currentIceWidth2 = 85;
	
	// Whichever situation has the bigger initial q value should have its ice melt all the way (max time and
	// max ice melted were calculated to make sure that happens). For the other situation, the amount of ice
	// that melts is proportional of the ratio of the two situations' initial q values.
	if(initialQ1 > initialQ2) {
		iceMeltHeight1 = 42;
		iceMeltWidth1 = 85;
		iceMeltHeight2 = initialQ2/initialQ1 * 42;
		iceMeltWidth2 = initialQ2/initialQ1 * 85;
	}
	else {
		iceMeltHeight2 = 42;
		iceMeltWidth2 = 85;
		iceMeltHeight1 = initialQ1/initialQ2 * 42;
		iceMeltWidth1 = initialQ1/initialQ2 * 85;
	}
}

function dropBlocks() {
	sit1BlockTop = sit1BlockTop + 45;
	var cssVal1 = sit1BlockTop + "px";
	
	sit2BlockTop = sit2BlockTop + 45;
	var cssVal2 = sit2BlockTop + "px";
	
	// Move the blocks down until they hit the water (the coordinates that were just calculated). Make
	// the fall take half a second (500ms). Then call calculateStep to start the heat-transfer calculations.
	$(".sit1block").animate({top:cssVal1}, 500, "linear");
	$("#sit2block1, #sit2block2, #sit2block3").animate({top:cssVal2}, 500, "linear");
	//sit2block4 must be animated separately so that the callback can be attached to only that one block;
	// otherwise it will be called four times (one for each block selected by ".sit2block")
	$("#sit2block4").animate({top:cssVal2}, 500, "linear", calculateStep);
}


/*
*************************************************************************
*							Running the Simulation						*
*************************************************************************
*/

function calculateStep() {
	if(!experimentRunning) return;
	if(currentStep > 200) {
		experimentRunning = false;
		$("#startButton").removeAttr("disabled");
		$("#startButton").css("border-color", "#093");
		$("#pauseButton").attr("disabled", "disabled");
		$("#pauseButton").css("border-color", "gray");
		return;
	}
	
	// Calculate heat transfer and new block temperatures for this step for the blocks of situation 1
	var qInstant1 = stirFactor1 * area1 * numBlocks1 * (currentBlockTemp1 - icewaterTemp) * secondsPerStep;
	if (qInstant1 > initialQ1)
		qInstant1 = initialQ1;
	q1 = q1 - qInstant1;
	currentBlockTemp1 = q1/(numBlocks1 * mass1 * heatCapacity1) + icewaterTemp;

	// Calculate heat transfer and new block temperatures for this step for the blocks of situation 2
	var qInstant2 = stirFactor2 * area2 * numBlocks2 * (currentBlockTemp2 - icewaterTemp) * secondsPerStep;
	if (qInstant2 > initialQ2)
		qInstant2 = initialQ2;
	q2 = q2 - qInstant2;
	currentBlockTemp2 = q2/(numBlocks2 * mass2 * heatCapacity2) + icewaterTemp;
	
	// Calculate the coordinates for the points on the graph
	var x = currentStep * secondsPerStep * xScale;
	x = x + "px";
	var y1 = ((initialQ1 - q1) / 2.01) * yScale; // The amount of ice melted is equal to the change in q divided by the
												// heat capacity of water (2.01)
	y1 = graphHeight - y1; // account for the fact that element positioning on a page counts from the top, not the bottom
	y1 = y1 + "px";
	var y2 = ((initialQ2 - q2) / 2.01) * yScale;
	y2 = graphHeight - y2;
	y2 = y2 + "px";

	
	// Calculate the new height and width values for the ice cubes of situation 1
	// Note that since currentIceHeight is a global variable, it is necessary to make a copy of it
	// to format it correctly for CSS, because if you change the format of the original you'll have
	// to change it back again afterwards.
	currentIceHeight1 = currentIceHeight1 - (qInstant1/initialQ1 * iceMeltHeight1);
	var cssHeight1 = currentIceHeight1 + "px";
	currentIceWidth1 = currentIceWidth1 - (qInstant1/initialQ1 * iceMeltWidth1);
	var cssWidth1 = currentIceWidth1 + "px";
	
	// Update the current temperature of the blocks on the screen, and change the color to match
	$("#currentBlockTemp1").html(currentBlockTemp1.toFixed(2));
	$("#currentBlockTemp2").html(currentBlockTemp2.toFixed(2));
	updateBlockColors();
	
	// Calculate the new height and width values for the ice cubes of situation 2
	currentIceHeight2 = currentIceHeight2 - (qInstant2/initialQ2 * iceMeltHeight2);
	var cssHeight2 = currentIceHeight2 + "px";
	currentIceWidth2 = currentIceWidth2 - (qInstant2/initialQ2 * iceMeltWidth2);
	var cssWidth2 = currentIceWidth2 + "px";
	
	// Animate blocks. The rest of the visual changes will take place while the animation is
	// running; as a callback, the animation will re-call this function. Like in dropBlocks,
	// sit2block4 will be animated separately so that the callback can be attached to that block alone,
	// to make sure the callback is only called once.
	if((sit1BlockTop+sit1BlockHeight) < 255) // If the blocks are already at the bottom of the beaker, don't move them
		sit1BlockTop++;
	if((sit2BlockTop+sit2BlockHeight) < 255)
		sit2BlockTop++;
	var cssVal1 = sit1BlockTop + "px";
	var cssVal2 = sit2BlockTop + "px";
	$(".sit1block").css("top", cssVal1);
	$("#sit2block1, #sit2block2, #sit2block3").css("top", cssVal2);
	$("#sit2block4").animate({top:cssVal2}, 50, "linear", calculateStep); // One frame should take about 50ms
	
	// Shrink the ice cubes
	$(".sit1Ice").css({height:cssHeight1, width:cssWidth1});
	$(".sit2Ice").css({height:cssHeight2, width:cssWidth2});
	
	var dot1 = "#sit1Point" + currentStep;
	var dot2 = "#sit2Point" + currentStep;
	$(dot1).css({top:y1, left:x});
	$(dot2).css({top:y2, left:x});
	$(dot1).show();
	$(dot2).show();
	
	currentStep++;
}



/*
*************************************************************************
*						Hiding/Showing More Info						*
*************************************************************************
*/

function showHelp() {
	alert("Melting Ice Simulation lets you compare the rate of energy transfer\n" +
		  "from heated blocks to ice cubes in two different beakers, each under\n" +
		  "its own set of initial conditions.\n\n" +
		  "Choose the initial conditions for Situation 1 and Situation 2.\n\n" +
		  "Then click the Start button to watch the ice melt.\n\n" +
		  "After the ice has melted, in order to change the initial conditions\n" +
		  "for another experiment, you must first press the Reset button to\n" +
		  "return the ice and the heated blocks to their initial positions\n" +
		  "and energies.\n\n" +
		  "While the ice is melting, you can watch the graph to see the mass\n" +
		  "of ice melted in each beaker over time. Note that the axes are\n" +
		  "recalculated every time to ensure a good view of the graph.\n\n" +
		  "This simulation assumes that all energy transferred goes into\n" +
		  "melting ice at 0�C into water at 0�C, and none goes into changing\n" +
		  "the temperature of the water or ice.");
}

function displayGraphInfo() {
	if(graphInfoShowing) {
		$("#graphHeightInfo").hide();
		$("#graphSlopeInfo").hide();
		graphInfoShowing = false;
	}
	else {
		$("#graphHeightInfo").fadeIn();
		$("#graphSlopeInfo").fadeIn();
		graphInfoShowing = true;
	}
	return false;
}

function displayAboutInfo(){
	alert("This program was created under the direction of Dr. Margot Vigeant\n" +
		  "and Dr. Michael Prince at Bucknell University. It was first developed\n" +
		  "in Flash by Matt Koppenhaver under Dr. Prince, and was adapted to\n" +
		  "Javascript by Emily Ehrenberger under Dr. Vigeant in 2011.\n\n" +
		  "The development of this program was funded by the National Science\n" +
		  "Foundation Grant DUE-0442234 (Prince) and DUE-0717536 (Vigeant).\n\n" +
		  "Address any questions or comments to prince@bucknell.edu.\n\n" +
		  "                                                Copyright.");
	return false;
}

function displayIEexp() {
	alert("Your ice cubes look like giant bricks because you are using a browser that cannot always display rounded corners correctly. " +
		  "If you want nicer-looking ice cubes, try switching to a different browser. But don't worry, the simulation will " +
		  "work fine either way!");
	
	return false;
}