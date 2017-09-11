/*
 * File: cyclescript.js
 * Author: Emily Ehrenberger (August 2011), Modified by Brooke Bullek (July 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 *         Based on Flash simulation by Gavin MacInnes
 * (c) Margot Vigeant 2017
*/

$(document).ready(init);

/* Constants */

var INITIAL_TEMP = 293; // K
var INITIAL_PISTON = 40; // cm
var INITIAL_PRESSURE = 1; // bar
var INITIAL_ENTROPY = 0;
var ARROW_MAX_WIDTH = 30;

/* Globals */

var R = 83.143; // (cm^3 * bar) / (mol * K)
var Cp = (7/2)*R; // (cm^3 * bar) / (mol * K)
var Cv = (5/2)*R; // (cm^3 * bar) / (mol * K)
var CrossSection = 609.334; // cm^2

var temp;
var pressure;
var pistonPosition;
var volume;
var entropy;
var stepType;
var cycleClosed;

var oldTemp;
var oldPressure;
var oldVolume;
var oldEntropy;

// The number of points that the user has saved on this cycle
var numSavedSteps;
var savedSteps;

// Prevents the user from spamming the 'Save Step' button
var hasUpdated = false;

var isiPad = false;
var slidingPistoniPad;

// The colors that the cycle steps will appear in
var colors = ['#E73232', '#A34FDC', '#209A0F', '#4FDCD2', '#F9A030', '#4030F9'];

/*
*************************************************************************************************************************
*                                                  Initialization                                                       *
*************************************************************************************************************************
*/

/*
 * The very first function called once the page is loaded. Shows the intro screen with a continue button and
 * registers event handlers with the buttons.
 */
function init() {
  $("#simulationDiv").hide();
  
  detectiPad();
  
  $("#continueLink").on('click', openSim);
  $("#pistonPosition").on('change', positionTextFieldChanged);
  // Set up drag-and-drop for normal browsers. If the user is on an iPad this will not detect anything (but won't break anything either)
  $("#slidingPiston").draggable( {containment:'parent', drag:pistonDragged, stop:pistonDragged} );
  $("#heatSourceTemp").on('change', getHeatSourceTemp);
  $(".stepType").on('click', getStepType);
  $("#saveStepButton").on('click', saveStep);
  $("#resetButton").on('click', resetAll);
  $("#finishCycleButton").on('click', closeCyclePressed);
  $("#about").on('click', displayAboutInfo);
  $("#instructions").on('click', displayInstructions);
  $("#enableSurfacePlot").on('click', transform3DGraph);
}

/*
 * Checks whether the platform index for "iPad" is undefined (equal to -1). If so, this is NOT an iPad. 
 * If this device is an iPad, accommodates the smaller window and sets up a webkit_draggable object.
 */
function detectiPad() {
  isiPad = !(navigator.platform.indexOf("iPad") == -1);
  
  if(isiPad){
    $(".container").css("width", "95%");
    // Set up drag-and-drop for iPad browsers. If the user is on a computer this will not detect anything (but won't break anything either)
    slidingPistoniPad = new webkit_draggable('slidingPiston', {onMove:pistonDraggediPad, onEnd:pistonDraggediPad});
  }
}

/*
 * Hides the intro scene once the user presses the 'continue' button and shows the actual piston simulation.
 */
function openSim() {
  $("#introDiv").hide();
  $("#simulationDiv").show();
  
  initializeGraphs();
  resetAll();
  
  return false;
}

/*
 * Called when the user either makes a change to the graph or saves a step.
 */
function toggleUpdate() {
  // The graph has updated and now a step can be saved
  if (hasUpdated) {
    $("#saveStepButton").removeAttr('disabled');
  } else {
    $('#saveStepButton').attr('disabled','disabled');
  }
}

/*
 * Reverts the simulation's progress to its original state.
 */
function resetAll() {
  // Reset internal variables
  temp = INITIAL_TEMP;
  pressure = INITIAL_PRESSURE;
  pistonPosition = INITIAL_PISTON;
  volume = pistonPosToVolume(INITIAL_PISTON);
  entropy = INITIAL_ENTROPY;
  stepType = "Adiabatic";
  
  oldTemp = temp;
  oldPressure = pressure;
  oldVolume = volume;
  oldEntropy = entropy;

  savedSteps = new Array();
  numSavedSteps = 0;
  cycleClosed = false;
  
  // Reset input fields / gas displays
  $("#heatSourceTemp").val(temp);
  $("#gasTemp").html(temp);
  $("#gasPressure").html(pressure);
  $("#pistonPosition").val(pistonPosition);
  movePistonTo(pistonPosition);

  // Process type starts as adiabatic by default
  $(".stepType").attr("checked", false);
  document.getElementById("stepTypeAdiabatic").checked = true;
  
  // Reset the piston insulation in the picture (shows the gray insulation)
  $("#jacket").show();
  $("#blue").hide();
  $("#red").hide();
  
  // Reset the text areas containing cycle data and other info
  $("#cycleSteps").html("");
  var cycleText = "Initial State: " + pressure + " bar, " + temp + " K, " + pistonPosition + " cm extension";
  appendStepText(colors[0], cycleText);

  $("#cycleInfo").html("");
  
  // Reset the PV (pressure vs. volume) graph
  Ppoints = new Array();
  Ppoints[0] = new DataPoint(INITIAL_PRESSURE, colors[0]);
  Vpoints = new Array();
  Vpoints[0] = new DataPoint(pistonPosToVolume(INITIAL_PISTON), colors[0]);

  // Reset the TS (temperature vs. entropy) graph
  Tpoints = new Array();
  Tpoints[0] = new DataPoint(INITIAL_TEMP, colors[0]);
  Spoints = new Array();
  Spoints[0] = new DataPoint(INITIAL_ENTROPY, colors[0]);

  // Reset the graphs
  PVTGraph3D.series[0].setData(null);
  PVgraph.series[0].setData(null);
  TSgraph.series[0].setData(null);

  // Surface plot is enabled by default
  $("#enableSurfacePlot").prop('checked', true);
  close3DGraph();

  dotPreviewed = false;
  hasUpdated = false;
  toggleUpdate();
  
  scaleHeatInArrow(66);
  scaleHeatOutArrow(66);
  scaleWorkArrow(66);
  $("#workArrow").attr("src", "workOutArrow.png");
  $("#heatInLabel").html("");
  $("#heatOutLabel").html("");
  $("#netWorkLabel").html("");
  $("#heatSourceLabel").html("");
  $("#heatSinkLabel").html("");
}

/*
*************************************************************************************************************************
*                                                    Event Handlers                                                     *
*************************************************************************************************************************
*/

/*
 * Called when the user clicks and drags the piston.
 */
function pistonDragged(event, ui) {
  pistonPosition = pixelsToPistonPos(ui.position.top);
  processNewPosition();
}

/*
 * Called when the user clicks and drags the piston on the iPad.
 */
function pistonDraggediPad() {
  // Stop the piston from being dragged sideways (the gotProject library doesn't have a way to do this automatically)
  $("#slidingPiston").css("left", "0px");
  
  // Read in the piston's new position
  pistonPosition = pixelsToPistonPos($("#slidingPiston").css("top"));
  
  /* Make sure piston is not out of range vertically (again, the jqueryui library for ordinary browswers does this
   * automatically, but the gotProject library for the iPad does not) */
  if (pistonPosition > 100) {
    pistonPosition = 100;
    movePistonTo(100);
  }
  else if (pistonPosition < 10) {
    pistonPosition = 10;
    movePistonTo(10);
  }
  
  processNewPosition();
}

/*
 * Updates the position when the textbox (and hence the piston's position) have changed.
 */
function positionTextFieldChanged() {
  var newPos = $("#pistonPosition").val();
  if (newPos == "") newPos = NaN;
  
  // Make sure the value entered is actually a number within range before processing
  if(isNaN(newPos)) {
    $("#pistonPosition").val(pistonPosition);
  }
  else {
    if (newPos < 10) {
      newPos = 10;
    }
    else if (newPos > 100) {
      newPos = 100;
    }

    $("#pistonPosition").val(newPos);
    pistonPosition = newPos * 1; // make sure Javascript knows it's a number, not a string
    processNewPosition();
  }
}

/*
 * Updates the temperature when the textbox has changed.
 */
function getHeatSourceTemp() {
  var newTemp = $("#heatSourceTemp").val();
  if (newTemp == "") newTemp = NaN;
  
  if (isNaN(newTemp)) {
    $("#heatSourceTemp").val(temp);
  }
  else {
    if (newTemp < 1) {
      newTemp = 1;
      $("#heatSourceTemp").val(newTemp);
    }
    temp = newTemp * 1; // make sure Javascript knows it's a number, not a string
    processNewTemp();
  }
}

/*
 * Updates the process type (adiabatic, isothermal, etc.) once the selected radio button has changed.
 */
function getStepType() {
  stepType = $("input[name='stepType']:checked").val();
  processNewStepType();
}

/*
 * Checks whether the cycle may be closed when the 'Finish Cycle' button is pressed.
 */
function closeCyclePressed() {
  var cycleCloses = closeCycle();
  if (cycleCloses) {
    cycleClosed = true;
    calculateCycleStats();
  }
}

/*
 * Shows a pop-up alert box when the user presses the help button.
 */
function displayInstructions() {
  alert("Instructions:\n\n" +
      "Try to create an engine (or heat pump) step by step. See how " +
      "efficient you can be!\n\n" +
      "For each step in the cycle, choose a thermodynamic process and adjust " +
      "the temperature and volume of the system by typing into the input " +
      "boxes or dragging the piston. Once you have finished changing the " +
      "state of the system, click \"Save Step\" to record the state change and " +
      "add that step to the cycle. Look in the box to the left of the buttons " +
      "to see the steps in your cycle so far.\n\n" +
      "Once you have completed a cycle and returned the system to its " +
      "initial state, click the \"Finish Cycle\" button to calculate the cycle " +
      "efficiency. If you click \"Finish Cycle\" when at least one of the " +
      "parameters (pressure, entropy, temperature, volume) has returned to its " +
      "starting value, the simulation will calculate the last step of the cycle " +
      "automatically.\n\n" +
      "Click the \"Reset\" button to clear your cycle and start over.");
  
  return false;
}

/*
 * Shows a pop-up alert box when the user presses the info button.
 */
function displayAboutInfo(){
  alert("This program was created under the direction of Dr. Margot Vigeant at " +
      "Bucknell University. It was initially developed in Flash by Gavin " +
      "MacInnes, and was adapted to Javascript by Emily Ehrenberger in 2011.\n\n" +
      "The development of this program was funded by the National Science " +
      "Foundation Grant DUE-0442234 (2009) and DUE-0717536 (2011).\n\n" +
      "Address any questions or comments to mvigeant@bucknell.edu.\n\n" +
      "\u00A9 Margot Vigeant 2011");
  return false;
}

/*
*************************************************************************************************************************
*                                                    Updating Display                                                   *
*************************************************************************************************************************
*/

/*
 * Takes an updated numeric position from the textbox and moves the drawing of the piston appropriately.
 */
function movePistonTo(newPos) {
  var newPosFromTop = 200 - (2 * newPos);
  // Truncate decimal places because not all browsers can process a fractional value for number of pixels
  newPosFromTop = Math.floor(newPosFromTop) + "px";
  $("#slidingPiston").css("top", newPosFromTop);
}

/*
 * Updates the colored border surrounding the piston. Aside from adiabatic processes
 * (which give no border around the chamber), the level of blue or red is a function
 * of the heat source temperature.
 */
function changeInsulationType() {
  if (stepType == "") return;
  
  if (stepType == "Adiabatic") {
    $("#jacket").show();
    $("#red").hide();
    $("#blue").hide();
  }
  else {
    $("#jacket").hide();
    $("#red").show();
    $("#blue").show();
    
    var redOpacity = temp / 6;
    $("#red").css("opacity", (redOpacity / 100));
    $("#red").css("filter", "alpha(opacity=" + Math.floor(redOpacity) + ")");
    
    var blueOpacity = (600 - temp) / 6;
    $("#blue").css("opacity", blueOpacity / 100);
    $("#blue").css("filter", "alpha(opacity=" + Math.floor(blueOpacity) + ")");
  }
}

/*
 * Takes the currently stored pressure and displays it as a text label.
 */
function displayPressure() {
  var pString;
  if (pressure >= 100) {
    pString = Math.round(pressure) + "";
  }
  else if (pressure >= 10) {
    pString = pressure.toFixed(1);
  }
  else {
    pString = pressure.toFixed(2);
  }
  
  $("#gasPressure").html(pString);
}

/*
 * Takes the currently stored temperature and displays it as a text label.
 */
function displayTemp() {
  var tString;
  if(temp >= 10) {
    tString = Math.round(temp) + "";
  }
  else {
    tString = temp.toFixed(1);
  }
  $("#heatSourceTemp").val(tString);
  $("#gasTemp").html(tString);
}

/*
 * Updates the text in the piston position textbox.
 */
function displayPistonPos() {
  movePistonTo(pistonPosition);
  var pistonString;
  if (pistonPosition >= 100) {
    pistonString = Math.round(pistonPosition) + "";
  }
  else {
    pistonString = pistonPosition.toFixed(1);
  }
  
  $("#pistonPosition").val(pistonString);
}

/*
 * Updates the radio buttons to check the one corresponding to the current step type.
 */
function displayStepType() {
  var stepTypeSelector = "#stepType[value=" + stepType + "]";
  
  $(".stepType").attr("checked", false);
  $(stepTypeSelector).attr("checked", true);
}

/*
 * Appends text to the "Cycle Steps" textbox in the given color.
 */
function appendStepText(hexColorString, text) {
  $("#cycleSteps").append("<span style='color:" + hexColorString + ";'>" + text + "</span>");

  // Scroll to the bottom of the div
  var cycleStepsDiv = document.getElementById("cycleSteps");
  cycleStepsDiv.scrollTop = cycleStepsDiv.scrollHeight;
}

/*
*************************************************************************************************************************
*                                                    Processing Input                                                   *
*************************************************************************************************************************
*/

/*
 * Called when the piston's position changes (which affects the volume and subsequently the temperature
 * and pressure).
 */
function processNewPosition() {
  switch(stepType) {
    case "Adiabatic":
      volume = pistonPosToVolume(pistonPosition);
      pressure = oldPressure * Math.pow((oldVolume / volume), (Cp / Cv));
      temp = oldTemp * (volume / oldVolume) * (pressure / oldPressure);
      entropy = oldEntropy;
      displayPressure();
      displayTemp();
      break;
    case "Isothermal":
      volume = pistonPosToVolume(pistonPosition);
      pressure = R * temp / volume;
      entropy = oldEntropy + R * Math.log(volume / oldVolume); // Math.log actually means ln (natural log)
      displayPressure();
      break;
    case "Isobaric":
      volume = pistonPosToVolume(pistonPosition);
      temp = volume * pressure / R;
      entropy  = oldEntropy + Cp * Math.log(temp/oldTemp); // Math.log actually means ln (natural log)
      displayTemp();
      break;
    case "Isochoric": // the piston isn't allowed to move if it's isochoric, so undo the move
      volume = oldVolume;
      pistonPosition = volumeToPistonPos(volume);
      break;
    default: volume = pistonPosToVolume(pistonPosition);
      break;
  }
  
  // Make sure both the displayed number and the visual position of the piston are consistent with the current value of pistonPosition
  displayPistonPos();

  // Clear the "cycle info" text area
  $("#cycleInfo").html("");
  graphPreviewDot();
  changeInsulationType();
}

/*
 * Called when the temperature of the heat source changes.
 */
function processNewTemp() {
  switch (stepType) {
    case "Adiabatic":
      pressure = oldPressure * Math.pow((temp / oldTemp), (Cp / R));
      volume = temp * R / pressure;
      pistonPosition = volumeToPistonPos(volume);
      entropy - oldEntropy;
      if (pistonPosition > 100) {
        pistonPosition = 100;
        processNewPosition();
      }
      else if (pistonPosition < 10) {
        pistonPosition = 10;
        processNewPosition();
      }
      else {
        displayPistonPos();
        displayPressure();
        displayTemp();
      }
      break;
    case "Isothermal": // the temperature is not allowed to change if it's isothermal, so undo the change
      temp = oldTemp;
      displayTemp();
      break;
    case "Isobaric":
      volume = R * temp / pressure;
      pistonPosition = volumeToPistonPos(volume);
      entropy = oldEntropy + Cp * Math.log(temp/oldTemp); // Math.log actually means ln (natural log)
      if (pistonPosition > 100) {
        pistonPosition = 100;
        processNewPosition();
      }
      else if(pistonPosition < 10) {
        pistonPosition = 10;
        processNewPosition();
      }
      else {
        displayPistonPos();
        displayTemp();
      }
      break;
    case "Isochoric":
      pressure = R * temp / volume;
      entropy = oldEntropy + Cv * Math.log(temp/oldTemp); // Math.log actually means ln (natural log)
      displayPressure();
      displayTemp();
      break;
    default:
      displayTemp();
      break;
  }
  
  // Clear the "cycle info" text area
  $("#cycleInfo").html("");
  graphPreviewDot();
  changeInsulationType();
}

/*
 * Called when the step type changes.
 */
function processNewStepType() {
  switch(stepType) {
    case "Adiabatic":
      if (entropy != oldEntropy) {
        if (volume != oldVolume) {
          processNewPosition();
        }
        else {
          processNewTemp();
        }
      }
      break;
    case "Isothermal":
      if (temp != oldTemp) {
        temp = oldTemp;
        displayTemp();
        processNewPosition();
      }
      break;
    case "Isobaric":
      if (pressure != oldPressure) {
        pressure = oldPressure;
        if (volume != oldVolume) {
        processNewPosition();
        }
       else {
        processNewTemp();
       }
       displayPressure();
      }
      break;
    case "Isochoric":
      if(volume != oldVolume) {
        volume = oldVolume;
        pistonPosition = volumeToPistonPos(volume);
        displayPistonPos();
        processNewTemp();
      }
      break;
  }
  
  // Clear the "cycle info" text area
  $("#cycleInfo").html("");
  graphPreviewDot();
  changeInsulationType();
}

/*
*************************************************************************************************************************
*                                                    Saving a Step                                                      *
*************************************************************************************************************************
*/

/*
 * Called when the user presses the 'Save Step' button.
 */
function saveStep() {
  // This button doesn't do anything while disabled
  if ($('#saveStepButton')[0].hasAttribute("disabled")) {
    return;
  }

  hasUpdated = false;
  toggleUpdate();

  var W; // work done
  var Q; // heat transfer
  var deltaU; // change in internal energy of the gas (used to calculate Q and/or W)
  var changeType; // whether the step represents an expansion, a compression, heating, or cooling

  switch(stepType) {
    case "Adiabatic":
      deltaU = Cv * (temp-oldTemp);
      Q = 0;
      W = deltaU - Q;
      if (volume > oldVolume) {
        changeType = "expansion";
      }
      else {
        changeType = "compression";
      }
      break;
    case "Isothermal":
      deltaU = 0;
      W = -R * temp * Math.log(volume/oldVolume); // Math.log actually means ln (natural log)
      Q = deltaU - W;
      if (volume > oldVolume) {
        changeType = "expansion";
      }
      else {
        changeType = "compression";
      }
      break;
    case "Isobaric":
      deltaU = Cv * (temp-oldTemp);
      W = pressure * (volume - oldVolume);
      Q = deltaU - W;
      if (volume > oldVolume) {
        changeType = "expansion";
      }
      else {
        changeType = "compression";
      }
      break;
    case "Isochoric":
      deltaU = Cv * (temp-oldTemp);
      W = 0;
      Q = deltaU - W;
      if (temp > oldTemp) {
        changeType = "heating";
      }
      else {
        changeType = "cooling";
      }
      break;
    default:
      $("#cycleInfo").html("Please choose a thermodynamic process type.");
      return;
    }
  
  if (stepType != "Adiabatic") {
    var deltaS = entropy - oldEntropy;
    var stuff = deltaS - Q / temp;
    
    if (stepType == "Isobaric" && (deltaS - Q / temp) < 0) {
      $("#cycleInfo").html("Step is invalid. Steps must obey the thermodynamic law that deltaS - Q/T >= 0.\n\ndeltaS = " + deltaS.toFixed(4) + 
                "\nQ = " + Q.toFixed(4) + " cm^3 * bar\nT = " + temp.toFixed(4) + " K\n\ndeltaS - Q/T = " + (deltaS - Q/temp).toFixed(4));
      alert("Step not saved.");
      return false;
    }
  }
  
  // create an empty object to act as an associative array containing the properties of this step
  var step = {};

  // store the thermodynamic properties in the step object
  step["stepType"] = stepType;
  step["W"] = W;
  step["Q"] = Q;
  step["T"] = temp;
  
  // save the step object by adding it to an array of all the steps
  savedSteps.push(step);
  numSavedSteps++;

  // Display details about this step to the textbox
  var cycleText = $("#cycleSteps").val() + "<br>" + stepType + " " + changeType + " to " + 
    pressure.toFixed(3) + " bar at " + temp.toFixed(0) + " K, " + pistonPosition.toFixed(1) + 
    " cm<br>" + " Entropy is: " + entropy.toFixed(3) + "<br>Work is: " + W.toFixed(1) + 
    " cm^3 * bar   =   " + toKiloJoules(W).toFixed(1) + " kJ<br>Q is: " + Q.toFixed(1) + 
    " cm^3 * bar   =   " + toKiloJoules(Q).toFixed(3) + " kJ";
  appendStepText(colors[numSavedSteps % colors.length], cycleText);
  
  // save the current state so it may be used for calculations/comparisons as the user creates the next step
  oldTemp = temp;
  oldPressure = pressure;
  oldVolume = volume;
  oldEntropy = entropy;
  dotPreviewed = false;  
  
  // If nothing went wrong
  return true;
}

/*
*************************************************************************************************************************
*                                                    Closing Cycle                                                      *
*************************************************************************************************************************
*/

function closeCycle() {
  var percent;
  var pressCloses;
  var volCloses;
  var tempCloses;
  var entCloses;
  
  // Check against the last SAVED pressure, not whatever pressure the simulation happens to currently have
  percent = Math.abs(INITIAL_PRESSURE - oldPressure) / INITIAL_PRESSURE;
  percent = percent.toFixed(3) * 1;
  pressCloses = (percent <= 0.001);
  
  percent = Math.abs(pistonPosToVolume(INITIAL_PISTON) - oldVolume) / pistonPosToVolume(INITIAL_PISTON);
  percent = percent.toFixed(3) * 1;
  volCloses = (percent <= 0.001);
  
  percent = Math.abs(INITIAL_TEMP - oldTemp) / INITIAL_TEMP;
  percent = percent.toFixed(3) * 1;
  tempCloses = (percent <= 0.001);
  
  percent = Math.abs(INITIAL_ENTROPY - oldEntropy);  // would be / INITIAL_ENTROPY like the others, but INITIAL_ENTROPY is 0
  percent = percent.toFixed(3) * 1;
  entCloses = (percent <= 0.001);
  
  // Check whether the cycle is closeable
  
  if (pressCloses && volCloses && tempCloses && entCloses) {
    // cycle is already closed; no action is necessary to close it
    return true;
  }
  else if (pressCloses) {
    stepType = "Isobaric";
    temp = INITIAL_TEMP;
    pistonPosition = INITIAL_PISTON;
    volume = pistonPosToVolume(INITIAL_PISTON);
    entropy = INITIAL_ENTROPY;
    displayTemp();
    displayPistonPos();
    displayStepType();
    $("#cycleInfo").html("Closing the cycle with an isobaric step...\n");
    
    var success = saveStep();
    
    if(success) {
      return true;
    }
    else {
      $("#cycleInfo").html("Attempting to close cycle with an isobaric step...\n\n" + $("#cycleInfo").val());
      return false;
    }

  }
  else if (volCloses) {
    stepType = "Isochoric";
    temp = INITIAL_TEMP;
    pressure = INITIAL_PRESSURE;
    entropy = INITIAL_ENTROPY;
    displayTemp();
    displayPressure();
    displayStepType();
    $("#cycleInfo").html("Closing the cycle with an isochoric step...\n");
    
    var success = saveStep();
    
    if(success) {
      return true;
    }
    else {
      $("#cycleInfo").html("Attempting to close cycle with an isochoric step...\n\n" + $("#cycleInfo").val());
      return false;
    }

  }
  else if (tempCloses) {
    stepType = "Isothermal";
    pressure = INITIAL_PRESSURE;
    pistonPosition = INITIAL_PISTON;
    volume = pistonPosToVolume(INITIAL_PISTON);
    entropy = INITIAL_ENTROPY;
    displayPressure();
    displayPistonPos();
    displayStepType();
    $("#cycleInfo").html("Closing the cycle with an isothermal step...\n");
    
    var success = saveStep();
    
    if(success) {
      return true;
    }
    else {
      $("#cycleInfo").html("Attempting to close cycle with an isothermal step...\n\n" + $("#cycleInfo").val());
      return false;
    }

  }
  else if (entCloses) {
    stepType = "Adiabatic";
    pressure = INITIAL_PRESSURE;
    temp = INITIAL_TEMP;
    piston = INITIAL_PISTON;
    volume = pistonPosToVolume(INITIAL_PISTON);
    displayPressure();
    displayTemp();
    displayPistonPos();
    displayStepType();
    $("#cycleInfo").html("Closing the cycle with an adiabatic step...\n");
    
    var success = saveStep();
    
    if(success) {
      return true;
    }
    else {
      $("#cycleInfo").html("Attempting to close cycle with an adiabatic step...\n\n" + $("#cycleInfo").val());
      return false;
    }
  }
  else {
    $("#cycleInfo").html("Cycle does not close. Try to make one of the variables (pressure, volume, temperature, or entropy) return to its initial value.");
    return false;
  } 
}

function calculateCycleStats() {
  var efficiencyString;
  var engineType;
  var cycleType;
  var heatSourceTemp;
  var heatSinkTemp;
  
  var netWork = 0;
  var heatIn = 0;
  var heatOut = 0;
  var efficiency;
  var maxTemp = NaN;
  var minTemp = NaN;
  
  for (var i = 0; i < savedSteps.length; i++) {
    netWork += savedSteps[i]["W"];
    
    if(savedSteps[i]["Q"] > 0) {
      heatIn += savedSteps[i]["Q"];
    }
    else {
      heatOut += savedSteps[i]["Q"];
    }
      
    if(isNaN(maxTemp)) {
      maxTemp = savedSteps[i]["T"];
    }
    else if(maxTemp < savedSteps[i]["T"]) {
      maxTemp = savedSteps[i]["T"];
    }
    
    if(isNaN(minTemp)) {
      minTemp = savedSteps[i]["T"];
    }
    else if(minTemp > savedSteps[i]["T"]) {
      minTemp = savedSteps[i]["T"];
    }
  }
  efficiency = -netWork / heatIn;
  
  // if the cycle requires work to be done on it to run
  if (netWork > 0.001) {
    engineType = "heat pump";

    var COP = heatIn / netWork;
    var CarnotCOP = 1 /( (maxTemp/minTemp) - 1);
    
    efficiencyString = "Cycle COP: " + COP.toFixed(4) + "<br>Carnot COP: " + CarnotCOP.toFixed(4);
    /*scaleHeatOutArrow(66);
    scaleHeatInArrow(Math.abs(efficiency) * 66);
    scaleWorkArrow(1 - Math.abs(efficiency)*66);*/
    scaleArrows(heatIn, heatOut, netWork);
    $("#workArrow").attr("src", "workInArrow.png");
    heatSourceTemp = minTemp;
    heatSinkTemp = maxTemp;
    
    cycleType = determineHeatPumpType();
  }
  else if (netWork < -0.001) {
    engineType = "engine";
    var CarnotEfficiency = 1 - minTemp/maxTemp;
    efficiencyString = "Cycle Efficiency: " + efficiency.toFixed(4) + "<br>Carnot Efficiency: " + CarnotEfficiency.toFixed(4);
    /*scaleHeatOutArrow(1 - Math.abs(efficiency)*66);
    scaleHeatInArrow(66);
    scaleWorkArrow(Math.abs(efficiency) * 66);*/
    scaleArrows(heatIn, heatOut, netWork);
    $("#workArrow").attr("src", "workOutArrow.png");
    heatSourceTemp = maxTemp;
    heatSinkTemp = minTemp;
    
    cycleType = determineEngineType();
  }
  else {
    $("#cycleInfo").html($("#cycleInfo").val() + "You've created an engine with a net work of 0! Your engine does nothing.\n");
    return;
  }
  
  $("#heatInLabel").html(toKiloJoules(heatIn).toFixed(1) + " kJ/mol");
  $("#heatOutLabel").html(toKiloJoules(heatOut).toFixed(1) + " kJ/mol");
  $("#netWorkLabel").html(toKiloJoules(netWork).toFixed(1) + " kJ/mol");
  $("#heatSourceLabel").html(heatSourceTemp.toFixed(1) + " K");
  $("#heatSinkLabel").html(heatSinkTemp.toFixed(1) + " K");
  if (cycleType=="other") {
    $("#cycleInfo").html($("#cycleInfo").val() + "You've created a new " + engineType + "!<br>Net work = " + toKiloJoules(netWork).toFixed(1) + " kJ<br>" + efficiencyString);
  }
  else {
    if(engineType=="heat pump") {
      engineType = "a heat pump";
    }
    else {
      engineType = "an engine";
    }
      
    $("#cycleInfo").html($("#cycleInfo").val() + "You've created " + engineType + " running on the " + cycleType + " cycle!<br>" + efficiencyString);
  }
}

function determineHeatPumpType() {
  if (savedSteps.length == 4) {
    if (savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isothermal" && savedSteps[2]["stepType"] == "Adiabatic" &&
        savedSteps[3]["stepType"] == "Isothermal") {
      return "Carnot";
    }
    else if (savedSteps[0]["stepType"] == "Isothermal" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isothermal" &&
        savedSteps[3]["stepType"] == "Adiabatic") {
      return "Carnot";
    }
  }

  return "other";
}

function determineEngineType() {
  //alert("determineEngineType");
  if(savedSteps.length == 4) {
    
    // Check for Carnot cycle
    if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isothermal" && savedSteps[2]["stepType"] == "Adiabatic" &&
          savedSteps[3]["stepType"] == "Isothermal") {
      return "Carnot";
    }
    else if(savedSteps[0]["stepType"] == "Isothermal" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isothermal" &&
          savedSteps[3]["stepType"] == "Adiabatic") {
      return "Carnot";
    }
    
    // Check for Otto cyle
    else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isochoric" && savedSteps[2]["stepType"] == "Adiabatic" &&
          savedSteps[3]["stepType"] == "Isochoric") {
      return "Otto";
    }
    else if(savedSteps[0]["stepType"] == "Isochoric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isochoric" &&
          savedSteps[3]["stepType"] == "Adiabatic") {
      return "Otto";
    }
    
    // Check for Rankine cycle
    else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isobaric" && savedSteps[2]["stepType"] == "Adiabatic" &&
          savedSteps[3]["stepType"] == "Isobaric") {
      return "Rankine";
    }
    else if(savedSteps[0]["stepType"] == "Isobaric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isobaric" &&
          savedSteps[3]["stepType"] == "Adiabatic") {
      return "Rankine";
    }
    
    // Check for Diesel cycle
    else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isobaric" && savedSteps[2]["stepType"] == "Adiabatic" &&
          savedSteps[3]["stepType"] == "Isochoric") {
      return "Diesel";
    }
    else if(savedSteps[0]["stepType"] == "Isobaric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isochoric" &&
          savedSteps[3]["stepType"] == "Adiabatic") {
      return "Diesel";
    }
    else if(savedSteps[0]["stepType"] == "Adiabatic" && savedSteps[1]["stepType"] == "Isochoric" && savedSteps[2]["stepType"] == "Adiabatic" &&
          savedSteps[3]["stepType"] == "Isobaric") {
      return "Diesel";
    }
    else if(savedSteps[0]["stepType"] == "Isochoric" && savedSteps[1]["stepType"] == "Adiabatic" && savedSteps[2]["stepType"] == "Isobaric" &&
          savedSteps[3]["stepType"] == "Adiabatic") {
      return "Diesel";
    }
    
    // Check for Stirling cycle
    else if(savedSteps[0]["stepType"] == "Isothermal" && savedSteps[1]["stepType"] == "Isochoric" && savedSteps[2]["stepType"] == "Isothermal" &&
          savedSteps[3]["stepType"] == "Isochoric") {
      return "Stirling";
    }
    else if(savedSteps[0]["stepType"] == "Isochoric" && savedSteps[1]["stepType"] == "Isothermal" && savedSteps[2]["stepType"] == "Isochoric" &&
          savedSteps[3]["stepType"] == "Isothermal") {
      return "Stirling";
    }
  }
  
  return "other";
}

/*
*************************************************************************************************************************
*                                             Conversions and Calculations                                              *
*************************************************************************************************************************
*/

function scaleArrows(heatIn, heatOut, netWork) {
  var mean = (Math.abs(heatIn) + Math.abs(heatOut) + Math.abs(netWork)) / 3;
  var stdDev = Math.sqrt((Math.pow((heatIn - mean), 2) + Math.pow((heatOut - mean), 2) + Math.pow((netWork - mean), 2)) / 3);
  var z_heatIn = Math.abs(Math.abs(heatIn) - mean) / (2*stdDev) + 0.5;
  var z_heatOut = Math.abs(Math.abs(heatOut) - mean) / (2*stdDev) + 0.5;
  var z_netWork = Math.abs(Math.abs(netWork) - mean) / (2*stdDev) + 0.5;
  
  scaleHeatInArrow(z_heatIn * 100);
  scaleHeatOutArrow(z_heatOut * 100);
  scaleWorkArrow(z_netWork * 100);
}

function scaleHeatInArrow(percent) {
  var newWidth = percent / 100 * ARROW_MAX_WIDTH;
  newWidth = Math.round(newWidth);
  $("#heatInArrow").css({height:"31px", width:(newWidth+"px")});
  
  var difference = ARROW_MAX_WIDTH - newWidth;
  var leftCoord = Math.round(500 + (difference / 2));
  $("#heatInArrow").css("left", leftCoord + "px");
}

function scaleHeatOutArrow(percent) {
  var newWidth = percent / 100 * ARROW_MAX_WIDTH;
  newWidth = Math.round(newWidth);
  $("#heatOutArrow").css({height:"31px", width:(newWidth+"px")});
  
  var difference = ARROW_MAX_WIDTH - newWidth;
  var leftCoord = Math.round(500 + (difference / 2));
  $("#heatOutArrow").css("left", leftCoord + "px");
}

function scaleWorkArrow(percent) {
  var newWidth = percent / 100 * ARROW_MAX_WIDTH;
  newWidth = Math.round(newWidth);
  $("#workArrow").css({height:(newWidth+"px"), width:"31px"});
  
  var difference = ARROW_MAX_WIDTH - newWidth;
  var topCoord = Math.round(90 + (difference / 2));
  $("#workArrow").css("top", topCoord + "px");
}

function pistonPosToVolume(pistonPos) {
  return pistonPos * CrossSection;
}

function volumeToPistonPos(vol) {
  return vol / CrossSection;
}

function pistonPosToPixels(pos) {
  var pixels = 200 - (2 * pos);
  // truncate decimal places because not all browsers can process a fractional value for number of pixels
  pixels = Math.floor(pixels);
  pixels += "px";
  return pixels;
}

function pixelsToPistonPos(pixels) {
  
  // Ensure Javascript sees pixels as a string; otherwise the code to remove "px" will break
  pixels = pixels + "";
  
  // Remove "px" from the end of the "pixels" value in case "pixels" contains a raw CSS value, to ensure it contains just a number
  var ind = pixels.indexOf('p');
  if(ind > -1)
    pixels = pixels.substring(0, ind);
    
  return (200 - pixels) / 2;
}

/*
 * Converts energy values, like work and heat, from our units of (cm^3 * bar) to kJ
 * The conversion is the following:
 *
 * (1cm)^3 * (1 bar) = ( (1/100) m)^3 * (100,000 Pa)
 *           = (1/10) (m^3 * Pa)
 *           = (1/10) J
 *
 * So 10 (cm^3 * bar) = 1 J
 */
function toKiloJoules(energy) {
  return 10*energy/1000;
}
