/*File:snowMelt.html
	Author: Daniel Vasquez (May 2017)
			Under the supervision of Margot Vigeant, Bucknell University
*/
var numDivisions = 2;
var maxDivisions = 5;
var array = [];
var baseWidth = 100;
function setup() {
  createCanvas(640, 480);
  var length = pow(2,maxDivisions);
  for (var i = 0; i < length; i++){
    var list = [];
    for (var j = 0; j < length; j++){
      list.push({x:0, y:0, width:0, height:0});
    }
    array.push(list);
  }
  noLoop();
}

function draw() {
  updateArray();
  for (var i = 0; i < array.length; i++){
    for (var j = 0; j < array.length; j++){
      piece = array[i][j];
      rect(piece.x, piece.y, piece.width, piece.height);
    }
  }
}

function updateArray() {
  var pieceWidth = baseWidth/numDivisions;
  var paddingToPieceRatio = .5;
  for (var i = 0; i < array.length; i++){
    for (var j = 0; j < array.length; j++){
      array[i][j].x = (i - 1)*((1+paddingToPieceRatio)*baseWidth/numDivisions);
      array[i][j].y = (j - 1)*((1+paddingToPieceRatio)*baseWidth/numDivisions);
      array[i][j].width = pieceWidth;
      array[i][j].height = pieceWidth;
    }
  }
}
