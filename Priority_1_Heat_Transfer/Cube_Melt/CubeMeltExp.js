/* File: CubeMeltExp.js
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 * 
 * Dependencies: snowMelt.js
 */

/*
 * This class encapsulates the behavior of either ice block (broken or unbroken)
 * drawn on the top-left quadrant of the screen.
 */
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

  /* The offset in pixels to draw the center of the ice block. */
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
   * Resizes the block pieces. Called whenever the window is resized.
   */
  this.resize = function() {
    // Avoid resizing if it would make part of the cube go offscreen
    if (baseWidth > windowHeight / 2) {
      var padding = 20; // pixels
      baseWidth = windowHeight / 2 - padding;
    }

    this.yOffset = windowHeight / 4;
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
    this.canvas = parent.createCanvas(windowWidth / 2, windowHeight / 2);
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
    this.setCenterArrayPos(this.xOffset, this.yOffset);
  }
}