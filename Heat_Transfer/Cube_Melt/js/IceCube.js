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
function IceCube() { // TODO: Refactor. This class also represents the water in the cup. The ice cube can also be divided into multiple ice cubes.
  // Class attributes
  this.array = []; // Array of squares (ice pieces)
  this.arrayPos = {x:0, y:0};
  this.canvas = null;

  /* Length (in cm) of one edge of the original unbroken ice cube. NOT dependent
   *on window size.
   */
  this.BASE_EDGE_LENGTH_CM = 20;

  /*
   * Amount to scale the vertical 'melting offset': the amount the ice cube sticks up
   * out of the liquid when it's undergoing shrinkage due to melting. Smaller numbers
   * submerge the ice cubes further into the liquid.
   */
  this.MELTED_OFFSET_SCALING = 1.7;

  this.edgeLength = this.BASE_EDGE_LENGTH_CM; // The length of a single cube (becomes smaller as ice is broken)
  this.numPieces = 1;
  this.surfaceArea = this.edgeLength * this.edgeLength * 6 * 1;
  this.iceVolume = Math.pow(baseWidth, 3); // TODO: Refactor, (isn't clear what volume this represents)


  this.iceMass = STARTING_ICE_MASS;

  /* Colors */
  this.iceColor = 'rgb(233, 247, 239)';
  this.iceBorderColor = 'rgb(208, 236, 231)';

  /* The offset in pixels to draw the center of the ice block. */
  this.xOffset;
  this.yOffset;

  /* Unbroken ice block always has 0 divisions. This will vary for the broken block. */
  this.numDivisions = 0;
  this.totalNumDivisions;

  /* Graphical properties */
  this.baseEdgeRoundness; // In degrees
  this.edgeRoundness;
  this.shadingPadding;
  this.edgeThickness;

  /* Other */
  this.hasDropped = false;
  this.isFalling = false;
  this.hasStartedMelting = false;
  this.isMelting = false;
  this.isDoneAnimating = false;
  this.distanceToFall = 0; // in pixels
  this.pctDistanceFallen = 0; // Range is 0 to 1.0
  this.pctMelted = 0; // Range is 0 to 1.0
  this.numFramesStalled = 0;

  /* ==================================================================
                              Graphical methods
     ==================================================================
  */

  /*
   * Sets the dimensions of the ice cube's drawing (both when the cube is first
   * instantiated as well as whenever the window is resized).
   */
  this.setDimensions = function() {
    this.yOffset = windowHeight / 4;
    this.baseEdgeRoundness = baseWidth / 20; // In degrees
    this.edgeRoundness = this.baseEdgeRoundness;
    this.shadingPadding = baseWidth / 10;
    this.edgeThickness = baseWidth / 100;
  }

  /*
   * Draws this experiment's array of ice cube(s).
   */
  this.display = function() {
    this.moveArrayToCenter();
    strokeWeight(this.edgeThickness);
    var length = Math.pow(2, this.numDivisions);

    // Skip drawing ice pieces that are already melted
    if (this.pctMelted > 0.9999) {
      return;
    }

    // Iterate through the ice pieces in this array
    for (var i = 0; i < length; i++) {
      for (var j = 0; j < length; j++) {
        var piece = this.array[i][j];

        // Setup variables for positioning the ice pieces
        var xPos = this.findXPosOfPiece(piece, j);
        var yPos = this.findYPosOfPiece(piece, j);
        var distanceFallen = this.findDistanceFallen(piece, j);

        this.displayBody(piece, distanceFallen, xPos, yPos);

        // Don't draw details if ice pieces are small enough (helps avoid lag)
        if (this.numDivisions < 4) {
         this.displayShading(piece, distanceFallen, xPos, yPos);
        }
      }
    }
  }

  /*
   * Draws the body of the given piece of ice cube.
   * @param piece: The ice piece to render (ice pieces are stored in this.array)
   * @param distanceFallen: The amount to draw the ice further down the page
   * @param xPos: The horizontal offset to begin drawing the ice piece
   * @param yPos: The vertical offset to begin drawing the ice piece
   */
  this.displayBody = function(piece, distanceFallen, xPos, yPos) {
    // Set up colors
    fill(this.iceColor);
    stroke(this.iceBorderColor);

    // Draw rounded edges if this ice block hasn't been fractured too much
    if (this.numDivisions < 3) {
      rect(xPos, yPos + distanceFallen, piece.width, piece.height,
      this.edgeRoundness, this.edgeRoundness, this.edgeRoundness, this.edgeRoundness);
    } else {
      rect(xPos, yPos + distanceFallen, piece.width, piece.height);
    }
  }

  /*
   * Draws the shading (white triangle) of the given piece of ice cube.
   * @param piece: The ice piece to render (ice pieces are stored in this.array)
   * @param distanceFallen: The amount to draw the ice further down the page
   * @param xPos: The horizontal offset to begin drawing the ice piece
   * @param yPos: The vertical offset to begin drawing the ice piece
   */
  this.displayShading = function(piece, distanceFallen, xPos, yPos) {
    noStroke();
    fill('white');
    var padding = piece.width / 10;

    // Draw the triangle on the lower-right corner of the cube
    triangle(xPos + padding * 4, yPos + piece.height - padding + distanceFallen,
      xPos + piece.width - padding, yPos + padding * 4 + distanceFallen,
      xPos + piece.width - padding, yPos + piece.height - padding + distanceFallen);
    fill(this.iceColor);
    // Draw an ellipse to make the hypotenuse appear concave
    ellipse(xPos + piece.width / 2, yPos + piece.height / 2 + distanceFallen,
      piece.width - padding * 1.5, piece.height - padding * 1.5);
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
   * Sets the array's position relative to its center.
   * @param x: The horizontal placement of the array on the screen
   * @param y: The vertical placement of the array on the screen
   */
  this.setCenterArrayPos = function(x, y) {
    var offset = this.findArrayRange() / 2;
    var paddingOffset = this.findOffsetFromPadding();
    var meltedOffset = this.findOffsetFromMelting();

    this.arrayPos.x = x - offset + meltedOffset;
    this.arrayPos.y = y - offset + paddingOffset + meltedOffset / this.MELTED_OFFSET_SCALING;
  }

  /*
   * Centers the array in the window.
   * @param offset: Added to the final position to display canvases side-by-side.
   */
  this.moveArrayToCenter = function() {
    this.setCenterArrayPos(this.xOffset, this.yOffset);
  }

  /* ==================================================================
                         Methods for functionality
     ==================================================================
  */

  /*
   * Initializes the array of ice blocks of this cube.
   */
  this.initializeArray = function() {
    var length = Math.pow(2, MAX_DIVISIONS);
    for (var i = 0; i < length; i++) {
      var list = [];
      for (var j = 0; j < length; j++) {
        list.push({x:0, y:0, width:0, height:0,
          floatDirection: int(random(100))});
      }

      this.array.push(list);
    }
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
        var offset = (1 + paddingToPieceRatio) * baseWidth / length;
        this.array[i][j].x = i * offset;
        this.array[i][j].y = j * offset * (1 - this.pctMelted);
        this.array[i][j].width = pieceWidth * (1 - this.pctMelted);
        this.array[i][j].height = pieceWidth * (1 - this.pctMelted);
      }
    }

    // Edges become less rounded as pieces become smaller
    this.edgeRoundness = this.baseEdgeRoundness / (this.numDivisions + 1) * (1 - this.pctMelted);
  }

  /*
   * Returns the length of either side of the split-up ice pieces. Assumes each
   * piece's height and width are identical.
   */
  this.findArrayRange = function() {
    var length = Math.pow(2, this.numDivisions); // The number of pieces along one axis
    var pieceWidth = baseWidth / length;
    var xRange = this.array[length - 1][length - 1].x + pieceWidth;
    return xRange;
  }

  /*
   * Computes the xPos (horizontal position) of an ice piece to draw it onscreen.
   * @param piece: An ice piece stored in this.array
   * @param rowIndex: The index of the row in which this piece is stored
   */
  this.findXPosOfPiece = function(piece, rowIndex) {
    var xPos = piece.x + this.arrayPos.x;

    // Odd-numbered rows of falling ice chips shift horizontally to improve 'stacking' effect
    if (rowIndex % 2 == 1) {
      var iceChipShiftFactor = MAX_DIVISIONS - this.numDivisions + 1;
      iceChipShiftFactor /= (1 + this.pctMelted * 3);
      xPos += this.pctDistanceFallen * piece.width / 2 / iceChipShiftFactor;
    }

    // Ice pieces shift back and forth in the liquid as they melt
    if (rowIndex != 0) {
      var floatDistance = this.findFloatDistance(piece, rowIndex) / this.numDivisions;

      // Even-numbered directions will float to the right
      if (piece.floatDirection % 2 == 0) {
        var rightWallPos = this.arrayPos.x + this.findArrayRange();
        if (xPos + floatDistance + piece.width < rightWallPos) {
          xPos += floatDistance;
        } else {
          // Switch direction this piece floats in
          piece.floatDirection += 1;
          // Set the position of this piece to be right against the boundary
          xPos = rightWallPos - piece.width;
        }
      // Odd-numbered directions will float to the left
      } else {
        var leftWallPos = this.arrayPos.x;
        if (xPos - floatDistance > leftWallPos) {
          xPos -= floatDistance;
        } else {
          // Switch direction this piece floats in
          piece.floatDirection += 1;
          // Set the position of this piece to be right against the boundary
          xPos = leftWallPos;
        }
      }
    }

    return xPos;
  }

  /*
   * Computes the yPos (vertical position) of an ice piece to draw it onscreen.
   * @param piece: An ice piece stored in this.array
   * @param rowIndex: The index of the row in which this piece is stored
   */
  this.findYPosOfPiece = function(piece, rowIndex) {
    var yPos = piece.y + this.arrayPos.y;

    // Ice pieces gradually rise vertically as they melt
    if (rowIndex != 0) {
      var floatDistance = this.findFloatDistance(piece, rowIndex) / 2;
      yPos -= floatDistance;
    }

    return yPos;
  }

  /*
   * Computes the floatDistance (which will be added to the x-position of the
   * given ice piece) as a consequent of the ice blocks melting and floating
   * in the water.
   * @param piece: An ice piece stored in this.array
   * @param rowIndex: The index of the row in which this piece is stored
   */
  this.findFloatDistance = function(piece, rowIndex) {
    var floatDistance = this.pctMelted * piece.width * rowIndex;
    return floatDistance;
  }

  /*
   * Returns the offset to apply when centering this IceCube once it's fallen
   * into the cup. Necessary to prevent the top rows of broken ice shards from
   * appearing to float above the surface of the liquid.
   */
  this.findOffsetFromPadding = function() {
    /* Find the actual width ('array range') of this IceCube minus the starting
     * (base) width. This coincides with the number of divisions (hits from a
     * hammer).
     */
    var padding = this.findArrayRange() - baseWidth;

    /* Scale with distance fallen. If already done falling into the cup, assume
     * distance fallen = 100%.
     */
    if (this.isDoneFalling) {
      return padding;
    } else {
      return this.pctDistanceFallen * padding;
    }
  }

  /*
   * Returns the offset needed to shift the shrinking cubes to the right by as they melt
   * (to ensure they remain centered despite the origin of cubes being drawn in the top-left
   * corner).
   */
  this.findOffsetFromMelting = function() {
    var length = Math.pow(2, this.numDivisions);
    // The length of one original (unmelted) ice chip in a cube with this many divisions
    var originalPieceWidth = baseWidth / length;
    // The length of the piece that is now gone (melted away)
    var meltedPieceWidth = originalPieceWidth * this.pctMelted;
    // Divide the melted portion in half to center the unmelted piece that remains
    return meltedPieceWidth / 2;
  }

  /*
   * Returns the vertical distance to draw this IceCube piece further down the screen due to
   * it falling towards the cup.
   * @param piece: The ice piece to render (ice pieces are stored in this.array)
   * @param yPosArray: The index into the row in which this piece is stored in this.array
   */
  this.findDistanceFallen = function(piece, yPosArray) {
    var distanceFallen = this.pctDistanceFallen * this.distanceToFall;
    // Pieces on the lower rows need to fall a lesser distance to reach the liquid
    distanceFallen -= yPosArray * this.pctDistanceFallen * piece.width / 2;
    return distanceFallen;
  }

  /*
   * Returns true if this ice cube hasn't hit its max number of divisions AND
   * it hasn't yet been dropped into the cup.
   */
  this.canBeBrokenFurther = function() {
    return this.numDivisions < this.totalNumDivisions && !this.hasDropped;
  }

  /*
   * 'Drops' the ice by the given incremental percentage.
   * @param pct: The percentage of the total drop to advance the ice's drop.
   */
  this.drop = function(pct) {
    // Ice drops more slowly once it encounters resistance from the liquid
    var hasHitLiquid = this.pctDistanceFallen > 0.70;

    if (hasHitLiquid) {
      this.pctDistanceFallen += pct;
    }
    else {
      var acceleration = this.pctDistanceFallen * pct; // proof of concept
      this.pctDistanceFallen += (pct + acceleration);
    }
  }

  /*
   * Melt this ice by updating its melted percentage with respect to its
   * current mass.
   */
  this.melt = function() {
    this.pctMelted = (STARTING_ICE_MASS - this.iceMass) / 100;
  }

  /* ==================================================================
               Methods for mathematical calculations
     ==================================================================
  */

  /*
  * The equivalent of setDimensions(), but for mathematical properties (e.g.
  * surface area) instead of graphical properties. Must be recomputed every
  * time the IceCube undergoes a change; e.g. being broken or melting.
  */
  this.calculateProperties = function() {
    this.edgeLength = this.calculateEdgeLength();
    this.numPieces = this.calculateNumPieces();
    this.surfaceArea = this.calculateAreaOfPieceFromMass() * this.numPieces;
    this.iceVolume = this.calculateVolume();
  }

  /*
   * Calculates the number of individual ice pieces of this block. An unbroken
   * IceCube will have only 1 piece. An ice block broken the maximum number of
   * times (5) will have 1,024 pieces.
   */
  this.calculateNumPieces = function() {
    var length = Math.pow(2, this.numDivisions); // The number of pieces along one axis
    return length * length * length;
  }

  /*
   * Calculates and returns the surface area for the entirety of this ice block.
   * Note more divisions = more surface area.
   */
  this.calculateSurfaceArea = function() {
    var volumeOfOneIcePiece = this.calculateVolume() / this.numPieces;
    var surfAreaOfOneIcePiece = 6 * Math.pow(volumeOfOneIcePiece, 2 / 3);
    return surfAreaOfOneIcePiece * this.numPieces;
  }

  /*
   * Calculates and returns the volume of this ice block. All pieces are included,
   * so both ice blocks will have the same volume regardless of the number of
   * divisions.
   */
  this.calculateVolume = function() {
    return Math.pow(this.edgeLength, 3) * this.numPieces;
  }

  /*
   * Finds the length of one edge of a cube by first calculating the surface area
   * of that cube.
   */
  this.calculateEdgeLength = function() {
    var surfaceAreaOfOneIcePiece = this.calculateAreaOfPieceFromMass();
    return sqrt(surfaceAreaOfOneIcePiece / 6);
  }

  /*
   * Determines the surface area of ONE of this IceCube's pieces using this
   * IceCube's total mass.
   */
  this.calculateAreaOfPieceFromMass = function() {
    if (this.iceMass == 0) {
      return 0;
    }
    return 6 * Math.pow(this.iceMass / (this.numPieces * ICE_DENSITY), 2 / 3);
  }
}

/***************** Other functions ******************/

/* Initializes the canvases of both ice cubes. Necessary for updating
 * the cursor properly as the user hovers over the ice cubes' respective
 * regions.
 */
function iceCubeCanvasSetup() {
  brokenExp.ice.initializeIceCanvas(BROKEN_ICE_DIV_ID);
  unbrokenExp.ice.initializeIceCanvas(UNBROKEN_ICE_DIV_ID);
}
