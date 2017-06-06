/* File: CubeMeltExp.js
 * Dependencies: snowMelt.js
 * 
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/*
 * This class encapsulates the behavior of either ice cube (broken or unbroken)
 * drawn on the top-left quadrant of the screen.
 */
function IceCube() {
  // Class attributes
  this.array = []; // Array of squares (ice pieces)
  this.arrayPos = {x:0, y:0};
  this.canvas = null;

  this.waterTemp = 280; // Temperature of water in Kelvin // TODO: why 280?
  this.surfaceArea = this.edgeLength * this.edgeLength * 6;
  this.volume = Math.pow(this.edgeLength, 3);
  this.iceMass = ICE_DENSITY * this.volume;

  /* Colors */
  this.iceColor = '#e9f7ef';
  this.iceBorderColor = '#d0ece7';

  /* The offset in pixels to draw the center of the ice block. */
  this.xOffset;
  this.yOffset;

  /* Unbroken ice block always has 0 divisions. This will vary for the broken block. */
  this.numDivisions = 0;
  this.totalNumDivisions;

  /* Graphical properties */
  this.edgeLength;
  this.baseEdgeRoundness; // In degrees
  this.edgeRoundness;
  this.shadingPadding;
  this.edgeThickness;

  /* Other */
  this.isFalling = false;
  this.distanceToFall; // in pixels
  this.pctDistanceFallen = 0;

  /*
   * Sets the dimensions of the ice cube's drawing (both when the cube is first 
   * instantiated as well as whenever the window is resized).
   */
  this.setDimensions = function() {
    this.yOffset = windowHeight / 4;
    this.edgeLength = baseWidth;
    this.baseEdgeRoundness = this.edgeLength / 20; // In degrees
    this.edgeRoundness = this.baseEdgeRoundness;
    this.shadingPadding = this.edgeLength / 10;
    this.edgeThickness = this.edgeLength / 100;
  }

  /* 
   * Draws this experiment's array of ice cube(s).
   */
  this.display = function() {
    this.moveArrayToCenter();
    strokeWeight(this.edgeThickness);
    var length = Math.pow(2, this.numDivisions);

    for (var i = 0; i < length; i++) {
      for (var j = 0; j < length; j++) {

        var piece = this.array[i][j];

        var xPos = piece.x + this.arrayPos.x;
        var yPos = piece.y + this.arrayPos.y;

        // Set up colors
        fill(this.iceColor);
        stroke(this.iceBorderColor);

        var dist = this.pctDistanceFallen * this.distanceToFall;

        // Draw rounded edges if this ice block hasn't been fractured too much
        if (this.numDivisions < 3) {
          rect(xPos, yPos + dist, piece.width, piece.height, 
          this.edgeRoundness, this.edgeRoundness, this.edgeRoundness, this.edgeRoundness);
        } else {
          rect(xPos, yPos + dist, piece.width, piece.height);
        }

        // Don't draw details if ice pieces are small enough (helps avoid lag)
        if (this.numDivisions != MAX_DIVISIONS) {
          // Draw shading
          noStroke();
          fill('white');
          var padding = piece.width / 10;
          triangle(xPos + padding * 4, yPos + piece.height - padding + dist, 
            xPos + piece.width - padding, yPos + padding * 4 + dist, 
            xPos + piece.width - padding, yPos + piece.height - padding + dist);
          fill(this.iceColor);
          ellipse(xPos + piece.width / 2, yPos + piece.height / 2 + dist, 
            piece.width - padding * 1.85, piece.height - padding * 1.85);
        }
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

    this.setDimensions(); // Reset the graphical attributes of this ice cube
    this.setDivisions(this.numDivisions); // Need to recalculate size of each piece
    this.distanceToFall = 500;
  }

  /*
   * Initializes the array of ice blocks of this cube.
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
   * Divides this cube's ice into pieces of equal size.
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

    // Edges become less rounded as pieces become smaller
    this.edgeRoundness = this.baseEdgeRoundness / (this.numDivisions + 1);
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
  }

  /* 
   * Centers the array in the window.
   * @param offset: Added to the final position to display canvases side-by-side. 
   */
  this.moveArrayToCenter = function() {
    this.setCenterArrayPos(this.xOffset, this.yOffset);
  }

  /*
   * Returns true if this ice cube hasn't hit its max number of divisions.
   */
  this.canBeBrokenFurther = function() {
    return this.numDivisions < this.totalNumDivisions;
  }
}

/***************** Other functions ******************/

/*
 * Initializes the canvases of both ice cubes. Necessary for updating
 * the cursor properly as the user hovers over the ice cubes' respective
 * regions.
 */
function iceCubeCanvasSetup() {
  brokenExp.ice.initializeIceCanvas(BROKEN_ICE_DIV_ID);
  unbrokenExp.ice.initializeIceCanvas(UNBROKEN_ICE_DIV_ID);
}
