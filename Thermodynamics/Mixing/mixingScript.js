/*
 * File: mixingScript.js
 * Purpose: To provide the animations and interactivity for the Entropy of Mixing simulation (Mixing.html)
 * Author: Emily Ehrenberger (June 2011)
 *		   Under the supervision of Margot Vigeant, Bucknell University
 *		   Based on Flash simulation by Molly Harms and Gavin MacInnes (2006)
 * (c) Margot Vigeant 2011
*/


/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/


$(document).ready(init);

// Variables to hold input values
var smallSubstance;
var smallTemp;
var smallVolume;
var showAnimations = true; // Toggles whether the "pouring" animations should be shown or skipped when beakers are mixed

var zoomPlaying = false; // Toggles whether the "zoom"/particle animations are supposed to be running (used so the animations
						 // can run pseudo-asynchronously and know when to stop, and also so the animations can be triggered
						 // by clicking a single "toggle" button rather than distinct "on" and "off" buttons)

/*
 * Function: init
 * Sets up the page when it is loaded, hiding elements that aren't supposed to be visible right away, and
 * attaching event handlers.
*/
function init() {
	// Hide the instructions/info paragraph, which isn't supposed to show until after the initial "quiz"
	// question is answered
	$("#demoInstructions").hide();

	// Hide pieces of the demo that aren't supposed to be visible yet
	$("#bigLiquid").hide();
	$("#smallLiquid").hide();
	$("#eyedropper").hide();
	$("#dyeDrops").hide();
	$("#experimentParameters").hide();
	$("#smallBeakerConcentration").hide();
	$("#experimentResults").hide();
	$("#tryItButton").hide();
	$("#zoomLink").hide();
	$("#zoomInBackdrop").hide();
	$("#zoomInfo").hide();

	// The "pouring" gif must be actually removed from the page, not just hidden, to ensure that the
	// gif animation starts at the beginning when the image is added again
	$("#smallBeakerPour").detach();

	// Creates the dots that represent particles in the "zoom"/particle animation so time isn't wasted doing that
	// when the user actually activates the animation
	generateZoomDots();

	$("#submitButton").on('click', questionAnswered);
	$("#smallBeakerSubstanceSelect").on('change', getSmallSubstance);
	$("#smallBeakerTempSelect").on('change', getSmallTemp);
	$("#zoomLink").on('click', showZoom);
	$("#tryItButton").on('click', mix);
	$("#toggleAnimations").on('click', toggleAnimations);
	$("#about").on('click', displayAboutInfo);
}

/*
 * Event Handler Function: questionAnswered
 * The event handler for the "submit" button for the initial "quiz" question. Reads in the user's answer, hides
 * the quiz question, and shows the instructions and controls for the demo itself
*/
function questionAnswered(){
	var answer = $("input[name='quiz']:checked").val(); // read in the selected value from the radio buttons
	var responseText;

	if(answer=="a")
		responseText = "You chose answer a) Higher.";
	else if (answer=="b")
		responseText = "You chose answer b) The same.";
	else if (answer=="c")
		responseText = "You chose answer c) Lower.";
	else if (answer=="d")
		responseText = "You chose answer d) Not enough information.";
	else
		return; // If the user hasn't selected an answer, don't do anything

	// Resets the inputs to their default values, and otherwise resets the demo experiment
	$("#defaultSmallSubstance").attr("selected","selected");
	$("#defaultSmallTemp").attr("selected", "selected");
	resetExperiment();

	$("#startQuestion").hide();
	$("#responseText").html(responseText);
	$("#responseText").show();
	$("#demoInstructions").show();
	$("#experimentParameters").show();
	$("#tryItButton").show();
	$("#bigLiquid").show();
	$("#smallLiquid").show();
}

/*
 * Function: resetExperiment
 * Resets the mixing animation to show the unmixed beakers, and re-enables all (relevant) input fields.
 * Also resets the text at the top of the screen to show instructions (as opposed to an explanation of
 * the results of the previous experiment).
*/
function resetExperiment() {
	$("#zoomLink").hide();
	$("#experimentResults").hide();
	$("#tryItButton").html("Try it!");

	// Enable the "substance select" drop-down list
	$("#smallBeakerSubstanceSelect").removeAttr("disabled");
	// Read in the selected substance again to ensure other fields are enabled or disabled
	// according to which substance is selected
	getSmallSubstance();

	// Reset beaker pictures to show unmixed liquids
	$("#eyedropper").hide();
	$("#bigLiquid").css("background", "url('images/bigLiquid.png') 0 0");
	$("#smallLiquid").show();

	// Show instructions
	$("#tryItTitle").show();
	$("#instructionsParagraph").html("Try mixing hot and cold water and see what happens to the entropy. You can also try mixing oil and water or dye and water.");

	// showZoom is in charge of resetting itself
	if(zoomPlaying)
		showZoom();
}

/*
*************************************************************************
*								Event Handlers							*
*************************************************************************
*/

/*
 * Event Handler Function: displayAboutInfo
 * Displays a dialog box containing information about the program when the user clicks the link labeled "About this program"
*/
function displayAboutInfo(){
	alert("This program was created under the direction of Dr. Margot Vigeant at " +
		  "Bucknell University. It was developed in Flash by Gavin MacInnes in " +
		  "2006, and was adapted to Javascript by Emily Ehrenberger in 2011.\n\n" +
		  "The development of this program was funded by the National Science " +
		  "Foundation Grant DUE-0442234 (2009) and DUE-0717536 (2011).\n\n" +
		  "Address any questions or comments to mvigeant@bucknell.edu.\n\n" +
		  "\u00A9 Margot Vigeant 2011");
	return false;
}

/*
 * Event Handler Function: getSmallSubstance
 * Called when the user selects a new substance for the small beaker.
 *
 * Reads in the selected substance, ensures that substance is now visually displayed in the beaker, and
 * enables, disables, or sets the values for other input fields depending on the substance
*/
function getSmallSubstance() {
	smallSubstance = $("#smallBeakerSubstanceSelect").val();

	// If the substance is water, enable the user to select the temperature.
	// Otherwise, disable temperature selection and set the temperature (both on the screen and in the
	// program) to 25.
	if(smallSubstance=="water") {
		$("#smallBeakerTempSelect").removeAttr("disabled");
		getSmallTemp();
		$("#smallLiquid").css("background", "url('images/smallLiquid.png') 0 0");
	}
	else {
		$("#defaultSmallTemp").attr("selected", "selected");
		$("#smallBeakerTempSelect").attr("disabled", "disabled");
		smallTemp = 25;
	}

	// If the substance is dye, change the volume to 1mL and display additional information about the concentration.
	// Otherwise, set the volume to 100mL and hide concentration information.
	if(smallSubstance=="dye") {
		$("#smallBeakerConcentration").show();
		$("#smallBeakerVolume").html("1 mL");
		smallVolume = 1;
		$("#smallLiquid").css("background", "url('images/smallLiquid.png') 0 -59px");
	}
	else {
		$("#smallBeakerConcentration").hide();
		$("#smallBeakerVolume").html("100 mL");
		smallVolume = 100;
	}

	// Oil doesn't have any special conditions to set, but you still have to make sure it shows up in the
	// picture of the small beaker
	if(smallSubstance=="oil") {
		$("#smallLiquid").css("background", "url('images/smallLiquid.png') -60px 0");
	}
}

/*
 * Event Handler Function: getSmallTemp
 * Called when the user selects a new temperature for the small beaker (only possible when the substance is water)
 *
 * Reads and stores the selected temperature
*/
function getSmallTemp() {
	smallTemp = $("#smallBeakerTempSelect").val();
}

/*
 * Event Handler Function: toggleAnimations
 * Activated when the user clicks the link labeled "Enable animations" / "Disable animations". Toggles whether pouring
 * animations should be shown or skipped, and updates the text of the link accordingly.
*/
function toggleAnimations() {
	if(showAnimations){
		showAnimations = false;
		$("#toggleAnimations").html("Enable animations");
	}
	else {
		showAnimations = true;
		$("#toggleAnimations").html("Disable animations");
	}

	return false;
}

/*
 * Event Handler Function: mix
 * Called when the user clicks the "Try it!" / "Do another!" button
 *
 * If an experiment is ready to be run, starts the appropriate animations (if animations are enabled) or sets the display to
 * the appropriate end state and calls the appropriate calculation function (depending on which substance is selected for the
 * small beaker). If an experiment has just been run, resets the demo to prepare for the next experiment.
*/
function mix() {

	// If an experiment is ready to be run
	if($("#tryItButton").html() == "Try it!") {

		// Disable experiment inputs until the experiment is reset (do it first to make sure they're
		// disabled if/while the animations run)
		$("#smallBeakerSubstanceSelect").attr("disabled", "disabled");
		$("#smallBeakerTempSelect").attr("disabled", "disabled");

		if(smallSubstance=="water") {
			if(showAnimations)
				animateWater(); // no need to call mixWater if animations are on, because the animations will call it when they finish
			else {
				$("#smallLiquid").hide();
				$("#bigLiquid").css("background", "url('images/bigLiquid.png') 0 -65px");
				mixWater();
			}
		}
		else if(smallSubstance=="oil") {
			if(showAnimations)
				animateOil();
			else {
				$("#smallLiquid").hide();
				$("#bigLiquid").css("background", "url('images/bigLiquid.png') -91px 0");
				mixOil();
			}
		}
		else if(smallSubstance=="dye") {
			if(showAnimations)
				animateDye();
			else {
				$("#smallLiquid").hide();
				$("#bigLiquid").css("background", "url('images/bigLiquid.png') -91px -65px");
				mixDye();
			}
		}
	}
	// If an experiment has just been run and needs to be reset
	else {
		$("#tryItTitle").html("Try it out!");
		resetExperiment();
	}
}

/*
*************************************************************************
*							Calculation Functions						*
*************************************************************************
*/

/*
 * Function: mixWater
 * Performs the calculations appropriate to mixing hot water with cold water, and displays the results
*/
function mixWater() {
	// Change the water temperatures to Kelvin (small beaker is hot; big beaker is cold)
	var hot = (smallTemp*1) + 273.15;
	var cold = 25 + 273.15;
	var mixed = (hot + cold) / 2; // the final temperature of the mixture

	var hotEntropyChange;
	var coldEntropyChange;
	var totalEntropyChange;

	// If the two beakers of water are the same temperature, calculate the entropy change from the change
	// in surface area
	if(hot==cold) {
		hotEntropyChange = (70.1*(-12.5) + 10*42)/298.15 * 1e-7;
		coldEntropyChange = (70.1*25)/298.15 * 1e-7;
		totalEntropyChange = hotEntropyChange + coldEntropyChange;
		mixed = mixed - 273.15; //convert mixture temperature back to celsius
		mixed = mixed + totalEntropyChange*298.15/(4.18*200);

		$("#instructionsParagraph").css("top", "100px");
		$("#instructionsParagraph").html("The temperatures were the same, so the entropy does not change.  However, to be " +
										 "absolutely rigorous, even changing the surface area of the water causes a change " +
										 "in surface energy, which results in a small change in entropy.");

		$("#bigBeakerEntropyChange").val(coldEntropyChange.toExponential(2) + " J/K");
		$("#smallBeakerEntropyChange").val(hotEntropyChange.toExponential(2) + " J/K");
		$("#totalEntropyChange").val(totalEntropyChange.toExponential(2) + " J/K");
		$("#otherResult").show();
		$("#otherResult").val(mixed.toFixed(7) + " \xB0C");
	}
	// If the waters are different temperatures, calculate the entropy change from
	// mixing the temperatures
	else {
		hotEntropyChange = 4.18 * 100 * Math.log(mixed/hot);
		coldEntropyChange = 4.18 * 100 * Math.log(mixed/cold);
		totalEntropyChange = hotEntropyChange + coldEntropyChange;

		$("#instructionsParagraph").html("The entropy change involved in a change in temperature is proportional to the " +
										 "natural log of the ratio of the final and initial temperatures.  The hot water " +
										 "loses less entropy than the cold water gains.");
		$("#bigBeakerEntropyChange").val(coldEntropyChange.toFixed(2) + " J/K");
		$("#smallBeakerEntropyChange").val(hotEntropyChange.toFixed(2) + " J/K");
		$("#totalEntropyChange").val(totalEntropyChange.toFixed(2) + " J/K");
		mixed = mixed  - 273.15; //convert mixture temperature back to celsius
		$("#otherResult").show();
		$("#otherResult").val(mixed + " \xB0C");
	}

	$("#bigBeakerEntropyChangeLabel").html("Cold Water<br />Entropy Change:");
	$("#smallBeakerEntropyChangeLabel").html("Hot Water<br />Entropy Change:");
	$("#otherResultLabel").show();
	$("#otherResultLabel").html("Final Temperature:");

	$("#zoomLink").html("Click here to see<br />how water mixes");
	$("#zoomLink").show();
	$("#responseText").hide();
	$("#tryItTitle").hide();
	$("#experimentResults").show();
	$("#tryItButton").removeAttr("disabled");
	$("#tryItButton").html("Do another!");
}

/*
 * Function: mixOil
 * Performs the calculations appropriate to mixing oil with water, and displays the results
*/
function mixOil() {
	var oilEntropyChange = (16.5 * -12.5 + 16.5 * 42)/298.15 * 1e-7;
	var waterEntropyChange = ((70.1-50) * 25)/298.15 * 1e-7;
	var totalEntropyChange = oilEntropyChange + waterEntropyChange;

	$("#bigBeakerEntropyChangeLabel").html("Water<br />Entropy Change:");
	$("#bigBeakerEntropyChange").val(waterEntropyChange.toExponential(2) + " J/K");
	$("#smallBeakerEntropyChangeLabel").html("Oil<br />Entropy Change:");
	$("#smallBeakerEntropyChange").val(oilEntropyChange.toExponential(2) + " J/K");
	$("#totalEntropyChange").val(totalEntropyChange.toExponential(2) + " J/K");
	$("#otherResultLabel").hide();
	$("#otherResult").hide();
	$("#instructionsParagraph").html("The oil and water do not mix, but there is a small amount of entropy involved " +
									 "in creating and destroying surface and interfacial boundaries.");

	$("#responseText").hide();
	$("#tryItTitle").hide();
	$("#experimentResults").show();
	$("#tryItButton").removeAttr("disabled");
	$("#tryItButton").html("Do another!");
}

/*
 * Function: mixDye
 * Performs the calculations appropriate to mixing dye with water, and displays the results
*/
function mixDye() {
	var dyeEntropyChange = -.001*8.314*Math.log(.001/(100/18.02+.001));
	var waterEntropyChange = -100/18.02*8.314*Math.log((100/18.02)/(100/18.02+.001));
	var totalEntropyChange = dyeEntropyChange + waterEntropyChange;

	$("#bigBeakerEntropyChangeLabel").html("Water<br />Entropy Change:");
	$("#bigBeakerEntropyChange").val(waterEntropyChange.toFixed(3) + " J/K");
	$("#smallBeakerEntropyChangeLabel").html("Dye<br />Entropy Change:");
	$("#smallBeakerEntropyChange").val(dyeEntropyChange.toFixed(3) + " J/K");
	$("#totalEntropyChange").val(totalEntropyChange.toFixed(3) + " J/K");
	$("#otherResultLabel").show();
	$("#otherResultLabel").html("Final Concentration:");
	$("#otherResult").show();
	$("#otherResult").val("0.01 M");
	$("#instructionsParagraph").html("When a dye is mixed with water, the change in concentration results in a change in entropy.");

	$("#zoomLink").html("Click here to see<br />how the dye mixes");
	$("#zoomLink").show();
	$("#responseText").hide();
	$("#tryItTitle").hide();
	$("#experimentResults").show();
	$("#tryItButton").removeAttr("disabled");
	$("#tryItButton").html("Do another!");
}

/*
*************************************************************************
*						Pouring Animation Functions						*
*************************************************************************
*/

/*
 * Function: animateWater
 * Disables the "Try It!" button and begins the animation for pouring the water. The animation must be split over
 * multiple functions because the only way to ensure that one stage of animation doesn't start until the previous
 * stage completes, is to pass a function containing the next stage as a callback to the animate() function.
*/
function animateWater() {
	$("#tryItButton").attr("disabled", "disabled");
	moveWaterBeaker();
}

/*
 * Function: moveWaterBeaker
 * Animates the small beaker (and the liquid inside it) to move it above the large beaker.
 * Calls the next stage of animation when finished.
*/
function moveWaterBeaker() {
	$("#smallBeaker").animate({top:"-90px", left:"295px"}, 1000, "linear");
	$("#smallLiquid").animate({top:"-67px", left:"302px"}, 1000, "linear", pourWater);
}

/*
 * Function: pourWater
 * Animates the tipping and pouring of water from the small beaker, by momentarily replacing the static
 * beaker picture with an animated gif. Waits half a second for the "pouring" animation to partially complete,
 * and then calls the next stage of animation to change the color of the water in the big beaker and
 * finish the "pouring".
*/
function pourWater() {
	$("#smallBeaker").hide();
	$("#smallLiquid").hide();

	// The gif must be added and removed from the page, rather than just shown and hidden, to ensure
	// that the animation always starts from the beginning.
	$("#smallLiquid").after('<img id="smallBeakerPour" src="images/blank_img.png" />');

	// Align the gif so that the "water pouring" animation shows (as opposed to the "oil pouring" animation)
	$("#smallBeakerPour").css("background", "url('images/smallBeakerPour2.gif') -150px 0");

	// "Animate" the "motion" of the gif to the location where it already is for 500 milliseconds (essentially,
	// do nothing for 500 milliseconds)--this is just to give the gif's internal animation time to run
	// before moving on to the next stage
	$("#smallBeakerPour").animate({top:"-99px"}, 500, "linear", changeBigBeakerWater);
}

/*
 * Function: changeBigBeakerWater
 * After the small beaker has started to pour water into the big beaker, changes the color of the water in
 * the big beaker (to represent the change in temperature), and then waits another second for the "pouring"
 * animation to finish, before calling the final stage of animation.
*/
function changeBigBeakerWater() {
	// Align the bigLiquid picture so that the picture representing "mixed water" shows
	$("#bigLiquid").css("background", "url('images/bigLiquid.png') 0 -65px");

	// "Move" the gif to where it already is; essentially, do nothing for 1 second while the gif's
	// internal animation completes
	$("#smallBeakerPour").animate({top:"-99px"}, 1000, "linear", finishAnimateWater);
}

/*
 * Function: finishAnimateWater
 * Switches the animated gif back with the static beaker picture (keeping the "liquid" picture hidden
 * because the beaker should now be empty) and animates the beaker's return to its place on the table.
 * When that animation is finished, call mixWater to perform and display the relevant calculations.
*/
function finishAnimateWater() {
	$("#smallBeakerPour").detach();
	$("#smallBeaker").show();
	// Put the liquid back in its original position even though it's hidden, so it's in the
	// correct place the next time it is un-hidden
	$("#smallLiquid").css({top:"83px", left:"372px"});
	$("#smallBeaker").animate({top:"60px", left:"365px"}, 1000, "linear", mixWater);
}


/*
 * Functions:
 * 			  animateOil
 * 			  moveOilBeaker
 * 			  pourOil
 * 			  changeBigBeakerOil
 * 			  finishAnimateOil
 *
 * Animate the various stages of pouring oil from the small beaker into the large beaker. These function
 * the same way as animateWater, moveWaterBeaker, etc.
*/
function animateOil() {
	$("#tryItButton").attr("disabled", "disabled");
	moveOilBeaker();
}

function moveOilBeaker() {
	$("#smallBeaker").animate({top:"-90px", left:"295px"}, 1000, "linear");
	$("#smallLiquid").animate({top:"-67px", left:"302px"}, 1000, "linear", pourOil);
}

function pourOil() {
	$("#smallBeaker").hide();
	$("#smallLiquid").hide();
	$("#smallLiquid").after('<img id="smallBeakerPour" src="images/blank_img.png" />');
	$("#smallBeakerPour").css("background", "url('images/smallBeakerPour2.gif') 0 0");
	$("#smallBeakerPour").animate({top:"-99px"}, 500, "linear", changeBigBeakerOil);
}

function changeBigBeakerOil() {
	$("#bigLiquid").css("background", "url('images/bigLiquid.png') -91px 0");
	$("#smallBeakerPour").animate({top:"-99px"}, 1000, "linear", finishAnimateOil);
}

function finishAnimateOil() {
	$("#smallBeakerPour").detach();
	$("#smallBeaker").show();
	$("#smallLiquid").css({top:"83px", left:"372px"});
	$("#smallBeaker").animate({top:"60px", left:"365px"}, 1000, "linear", mixOil);
}

/*
 * Function: animateDye
 * Disables the "Try It!" button, shows the eyedropper, and begins the animation for adding dye to
 * the water in the big beaker
*/
function animateDye() {
	$("#tryItButton").attr("disabled", "disabled");
	$("#eyedropper").show();
	raiseEyedropper();
}

/*
 * Functions:
 *			  raiseEyedropper
 *			  moveEyedropperLeft
 * Animate the motion of the eyedropper from the small beaker to above the large beaker.
 * Split up into two parts (first raising the eyedropper out of the small beaker, then moving it
 * over the second beaker) to make it look more natural. When both parts of the animation are done,
 * calls releaseDye to continue the animation.
*/
function raiseEyedropper() {
	$("#eyedropper").animate({top:"-45px", left:"380px"}, 300, "linear", moveEyedropperLeft);
}

function moveEyedropperLeft() {
	$("#eyedropper").animate({top:"-95px", left:"255px"}, 700, "linear", releaseDye);
}

/*
 * Function: releaseDye
 * Begins animating the falling of the drops of dye from the eyedropper, then calls changeBigBeakerDye
 * to change the color of the liquid in the big beaker to represent the mixing of the dye with the water.
*/
function releaseDye() {
	$("#dyeDrops").show();
	$("#dyeDrops").animate({top:"68px", left:"263px"}, 600, "linear", changeBigBeakerDye);
}

/*
 * Function: changeBigBeakerDye
 * Changes the color of the liquid in the big beaker to represent the mixing of the dye, and finishes
 * animating the falling of the drops of dye into the beaker. Calls the next phase of animation when
 * finished.
*/
function changeBigBeakerDye() {
	$("#bigLiquid").css("background", "url('images/bigLiquid.png') -91px -65px");
	$("#dyeDrops").animate({top:"100px", left:"263px"}, 200, "linear", moveEyedropperRight);
}

/*
 * Functions:
 *			  moveEyedropperRight
 * 			  finishAnimateDye
 * Move the eyedropper back to the small beaker, again in two parts so it looks more natural. Hide the
 * drops of dye and move them back to their original position, so they're ready the next time they need
 * to be animated. When finished, call mixDye to perform and display the relevant calculations.
*/
function moveEyedropperRight() {
	$("#eyedropper").animate({top:"-45px", left:"385px"}, 700, "linear", finishAnimateDye);
}

function finishAnimateDye() {
	$("#dyeDrops").hide();
	$("#dyeDrops").css({top:"-30px", left:"263px"});
	$("#eyedropper").animate({top:"20px", left:"395px"}, 300, "linear", mixDye);
}

/*
*************************************************************************
*					"Zoom"/Particle Animation Functions					*
*************************************************************************
*/

/*
 * Function: generateZoomDots
 * Dynamically generates the HTML for 500 dots to represent the particles in the "particle zoom" animations.
 * This is done dynamically primarily because it is unwieldy and unnecessary to include a large chunk of HTML
 * statically in the HTML page. The generation is done once, when the page loads, and then the dots are
 * shown, hidden, moved, and reset as needed.
 *
 * Dots are named "cold1" through "cold250" and "hot1" through "hot250", and given classes "coldDot" and "hotDot",
 * because the cold/hot water mixing needs to make this distinction. However, the same dots are used for the particles
 * in the dye-mixing particle animation, where all dots are visually identical and both types are treated the same way.
*/
function generateZoomDots() {
	// Wrap all of the "dot" elements in a div element so that the div can be shown and hidden to show/hide
	// all of the dots with a single statement, and also to make the coordinates more intuitive (0,0 relative
	// to the div is the center of the "magnification circle", rather than the center being something arbitrary
	// determined by the circle's own alignment on the page)
	var zoomHTML = '<div id="zoomDiv">';
	var coldHTML = '<img id="cold1" class="coldDot" src="images/blank_img.png" />';
	var hotHTML = '<img id="hot1" class="hotDot" src="images/blank_img.png" />';

	// The source image is blank_img.png so that the color of the dots can be manipulated by
	// simply changing the background color via CSS
	for(var i=2; i<=100; i++) {
		coldHTML += '<img id="' + "cold" + i + '" class="coldDot" src="images/blank_img.png" />';
		hotHTML += '<img id="' + "hot" + i + '" class="hotDot" src="images/blank_img.png" />';
	}

	zoomHTML += coldHTML + hotHTML + '</div>';
	$("#zoomInBackdrop").after(zoomHTML);
	$("#zoomDiv").hide();
}

/*
 * Function: showZoom
 * Called when the user clicks the zoomLink (displayed after either a water or a dye experiment has been performed).
 * Determines whether the experiment performed involved water or dye, and turns the appropriate "particle zoom"
 * animation on/off.
*/
function showZoom() {
	// If the animation is currently on, turn it off by hiding the animation components and setting zoomPlaying
	// to false (this flag alerts the function that actually handles the animation to stop)
	if(zoomPlaying) {
		$("#zoomInfo").hide();
		$("#zoomInBackdrop").hide();
		$("#zoomDiv").hide();
		zoomPlaying = false;
	}
	// If the animation is currently off, start the animation
	else {
		// Set substance-dependent conditions, according to whether the substance is water or dye
		if(smallSubstance=="water") {
			// Set the colors of the dots to red and blue, for hot and cold water, and reset hot1 and cold1
			// to the appropriate starting positions for the water animation
			$(".coldDot").css("background-color", "blue");
			$(".hotDot").css("background-color", "red");
			$("#cold1").css("top", "1px");
			$("#cold1").css("left", "-9px");
			$("#hot1").css("top", "1px");
			$("#hot1").css("left", "11px");
			$("#zoomInfo").val("The hot and cold water mixes through diffusion. Can diffusion unmix the water?");

			// All of the other dots have their positions chosen randomly, with blue dots on the left
			// and red dots on the right.
			for (var i=2; i<=100; i++) {

				randomizeColdPosition("#cold" + i);
				randomizeHotPosition("#hot" + i);
			}
		}
		else if(smallSubstance=="dye") {
			// Set all of the dots to be green for the dye animation, and reset them to the appropriate
			// starting position for the dye animation (which is all dots at the center)
			$(".coldDot").css({"background-color":"green", left:"0px", top:"0px"});
			$(".hotDot").css({"background-color":"green", left:"0px", top:"0px"});
			$("#zoomInfo").val("The individual molecules of dye are mixed by Brownian (random) motion. Can the process be reversed?");
		}

		// Starting the animation itself is the same regardless of the substance
		zoomPlaying = true;
		$("#zoomInfo").show();
		$("#zoomInBackdrop").show();
		$("#zoomDiv").show();
		animateZoomDots();
	}

	return false;
}

/*
 * Function: randomizeColdPosition
 * Randomly determines the starting point for a given "cold" particle during setup for the water
 * "particle zoom" animation. "Cold" particles are located at a random point in the left half of
 * the "zoom circle".
*/
function randomizeColdPosition(name) {
	// x and y will be the starting coordinates; set them to large values so that
	// they will be defined when they are checked by "while", and the "while" condition
	// will evaluate to true.
	var x = 200;
	var y = 150;

	// 4688 is approximately equal to r^2 of the circle. If x^2 + y^2 = r^2,
	// the point is outside of the circle, so generate random coordinates until
	// the point is inside the circle.
	while( (Math.pow(x, 2)+Math.pow(y, 2)) > 2250) {
		// x must be negative to put the particle on the left side
		x = -Math.random()*100;
		y = Math.random()*100;
		if (Math.random()>0.5) {
			y = y*-1;
		}
	}

	x = x + "px";
	y = y + "px";

	$(name).css("top", y);
	$(name).css("left", x);
}

/*
 * Function: randomizeHotPosition
 * Randomly determines the starting point for a given "hot" particle during setup for the water
 * "particle zoom" animation. "Hot" particles are located at a random point in the right half of
 * the "zoom circle". Functions similarly to randomizeColdPosition.
*/
function randomizeHotPosition(name) {
	var x = 200;
	var y = 150;

	while( (Math.pow(x, 2)+Math.pow(y, 2)) > 2250) {
		// x must be positive to put the particle on the right side
		x = Math.random()*100;
		y = Math.random()*100;
		if (Math.random()>0.5) {
			y = y*-1;
		}
	}

	x = x + "px";
	y = y + "px";

	$(name).css("top", y);
	$(name).css("left", x);
}

/*
 * Function: animateZoomDots
 * Randomly oves the dots representing particles on the screen, determining each particle's
 * motion independently. Passes itself as a callback to the last animation function, so
 * that it keeps moving the dots until told to stop.
 *
 * Note that this function is used to animate both the dye "particles" and the hot/cold
 * water "particles". Note also that "cold" and "hot" particles have the same behavior,
 * even in the water animation; the distinction is only necessary for the initial setup
 * in showZoom.
*/
function animateZoomDots() {
	// Use this flag to stop the function from indefinitely calling itself and stop the animation
	if(!zoomPlaying)
		return;

	var x, y, xmove, ymove, name, ind;

	for(var i=1; i<=100; i++) {
		// Randomly move the "cold" dot first
		name = "#cold" + i;

		// Read/parse the CSS "left" value to determine x-coordinate
		x = $(name).css("left");
		ind = x.indexOf("p");
		x = x.substring(0, ind);

		// Read/parse the CSS "top" value to determine y-coordinate
		y = $(name).css("top");
		ind = y.indexOf("p");
		y = y.substring(0, ind);

		// Randomly determine move distance and direction and assign new coordinates
		xmove = (x*1) + determineXMove(x, y);
		ymove = (y*1) + determineYMove(x, y);
		xmove = xmove + "px";
		ymove = ymove + "px";
		$(name).css({left:xmove, top:ymove});

		// Randomly move the "hot" dot next
		name = "#hot" + i;

		// Read/parse the CSS "left" value to determine x-coordinate
		x = $(name).css("left");
		ind = x.indexOf("p");
		x = x.substring(0, ind);

		// Read/parse the CSS "top" value to determine y-coordinate
		y = $(name).css("top");
		ind = y.indexOf("p");
		y = y.substring(0, ind);

		// Randomly determine move distance and direction and assign new coordinates
		xmove = (x*1) + determineXMove(x, y);
		ymove = (y*1) + determineYMove(x, y);
		xmove = xmove + "px";
		ymove = ymove + "px";

		// Use animate() instead of css() to assign the new location for the last dot,
		// because animate() will take a callback, allowing this function to indirectly
		// call itself indefinitely without blocking all the other code in an infinite loop.
		if(i==100) {
			$(name).animate({left:xmove, top:ymove}, 5, "linear", animateZoomDots);
		}
		else {
			$(name).css({left:xmove, top:ymove});
		}
	}
}

/*
 * Function: determineXMove
 * Randomly determines an integer number of pixels, between -3 and 3 inclusive,
 * to move a particle horizontally. The arguments x and y represent the current
 * location of the particle; these are only used to ensure that the determined
 * movement will not cause the particle to go outside of the circle.
 *
 * Returns the number representing distance and direction of the move, NOT
 * a new x-coordinate for the particle.
*/
function determineXMove(x, y) {
	var xmove;

	// If the dot is already at the edge of the circle, move it towards the
	// middle of the circle
	if (Math.pow((x), 2)+Math.pow((y), 2)>2250) {
		if(x > 0)
			xmove = -3;
		else
			xmove = 3;
	}
	// Otherwise, determine the move randomly
	else {
		xmove = Math.floor(4*Math.random());
		if (Math.random()>0.5) {
			xmove = xmove*-1;
		}
	}

	return xmove;
}

/*
 * Function: determineYMove
 * Randomly determines an integer number of pixels, between -3 and 3 inclusive,
 * to move a particle vertically. The arguments x and y represent the current
 * location of the particle; these are only used to ensure that the determined
 * movement will not cause the particle to go outside of the circle.
 *
 * Returns the number representing distance and direction of the move, NOT
 * a new y-coordinate for the particle.
*/
function determineYMove(x, y) {
	var ymove;

	// If the dot is already at the edge of the circle, move it towards the
	// middle of the circle
	if (Math.pow((x), 2)+Math.pow((y), 2)>2250) {
		if(y > 0)
			ymove = -3;
		else
			ymove = 3;
	}
	// Otherwise, determine the move randomly.
	else {
		ymove = Math.floor(4*Math.random());
		if (Math.random()>0.5) {
			ymove = ymove*-1;
		}
	}

	return ymove;
}
