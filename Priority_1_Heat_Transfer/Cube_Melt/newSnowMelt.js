/*File:snowMelt.html
	Author: Daniel Vasquez (May 2017)
			Under the supervision of Margot Vigeant, Bucknell University
*/
var numDivisions = -1;
var maxDivisions = 5;
var array = [];
var baseWidth = 100;
var holdingHammer = false;

function setup() {
  createCanvas(640, 480);
  initializeArray(maxDivisions)
  setDivisions(0);
  toggleHammer();
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

function draw() {
  //whipe the canvas clean
  clear();
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
      rect(piece.x, piece.y, piece.width, piece.height);
      //print("Made a rect at:", piece.x, piece.y);
    }
  }
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

/*------- END Maths and Sciences Functions -------------*/

/*------- BEGIN Animation Functions --------------------*/

/* Toggles holding the hammer. Replaces the cursor with a hammer graphic.
 *
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
 */
function breakAnimation(){
  // Spawn strike sparks
  return
}

/* Animation indicating that the ice couldn't be broken.
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
