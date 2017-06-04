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
  
  this.buffer = null;

  // The size of the buffer (in pixels)
  this.xLength;
  this.yLength;

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
  	// Clear the buffer
  	this.buffer.background(255, 255, 255);

    // Set graphical attributes
    this.buffer.strokeWeight(this.cupThickness);
    this.buffer.stroke(this.borderColor);
    this.buffer.fill(this.cupColor);

    /* Draw the bottom of the cup */
    // Ref: Top-left xPos/yPos, width, height, degrees of 4 rounded corners
    this.buffer.rect(this.cupBeginPosX, this.cupBeginPosY, this.cupWidth, 
      this.cupHeight, 0, 0, this.cupRoundedCornerDegree, this.cupRoundedCornerDegree);

    /* Draw the top of the cup */
    // Ref: Center xPos/yPos, width, height
  	this.buffer.ellipse(this.cupBeginPosX + this.cupWidth / 2, this.cupBeginPosY,
  		this.cupWidth, 15);

    /* Draw the cup's handle */
    // Ref: Ellipse x/y coords, width, height, start/stop angles, mode
    this.buffer.arc(this.xLength / 2 - this.cupWidth / 2 + this.cupThickness, this.cupBeginPosY + this.cupHeight / 2.2, 
      this.cupHandleWidth, this.cupHandleHeight, PI / 2, -(PI / 2), OPEN);
    this.buffer.fill('white');
    this.buffer.arc(this.xLength / 2 - this.cupWidth / 2 , this.cupBeginPosY + this.cupHeight / 2.2, 
      this.cupHandleWidth / 2, this.cupHandleHeight / 2, PI / 2, -(PI / 2), CHORD);
  }

  /*
   * Initializes this cup's graphical buffer.
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
   * Resizes the cup. Called whenever the window is resized.
   */
  this.resize = function() {
  	this.xLength = windowWidth / 4;
  	this.yLength = windowHeight / 2;
    this.setDimensions();
  	this.buffer._renderer.resize(this.xLength, this.yLength);
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

  unbrokenIceCup.setDimensions();
  brokenIceCup.setDimensions();

	unbrokenIceCup.initializeBuffer(xLength, yLength);
	brokenIceCup.initializeBuffer(xLength, yLength);
}