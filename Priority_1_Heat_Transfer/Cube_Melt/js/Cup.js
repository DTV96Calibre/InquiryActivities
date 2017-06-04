/* File: Cup.js
 * Dependencies: snowMelt.js
 * 
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/*
 * This class encapsulates the behavior of both cups rendered in the lower-left
 * quadrant of the screen. The cups have animations that show blocks of ice
 * dissolving over a short period of time.
 */
function Cup() {

  // Class attributes

  // The size of the buffer (in pixels)
  this.xLength;
  this.yLength;

  // The offset from the left (x) and top (y) of the screen (in pixels)
  this.xOffset;
  this.yOffset;

  /* Colors */
  this.cupColor = '#ebedef';
  this.borderColor = '#c4c1c0';

  /* Dimensions */
  this.cupWidth;
  this.cupHeight;
  this.cupThickness;
  this.cupRoundedCornerDegree;
  this.cupBeginPosX;
  this.cupBeginPosY;
  this.cupHandleWidth;
  this.cupHandleHeight;

  /*
   * Draws this cup. All components are drawn w.r.t. xLength to maintain ratio.
   */
  this.display = function() {
    // Set graphical attributes
    strokeWeight(this.cupThickness);
    stroke(this.borderColor);
    fill(this.cupColor);

    /* Draw the bottom of the cup */
    // Ref: Top-left xPos/yPos, width, height, degrees of 4 rounded corners
    rect(this.cupBeginPosX + this.xOffset, this.cupBeginPosY + this.yOffset, 
      this.cupWidth, this.cupHeight, 0, 0, this.cupRoundedCornerDegree, 
      this.cupRoundedCornerDegree);

    /* Draw the top of the cup */
    // Ref: Center xPos/yPos, width, height
  	ellipse(this.xOffset + this.cupBeginPosX + this.cupWidth / 2, 
      this.yOffset + this.cupBeginPosY, this.cupWidth, this.cupHeight / 27);

    /* Draw the cup's handle */
    // Ref: Ellipse x/y coords, width, height, start/stop angles, mode
    arc(this.xOffset + this.xLength / 2 - this.cupWidth / 2 + this.cupThickness, 
      this.yOffset + this.cupBeginPosY + this.cupHeight / 2.2, this.cupHandleWidth, 
      this.cupHandleHeight, PI / 2, -(PI / 2), OPEN);
    fill('white');
    arc(this.xOffset + this.xLength / 2 - this.cupWidth / 2, this.yOffset + 
      this.cupBeginPosY + this.cupHeight / 2.2, this.cupHandleWidth / 2, 
      this.cupHandleHeight / 2, PI / 2, -(PI / 2), CHORD);
  }

  /*
   * Initializes this cup's dimensions on the canvas.
   * @param _xLength: The width in pixels of the buffer.
   * @param _yLength: The height in pixels of the buffer.
   * @param _xOffset: The distance from the left of the screen to draw this buffer.
   * @param _yOffset: The distance from the top of the screen to draw this buffer.
   */
  this.initializeBuffer = function(_xLength, _yLength, _xOffset, _yOffset) {
    this.xLength = _xLength;
    this.yLength = _yLength;
    this.xOffset = _xOffset;
    this.yOffset = _yOffset;
  }

  /*
   * Resizes the cup. Called whenever the window is resized.
   */
  this.resize = function() {
  	this.xLength = windowWidth / 4;
  	this.yLength = windowHeight / 2;
    this.yOffset = windowHeight / 2;
    this.setDimensions();
  }

  /*
   * Sets the dimensions of the cup's drawing (both when the cup is first 
   * instantiated as well as whenever the window is resized).
   */
  this.setDimensions = function() {
    this.cupWidth = this.xLength * 0.6;
    this.cupHeight = this.xLength * 0.8;
    this.cupThickness = this.cupWidth / 150;
    this.cupRoundedCornerDegree = this.cupWidth / 5;
    this.cupBeginPosX = this.xLength / 2 - this.cupWidth / 2;
    this.cupBeginPosY = this.yLength / 2 - this.cupHeight / 2;
    this.cupHandleWidth = this.cupWidth / 2.1;
    this.cupHandleHeight = this.cupHeight / 2.7;
  }
}

/***************** Other functions ******************/

/*
 * Performs the necessary steps to initialize a new pair of cups.
 */
function cupSetup() {
	var xLength = windowWidth / 4;
	var yLength = windowHeight / 2;
  var yOffset = windowHeight / 2;

  unbrokenIceCup.setDimensions();
  brokenIceCup.setDimensions();

	unbrokenIceCup.initializeBuffer(xLength, yLength, 0, yOffset);
	brokenIceCup.initializeBuffer(xLength, yLength, windowWidth / 4, yOffset);
}