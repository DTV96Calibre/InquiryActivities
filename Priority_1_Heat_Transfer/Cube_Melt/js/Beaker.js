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
  this.buffer = null;

  /*
   * Initializes this beaker's graphical buffer.
   * @param x: The width in pixels of the buffer.
   * @param y: The height in pixels of the buffer.
   * @return The newly created buffer.
   */
  this.initializeBuffer = function(x, y) {
    this.buffer = createGraphics(x, y);
  }

  /*
   * Draws this beaker.
   */
  this.display = function() {
  	this.buffer.background(random(255), random(255), random(255));
  }
}

/***************** Other functions ******************/

/*
 * Performs the necessary steps to initialize a new pair of beakers.
 */
function beakerSetup() {
  unbrokenExpBeaker.initializeBuffer(windowWidth / 4, windowHeight / 2);
  brokenExpBeaker.initializeBuffer(windowWidth / 4, windowHeight / 2);
}