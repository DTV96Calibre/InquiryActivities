/* File: snowMelt.js
 * Dependencies: IceCube.js
 *
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/******************* Constants **********************/

var ROOM_TEMPERATURE = 295; // Room temperature in Kelvin
var ICE_FREEZE_TEMP_K = 273.15; // Temperature of ice at freezing point in Kelvin
var ICE_DENSITY = 0.917; // Density of ice in g/cm^3
//var WATER_DENSITY = ;
//var CUP_VOLUME = ;
var MASS_CUP_OF_WATER = 500; // Mass in grams of a "cup" of water. NOTE: Not actual cup unit

var HEAT_CAPACITY_WATER = 4.205; /* Joules of heat for the temperature of one
  gram of water to increase 1 degrees Celcius.*/
var DELTA_H_FUS_WATER = 333.86; // (Latent) heat of fusion of water in joules per gram.
var H = 100; // Free water convection (Wm^-2K^-1) // Heat transfer constant

var MAX_DIVISIONS = 5; // Maximum number of times user can break the ice block
var BASE_WIDTH_SCALING = 9; // Amount to divide windowWidth by to get size of ice block
var BROKEN_ICE_DIV_ID = "brokenIceCanvas-holder"; // For placing p5 canvases
var UNBROKEN_ICE_DIV_ID = "unbrokenIceCanvas-holder";

var FPS = 60; // Frames per second. The rate at which the draw function is called.

/**************** Global variables ******************/

var iceCanvas;
var baseWidth = 100; // Number of pixels along one edge of an unbroken ice block
var ctx;
var hasChanged; // Cuts down on calculations inside the draw() function
var mouseIsPressed;

// Pieces of the experiment
var unbrokenIce;
var brokenIce;
var unbrokenIceCup;
var brokenIceCup;

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

  // Create both ice visualizations and initialize them
  brokenIce = new IceCube();
  unbrokenIce = new IceCube();
  iceCubeSetup();

  // Create both cups and initialize them
  unbrokenIceCup = new Cup();
  brokenIceCup = new Cup();
  cupSetup();

  initializeChart();
  windowResized();

  hasChanged = true; // Force the draw function to execute

  //noLoop();
}

function draw() {
  updateCursor();

  // Don't re-render/recalculate drawings if they haven't been updated
  if (!hasChanged) {
    return;
  }

  // Clear the canvas
  background(255, 255, 255);

  //myLineChart.data.datasets[0].data[0] += 1;
  //myLineChart.update();

  // Draw the ice blocks
  brokenIce.display();
  unbrokenIce.display();

  // Draw the cups
  unbrokenIceCup.display();
  brokenIceCup.display();

  // Paint the off-screen buffers onto the main canvas
  // image(unbrokenIceCup.buffer, 0, windowHeight / 2);
  // image(brokenIceCup.buffer, windowWidth / 4, windowHeight / 2);

  hasChanged = false;
  stepSimulation(brokenIce);
}

/*
 * Built-in p5 function; called whenever the browser is resized.
 */
function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight);

  hasChanged = true;

  // Update variables that scale with screen size
  baseWidth = windowWidth / BASE_WIDTH_SCALING;
  unbrokenIce.xOffset = windowWidth / 8;
  brokenIce.xOffset = windowWidth / 2 - windowWidth / 8;
  brokenIceCup.xOffset = windowWidth / 4;

  unbrokenIce.resize();
  brokenIce.resize();

  unbrokenIceCup.resize();
  brokenIceCup.resize();
}

/*********** User interaction functions *************/

/*
 * Controls the appearance of the cursor, which looks like a hammer when hovering
 * over the ice cubes and looks like a red X when the ice can't be broken further.
 */
function updateCursor() {
  if (!mouseIsPressed) {
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
      if (brokenIce.cursorIsOver() && brokenIce.canBeBrokenFurther()) {
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
  if (brokenIce.cursorIsOver() && brokenIce.canBeBrokenFurther()) {
    print("Breaking ice");
    brokenIce.numDivisions += 1;
    brokenIce.setDivisions(brokenIce.numDivisions);
    hasChanged = true;
  }

  else {
    print("The ice couldn't be broken further");
  }
}

/************ Math and science functions ************/

/* Calculates the changes in the simulation over dt, the change in time over
 * a loop of the draw function which is called 60 times a second.
 * @param exp: An IceCube object that tracks information about an experiment
 */
function stepSimulation(exp) {
  print("exp.name:", exp.name);
  print("exp.iceMass:", exp.iceMass);
  var dt = 1/FPS; // inverse of the expected framerate.
  print("period is:", dt);
  var n = pow(pow(2, exp.numDivisions), 3); // The number of pieces in the whole ice
  print("n is:", n);
  var aOne = findAreaOfOneIcecubeFromMass(exp.iceMass, n);
  print("aOne is:", aOne);
  print("tempWater is:", exp.waterTemp);
  var q = findQ(aOne, n, exp.waterTemp, dt);
  print("q is:", q);
  var mMelted = findM_melted(q); // The mass of the liquid created from melting ice.
  exp.waterTemp = findT_waterNewMelting(exp.waterMass, exp.waterTemp, mMelted);
  print("Melted, waterTemp is:", exp.waterTemp);
  exp.waterTemp = findT_waterNewMixing(exp.waterMass, exp.waterTemp, mMelted);
  exp.waterMass += mMelted; // Add new liquid to water
  exp.iceMass -= mMelted;   // Remove melted mass from ice
  exp.edgeLength = findEdgeLength(aOne); // Store piece edgelength for drawing
  graphTemperature(exp.waterTemp, exp.name); // TODO: This function should be called in draw
}

/* TODO: This function is not in use, remove later
 *
 */
function findAreaOfOneIcecubeFromLength(initLength, divisions) {
  return pow((initLength/pow(2, divisions)), 3);
}

/* Determines the total area of ice divided into n parts.
 * @param iceMass: the mass of the whole
 * @param n: the number of parts in the whole
 */
function findAreaOfOneIcecubeFromMass(iceMass, n) {
  return 6*pow(iceMass/(n*ICE_DENSITY),2/3);
}

/* Shortcut function that calculates the area of an icecube given it's mass.
 * TODO: This function is not used, remove later
 * @param iceMass: the mass of the whole
 */
function findAreaFromMass(iceMass) {
  return findAreaOfOneIcecubeFromMass(iceMass, 1);
}



/*
 * Finds the melting time for the cubes in each cup to set up the animation
 * fade time.
 * Calculates heat transfer due to water making contact with ice surface.
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
 * @return Temperature of water after mixing. (Kelvin)
 */
function findT_waterNewMixing(mWater, tempWater, mMelted) {
  return ((mWater * tempWater) + (mMelted * ICE_FREEZE_TEMP_K)) / (mWater * mMelted);
}

/* Finds the length of one edge of a cube given the surface area of that cube.
 * @param surfaceArea: The surface area of a particular cube
 * @return The length of one edge of the cube
 */
function findEdgeLength(surfaceArea) {
  return sqrt(surfaceArea/6);
}

/************ Chart Functionality functions ************/

/* Graphs a temperature datapoint. Assumes constant period (1/FPS) between adjacent points.
 * Assumes points aren't being skipped!
 * @param temperature: The new temperature value to be graphed
 * @param name: The identifying string for a dataset to be appended to (found in IceCube.name)
 */
function graphTemperature(temperature, name) {
  var period = 1/FPS;
  var dataSetIndex; // The value
  if (name === "broken") {
    dataSetIndex = 0;
  } else if (name === "unbroken") {
    dataSetIndex = 1;
  } else {
    print("Tried to add data to", name, "which is not recognized by graphTemperature()");
    return // Stop before attempting insertion of data point
  }
  var i = chartData.data.datasets[dataSetIndex].data.length-1; // index for the last element in data
  var prevTime = chartData.data.datasets[dataSetIndex].data[i].x;
  chartData.data.datasets[dataSetIndex].data.push({x:prevTime + period, y:temperature});
  myLineChart.update();
  return;
}
