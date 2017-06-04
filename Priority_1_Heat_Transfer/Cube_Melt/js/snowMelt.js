/* File: snowMelt.js
 * Dependencies: IceCube.js
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
var BASE_WIDTH_SCALING = 9; // Amount to divide windowWidth by to get size of ice block
var BROKEN_ICE_DIV_ID = "brokenIceCanvas-holder"; // For placing p5 canvases
var UNBROKEN_ICE_DIV_ID = "unbrokenIceCanvas-holder";

/**************** Global variables ******************/

var iceCanvas;
var baseWidth = 100; // Number of pixels along one edge of an unbroken ice block
var holdingHammer = false;
var ctx;
var hasChanged; // Cuts down on calculations inside the draw() function

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
  
  baseWidth = windowWidth / BASE_WIDTH_SCALING;

  // Create both ice visualizations and initialize them
  brokenIce = new IceCube();
  unbrokenIce = new IceCube();
  iceCubeSetup();

  // Create both cups and initialize them
  unbrokenIceCup = new Cup();
  brokenIceCup = new Cup();
  cupSetup();

  toggleHammer();
  initializeChart();
  windowResized();

  hasChanged = true; // Force the draw function to execute

  //noLoop();
}

function draw() {
  /* Begin logic for controlling appearance of cursor */
  if (holdingHammer) {
    if (mouseIsPressed) {
      cursor('hammer_click.cur', 0, 0); // Sets cursor to hammer_click.cur
    } else {
      cursor('hammer_hover.cur', 0, 0);
    }
  } else {
    cursor(ARROW, 0, 0); // Sets cursor to default arrow
  }
  /* End logic for controlling appearance of cursor */

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
  image(unbrokenIceCup.buffer, 0, windowHeight / 2);
  image(brokenIceCup.buffer, windowWidth / 4, windowHeight / 2);

  hasChanged = false;
}

function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight);

  hasChanged = true;

  // Update variables that scale with screen size
  unbrokenIce.xOffset = windowWidth / 8;
  brokenIce.xOffset = windowWidth / 2 - windowWidth / 8;
  baseWidth = windowWidth / BASE_WIDTH_SCALING;

  unbrokenIce.resize();
  brokenIce.resize();

  unbrokenIceCup.resize();
  brokenIceCup.resize();
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


/************** Animation functions *****************/

/*
 * Toggles holding the hammer. Replaces the cursor with a hammer graphic.
 */
function toggleHammer() {
  holdingHammer = !holdingHammer;
  if (holdingHammer) {
    cursor('hammer_hover.cur', 0, 0);
  } else {
    cursor(ARROW, 0, 0);
  }
}

/*
 * Attempts to break the ice further. Does nothing if MAX_DIVISIONS is reached.
 */
function swingHammer() {
  if (brokenIce.numDivisions < MAX_DIVISIONS && cursorOverBrokenExp()) {
    print("Breaking ice");
    brokenIce.numDivisions += 1;
    breakAnimation();
    brokenIce.setDivisions(brokenIce.numDivisions);
    hasChanged = true;
  }

  else {
    print("The ice couldn't be broken further");
    noBreakAnimation();
  }
}

/*
 * Animation for the breaking of user-breakable ice block.
 */
function breakAnimation() {
  // Spawn strike sparks
  return
}

/*
 * Animation indicating that the ice couldn't be broken.
 */
function noBreakAnimation() {
  // Spawn dust/poof/smoke particles
  return
}

/*********** User interaction functions *************/

function mousePressed() {
  swingHammer();
}

/**
 * Detect whether the cursor is hovering over the breakable ice block.
 */
function cursorOverBrokenExp() {
  var halfBlockSize = brokenIce.findArrayRange() / 2;
  var xLeft = brokenIce.xOffset - halfBlockSize;
  var xRight = brokenIce.xOffset + halfBlockSize;
  var yTop = brokenIce.yOffset - halfBlockSize - 20;
  var yBottom = brokenIce.yOffset + halfBlockSize;

  return (mouseX >= xLeft && mouseX <= xRight) &&
         (mouseY >= yTop && mouseY <= yBottom);
}
