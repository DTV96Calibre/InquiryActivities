/* File: snowMelt.js
 * Dependencies: CubeMeltExp.js
 *
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/******************* Constants **********************/

var ICE_FREEZE_TEMP_K = 273.15; // Temperature of ice at freezing point in Kelvin
var ICE_DENSITY = 917; // Density of ice in kg/m^3
var MAX_DIVISIONS = 5; // Maximum number of times user can break the ice block
var BASE_WIDTH_SCALING = 9; // Amount to divide windowWidth by to get size of ice block
var BROKEN_ICE_DIV_ID = "brokenIceCanvas-holder"; // For placing p5 canvases
var UNBROKEN_ICE_DIV_ID = "unbrokenIceCanvas-holder";

var HEAT_CAPACITY_WATER = 4.184; /* Joules of heat for the temperature of one
  gram of water to increase 1 degrees Celcius.*/
var DELTA_H_FUS_WATER = 33.55; // (Latent) heat of fusion of water in joules per gram.
var H = 6.626070040e-34; // Planck's constant

/**************** Global variables ******************/

var iceCanvas;
var baseWidth = 100; // Number of pixels along one edge of an unbroken ice block
var holdingHammer = false;
var ctx;
var hasChanged; // Cuts down on calculations inside the draw() function

// Pieces of the experiment
var unbrokenExp;
var brokenExp;
var unbrokenExpBeaker;
var brokenExpBeaker;

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
  baseWidth = windowWidth / BASE_WIDTH_SCALING;

  // Create both ice visualizations and initialize them
  brokenExp = new CubeMeltExp();
  unbrokenExp = new CubeMeltExp();
  cubeMeltSetup();

  // Create both beakers and initialize them
  unbrokenExpBeaker = new Beaker();
  brokenExpBeaker = new Beaker();
  beakerSetup();

  toggleHammer();
  initializeChart();
  windowResized();

  hasChanged = true;

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
  brokenExp.display();
  unbrokenExp.display();

  // Draw the beakers
  unbrokenExpBeaker.display();
  brokenExpBeaker.display();

  // Paint the off-screen buffers onto the main canvas
  image(unbrokenExpBeaker.buffer, 0, windowHeight / 2);
  image(brokenExpBeaker.buffer, windowWidth / 4, windowHeight / 2);

  hasChanged = false;
}

function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight);

  hasChanged = true;

  // Update variables that scale with screen size
  unbrokenExp.xOffset = windowWidth / 8;
  brokenExp.xOffset = windowWidth / 2 - windowWidth / 8;
  baseWidth = windowWidth / BASE_WIDTH_SCALING;

  unbrokenExp.resize();
  brokenExp.resize();

  unbrokenExpBeaker.resize();
  brokenExpBeaker.resize();
}

/************ Math and science functions ************/

/*
 * Finds the melting time for the cubes in each beaker to set up the animation
 * fade time.
 */
function findMeltingTime() {
  simulationSetup();
  findMeltStep();
  simulationSetup();
  findMeltStep2();
  simulationSetup();
}

/*
 * Calculates heat transfer due to water making contact with ice surface.
 * @param aOne: The area of one ice cube.
 * @param n: number of ice cubes. Units in mm^2.
 * @param tempWater: The current temperature of the water.
 * @param dt: change in time. Units in seconds.
 * @return: The heat exchanged.
 */
function findQ(aOne, n, tempWater, dt) {
  return dt*H*(aOne * n) * (ICE_FREEZE_TEMP_K - tempWater);
}

/*
 * Calculates the mass of ice melted and converted to liquid water.
 * @param q: The heat exchanged resulting in the ice melting.
 * @return:
 */
function findM_melted(q, tempWater, mWaterOld) {
  return q / DELTA_H_FUS_WATER;
}

/*
 * Calculates the new temperature of the water after the ice melts a bit.
 * @param q: The heat exchanged resulting in the ice melting.
 * @param tempWater: The current temperature of the water.
 * @param mWaterOld: The current mass of the water.
 * @return: The new temperature of the water. (Kelvin)
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
  return ((mWaterOld * tempWater) + (mMelted * ICE_FREEZE_TEMP_K))/(mWater * mMelted);
}
/* Deprecated.
 * The actual simulation. Calculates temperature and plots it.
 */
function measureSimulation() {
  if (currentStep < numDataPts) {
    Qmelt = (waterT-(Cice+CtoKelvin))*h*surfArea*timeStep;
    //alert("Qmelt: " + Qmelt);
    iceMelt = Qmelt/hfusion;
    //alert("iceMelt: " + iceMelt);
    iceMassOld = iceMass;
    iceMass = iceMassOld - iceMelt;
    //alert("iceMass: " + iceMass);
    if (iceMass > 0.1) {
      tempT = waterT - Qmelt/((iceMelt+waterMass)*joulesPerCal);
      //alert("tempT: " + tempT);
      waterT = (waterMass*tempT + iceMelt*(Cice+CtoKelvin))/(iceMelt+waterMass);
      //alert("waterT: " + waterT);
      waterMass = waterMass + iceMelt;
      //alert("waterMass: " + waterMass);
      surfArea = iceMass/iceMassOld*surfArea;
    }

    Qmelt2 = (waterT2-(Cice+CtoKelvin))*h*surfArea2*timeStep;
    iceMelt2 = Qmelt2/hfusion;
    iceMassOld2 = iceMass2;
    iceMass2 = iceMass2 - iceMelt2;
    if (iceMass2 > 0.1) {
      tempT2 = waterT2 - Qmelt2/((iceMelt2+waterMass2)*joulesPerCal);
      waterT2 = (waterMass2*tempT2 + iceMelt2*(Cice+CtoKelvin))/(iceMelt2+waterMass2);
      waterMass2 = waterMass2 + iceMelt2;
      surfArea2 = iceMass2/iceMassOld2*surfArea2;
    }

    // Plots every other data point
    if (currentStep % 2 == 0) {
      x1 = 38 + currentStep + "px";
      x2 = 39 + currentStep + "px";

      y1 = (graphHeight - (waterT-CtoKelvin)*(graphHeight/maxTemp) + 68); + "px";
      y2 = (graphHeight - (waterT2-CtoKelvin)*(graphHeight/maxTemp) + 68); + "px";

      if ((y2-y1) < 1.5) {
        y2 = y2 + "px";
        y1 = y2;
      } else {
        y1 = y1 + "px";
        y2 = y2 + "px";
      }

      var dot1 = "#sit1Point" + (currentStep/2);
      var dot2 = "#sit2Point" + (currentStep/2);
      $(dot1).css({top:y1, left:x1});
      $(dot2).css({top:y2, left:x2});
      $(dot1).show();
      $(dot2).show();
    }

    currentStep++;
    setTimeout(measureSimulation, 40);
  } else {
    $("#resetButton").removeAttr("disabled");
  }
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
  if (brokenExp.numDivisions < MAX_DIVISIONS && cursorOverBrokenExp()) {
    print("Breaking ice");
    brokenExp.numDivisions += 1;
    breakAnimation();
    brokenExp.setDivisions(brokenExp.numDivisions);
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
  var halfBlockSize = brokenExp.findArrayRange() / 2;
  var xLeft = brokenExp.xOffset - halfBlockSize;
  var xRight = brokenExp.xOffset + halfBlockSize;
  var yTop = brokenExp.yOffset - halfBlockSize - 20;
  var yBottom = brokenExp.yOffset + halfBlockSize;

  return (mouseX >= xLeft && mouseX <= xRight) &&
         (mouseY >= yTop && mouseY <= yBottom);
}
