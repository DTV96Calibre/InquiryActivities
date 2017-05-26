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
var chartData = {
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
    }
  };

function setup() {
  initializeIceCanvas();
  initializeArray(maxDivisions)
  setDivisions(0);
  toggleHammer();
  initializeChart();

  //noLoop();
}

function initializeArray(maxDivisions) {
  var length = pow(2, maxDivisions);
  for (var i = 0; i < length; i++){
    var list = [];
    for (var j = 0; j < length; j++){
      list.push({x:0, y:0, width:0, height:0});
    }
    array.push(list);
  }
}

/*
 * Author: Daniel Vasquez (2017)
 */
function initializeIceCanvas() {
  iceCanvas = createCanvas(windowWidth, windowHeight/2);
  iceCanvas.parent("iceCanvas-holder")
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
  moveArrayToCenter();

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

  var length = pow(2, numDivisions);
  for (var i = 0; i < length; i++){
    for (var j = 0; j < length; j++){
      piece = array[i][j];
      rect(piece.x + arrayPos.x, piece.y + arrayPos.y, piece.width, piece.height);
      //print("Made a rect at:", piece.x, piece.y);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight/2);
}

/*------- BEGIN Maths and Sciences Functions -------------*/
function setDivisions(n) {
  if (n < numDivisions) {
    initializeArray(maxDivisions);
  }
  numDivisions = n;
  var length = pow(2, numDivisions); // the number of pieces along one axis
  //print("Length =", length);
  var pieceWidth = baseWidth/length;
  var paddingToPieceRatio = .5;
  for (var i = 0; i < length; i++){
    for (var j = 0; j < length; j++){
      array[i][j].x = (i)*((1+paddingToPieceRatio)*baseWidth/length);
      //print(array[i][j].x);
      array[i][j].y = (j)*((1+paddingToPieceRatio)*baseWidth/length);
      array[i][j].width = pieceWidth;
      array[i][j].height = pieceWidth;
    }
  }
}

/* Returns length of either side of the split-up ice pieces.
 * Assumes each piece's length == width
 * Author: Daniel Vasquez (2017)
 */
function findArrayRange() {
  var length = pow(2, numDivisions);
  var pieceWidth = baseWidth/length;
  var xRange = array[length-1][length-1].x + pieceWidth;
  return xRange;
}

/* Sets the array's position relative to it's center
 * Author: Daniel Vasquez (2017)
 */
function setCenterArrayPos(x, y) {
  offset = findArrayRange()/2;
  print(offset);
  arrayPos.x = x - offset;
  arrayPos.y = y - offset;
  //print(arrayPos.x, arrayPos.y);
}

/* Centers the array in the windows
 * Author: Daniel Vasquez (2017)
 */
function moveArrayToCenter() {
  var middleX = windowWidth / 2;
  var middleY = windowHeight / 4;
  setCenterArrayPos(middleX, middleY);
}

/*
 * Function: findMeltingTime
 * Finds the melting time for the cubes in each beaker to set up the animation fade time
 * Author: Daniel Prudente (September 2012)
**/
function findMeltingTime() {
	simulationSetup();
	findMeltStep();
	simulationSetup();
	findMeltStep2();
	simulationSetup();
}

/*------- END Maths and Sciences Functions -------------*/

/*------- BEGIN Animation Functions --------------------*/

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
function swingHammer() {
  if (numDivisions < maxDivisions){
    print("Breaking ice");
    numDivisions += 1;
    breakAnimation();
    setDivisions(numDivisions);
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

/*------- END Animation Functions --------------------*/

/*------- BEGIN User Interaction Functions -----------*/

function mousePressed(){
  swingHammer();
}

/*------- END User Interaction Functions -----------*/
