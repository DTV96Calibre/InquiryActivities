/*
 * File: carnotAnimate.js
 * Purpose: To provide the animations and interactivity for the Carnot Engine simulation (Carnot-Engine.html)
 * Author: Emily Ehrenberger (May 2011)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 *		   Based on Flash simulation by Molly Harms and Gavin MacInnes (2009)
 * (c) Margot Vigeant 2009
*/


/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/

$(document).ready(init);

// Global constants
var heatIn = 1000;
var R = 0.008314;
var Cp = 5/2 * R;

// Variables to hold input values
var hotTemp;
var hotUnits;
var coldTemp;
var coldUnits;
var componentsFactor;  // Represents the factor by which the engine's efficiency is scaled, based on whether the components
						// are "Normal", "Good", "Cutting Edge", or "Ideal". (The calculations assume ideal components, so
						// if those are selected, don't scale at all--componentsFactor should be 1. The less ideal the
						// components are, the smaller of a fraction componentsFactor is.)

var tooltipsOn; // Toggles whether "extra info" tooltips should be displayed in response to the mouse hovering over parts of the engine

// Variables to hold cycle data (calculation results)
var pressure1;  // Pressure of the first phase of the Carnot cycle (top left)
var pressure2;  // Pressure of the second phase of the Carnot cycle (top right)
var pressure3;  // Pressure of the third phase of the Carnot cycle (bottom)
var pressure4;  // Pressure of the fourth phase of the Carnot cycle (bottom left)
var workIn;
var workOut;
var netWork;
var heatOut;
var thermEff;
var ECarnot; //not displayed but needed to determine the "hotTemp" trivia

/*
 * Method: init
 * Resets all input and output fields and sets up animations, event handlers, etc. when the page is loaded
*/
function init(){
	// Clear all input fields and their corresponding global variables
	$("#hotTempInput").val("");
	$("#coldTempInput").val("");
	hotTemp = NaN;
	coldTemp = NaN;
	$("#hotFactArea").val("Please enter a hot temperature.");
	$("#coldFactArea").val("Please enter a cold temperature.");
	// Reset the drop-down lists to their default values
	$("#componentsDefault").attr("selected","selected");
	$("#coldUnitDefault").attr("selected","selected");
	$("#hotUnitDefault").attr("selected","selected");
	// ... and then reread in those values to ensure consistency, just in case
	getHotUnits();
	getColdUnits();
	getComponents();

	// Clear all GUI fields/labels and variables containing calculated cycle data
	clearCalculatedData();

	// Hide the "tooltip" displays and register event handlers to trigger their reappearance when
	// the mouse hovers over the corresponding page elements.
	$("#hotTempTooltip").hide();
	$("#hotTempInput").on('mouseover', function() {showTooltip("hotTempTooltip");});
	$("#hotTempInput").on('mouseout', function() {hideTooltip("hotTempTooltip");});
	$("#coldTempTooltip").hide();
	$("#coldTempInput").on('mouseover', function() {showTooltip("coldTempTooltip");});
	$("#coldTempInput").on('mouseout', function() {hideTooltip("coldTempTooltip");});
	$("#compSelectTooltip").hide();
	$("#compSelect").on('mouseover', function() {showTooltip("compSelectTooltip");});
	$("#compSelect").on('mouseout', function() {hideTooltip("compSelectTooltip");});
	$("#cycleLeftTooltip").hide();
	$("#cycleLeftHover").on('mouseover', function(){showTooltip("cycleLeftTooltip");});
	$("#cycleLeftHover").on('mouseout', function(){hideTooltip("cycleLeftTooltip");});
	$("#cycleTopTooltip").hide();
	$("#cycleTopHover").on('mouseover', function(){showTooltip("cycleTopTooltip");});
	$("#cycleTopHover").on('mouseout', function(){hideTooltip("cycleTopTooltip");});
	$("#cycleRightTooltip").hide();
	$("#cycleRightHover").on('mouseover', function(){showTooltip("cycleRightTooltip");});
	$("#cycleRightHover").on('mouseout', function(){hideTooltip("cycleRightTooltip");});
	$("#cycleBottomTooltip").hide();
	$("#cycleBottomHover").on('mouseover', function(){showTooltip("cycleBottomTooltip");});
	$("#cycleBottomHover").on('mouseout', function(){hideTooltip("cycleBottomTooltip");});
	$("#engineWindowTooltip").hide();
	$("#engineWindowHover").on('mouseover', function(){showTooltip("engineWindowTooltip");});
	$("#engineWindowHover").on('mouseout', function(){hideTooltip("engineWindowTooltip");});
	$("#idealGasTooltip").hide();
	$("#idealGasHover").on('mouseover', function(){showTooltip("idealGasTooltip");});
	$("#idealGasHover").on('mouseout', function(){hideTooltip("idealGasTooltip");});

	// Register event handlers for input fields
	$("#hotTempInput").on('change', getHotTemp);
	$("#hotTempUnits").on('change', getHotUnits);
	$("#coldTempInput").on('change', getColdTemp);
	$("#coldTempUnits").on('change', getColdUnits);
	$("#compSelect").on('change', getComponents);
	$("#about").on('click', displayAboutInfo);
	$('#helpButton').on('click', displayHelp);
	$("#toggleTooltips").on('click', toggleTooltips);

	toggleTooltips = false;  // Tooltips shouldn't appear in response to hovering unless the user turns them on (reduces page clutter)

	// Reset the animal picture to not display an animal
	$("#animal").css("background", "url('animals.png') -140px 0");


	// Start the animation for the animals (although at this point the animal "picture" itself will be blank)
	upBelt();
}

/*
 * Method: clearCalulatedData
 * Clears all GUI fields that contain data that has been dynamically calculated about the Carnot cycle.
 * Also resets all global variables containing such data to "NaN" to signal to the program that these are "empty" as well.
*/
function clearCalculatedData(){

	// Clear all calculated values from the graphical display
	$("#triviaArea").val("");
	$("#netWk").html("");
	$("#thermEff").html("");
	$("#wkOut").html("");
	$("#wkIn").html("");
	$("#pressure1").html("");
	$("#pressure2").html("");
	$("#pressure3").html("");
	$("#pressure4").html("");
	$("#heatOut").html("");

	// Reset the animal "picture" to be blank
	$("#animal").css("background", "url('animals.png') -140px 0");

	// Clear all of the corresponding variables
	pressure1 = NaN;
	pressure2 = NaN;
	pressure3 = NaN;
	pressure4 = NaN;
	workIn = NaN;
	workOut = NaN;
	netWork = NaN;
	heatOut = NaN;
	thermEff = NaN;
	ECarnot = NaN;
}


/*
 * Methods:
 *			upBelt
 *			overEdge
 *			fall
 * Control the motion of the animal on the conveyor belt
 * (Three functions are required because the only way to ensure sequential behavior among the animation stages
 *  is to pass in a function for the next stage as a callback to animate(), to be called when the current stage
 *  of animation is complete. Thus the callback cycle upBelt-->overEdge-->fall-->upBelt is used to make the animal
 * travel up the conveyor belt, slide over the edge, and fall vertically, cycling indefinitely.
*/
function upBelt(){
	$("#animal").css({left:"221px", top:"238px"});
	$("#animal").animate({left:"300px", top:"185px"}, 2000, "linear", overEdge);
}

function overEdge(){
	$("#animal").animate({left:"320px", top:"181px"}, 500, "linear", fall);
}

function fall(){
	$("#animal").animate({left:"320px", top:"281px"}, 1000, "linear", upBelt);
}

/*
*************************************************************************
*								Event Handlers							*
*************************************************************************
*/

/*
 * Event Handler Method: getHotTemp
 * Called when a "hot temperature" value is entered in the input text field by the user.
 *
 * If valid values have been entered for both "hot temperature" and "cold temperature", calls calculate() to
 *		calculate and display cycle data. Otherwise, clears all displayed cycle data.
 *
 * Sets the value of the "hot facts" text area depending on the temperature value input.
*/
function getHotTemp(){
	hotTemp = $("#hotTempInput").val();
	if(hotTemp=="") hotTemp = NaN;  // Ensure a blank text field is read as "no value", not as a value of 0

	if(isNaN(hotTemp)){
		clearCalculatedData();
		$("#hotFactArea").val("Please enter a hot temperature.");
	}
	// No need to check whether hotUnits has a valid value, because it's input by drop-down list, so it always has a valid value
	else if(toKelvin(hotTemp, hotUnits) <=0)
	{
		clearCalculatedData();
		$("#hotFactArea").val("You can't have a temperature at or below absolute zero.");
	}
	else{
		hotTemp = toKelvin(hotTemp, hotUnits);

		if(!isNaN(coldTemp)){
			calculate();
		}

		// If calculate() happens, it needs to happen before getHotFact, because getHotFact
		// sometimes depends on results from calculate()
		$("#hotFactArea").val(getHotFact());
	}
}

/*
 * Event Handler Method: getHotUnits
 * Called when a new unit of measurement for the "hot temperature" is selected by the user
 *
 * Reads the new units, and then calls getHotTemp to re-load the new hot temperature in the updated units
 * (and do any other related things)
*/
function getHotUnits(){
	hotUnits = $("#hotTempUnits").val();
	getHotTemp();
}

/*
 * Event Handler Method: getColdTemp
 * Called when a "cold temperature" value is entered in the input text field by the user.
 *
 * If valid values have been entered for both "hot temperature" and "cold temperature", calls calculate() to
 *		calculate and display cycle data. Otherwise, clears all displayed cycle data.
 *
 * Sets the value of the "cold facts" text area depending on the temperature value input.
*/
function getColdTemp(){
	coldTemp = $("#coldTempInput").val();
	if(coldTemp=="") coldTemp = NaN;

	if(isNaN(coldTemp)){
		clearCalculatedData();
		$("#coldFactArea").val("Please enter a cold temperature.");
	}
	// No need to check whether coldUnits has a valid value, because it's input by drop-down list, so it always has a valid value
	else if(toKelvin(coldTemp, coldUnits) <=0)
	{
		clearCalculatedData();
		$("#coldFactArea").val("You can't have a temperature at or below absolute zero.");
	}
	else{
		coldTemp = toKelvin(coldTemp, coldUnits)

		if(!isNaN(hotTemp)){
			calculate();
		}

		$("#coldFactArea").val(getColdFact());
	}
}

/*
 * Event Handler Method: getColdUnits
 * Called when a new unit of measurement for the "cold temperature" is selected by the user
 *
 * Reads the new units, and then calls getColdTemp to re-load the new cold temperature in the updated units
 * (and do any other related things)
*/
function getColdUnits(){
	coldUnits = $("#coldTempUnits").val();
	getColdTemp();
}

/*
 * Event Handler Method: getComponents
 * Called when the user selects a new type of "engine components" (normal, good, cutting-edge, or ideal)
 *
 * Updates the componentsFactor global variable based on the type of components selected.
 *
 * If valid values have previously been entered for both "hot temperature" and "cold temperature", calls calculate() to
 *		re-calculate and display cycle data based on the new components selection.
*/
function getComponents(){
	var components = $("#compSelect").val();

	if(components=="normal")
		componentsFactor = 0.87;
	else if(components=="good")
		componentsFactor = 0.92;
	else if(components=="great") // "great" stands for the GUI option "Real, Cutting-Edge Components"
		componentsFactor = 0.955;
	else if(components=="ideal")
		componentsFactor = 1;

	if(!isNaN(hotTemp) && !isNaN (coldTemp))
		calculate();
}

/*
 * Event Handler Method: displayAboutInfo
 * Displays a dialog box containing information about the program when the user clicks the "i" glyphicon button.
*/
function displayAboutInfo() {
	/*alert("This program was created under the direction of Dr. Margot Vigeant at \n" +
		  "Bucknell University. It was developed in Flash by Gavin MacInnes in\n" +
		  "2009, and was adapted to Javascript by Emily Ehrenberger in 2011.\n\n" +
		  "The development of this program was funded by the National Science\n" +
		  "Foundation Grant DUE-0442234 (2009) and DUE-0717536 (2011).\n\n" +
		  "Address any questions or comments to mvigeant@bucknell.edu.\n\n" +
		  "                                                Copyright.");*/
	alert("This program was created under the direction of Dr. Margot Vigeant, Bucknell University Department of Chemical " +
		" Engineering. It was developed in Flash by Gavin MacInnes in 2009, and was adapted to Javascript by Emily " +
		"Ehrenberger in 2011.\n\n The development of this program was funded by the National Science Foundation Grant " +
		"DUE-0442234 (2009) and DUE-0717536 (2011).\n\n Address any questions or comments to mvigeant@bucknell.edu\n\n" +
		"\u00A9 Margot Vigeant 2011.");
	return false;
}

/*
 * Event Handler Method: displayHelp
 * Displays a dialog box containing information about how to use the program when the user clicks the "?" glyphicon
 * button.
 */
function displayHelp() {
	alert("Enter a hot temperature and a cold temperature and select a cycle ideality from the drop-down menu. " +
		"Characteristics for your Carnot engine will be shown in blue text once both temperatures are entered.\n\n" +
		"If the engine has a nonnegative and nonzero thermal efficiency, an animal will be lifted by the belt " +
		"proportional to the magnitude of the net work done by the engine (shown in the bottom left corner).");
}

/*
 * Event Handler Method: showTooltip
 * Displays the "tooltip" with the specified name when the user hovers over a certain area of the screen, if
 * the toggle for tooltips is set to true
*/
function showTooltip(name){
	if(tooltipsOn)
		$('#' + name).fadeIn();
}

/*
 * Event Handler Method: hideTooltip
 * Hides the "tooltip" with the specified name when the user stops hovering over the area that triggers it, if
 * the toggle for tooltips is set to true (otherwise there's no need to hide the tooltip because it was never displayed)
*/
function hideTooltip(name){
	if(tooltipsOn)
		$('#' + name).fadeOut();
}

/*
 * Event Handler Method: tottleTooltips
 * Toggles whether tooltips should be active or not, when the user clicks the link labeled "More info (off)" / "More info (on)".
 * Also updates the text of said link to indicate the current value of the toggle.
*/
function toggleTooltips(){
	if(tooltipsOn){
		tooltipsOn = false;
		$("#toggleTooltips").html("More info (off)");
	}
	else {
		tooltipsOn = true;
		$("#toggleTooltips").html("More info (on)");
	}

	return false;
}


/*
*************************************************************************
*						Calculation Functions							*
*************************************************************************
*/

/*
 * Method: toKelvin
 * Converts the specified temperature value, given in the specified units, to Kelvin
*/
function toKelvin(temp, units){
	if(units=="c")
		return (temp*1) + 273.15;

	else if(units=="f")
		return (temp - 32) * 5/9 + 273.15;

	else if(units=="r")
		return temp * 5/9;

	// If the temperature is not in Celsius, Farenheit, or Rankine, assume it's already in Kelvin
	else return temp;
}

/*
 * Method: calculate
 * Calculates "cycle data" based on the current values for hot temperature, cold temperature, and componentsFactor.
 * "Cycle data" consists of:
 *		work in
 *		work out
 *		net work
 * 		pressures at 4 stages of the cycle
 *		heat out
 *		Carnot efficiency
 *		thermal efficiency
 * All but Carnot efficiency are displayed in some way to the user by calling "displayResults" (this function
 * makes that call automatically)
 *
 * This method assumes hotTemp, coldTemp, and componentsFactor all have valid values.
*/
function calculate(){
	// Before calculating, ensure that hotTemp and coldTemp are not equal, and display a message if they
	// are. Don't calculate if they are equal because it will cause divide by zero errors; just erase the
	// results of previous calculations.
	if(hotTemp == coldTemp){
		clearCalculatedData();
		$("#triviaArea").val("Please make the hot reservoir temperature higher than the cold reservoir.");
		return;
	}

	// Declare variables to hold intermediary work values for pieces of the cycle
	var work1;
	var work2;
	var work3;
	var work4;

	// Calculate pressures
	pressure2 = 1;
	pressure1 = pressure2 * Math.pow((hotTemp/coldTemp), (Cp / (componentsFactor*R)));

	//pressures 3 and 4 depend on work4, so calculate work4 first
	work4 = -heatIn;

	//pressure4 must be chosen so that the cycle converges, so approximate pressure4
	//by repeatedly refining a guess

	//initial guess for pressure4
	var guess = 2.72 * pressure1;
	// declare temporary variables to support this calculation
	var n;
	var dp;
	// refine guess through 10 cycles
	for(var i=0; i<10; i++){
		n = -work4 / (R*hotTemp) * Math.log(guess/pressure1);
		var oldGuess = guess;
		var newGuess = pressure1 * Math.exp(-work4 /(n*R*hotTemp));
		guess = (newGuess - oldGuess)/2 + oldGuess;
	}

	// set pressure4 to the result calculated above, and determine pressure3
	pressure4 = guess;
	pressure3 = pressure4 * Math.pow((coldTemp/hotTemp), (Cp * componentsFactor / R));

	//calculate the work for the other 3 parts of the cycle
	work1 =  componentsFactor * n * Cp * (coldTemp-hotTemp);
	work2 = -n * R * coldTemp * Math.log(pressure2/pressure3);
	work3 = (1/componentsFactor) * n * Cp * (hotTemp-coldTemp);

	//calculate workOut, workIn, and netWork
	workOut = work1 + work4;
	workIn = work2 + work3;
	netWork = workOut + workIn;

	// Calculate intermediary heat values for stages 1 and 3 of the cycle; used to compute total for heatOut
	var Q1 = (1-componentsFactor) * n * Cp * (coldTemp-hotTemp);
	var Q3 = (1 - 1/componentsFactor) * n * Cp * (hotTemp-coldTemp);
	heatOut = -work2 + Q1 + Q3;

	// Calculate Carnot efficiency and thermal efficiency
	Ecarnot = 1 - coldTemp/hotTemp;
	thermEff = -(work1 + work2 + work3 + work4) / heatIn;

	// Ensure none of the results defy the laws of physics
	validateResults();

	// Display the validated results on the GUI
	displayResults();
}

/*
 * Method: validateResults
 * Ensures none of the results defy the laws of physics (or are otherwise invalid), and updates both the GUI
 * and the global variables to ensure that no invalid data is displayed or retained in the program.
*/
function validateResults(){
	//Limit thermal and Carnot efficiencies to 0.99999999
	if (Ecarnot>=0.99999999) {
		Ecarnot = 0.99999999;
	}
	if (thermEff>=0.99999999) {
		thermEff = 0.99999999;
	}

	// Limit net work to -999.99999999
	if(netWork <= -999.99999999)
		netWork = -999.99999999;

	// Forbid negative efficiency. If negative efficiency is found, display an explanation in the Efficiency Trivia area
	if (thermEff<0) {
		thermEff = NaN;
		$("#triviaArea").val("There is so much friction in the engine that it would require work to operate at these conditions.");
	}
	if (Ecarnot<0) {
		// If Ecarnot < 0, then all of the data from the calculations are invalid, so just clear them all (both
		// in the program variables and in the display).
		clearCalculatedData();
		$("#triviaArea").val("You've created a Heat pump (like a refrigerator).  Please make the Hot Temperature higher than the Cold Temperature.");
	}
}

/*
 * Method: displayResults
 * Displays all defined values for cycle data in their corresponding GUI labels/fields/etc.
 * Anything whose value is NaN will not be displayed, and that field in the GUI will be cleared
 *(providing an easy way to make sure invalid data is not displayed)
*/
function displayResults(){
// Display pressure values rounded to two decimal places (display in scientific notation if > 10,000)
	if(!isNaN(pressure1)){
		if(pressure1 > 10000)
			$("#pressure1").html(pressure1.toExponential(2) + " bar");
		else
			$("#pressure1").html(pressure1.toFixed(2) + " bar");
	}
	else {
		$("#pressure1").html("");
	}
	if(!isNaN(pressure2)){
		if(pressure2 > 10000)
			$("#pressure2").html(pressure2.toExponential(2) + " bar");
		else
			$("#pressure2").html(pressure2.toFixed(2) + " bar");
	}
	else {
		$("#pressure2").html("");
	}
	if(!isNaN(pressure3)){
		if(pressure3 > 10000)
			$("#pressure3").html(pressure3.toExponential(2) + " bar");
		else
			$("#pressure3").html(pressure3.toFixed(2) + " bar");
	}
	else {
		$("#pressure3").html("");
	}
	if(!isNaN(pressure4)){
		if(pressure4 > 10000)
			$("#pressure4").html(pressure4.toExponential(2) + " bar");
		else
			$("#pressure4").html(pressure4.toFixed(2) + " bar");
	}
	else {
		$("#pressure4").html("");
	}

	// Display work values (netWork is rounded to 1 decimal place unless that rounding would put it at -1000 (which is physically impossible);
	// the others are rounded to the nearest whole number)
	if(!isNaN(netWork)) {
		if(netWork.toFixed(1) <= -999.99999999)		// If rounding to 1 decimal place would put netWork at -1000, then round to 8 decimal places
			$("#netWk").html(netWork.toFixed(8) + " kW"); // Note that you will never need more than 8 to fix this problem, because any number less than
														  //-999.99999999 (8 decimal places) gets set to -999.99999999 (8 places) up in validateResults
		else
			$("#netWk").html(netWork.toFixed(1) + " kW");
	}
	else
		$("#netWk").html("");
	if(!isNaN(workIn))
		$("#wkIn").html(workIn.toFixed(0) + " kW");
	else
		$("#wkIn").html("");
	if(!isNaN(workOut))
		$("#wkOut").html(workOut.toFixed(0) + " kW");
	else
		$("#wkOut").html("");

	// Display heatOut rounded to two decimal places, or in scientific notation if the value is between 0 and -0.1
	if(!isNaN(heatOut)){
		if(heatOut < -0.1)
			$("#heatOut").html(heatOut.toFixed(2) + " kW");
		else
			$("#heatOut").html(heatOut.toExponential(2) + " kW");
	}
	else {
		$("#heatOut").html("");
	}

	// Display the thermal efficiency, rounded to 8 decimal places.
	if(!isNaN(thermEff)){
		$("#thermEff").html(thermEff.toFixed(8));
		$("#triviaArea").val(getEfficiencyTrivia());
	}
	else {
		$("#thermEff").html("");
	}

	// call displayAnimal to ensure the animal picture gets updated according to the thermal efficiency value
	// (or cleared if that value is invalid)
	displayAnimal();
}

/*
 * Method: displayAnimal
 * Changes the "animal" picture to show the appropriate animal, based on the value of the thermal efficiency.
 * Note that all of the "animal" images are compiled into a single image sprite, so this is accomplished
 * by simply moving the sprite around to line up the correct animal with the image element.
*/
function displayAnimal(){

	// If there is no valid efficiency, don't display any animal
	if(isNaN(thermEff) || thermEff <= 0)
		$("#animal").css("background", "url('animals.png') -140px 0");

	// display whale
	else if (thermEff>0.95)
		$("#animal").css("background", "url('animals.png') 0 -51px");

	// display elephant
	else if (thermEff>0.5)
		$("#animal").css("background", "url('animals.png') -65px 0");

	// display cow
	else if (thermEff>0.2)
		$("#animal").css("background", "url('animals.png')-140px -51px");

	// display chicken
	else if (thermEff>0.08)
		$("#animal").css("background", "url('animals.png') 0 0");

	// display feather
	else if (thermEff>0)
		$("#animal").css("background", "url('animals.png') -75px -51px");

}


/*
*************************************************************************
*						Miscellaneous Functions							*
*************************************************************************
*/

/*
 * Method: getHotFact
 * Determines which "hot fact" should be displayed to the user, based on
 * the current "hot temperature" and, in one case, the Carnot efficiency (if specified).
 *
 * This method assumes that hotTemp has a valid value.
*/
function getHotFact(){
	// temporarily convert the hot temperature to celsius for the comparison
	var celsius = hotTemp-273.15;
	var HotBlurb;

	// If the hot temperature is very low, the "hot fact" chosen will also depend on whether
	// the Carnot efficiency is also very low. This check is more complex, so do it here
	// and store the result in a local variable, tinyECarnot, to streamline the code below.
	// tinyECarnot will be true if ECarnot is defined AND has a value less than 0.15,
	// and false if ECarnot is larger OR if it is undefined.
	var tinyECarnot;
	if(isNaN(ECarnot))
		tinyECarnot = false;
	else if(ECarnot < 0.15)
		tinyECarnot = true;
	else
		tinyECarnot = false;

	if (celsius>8000000000) {
		HotBlurb = "1e16 Kelvin is the hottest temperature ever achieved at Fermilab.";
	} else if (celsius>100000000) {
		HotBlurb = "A super nova can have temperatures reaching 1 trillion Kelvin.";
	} else if (celsius>100000) {
		HotBlurb = "The core of the Sun is estimated to be 15 million Kelvin.";
	} else if (celsius>20000) {
		HotBlurb = "A lightning bolt can reach temperatures of up to 30,000 \xB0C (55,000\xB0F).";
	} else if (celsius>10000) {
		HotBlurb = "An arc welder can reach 20,000 \xB0C (36,000\xB0F) in the arc.";
	} else if (celsius>6500) {
		HotBlurb = "The Earth's Core is estimated to be at a temperature of up to 7,000 \xB0C (13,000\xB0F).";
	} else if (celsius>3700) {
		HotBlurb = "The photsphere (outer layer) of the sun is estimated to be 6,000 \xB0C (11,000 \xB0F).";
	} else if (celsius>3600) {
		HotBlurb = "Tungsten is the last element to melt at 3683 \xB0C (6661 \xB0F).";
	} else if (celsius>3200) {
		HotBlurb = "An oxyacetylene cutting torch will reach temperatures of up to 3480 \xB0C (6290 \xB0F).";
	} else if (celsius>2900) {
		HotBlurb = "The hottest a typical hydrocarbon can reach burning in pure oxygen (the adiabatic flame temperature) is 3000 \xB0C (5400 \xB0F).";
	} else if (celsius>2300) {
		HotBlurb = "Tungsten Carbide, used for very hard tool bits, will melt at 2870 \xB0C (5178 \xB0F).";
	} else if (celsius>1800) {
		HotBlurb = "The hottest a typical hydrocarbon can reach burning in air (adiabatic flame temperature) is 2000 \xB0C (3600 \xB0F).";
	} else if (celsius>1500) {
		HotBlurb = "A blast furnace, used in iron refining, ranges from 1500-1800 \xB0C (2700-3250 \xB0F).";
	} else if (celsius>1400) {
		HotBlurb = "The outer core of a candle flame (the blue part) will be 1400 \xB0C (2550 \xB0F).";
	} else if (celsius>1250) {
		HotBlurb = "Steel will melt at 1370 \xB0C (2490 \xB0F).";
	} else if (celsius>1100) {
		HotBlurb = "Fresh lava can reach temperatures of up to 1200 \xB0C (2160 \xB0F).";
	} else if (celsius>799) {
		HotBlurb = "Typical flame temperatures in gas turbines are around 800 \xB0C (1500 \xB0F).";
	} else if (celsius>700) {
		HotBlurb = "The red part of a candle flame is 800 \xB0C (1440 \xB0F).";
	} else if (celsius>499) {
		HotBlurb = "The steam temperature of a typical steam turbine ranges from 500-600 \xB0C (900-1100 \xB0F).";
	} else if (celsius>399) {
		HotBlurb = "The average surface temperature of Venus is 460 \xB0C (850 \xB0F).";
	} else if (celsius>320) {
		HotBlurb = "Teflon melts at 335 \xB0C (635 \xB0F).";
	} else if (celsius>160) {
		HotBlurb = "The average home oven can reach temperatures of 280 \xB0C (500 \xB0F).";
	} else if (celsius>130) {
		HotBlurb = "Polyethylene will melt around 130-145 \xB0C (266-293 \xB0F).";
	} else if (celsius>80) {
		HotBlurb = "Water boils at 100 \xB0C (212 \xB0F).";
	} else if (celsius>50) {
		HotBlurb = "The highest recorded temperature on Earth was in Libya on 7/13/1922 when it reached 57.7 \xB0C (135.9 \xB0F).";
	} else if (celsius>30) {
		HotBlurb = "Did you know that Carbon Dioxide is a supercritical fluid at only 31.1 \xB0C (88 \xB0F) and 74 bars?";
	} else if (celsius>20) {
		HotBlurb = "Room temperature is around 25 \xB0C (78 \xB0F).";
	} else if (celsius<20 && tinyECarnot) {
		HotBlurb = "I wouldn't really call this hot, would you?";
	} else if (celsius>-1) {
		HotBlurb = "Water freezes at 0 \xB0C (32 \xB0F).";
	} else if (celsius>-10) {
		HotBlurb = "The average winter temperature in Northeastern America is -5 \xB0C (23 \xB0F).";
	} else if (celsius>-50) {
		HotBlurb = "This would only be hot in Antarctica.";
	} else if (celsius>-210) {
		HotBlurb = "This would only be hot on Pluto.";
	} else if (celsius>-273.15) {
		HotBlurb = "Not hot.";
	}

	return HotBlurb;
}

/*
 * Method: getColdFact
 * Determines which "cold fact" should be displayed to the user, based on
 * the current "cold temperature".
 *
 * This method assumes that coldTemp has a valid value.
*/
function getColdFact(){
	// temporarily convert the cold temperature to celsius for the comparison
	var celsius = coldTemp - 273.15;
	var ColdBlurb;

	if (celsius>10000) {
		ColdBlurb = "This is not cold.";
	} else if (celsius>5000) {
		ColdBlurb = "This is cold for a fusion reaction.";
	} else if (celsius>1000) {
		ColdBlurb = "This is cold if it's backwards day.";
	} else if (celsius>400) {
		ColdBlurb = "This is cold for a geophysicist.";
	} else if (celsius>250) {
		ColdBlurb = "This is cold on Venus.";
	} else if (celsius>100) {
		ColdBlurb = "If wishes were fishes, this would cook them all.";
	} else if (celsius>50) {
		ColdBlurb = "Too cold to boil water.";
	} else if (celsius>20) {
		ColdBlurb = "Room temperature is 25 \xB0C (78 \xB0F).";
	} else if (celsius>5) {
		ColdBlurb = "The average temperature of the earth is 15 \xB0C (59 \xB0F).";
	} else if (celsius>-12) {
		ColdBlurb = "The average winter temperature in Northeastern America is -5 \xB0C (23 \xB0F).";
	} else if (celsius>-35) {
		ColdBlurb = "Ammonia (a common industrial refrigerant) is a liquid at -33.6 \xB0C (-28.5 \xB0F).";
	} else if (celsius>-39) {
		ColdBlurb = "Mercury freezes at -39 \xB0C (-38.2 \xB0F).";
	} else if (celsius>-41) {
		ColdBlurb = "-40 \xB0C and -40 \xB0F are the same temperature.";
	} else if (celsius>-60) {
		ColdBlurb = "The average temperature at the south pole is -48 \xB0C (-54.4 \xB0F).";
	} else if (celsius>-70) {
		ColdBlurb = "Steel will shatter at these temperatures.";
	} else if (celsius>-82) {
		ColdBlurb = "Solid carbon dioxide (dry ice) sublimes at -78.5 \xB0C (-109.3 \xB0F).";
	} else if (celsius>-100) {
		ColdBlurb = "The coldest recorded temperature on earth was in Vostock II (Antarctica) on 7/21/1983, -89.2 \xB0C (-128.6 \xB0F).";
	} else if (celsius>-143) {
		ColdBlurb = "Ethanol freezes at -114.1 \xB0C (159 K).";
	} else if (celsius>-168) {
		ColdBlurb = "LNG (Liquified Natural Gas) is 112 K (-161 \xB0C).";
	} else if (celsius>-193) {
		ColdBlurb = "Liquid oxygen boils at 89.98 K (-183 \xB0C).";
	} else if (celsius>-223) {
		ColdBlurb = "Nitrogen is liquid at 77 K (-196 \xB0C).";
	} else if (celsius>-243) {
		ColdBlurb = "The surface of Pluto ranges from 35-45 K.";
	} else if (celsius>-263) {
		ColdBlurb = "Liquid hydrogen is 20.2 K.";
	} else if (celsius>-270) {
		ColdBlurb = "Liquid helium boils at 4 K";
	} else if (celsius>-271.65) {
		ColdBlurb = "Did you know that the average temperature of the universe is 2.72 K?";
	} else if (celsius>-273.14) {
		ColdBlurb = "Helium is a solid at 0.77 K.";
	} else if (celsius>-273.15) {
		ColdBlurb = "The coldest temperature achieved in lab is 2e-9 K, done with four Helium atoms.";
	}

	return ColdBlurb;
}

/*
 * Method: getEfficiencyTrivia
 * Determines which "efficiency trivia" should be displayed to the user, based on
 * the current thermal efficiency value
 *
 * This method assumes that thermEff has a valid value.
*/
function getEfficiencyTrivia(){
	var EffBlurb;

	if (thermEff == 0.99999999) {
		EffBlurb = "You are as efficient as this calculator can display.  The Second Law of Thermodynamics says that you cannot reach an efficiency of 1.";
	} else if (thermEff>0.75) {
		EffBlurb = "A hydrogen fuel cell can achieve an equivalent efficiency of 80%.  Note that a fuel cell is not a heat engine.";
	} else if (thermEff>0.55) {
		EffBlurb = "The most efficient engines today can reach 60% thermal efficiency, which is done by using high temperature materials that can stand temperatures as high as 1450 \xB0C (2650 \xB0F).";
	} else if (thermEff>0.46) {
		EffBlurb = "Combined cycle gas turbines in the 1990s allowed thermal efficiencies of 50%.";
	} else if (thermEff>0.42) {
		EffBlurb = "Simple gas turbines will have a thermal efficiency of about 43%.";
	} else if (thermEff>0.37) {
		EffBlurb = "Diesel engines have a thermal efficiency of from 35-42%";
	} else if (thermEff>0.34) {
		EffBlurb = "Steam turbines that operate on the Rankine Cycle (a typical coal power plant) are 35% thermally efficient.";
	} else if (thermEff>0.30) {
		EffBlurb = "Internal combustion engines in race cars can be up to 34% efficient.";
	} else if (thermEff>0.25) {
		EffBlurb = "Normal internal combustion engines used in automobiles have a thermal efficiency ranging from 25-30%.";
	} else if (thermEff>0.15) {
		EffBlurb = "High temperature geothermal engines typically have a thermal efficiency of about 20%.";
	} else if (thermEff>0.05) {
		EffBlurb = "Low temperature geothermal engines have a thermal efficiency of only 8-12%.";
	} else if (thermEff>0) {
		EffBlurb = "The early steam engine built by Newcomen probably had a thermal efficiency of only 0.5%.";
	}

	return EffBlurb;
}
