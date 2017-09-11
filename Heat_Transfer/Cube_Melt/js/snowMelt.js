/* File: snowMelt.js
 * Dependencies: IceCube.js, Cup.js, Experiment.js
 *
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/******************* Constants **********************/

/* Mathematical constants */
var ROOM_TEMPERATURE = 295; // Room temperature in Kelvin
var ICE_FREEZE_TEMP_K = 273.15; // Temperature of ice at freezing point in Kelvin
var ICE_DENSITY = 0.917; // Density of ice in g/cm^3

var MASS_CUP_OF_WATER = 500; // Mass in grams of a "cup" of water. NOTE: Not actual cup unit
var STARTING_ICE_MASS = 100; // Starting mass of either ice cube in grams

var HEAT_CAPACITY_WATER = 4.205; /* Joules of heat for the temperature of one
  gram of water to increase 1 degrees Celcius.*/

var DELTA_H_FUS_WATER = 333.86; // (Latent) heat of fusion of water in joules per gram.
var H = 0.01; // Free water convection (Wcm^-2K^-1) // Heat transfer constant

/* Other constants */
var MAX_DIVISIONS = 5; // Maximum number of times user can break the ice block
var BASE_WIDTH_SCALING = 11.5; // Amount to divide windowWidth by to get size of ice block
var BROKEN_ICE_DIV_ID = "brokenIceCanvas-holder"; // For placing p5 canvases
var UNBROKEN_ICE_DIV_ID = "unbrokenIceCanvas-holder";
var FRAME_RATE = 60; // Frames per second. The rate at which the draw function is called.
var MAX_RUN_TIME = 10000; // This shouldn't be reached unless STARTING_ICE_MASS is increased from 500
var TIME_SCALE_FACTOR = 1000; // Scales simulation rate (we don't want to wait 20 minutes for ice to melt)
var VALUE_PRECISION = 3; // Number of decimals to round to when displaying values under chart
var SECONDS_IN_MINUTES = 60;

/* A collection of HTML div IDs for editable text values in the simulation info box. */
var UNBROKEN_NUM_CUBES_DIV = 'unbroken-num-cubes';
var BROKEN_NUM_CUBES_DIV = "broken-num-cubes";
var UNBROKEN_MASS_DIV = "unbroken-mass";
var BROKEN_MASS_DIV = "broken-mass";
var UNBROKEN_SURF_AREA_DIV = "unbroken-surf-area";
var BROKEN_SURF_AREA_DIV = "broken-surf-area";

/* RGB color values for distinguishing unbroken & broken ice on the chart */
var UNBROKEN_ICE_CHART_COLOR = '127, 205, 187';
var BROKEN_ICE_CHART_COLOR = '44, 127, 184';

/**************** Global variables ******************/

var iceCanvas;
var baseWidth; // Number of pixels along one edge of an unbroken ice block
var ctx;
var hasChanged; // Cuts down on calculations inside the draw() function
var mouseIsPressed;
var simulationTime;
var simulationPaused;
var iceBroken = false;
var tooltipOpacity = 1;

// Pieces of the experiment
var unbrokenIce;
var brokenIce;
var unbrokenExp;
var brokenExp;

// For enabling web transitions on pop-up help tooltip
var helpBoxPopUp;
var helpBtn;
var infoBoxPopUp;
var infoBtn;
var helpBtnActive = false;
var infoBtnActive = false;

/********** Configuration data for chart ************/

var chartData = {
  type: 'scatter', // line chart doesn't behave as expected
  data: {
    datasets: [
      {
        label: 'Unbroken Ice',
        fill: false,
        cubicInterpolationMode: 'monotone',
        backgroundColor: "rgba(" + UNBROKEN_ICE_CHART_COLOR + ", 0.4)",
        data: []
      },
      {
        label: 'Broken Ice',
        fill: false,
        cubicInterpolationMode: 'monotone',
        backgroundColor: "rgba(" + BROKEN_ICE_CHART_COLOR + ", 0.4)",
        data: []
      }
    ]
  },

  options: {
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Temperature (K)',
          fontSize: 15
        },
        ticks: {
          //suggestedMin: ICE_FREEZE_TEMP_K
        }
      }],

      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Time (Minutes)',
          fontSize: 15
        }
      }]
    },

    pan: {
      enabled: true,
      mode: 'xy',
      rangeMin:{x: 0, y: 270},
      rangeMax:{x: 180, y: 300}
    },

    zoom: {
      enabled: true,
      drag: false,
      mode: 'y',
      rangeMin:{x:   0, y: 270},
      rangeMax:{x: 180, y: 300}
    },

    legend: {
      display: true,
      position: 'bottom',
      padding: 100
    },

    responsive: true,
    maintainAspectRatio: false
  },
};

/***************** Experiment setup *****************/

function initializeChart() {
  if (typeof myLineChart !== 'undefined') {
    myLineChart.destroy();
  }

  ctx = document.getElementById("myChart").getContext("2d");
  myLineChart = new Chart(ctx, chartData);
  myLineChart.data.datasets[0].data = []; // Manually set data to nothing
  myLineChart.data.datasets[1].data = [];
  myLineChart.update();
}

function setup() {
  // Lock pixel density to avoid cropping when user zooms in on browser
  pixelDensity(1);

  mouseIsPressed = false;
  baseWidth = windowWidth / BASE_WIDTH_SCALING;
  simulationPaused = false;

  // Create both ice cubes and initialize them
  brokenIce = new IceCube();
  unbrokenIce = new IceCube();

  // Hook up the ice cubes to their respective experiments
  unbrokenExp = new Experiment('unbroken', unbrokenIce);
  brokenExp = new Experiment('broken', brokenIce);
  unbrokenExp.init();
  brokenExp.init();
  iceCubeCanvasSetup();

  initializeChart();
  simulationTime = 0;
  windowResized();

  hasChanged = true; // Force the draw function to execute
}

function draw() {
  updateCursor();

  // Don't do anything aside from update the cursor while simulation is paused
  if (simulationPaused) {
    return;
  }

  stepSimulationHelper();

  // Don't re-render/recalculate drawings if they haven't been updated
  if (!hasChanged) {
    return;
  }

  // Clear the canvas
  background(255, 255, 255);

  drawTitle();

  if (tooltipOpacity > 0) {
    drawBreakableIceTooltip();
  }

  unbrokenExp.display();
  brokenExp.display();
}

/*
 * Writes the title of the page towards the top of the canvas.
 */
function drawTitle() {
  // Set exact font to avoid inconsistencies between browsers
  textFont("Helvetica");

  /* When the window is longer than it is wide (e.g. mobile), draw the text
   * on top of each other instead of side-by-side for readability
   */
  var windowRatio = windowWidth / windowHeight;

  if (windowRatio < 1) {
    // Mobile layout
    var fontSize = windowWidth / 2 / 24;
    textSize(fontSize);

    var fontPosX = windowWidth / 8;
    var fontPosY = windowHeight / 24;

    fill(32, 32, 32); // grey
    text("Rate vs. Amount: ", fontPosX * 1.4, fontPosY);
    fill(0, 102, 153); // blue
    text("Cube Melt Simulation", fontPosX * 1.2, fontPosY * 1.45);
  }
  else {
    // Standard/desktop
    var fontSize = windowWidth / 2 / 32;
    textSize(fontSize);

    var fontPosX = windowWidth / 9;
    var fontPosY = windowHeight / 24;

    fill(32, 32, 32); // grey
    text("Rate vs. Amount: ", fontPosX, fontPosY);
    fill(0, 102, 153); // blue
    text("Cube Melt Simulation", fontPosX * 2.12, fontPosY);
  }
}

/*
 * Writes the tooltip informing the user that they can break the ice cube on 
 * the right.
 */
function drawBreakableIceTooltip() {
  // Make text fade away by reducing the opacity once user has broken ice
  if (iceBroken) {
    tooltipOpacity -= 0.1;
  }

  textFont("Helvetica");
  var fontSize = windowWidth / 100;
  textSize(fontSize);
  var fontPosX = brokenIce.xOffset - baseWidth / 2.2;
  var fontPosY = brokenIce.yOffset - baseWidth / 1.4;
  fill("rgba(32, 32, 32," + tooltipOpacity + ")"); // grey
  text("Click to break ice!", fontPosX, fontPosY);
}

/*
 * Built-in p5 function; called whenever the browser is resized.
 */
function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight);

  // Update variables that scale with screen size
  baseWidth = windowWidth / BASE_WIDTH_SCALING;
  unbrokenExp.resize();
  brokenExp.resize();

  hasChanged = true;
}

/*********** User interaction functions *************/

/*
 * Controls the appearance of the cursor, which looks like a hammer when hovering
 * over the ice cubes and looks like a red X when the ice can't be broken further.
 */
function updateCursor() {
  // Ice has already fallen and can't be broken now
  if (unbrokenExp.ice.hasDropped) {
    cursor(ARROW);
  }

  // Ice hasn't fallen yet; mouse button isn't pressed
  else if (!mouseIsPressed) {
    if (cursorOverIceCubes()) {
      cursor('hammer_hover.cur');
    } else {
      cursor(ARROW);
    }
  }

  // Mouse is pressed
  else {
    if (cursorOverIceCubes()) {
      // If clicking on a breakable ice cube, show the hammer cursor
      if (brokenExp.cursorIsOverIce() && brokenExp.ice.canBeBrokenFurther()) {
        cursor('hammer_click.cur');
      }
      // Else, show a red X because the user can't break this ice
      else {
        cursor('red_x.cur', -10, -10);
      }
    }
    else {
      cursor(ARROW);
    }
  }
}

/*
 * Built-in p5 function; called whenever the user clicks the mouse.
 */
function mousePressed() {
  mouseIsPressed = true;
  swingHammer();
}

/*
 * Built-in p5 function; called whenever the user releases the mouse.
 */
function mouseReleased() {
  mouseIsPressed = false;
}

/*
 * Attempts to break the ice further. Does nothing if MAX_DIVISIONS is reached.
 */
function swingHammer() {
  if (brokenExp.cursorIsOverIce() && brokenExp.ice.canBeBrokenFurther() && !simulationPaused) {
    brokenExp.ice.setDivisions(brokenExp.ice.numDivisions + 1);
    hasChanged = true;
    iceBroken = true;
  }
}

/************ Math and science functions ************/

/*
 * Advances the simulation by updating the mathematical calculations. All functions of
 * this nature should be put here in order to run once per draw() loop.
 */
function stepSimulationHelper() {
  if (unbrokenExp.ice.hasStartedMelting && simulationTime < MAX_RUN_TIME) {
    simulationTime += TIME_SCALE_FACTOR * 1 / FRAME_RATE;

    /* Force graph to continue plotting until both simulations have finished.
     * The unbroken exp will always be the longer of the two, so use that as
     * a baseline.
     */
    if (!unbrokenExp.isFinished()) {
      graphTemperature(brokenExp.cup.liquidTemp, brokenExp.type);
      graphTemperature(unbrokenExp.cup.liquidTemp, unbrokenExp.type);
    }

    // Continue with the IceCubes' respective simulations, if applicable
    if (!brokenExp.isFinished()) {
      stepSimulation(brokenExp);
    }
    if (!unbrokenExp.isFinished()) {
      stepSimulation(unbrokenExp);
    }

    myLineChart.resetZoom();
    myLineChart.update(0, true); // Redraw chart with new data points
  }

  unbrokenExp.updateCalculations();
  brokenExp.updateCalculations();
}

/* Calculates the changes in the simulation over dt, the change in time over
 * a loop of the draw function which is called 60 times a second.
 * @param exp: An Experiment object
 */
function stepSimulation(exp) {
  // Consider the components from the given Experiment obj.
  var ice = exp.ice;
  var cup = exp.cup;

  var dt = TIME_SCALE_FACTOR * 1 / FRAME_RATE; // inverse of the expected framerate.
  var n = ice.numPieces; // The number of pieces in the whole ice
  var aOne = ice.calculateAreaOfPieceFromMass();
  var q = findQ(aOne, n, cup.liquidTemp, dt);

  if (q == 0) {
    return true;
  }

  // The mass of the liquid created from melting ice
  var mMelted = Math.max(0, Math.min(findM_melted(q), ice.iceMass));

  cup.liquidTemp = Math.max(ICE_FREEZE_TEMP_K, findT_waterNewMelting(q, cup.liquidTemp,
   cup.liquidMass));
  cup.liquidTemp = Math.max(ICE_FREEZE_TEMP_K, findT_waterNewMixing(cup.liquidMass,
    cup.liquidTemp, mMelted));
  cup.liquidMass += mMelted; // Add new liquid to water
  ice.iceMass -= mMelted;   // Remove melted mass from ice

  return false;
}

/* Calculates heat transfer due to water making contact with ice surface.
 * @param aOne: The area of one ice cube. Units in mm^2. TODO: This should be cm^2?
 * @param n: number of ice cubes.
 * @param tempWater: The current temperature of the water.
 * @param dt: change in time. Units in seconds.
 * @return The heat exchanged.
 */
function findQ(aOne, n, tempWater, dt) {
  return dt * H * (aOne * n) * (ICE_FREEZE_TEMP_K - tempWater);
}

/*
 * Calculates the mass of ice melted and converted to liquid water.
 * @param q: The heat exchanged resulting in the ice melting.
 * @return Mass of the melted ice.
 */
function findM_melted(q) {
  return -1 * q / DELTA_H_FUS_WATER;
}

/*
 * Calculates the new temperature of the water after the ice melts a bit.
 * @param q: The heat exchanged resulting in the ice melting.
 * @param tempWater: The current temperature of the water.
 * @param mWaterOld: The current mass of the water.
 * @return The new temperature of the water. (Kelvin)
 */
function findT_waterNewMelting(q, tempWater, mWaterOld) {
  return q / (HEAT_CAPACITY_WATER * mWaterOld) + tempWater;
}

/*
 * Calculates the new temperature of the water after mixing in the melted ice.
 * @param mWater: The current mass of the water.
 * @param tempWater: The current temperature of the water (after previous calculation steps)
 * @param mMelted: The mass of melted ice.
 * @return Temperature of water after mixing. (Kelvin)
 */
function findT_waterNewMixing(mWater, tempWater, mMelted) {
  return ((mWater * tempWater) + (mMelted * ICE_FREEZE_TEMP_K)) / (mWater + mMelted);
}

/*
 * Rounds a value to the given number of places.
 */
Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places)  + "e-" + places);
}

/*************** Chart Functionality ****************/

/* Graphs a temperature datapoint. Assumes constant period (1/FRAME_RATE) between adjacent points.
 * Assumes points aren't being skipped!
 * @param temperature: The new temperature value to be graphed
 * @param name: The identifying string for a dataset to be appended to (found in IceCube.name)
 */
function graphTemperature(temperature, name) {
  temperature = temperature.toFixed(VALUE_PRECISION); // Reduce decimal places displayed
  var period = TIME_SCALE_FACTOR * 1 / FRAME_RATE;
  var dataSetIndex; // Index for referencing a dataset
  if (name == "broken") {
    dataSetIndex = 1;
  } else if (name == "unbroken") {
    dataSetIndex = 0;
  } else {
    return; // Stop before attempting insertion of data point
  }
  //var i = chartData.data.datasets[dataSetIndex].data.length-1; // index for the last element in data
  // var prevTime = chartData.data.datasets[dataSetIndex].data[i].x;
  // print("Previous time:", prevTime);
  // var currTime = prevTime + period; // TODO: This should be reworked so that the first value edgecase is accounted for
  // chartData.data.datasets[dataSetIndex].data.push({x:currTime, y:temperature});
  var lowPrecisionTime = (simulationTime / SECONDS_IN_MINUTES).toFixed(VALUE_PRECISION);
  chartData.data.datasets[dataSetIndex].data.push({x:lowPrecisionTime, y:temperature});
  return;
}

/**** Code to interface with HTML elements (e.g. bootstrap btns) ****/

// jQuery code to register button clicks and link them to appropriate JS functions
$(document).ready(function(){
  // For enabling web transitions on pop-up help tooltip
  helpBoxPopUp = document.getElementById('help-box');
  helpBtn = document.getElementById('helpBtn');
  helpBtn.addEventListener("click", function(){
    toggleHelp();
  }, false);

  // For enabling web transitions on pop-up info tooltip
  infoBoxPopUp = document.getElementById('info-box');
  infoBtn = document.getElementById('infoBtn');
  infoBtn.addEventListener("click", function(){
    toggleInfo();
  }, false);

  // Prevent user from accidentally highlighting chart while clicking ice
  document.onselectstart = function(){
    return false;
  }

  // Button interactions
  $("#startBtn").click(function () {
    startSimulation();
    $('#startBtn').attr('disabled','disabled');
  });

  $("#resetBtn").click(function () {
    resetSimulation();
    $("#startBtn").removeAttr('disabled');
  });

  $("#pauseBtn").click(function () {
    pauseSimulation();
  });
});

/*
 * Called when the user presses the green 'Start' button. Begins the simulation
 * by dropping the ice cubes and beginning to run through the calculations.
 */
function startSimulation() {
  // Don't allow the simulation to be started a second time
  if (!brokenExp.ice.hasDropped) {
    brokenExp.beginDroppingIce();
    unbrokenExp.beginDroppingIce();
  }
}

/*
 * Called when the user presses the red 'Restart' button. Resets the states of both
 * ice cubes as well as the chart.
 */
function resetSimulation() {
  // Resetting the simulation forces the pause button to reset as well
  if (simulationPaused) {
    pauseSimulation();
  }

  // Calling the p5 setup function will reset all onscreen elements
  setup();
}

/*
 * Called when the user presses the pause button. If the simulation is live, pauses
 * everything (including animations and calculations). Otherwise, resumes the
 * simulation.
 */
function pauseSimulation() {
  if (!simulationPaused) {
    $("#pauseBtn").find(".glyphicon").removeClass('glyphicon-pause');
    $("#pauseBtn").find(".glyphicon").addClass('glyphicon-play');
    // The start button is also disabled in pause mode
    $('#startBtn').attr('disabled','disabled');
  }
  else {
    $("#pauseBtn").find(".glyphicon").removeClass('glyphicon-play');
    $("#pauseBtn").find(".glyphicon").addClass('glyphicon-pause');
    if (!brokenExp.ice.hasDropped) {
      $("#startBtn").removeAttr('disabled');
    }
  }
  simulationPaused = !simulationPaused;
}

/*
 * Called when the user presses the help button.
 */
function toggleHelp() {
  if (infoBtnActive) {
    // Make info box disappear to make room for help box
    infoBoxPopUp.classList.toggle("appear");
    infoBtnActive = false;
  }
  helpBoxPopUp.classList.toggle("appear");
  helpBtnActive = !helpBtnActive;
}

/*
 * Called when the user presses the info button.
 */
function toggleInfo() {
  if (helpBtnActive) {
    // Make help box disappear to make room for info box
    helpBoxPopUp.classList.toggle("appear");
    helpBtnActive = false;
  }
  infoBoxPopUp.classList.toggle("appear");
  infoBtnActive = !infoBtnActive;
}
