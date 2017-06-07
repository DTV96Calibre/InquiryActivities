/* File: snowMelt.js
 * Dependencies: IceCube.js, Cup.js, Experiment.js
 *
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/******************* Constants **********************/

var ICE_FREEZE_TEMP_K = 273.15; // Temperature of ice at freezing point in Kelvin
var ICE_DENSITY = 917; // Density of ice in kg/m^3
var HEAT_CAPACITY_WATER = 4.184; /* Joules of heat for the temperature of one
  gram of water to increase 1 degrees Celcius.*/
var DELTA_H_FUS_WATER = 33.55; // (Latent) heat of fusion of water in joules per gram.
var H = 6.626070040e-34; // Planck's constant

var MAX_DIVISIONS = 5; // Maximum number of times user can break the ice block
var BASE_WIDTH_SCALING = 12; // Amount to divide windowWidth by to get size of ice block
var BROKEN_ICE_DIV_ID = "brokenIceCanvas-holder"; // For placing p5 canvases
var UNBROKEN_ICE_DIV_ID = "unbrokenIceCanvas-holder";
var FRAME_RATE = 60; // Frames per second

/**************** Global variables ******************/

var iceCanvas;
var baseWidth; // Number of pixels along one edge of an unbroken ice block
var ctx;
var hasChanged; // Cuts down on calculations inside the draw() function
var mouseIsPressed;

// Pieces of the experiment
var unbrokenIce;
var brokenIce;
var unbrokenExp;
var brokenExp;

/********** Configuration data for chart ************/

var chartData = {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Broken Ice',
        data: [{x:0, y:1}, {x:1, y:2}]
      },
      {
        label: 'Unbroken Ice',
        backgroundColor: "rgba(75, 192, 192, 0.4)",
        data: [{x:0, y:2}, {x:1, y:0}]
      }
    ]
  },

  options: {
    pan: {
      enabled: true,
      mode: 'xy'
      //rangeMin:{x: null, y: null},
      //rangeMax:{x: null, y: null}
    },

    zoom: {
      enabled: true,
      drag: false,
      mode: 'y'
      //rangeMin:{x: null, y: null},
      //rangeMax:{x: null, y: null}
    },

    responsive: true
  }
};

/***************** Experiment setup *****************/

function initializeChart() {
  ctx = document.getElementById("myChart").getContext("2d");
  myLineChart = new Chart(ctx, chartData);
}

function setup() {
  // Lock pixel density to avoid cropping when user zooms in on browser
  pixelDensity(1);

  mouseIsPressed = false;
  
  baseWidth = windowWidth / BASE_WIDTH_SCALING;

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
  windowResized();

  hasChanged = true; // Force the draw function to execute
}

function draw() {
  updateCursor();

  // Don't re-render/recalculate drawings if they haven't been updated
  if (!hasChanged) {
    return;
  }

  // Clear the canvas
  background(255, 255, 255);

  drawTitle();

  //myLineChart.data.datasets[0].data[0] += 1;
  //myLineChart.update();

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
    text("Melting Ice Simulation", fontPosX * 1.2, fontPosY * 1.45);
  }
  else {
    // Standard/desktop
    var fontSize = windowWidth / 2 / 32;
    textSize(fontSize);

    var fontPosX = windowWidth / 10;
    var fontPosY = windowHeight / 24;

    fill(32, 32, 32); // grey
    text("Rate vs. Amount: ", fontPosX, fontPosY);
    fill(0, 102, 153); // blue
    text("Melting Ice Simulation", fontPosX * 2.25, fontPosY);
  }
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
  if (brokenExp.cursorIsOverIce() && brokenExp.ice.canBeBrokenFurther()) {
    brokenExp.ice.setDivisions(brokenExp.ice.numDivisions + 1);
    hasChanged = true;
  }
}

/************ Math and science functions ************/

/*
 * Finds the melting time for the cubes in each cup to set up the animation 
 * fade time.
 * Calculates heat transfer due to water making contact with ice surface.
 * @param aOne: The area of one ice cube.
 * @param n: number of ice cubes. Units in mm^2. // TODO: ?
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
function findM_melted(q, tempWater, mWaterOld) {
  return q / DELTA_H_FUS_WATER;
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
 * @return: Temperature of water after mixing. (Kelvin)
 */
function findT_waterNewMixing(mWater, tempWater, mMelted) {
  return ((mWaterOld * tempWater) + (mMelted * ICE_FREEZE_TEMP_K)) / (mWater * mMelted);
}

/**** Code to interface with HTML elements (e.g. bootstrap btns) ****/

// jQuery code to register button clicks and link them to appropriate JS functions
$(document).ready(function(){
  $("#startBtn").click(function () {
    startSimulation();
    // $("#startBtn").toggleClass("disabled");
    $('#startBtn').attr('disabled','disabled');
  });

  $("#resetBtn").click(function () {
    resetSimulation();
    $("#startBtn").removeAttr('disabled');
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
  // Calling the p5 setup function will reset all onscreen elements
  setup();
}
