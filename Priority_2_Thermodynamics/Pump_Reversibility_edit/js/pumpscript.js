/*
 * File: pumpscript.js
 * Purpose: To provide the animations and interactivity for the Pump Reversibility simulation (pump-reversibility.html)
 * Author: Emily Ehrenberger (April 2012)
 *       Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2012
*/


/*
 * This file makes use of the JQuery libraries (http://jquery.com/)
*/

$(document).ready(init);

var simulationStarted = false;

// constants
var minRate = 0.062;
var maxRate = 13.9;   // Found from ITT website
var g = 9.8;  // m/s^2
var height = 50;  // m

var pipeRadius = .026251; // m (using a schedule 40 steel pipe with 2.067 inch diameter)
var volWater = 100; // L

// Physics of water draining (also constants)

var drainV = height / Math.sqrt(2 * g * height); // m / s. Avg Velocity = D / t where D = .5 * g * t^2 and so drainV = D / Sqrt(2 * D * g)
var drainFrictionCoeff = calcFrictionCoeff(drainV); // Finds friction coefficient for draining water
var drainRate = Math.PI * pipeRadius * pipeRadius * drainV; // m^3 / s
var drainRateLiters = drainRate * 1000; // L / s
var drainEfficiency = 35;

// W absorbed by pump from drain = (Wfriction + Wkinetic - Wpotential) / PumpEfficiency
var drainWork = volWater * ( (drainV * drainV * drainFrictionCoeff * height / pipeRadius) + (drainV * drainV / 2) - (g * height * (drainEfficiency / 100)) );
var drainPower = drainRateLiters * ( (drainV * drainV * drainFrictionCoeff * height / pipeRadius) + (drainV * drainV / 2) - (g * height * (drainEfficiency / 100)) );
var drainTime = volWater / drainRateLiters * 1000; // in milliseconds; used for animation purposes

// variables to hold inputs and calculation results
var pumpRate; // L/s
var pumpEff; // efficiency of pump
var pumpWork; // work done by pump
var powerRecovery; // proportion of work recovered via draining to work done by pump
var pumpTime; // in milliseconds; used for animation purposes


/*
*************************************************************************************************************************
*                         Initialization                            *
*************************************************************************************************************************
*/

/*
 * Function: init
 * Sets up the page when it is loaded, hiding elements that aren't supposed to be visible right away, and
 * attaching event handlers. Also clears all input and output fields.
*/
function init() {
  $("#openValve").hide();
  $("#openSideValve").hide();
  $("#drainWater").hide();
  $("#suspendedWater").hide();
  $("#pumpWorkArrow").hide();
  $("#drainWorkArrow").hide();
  $("#splash").hide();
  
  // clear input fields and set input to NaN to mark that no input has been received yet
  $("#pumpRate").val("");
  pumpRate = NaN;
  
  // clear output fields
  $("#pumpEff").html("");
  $("#pumpWork").html("");
  $("#drainWork").html("");
  $("#powerRecovery").html("");
  
  // set the value of volumeLabel (set here rather than in the html just for ease of revision)
  $("#volumeLabel").html("" + volWater + " L");
  
  // make sure all input elements are enabled (in case the user refreshes the page while some elements are disbled)
  $("#runButton").removeAttr("disabled");
  $("#resetButton").removeAttr("disabled");
    $("#skipButton").removeAttr("disabled");
  $("#pumpRate").removeAttr("disabled");
  
  // register event handlers
  $("#pumpRate").on('change', getPumpRate);
  $("#runButton").on('click', runPump);
  $("#resetButton").on('click', resetPump);
    $("#skipButton").on('click', skip);
  $("#about").on('click', displayAboutInfo);
  $("#helpButton").on('click', displayHelp);

  // Generate the LiquidFun assets (particles and rigid bodies)
  initTestbed(); // Found in liquidfun/testbed.js
}

/*
*************************************************************************************************************************
*                         Event Handlers                            *
*************************************************************************************************************************
*/

/*
 * Event Handler Function: getPumpRate
 * Called when the user inputs a new value into the pumpRate field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getPumpRate() {
  var input = $("#pumpRate").val();
  
  // if the entered value is not a valid number, keep the current pump rate and display that number in the input field.
  // if no valid pump rate as been entered, clear the input field
  if(isNaN(input) || input == "") {
    if(!isNaN(pumpRate)) {
      $("#pumpRate").val(pumpRate); 
    }
    else {
      $("#pumpRate").val(""); 
    }
  }
  // if the input is outside the valid range, set the pump rate to the highest/lowest valid value
  // and update the display accordingly
  else if(input > maxRate) {
    pumpRate = maxRate;
    $("#pumpRate").val(maxRate);
  }
  else if(input < minRate) {
    pumpRate = minRate;
    $("#pumpRate").val(minRate);
  }
  // if input is valid, set pumpRate
  else {
    pumpRate = input; 
  }
  
  $("#pumpEff").val("");
  $("#pumpWork").val("");
  $("#drainWork").val("");
  $("#powerRecovery").val("");
}

/*
 * Event Handler Function: resetPump
 * Called when the user clicks the "Reset" button
 *
 * Stops all animations, returns animation pictures to their initial state, and clears all output fields
*/
function resetPump() {
  finishDrain();
  
  // clear output fields
  $("#pumpEff").html("");
  $("#pumpWork").html("");
  $("#drainWork").html("");
  $("#powerRecovery").html("");
}

/*
 * Event Handler Function: runPump
 * Called when the user clicks the "Run Pump" button
 *
 * If a valid pumpRate has been entered, initiates the animation sequence
*/
function runPump() {
  
  if(isNaN(pumpRate) || simulationStarted)
    return;

  openTank1(); // Remove the barrier at the bottom of tank 1
  openLowerPipe();
  // stirrerIsMoving = true;
  // world.SetGravity(new b2Vec2(1, -1));
    
  pumpTime = volWater / pumpRate * 1000; // pump time in milliseconds
  
  // ensure that animation components are in their initial state
  resetPump();
  
  // disable pumpRate input field and "Run Pump" button while animation is running
  // (leave "Reset" button enabled so users have a way to cancel the animation)
  $("#runButton").attr("disabled", "disabled");
  $("#pumpRate").attr("disabled", "disabled");
  simulationStarted = true;
  
  // begin the animation
  pumpWater();
}

/*
 * Event Handler Method: displayAboutInfo
 * Displays a dialog box containing information about the program when the user clicks the "i" glyphicon button.
*/
function displayAboutInfo() {
  alert("This program was created by Emily Ehrenberger under the direction of Dr. " +
      "Margot Vigeant, Bucknell University Department of Chemical Engineering in 2012.\n\n" +
      "The development of this program was funded by the National Science " +
      "Foundation Grant DUE-0717536 (2011).\n\n" +
      "The simulated pump was based on data from Gould Pumps Industrial Products.\n\n" +
      "Address any questions or comments to mvigeant@bucknell.edu.\n\n" +
      "\u00A9 Margot Vigeant 2012");
  return false;
}

/*
 * Event Handler Method: displayHelp
 * Displays a dialog box containing information about how to use the program when the user clicks the "?" glyphicon
 * button.
 */
function displayHelp() {
  alert("Enter a pump rate within the specified range and hit \"Run Pump\" to begin pumping the water " +
    "through the chamber.\n\nOnce the topmost tank has been filled, it will begin draining. You may skip the " +
    "animation during either of these processes by clicking the white button.\n\nOnce the simulation has " +
    "finished, results will be displayed in the box in the upper left. Click the \"Reset\" button to " +
    "restart the simulation.");
}

/*
*************************************************************************************************************************
*                         Animation Functions                         *
*************************************************************************************************************************
*/

/*
 * Function: pumpWater
 * Runs the portion of the animation for pumping the water into the upper tank
*/
function pumpWater() {
  
  // move the valves into their proper positions (open vs. closed) and show the image of water filling the pipe
  $("#closedValve").hide();
  $("#openValve").show();
  $("#drainWorkArrow").show();
  
  // animate the water level rising in the upper tank and lowering in the lower tank
  $("#tank1Water").show();
  $("#tank2Water").show();
  $("#tank1Water").animate({top:"433px"}, pumpTime, "linear");
  $("#tank2Water").animate({top:"4px"}, pumpTime, "linear", pause); // register the pause function to be called when this section of the animation finishes
}

/*
 * Function: pause
 * Runs the portion of the animation for pumping the water into the upper tank
*/
function pause() {
  // move the valves into their proper positions (open vs. closed) and replace the image of water filling the pipe with the one appropriate
  // to the second tank only being full
  $("#closedValve").show();
  $("#openValve").hide();
  $("#drainWorkArrow").hide();
  
  // dummy animate function that "moves" tank1Water to the position it's already in for 1.5 seconds, just to produce a pause in the animation
  $("#tank1Water").animate({top:"433px"}, 1500, "linear", drainWater); // register the drainWater function to be called when this section of the animation finishes
}

/*
 * Function: drainWater
 * Runs the portion of the animation for draining the water from the upper tank out of the system
*/
function drainWater() {
  // move the valves into their proper positions (open vs. closed) and show the images of water draining through the pipe
  $("#suspendedWater").hide();
  // $("#drainWater").show();
  $("#closedSideValve").hide();
  $("#openSideValve").show();
  // $("#drainWater").show();
  // $("#splash").show();
  $("#pumpWorkArrow").show();
  
  $("#tank2Water").animate({top:"97px"}, drainTime, "linear", finishDrain); // register the finishDrain function to be called when this section of the animation finishes
}

/*
 * Function: finishDrain
 * Cleans up after the draining animation, re-enables inputs, and displays outputs
*/
function finishDrain() {
  $("#runButton").removeAttr("disabled");
  $("#resetButton").removeAttr("disabled");
  $("#pumpRate").removeAttr("disabled");
  $("#skipButton").removeAttr("disabled");
  $("#drainWater").hide();
  $("#drainWorkArrow").hide();
  $("#splash").hide();
  simulationStarted = false;
  displayStats();
}

/*
 * Function: skip
 * Skips the current animation and removes the animation from the queue
*/  
function skip() {
  $("#tank1Water").stop(true,true);
  $("#tank2Water").stop(true,true);
}

/*
*************************************************************************************************************************
*                         Calculations                            *
*************************************************************************************************************************
*/

/*
 * Function: displayStats
 * Calculates the pump efficiency, work done by the pump, and percentage of work recovered during drain. Displays these
 * stats, as well as the work done by the water on the pump when it drained
*/
function displayStats() {
  var pumpV = (pumpRate * .001) / (Math.PI * pipeRadius * pipeRadius); 
  // In m/s. pumpV is AVERAGE velocity of the water being pumped, 1 L/s = .001 m^3/s
  
  var mDot = volWater / (volWater / pumpRate);

  var pumpFrictionCoeff = calcFrictionCoeff(pumpV);

  // calculate pump efficiency
  pumpEff = findEfficiency(pumpRate);
  
  pumpWork = (volWater * (g * height + pumpV * pumpV / 2 + pumpFrictionCoeff * pumpV * pumpV * height / pipeRadius)) / (pumpEff / 100); //        Work*pumpEfficiency = m*2*f*v^2*L/D+mv^2/2+mgh
  
  //pumpPower = pumpWork / (volWater / pumpRate);
  
  pumpPower = (pumpRate * (g * height + pumpV * pumpV / 2 + pumpFrictionCoeff * pumpV * pumpV * height / pipeRadius)) / (pumpEff / 100);
  
  powerRecovery = Math.abs(drainPower / pumpPower * 100);
  
  // display outputs
  $("#pumpWork").html(Math.round(pumpPower*100)/100 + " W");
  $("#drainWork").html(Math.round(drainPower*100)/100 + " W");
  $("#pumpEff").html(Math.round(pumpEff*100)/100 + "%");
  $("#powerRecovery").html(powerRecovery.toFixed(4) + "%");
}

/*
 * Function: findEfficiency
 * Calculates the pump efficiency with a given flow rate (in L/s)
*/
function findEfficiency(flowRate) {
  // in %, equation found in excel sheet that took data from ITT website
  return (-0.0009*flowRate*flowRate*flowRate*flowRate + 0.0201*flowRate*flowRate*flowRate - 0.3106*flowRate*flowRate + 5.2603*flowRate); 
}


/*
 * Function: toKiloJoules
 * Purpose: Converts work values from J to kJ
 */
function toKiloJoules(energy) {
  return energy/1000;
}



/*
 * Function: calcFrictionCoeff
 * Purpose: Finds the friction coefficient
*/

function calcFrictionCoeff(flowrate) {
    
  var reynoldsNum = 4 * 1000000 * flowrate / (Math.PI * pipeRadius);
  var frictionCoeff = Math.pow((1/(1.8*Math.log(6.9/reynoldsNum))),2)/4; // Finds fanning coefficient using Haalands equation assuming smooth surface

  return frictionCoeff;

}

