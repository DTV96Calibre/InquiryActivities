/* File: Beaker.js
 * Dependencies: snowMelt.js
 * 
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/*
 * This class encapsulates the behavior of both beakers rendered in the lower-left
 * quadrant of the screen. The beakers have animations that show blocks of ice
 * dissolving over a short period of time.
 */
function Beaker() {
  /* Class attributes */
  this.buffer = null;

  // The size of the buffer (in pixels)
  this.xLength;
  this.yLength;

  // Colors
  this.bottomColor = '#ebedef';
  this.topColor = '#d6dbdf';
  this.markingColor = '#edbb99';

  // Dimensions
  this.beakerWidth;
  this.beakerHeight;
  this.beakerThickness;
  this.beakerRoundedCornerDegree;
  this.beakerBeginPosX;
  this.beakerBeginPosY;
  this.btwMarkingsDistance;
  this.beakerMarkingsPosX;
  this.beakerMarkingsPosY;
  this.beakerMarkingsWidth;
  this.beakerMarkingsHeight;

  // Misc.
  this.numMarkings = 4;

  /*
   * Draws this beaker. All components are drawn w.r.t. xLength to maintain ratio.
   */
  this.display = function() {
  	// Clear the buffer
  	this.buffer.background(255, 255, 255);

    /* Draw the bottom of the beaker */
    this.buffer.noStroke();
  	this.buffer.fill(this.bottomColor);

    // Ref: Top-left xPos/yPos, width, height, degrees of 4 rounded corners
    this.buffer.rect(this.beakerBeginPosX, this.beakerBeginPosY, this.beakerWidth, 
      this.beakerHeight, 0, 0, this.beakerRoundedCornerDegree, this.beakerRoundedCornerDegree);

    /* Draw the top of the beaker ("3D effect" ... kinda) */
    this.buffer.stroke(this.bottomColor);
    this.buffer.strokeWeight(this.beakerThickness);
    this.buffer.fill(this.topColor);

    // Ref: Center xPos/yPos, width, height
  	this.buffer.ellipse(this.beakerBeginPosX + this.beakerWidth / 2, this.beakerBeginPosY,
  		this.beakerWidth, this.beakerHeight / 3);

    /* Draw red measurement markings on side of beaker */
    this.buffer.noFill();
    this.buffer.stroke(this.markingColor);
    this.buffer.strokeWeight(3);

    for (var i = 0; i < this.numMarkings; i += 1) {
      this.buffer.arc(this.beakerMarkingsPosX, this.beakerMarkingsPosY + this.btwMarkingsDistance * i, 
        this.beakerMarkingsWidth, this.beakerMarkingsHeight, PI / 2, PI);
    }
  }

  /*
   * Initializes this beaker's graphical buffer.
   * @param x: The width in pixels of the buffer.
   * @param y: The height in pixels of the buffer.
   * @return The newly created buffer.
   */
  this.initializeBuffer = function(x, y) {
    this.buffer = createGraphics(x, y);
    this.xLength = x;
    this.yLength = y;
  }

  /*
   * Resizes the beaker. Called whenever the window is resized.
   */
  this.resize = function() {
  	this.xLength = windowWidth / 4;
  	this.yLength = windowHeight / 2;
    this.setDimensions();
  	this.buffer._renderer.resize(this.xLength, this.yLength);
  }

  /*
   * Sets the dimensions of the beaker drawing (both when the beaker is first 
   * instantiated as well as whenever the window is resized).
   */
  this.setDimensions = function() {
    // General
    this.beakerWidth = this.xLength * 0.6;
    this.beakerHeight = this.xLength * 0.6;
    this.beakerThickness = this.beakerWidth / 30;
    this.beakerRoundedCornerDegree = this.beakerWidth / 3;
    this.beakerBeginPosX = this.xLength / 2 - this.beakerWidth / 2;
    this.beakerBeginPosY = this.xLength / 4;

    // Red markings on the side of the beaker
    this.btwMarkingsDistance = this.beakerHeight / (this.numMarkings + 2);
    this.beakerMarkingsPosX = this.xLength / 2 - this.beakerWidth / 2.53;
    this.beakerMarkingsPosY = this.beakerBeginPosY + this.beakerHeight / 6;
    this.beakerMarkingsWidth = this.beakerWidth / 5;
    this.beakerMarkingsHeight = this.beakerHeight / 10;
  }
}

/***************** Other functions ******************/

/*
 * Performs the necessary steps to initialize a new pair of beakers.
 */
function beakerSetup() {
	var xLength = windowWidth / 4;
	var yLength = windowHeight / 2;

  unbrokenExpBeaker.setDimensions();
  brokenExpBeaker.setDimensions();

	unbrokenExpBeaker.initializeBuffer(xLength, yLength);
	brokenExpBeaker.initializeBuffer(xLength, yLength);
}