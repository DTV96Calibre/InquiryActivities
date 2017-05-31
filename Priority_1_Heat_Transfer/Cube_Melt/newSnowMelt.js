/* File: snowMelt.html
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/******************* Constants **********************/

var ICE_FREEZE_TEMP_K = 273.15; // Temperature of ice at freezing point in Kelvin
var ICE_DENSITY = 917; // Density of ice in kg/m^3
var MAX_DIVISIONS = 5; // Maximum number of times user can break the ice block
var BASE_WIDTH_SCALING = 9; // Amount to divide windowWidth by to get size of ice block

/**************** Global variables ******************/

var iceCanvas;
var baseWidth = 100; // Number of pixels along one edge of an unbroken ice block
var numDivisions = -1;
var array = [];
var arrayPos = {x:100, y:100};
var holdingHammer = false;
var ctx;
var myLineChart;

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

/***** Reusable class for cube melt experiment ******/

function CubeMeltExp() {
  // Class attributes
  this.array = []; // Array of rectangles (ice pieces)
  this.arrayPos = {x:0, y:0};
  this.canvas = null;
  this.waterTemp = 280; // Temperature of water in Kelvin // TODO: why 280?
  this.edgeLength = baseWidth; // The length of an ice piece's edge
  this.surfaceArea = this.edgeLength * this.edgeLength * 6;
  this.volume = Math.pow(this.edgeLength, 3);
  this.iceMass = ICE_DENSITY * this.volume;
  this.xOffset = 0;
  this.yOffset = 0;

  /* Unbroken exp always has 0 divisions. This will vary for the broken exp. */
  this.numDivisions = 0;

  /* 
   * Draws this experiment's array of cube(s).
   */
  this.display = function() {
    var length = Math.pow(2, this.numDivisions);
    for (var i = 0; i < length; i++) {
      for (var j = 0; j < length; j++) {
        var piece = this.array[i][j];
        rect(piece.x + this.arrayPos.x, piece.y + this.arrayPos.y, piece.width, piece.height);
        //print("Made a rect at:", piece.x, piece.y); // Debug
      }
    }
  }

  /*
   * Resizes the block pieces.
   */
  this.resize = function() {
    // Avoid resizing if it would make part of the cube go offscreen
    if (baseWidth > windowHeight / 2) {
      var padding = 20; // pixels
      baseWidth = windowHeight / 2 - padding;
    }

    this.edgeLength = baseWidth;
    this.setDivisions(this.numDivisions); // Need to recalculate size of each piece
  }

  /*
   * Initializes the array of ice blocks in this experiment.
   */
  this.initializeArray = function() {
    var length = Math.pow(2, MAX_DIVISIONS);
    for (var i = 0; i < length; i++) {
      var list = [];
      for (var j = 0; j < length; j++) {
        list.push({x:0, y:0, width:0, height:0});
      }

      this.array.push(list);
    }
  }

  /*
   * Initializes this experiment's canvas.
   * @param targetElement: The ID of the HTML div element that will hold this canvas.
   */
  this.initializeIceCanvas = function(targetElement) {
    // Create canvas and set its parent to the appropriate div tag
    this.canvas = parent.createCanvas(windowWidth / 2, windowHeight);
    this.canvas.parent(targetElement);
  }

  /* 
   * Divides this experiment's ice into pieces of equal size.
   * @param n: The number of divisions to be executed.
   */
  this.setDivisions = function(n) {
    if (n < this.numDivisions) {
      this.initializeArray(); // Reset ice to whole block
    }

    this.numDivisions = n;
    var length = Math.pow(2, this.numDivisions); // The number of pieces along one axis
    var pieceWidth = baseWidth / length;
    var paddingToPieceRatio = 0.5;
    for (var i = 0; i < length; i++) { // Iterate over pieces that exist
      for (var j = 0; j < length; j++) {
        var offset = ((1 + paddingToPieceRatio) * baseWidth / length);
        this.array[i][j].x = i * offset;
        this.array[i][j].y = j * offset;
        this.array[i][j].width = pieceWidth;
        this.array[i][j].height = pieceWidth;
      }
    }
  }

  /* 
   * Returns the length of either side of the split-up ice pieces. Assumes each 
   * piece's length and width are identical.
   */
  this.findArrayRange = function() {
    var length = Math.pow(2, this.numDivisions); // The number of pieces along one axis
    var pieceWidth = baseWidth / length;
    //print(exp.array[length-1][-0.5]); // Debug
    var xRange = this.array[length - 1][length - 1].x + pieceWidth;
    return xRange;
  }

  /* 
   * Sets the array's position relative to its center.
   * @param x: The horizontal placement of the array on the screen
   * @param y: The vertical placement of the array on the screen
   */
  this.setCenterArrayPos = function(x, y) {
    var offset = this.findArrayRange() / 2;
    this.arrayPos.x = x - offset;
    this.arrayPos.y = y - offset;
    //print(arrayPos.x, arrayPos.y); // Debug
  }

  /* 
   * Centers the array in the window.
   * @param offset: Added to the final position to display canvases side-by-side. 
   */
  this.moveArrayToCenter = function() {
    this.yOffset = windowHeight / 4;
    this.setCenterArrayPos(this.xOffset, this.yOffset);
  }
}

/***************** Experiment setup *****************/

function initializeChart() {
  ctx = document.getElementById("myChart").getContext("2d");
  myLineChart = new Chart(ctx, chartData);
}

function setup() {
  baseWidth = windowWidth / BASE_WIDTH_SCALING;

  // Create both ice visualizations and initialize each of them
  brokenExp = new CubeMeltExp();
  unbrokenExp = new CubeMeltExp();

  unbrokenExp.xOffset = windowWidth * 0.15;
  brokenExp.xOffset = windowWidth * 0.35;

  brokenExp.initializeIceCanvas("brokenIceCanvas-holder");
  unbrokenExp.initializeIceCanvas("unbrokenIceCanvas-holder");

  brokenExp.initializeArray();
  unbrokenExp.initializeArray();

  brokenExp.setDivisions(0);
  unbrokenExp.setDivisions(0);
 
  toggleHammer();
  initializeChart();

  windowResized();

  //noLoop();
}

function draw() {
  // Clear the canvas
  background(255, 255, 255);

  //myLineChart.data.datasets[0].data[0] += 1;
  //myLineChart.update();
  brokenExp.moveArrayToCenter();
  unbrokenExp.moveArrayToCenter();

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

  brokenExp.display();
  unbrokenExp.display();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight / 2); // TODO Remove dependence on window

  // Update variables that scale with screen size
  unbrokenExp.xOffset = windowWidth * 0.15;
  brokenExp.xOffset = windowWidth * 0.35;
  baseWidth = windowWidth / BASE_WIDTH_SCALING;
  unbrokenExp.resize();
  brokenExp.resize();
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
 * Detect whether the cursor is hovering over the breakable ice blocks.
 */
function cursorOverBrokenExp() {
  var xLeft = brokenExp.xOffset - brokenExp.findArrayRange() / 2;
  var xRight = brokenExp.xOffset + brokenExp.findArrayRange() / 2;
  var yTop = brokenExp.yOffset - brokenExp.findArrayRange() / 2;
  var yBottom = brokenExp.yOffset + brokenExp.findArrayRange() / 2;
  return (mouseX >= xLeft && mouseX <= xRight) &&
         (mouseY >= yTop && mouseY <= yBottom);
}
