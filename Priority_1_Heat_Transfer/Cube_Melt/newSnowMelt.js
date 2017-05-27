/*File:snowMelt.html
	Author: Daniel Vasquez (May 2017)
			Under the supervision of Margot Vigeant, Bucknell University
*/
var iceCanvas;
var numDivisions = -1;
var maxDivisions = 5;
var array = [];
var arrayPos = {x:100, y:100};
var baseWidth = 100;
var holdingHammer = false;
var ctx;
var myLineChart;
var chartData = { //Configuration data for chart
  type: 'line',
  data: {
    datasets: [{
        label: 'Broken Ice',
        data: [{x:0,y:1}, {x:1,y:2}]
      },
      {
        label: 'Unbroken Ice',
        backgroundColor: "rgba(75,192,192,0.4)",
        data: [{x:0,y:2}, {x:1,y:0}]
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
    }
  }
};

/* -- Science Variables -- */
var Tice = 273.15 // Temperature of ice at freezing point in Kelvin
var iceDensity = 917; // Density of ice in kg/m^3
var brknExp = {
  array: [],
  arrayPos: {x:0, y:0},
  canvas: null,
  iceDensity: iceDensity,
  Twater: 280,
  edgeLength: baseWidth, // The length of an individual piece's edge
  surfaceArea: self.edgeLength * self.edgeLength * 6,
  volume: self.edgeLength * self.edgeLength * self.edgeLength,
  Mice: self.iceDensity*self.volume,
  numDivisions: 0
}
var unbrknExp = {
  array: [],
  arrayPos: {x:0, y:0},
  canvas: null,
  iceDensity: iceDensity,
  Twater: 280,
  edgeLength: baseWidth,
  surfaceArea: self.edgeLength * self.edgeLength * 6,
  volume: self.edgeLength * self.edgeLength * self.edgeLength,
  Mice: self.iceDensity*self.volume
}

function setup() {
  initializeIceCanvas(brknExp, "brokenIceCanvas-holder");
  initializeIceCanvas(unbrknExp, "unBrokenIceCanvas-holder");
  initializeArray(maxDivisions, brknExp);
  initializeArray(maxDivisions, unbrknExp);
  setDivisions(0, brknExp);
  setDivisions(0, unbrknExp);
  toggleHammer();
  initializeChart();

  //noLoop();
}

function initializeArray(maxDivisions, exp) {
  var length = pow(2, maxDivisions);
  for (var i = 0; i < length; i++){
    var list = [];
    for (var j = 0; j < length; j++){
      list.push({x:0, y:0, width:0, height:0});
    }
    exp.array.push(list);
  }
}

/*
 * Author: Daniel Vasquez (2017)
 */
function initializeIceCanvas(exp, targetElement) {
  exp.canvas = createCanvas(windowWidth, windowHeight/2);
  exp.canvas.parent(targetElement)
}

/*
 * Author: Daniel Vasquez (2017)
 */
function initializeChart() {
  ctx = document.getElementById("myChart").getContext("2d");
  myLineChart = new Chart(ctx, chartData);
}

function draw() {
  //whipe the canvas clean
  background(255,255,255);

  //myLineChart.data.datasets[0].data[0] += 1;
  //myLineChart.update();
  moveArrayToCenter(brknExp);
  moveArrayToCenter(unbrknExp);

  /*---BEGIN Logic for controlling appearance of cursor---*/
  if (holdingHammer) {
    if (mouseIsPressed) {
      cursor('hammer_click.cur', 0, 0); //sets cursor to hammer_click.cur
    } else {
      cursor('hammer_hover.cur', 0, 0);
    }
  } else {
    cursor(ARROW, 0, 0);  //sets cursor to default arrow constant
  }
  /*---END Logic for controlling appearance of cursor---*/
  drawExperiment(brknExp);
  drawExperiment(unbrknExp);
}

function drawExperiment(exp) {
  var length = pow(2, exp.numDivisions);
  for (var i = 0; i < length; i++){
    for (var j = 0; j < length; j++){
      piece = exp.array[i][j];
      rect(piece.x + exp.arrayPos.x, piece.y + exp.arrayPos.y, piece.width, piece.height);
      //print("Made a rect at:", piece.x, piece.y);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight/2); // TODO Remove dependence on window
}

/* rgb(75, 193, 101) - BEGIN Maths and Sciences Functions ------------------*/

/* Divides the experiment's ice into pieces of equal size. Results reflect
 * Uses global values for calculations
 * n divisions from an initial whole ice block.
 * n = number of divisions to be executed
 * exp = the experiment this function will be executed on
 * Author: Daniel Vasquez (2017)
 */
function setDivisions(n, exp) {
  if (n < exp.numDivisions) {
    initializeArray(maxDivisions, exp); // Reset ice to whole block
  }
  exp.numDivisions = n;
  var length = pow(2, exp.numDivisions); // the number of pieces along one axis
  var pieceWidth = baseWidth/length; // baseWidth is a global
  var paddingToPieceRatio = .5;
  for (var i = 0; i < length; i++){ // iterate over pieces that exist
    for (var j = 0; j < length; j++){
      // paddingToPieceRatio is a global
      exp.array[i][j].x = (i)*((1+paddingToPieceRatio)*baseWidth/length);
      exp.array[i][j].y = (j)*((1+paddingToPieceRatio)*baseWidth/length);
      exp.array[i][j].width = pieceWidth;
      exp.array[i][j].height = pieceWidth;
    }
  }
}

/* Returns length of either side of the split-up ice pieces.
 * Assumes each piece's length == width
 * Author: Daniel Vasquez (2017)
 */
function findArrayRange(exp) {
  var length = pow(2, exp.numDivisions);
  var pieceWidth = baseWidth/length;
  //print(exp.array[length-1][-0.5]);
  var xRange = exp.array[length-1][length-1].x + pieceWidth;
  return xRange;
}

/* Sets the array's position relative to it's center
 * Author: Daniel Vasquez (2017)
 */
function setCenterArrayPos(exp, x, y) {
  offset = findArrayRange(exp)/2;
  exp.arrayPos.x = x - offset;
  exp.arrayPos.y = y - offset;
  //print(arrayPos.x, arrayPos.y);
}

/* Centers the array in the windows
 * Author: Daniel Vasquez (2017)
 */
function moveArrayToCenter(exp) {
  var middleX = windowWidth / 2;
  var middleY = windowHeight / 4;
  setCenterArrayPos(exp, middleX, middleY);
}

/*
 * Function: findMeltingTime
 * Finds the melting time for the cubes in each beaker to set up the animation fade time
 * Author: Daniel Prudente (September 2012)
 */
function findMeltingTime() {
	simulationSetup();
	findMeltStep();
	simulationSetup();
	findMeltStep2();
	simulationSetup();
}

/*
 * Function: measureSimulation
 * The actual simulation. Calculates temperature and plots it.
 * Author: Daniel Prudente (September 2012)
 * Modder: Daniel Vasquez (2017)
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

			//alert(y1 + "    " + y2);

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

/* rgb(75, 193, 101) - END Maths and Sciences Functions ------------------*/

/* rgb(116, 52, 233) - BEGIN Animation Functions ------------------ */

/* Toggles holding the hammer. Replaces the cursor with a hammer graphic.
 *
 * Author: Daniel Vasquez (2017)
 */
function toggleHammer() {
  holdingHammer = !holdingHammer;
  if (holdingHammer){
    cursor('hammer_hover.cur', 0, 0);
  } else {
    cursor(ARROW, 0, 0);
  }
}

/* Attempts to break the ice further.
 * If maxDivisions is reached, does nothing.
 * Author: Daniel Vasquez (2017)
 */
function swingHammer(exp) {
  if (exp.numDivisions < maxDivisions){
    print("Breaking ice");
    exp.numDivisions += 1;
    breakAnimation();
    setDivisions(exp.numDivisions, exp);
  }
  else {
    print("The ice couldn't be broken further");
    noBreakAnimation(); // Animation that signals to user that ice can not be broken further
  }
}

/* Animation for the breaking of user-breakable ice block.
 * Author: Daniel Vasquez (2017)
 */
function breakAnimation(){
  // Spawn strike sparks
  return
}

/* Animation indicating that the ice couldn't be broken.
 * Author: Daniel Vasquez (2017)
 */
function noBreakAnimation(){
  // Spawn dust/poof/smoke particles
  return
}

/* rgb(116, 52, 233) - END Animation Functions ------------------ */

/* rgb(252, 220, 49) - BEGIN User Interaction Functions ------------------ */

function mousePressed(){
  swingHammer(brknExp);
}

/* rgb(252, 220, 49) - END User Interaction Functions ------------------ */
