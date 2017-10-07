/*
 * File: Arm.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var ARM_SIZE_SCALE = 0.065; // times windowWidth

/**
 * This class represents the arm (and hand) of the cat chef, who will pick up
 * the pot after it's been designed by the user.
 */
class Arm {
  /**
   * Constructor for an Arm object
   * @param  {array} pos: A horizontal and vertical position
   * @return none
   */
  constructor(pos) {
    this.pos = {x:0, y:0}; // array should be faster than object
    this.pos = pos;
    this.destPos = pos;
    this.handDiameter = windowWidth * ARM_SIZE_SCALE;
    this.shoulderOffset = [-1 * this.handDiameter, -1 * this.handDiameter]; // shoulder is drawn to the upper left
    this.handColor = 63;
    this.armThickness = this.handDiameter * 0.75;
    this.armColor = 127;
  }

  /**
   * Sets the destination position of this Arm so that it will begin to move.
   */
  setPos(newPos) {
    this.destPos = newPos;
  }

  /**
   * Draws the arm. This function is called once per frame while the arm is
   * onscreen.
   * @return none
   */
  draw() {
    this.ease(); // Move arm toward destination

    /* Draw arm */
    stroke(this.armColor);
    strokeWeight(this.armThickness);
    line(this.pos.x, this.pos.y, this.pos.x + this.shoulderOffset[0], 
      this.pos.y + this.shoulderOffset[1]);
    strokeWeight(1);
    noStroke();

    /* Draw hand */
    fill(this.handColor);
    ellipse(this.pos.x, this.pos.y, this.handDiameter);
  }

  /**
   * Resizes the arm; this function is called by the Editor scene whenever the
   * window is resized.
   * @return none
   */
  resize() {
    this.handDiameter = windowWidth * ARM_SIZE_SCALE;
    this.shoulderOffset = [-1 * this.handDiameter, -1 * this.handDiameter]; // shoulder is drawn to the upper left
    this.armThickness = this.handDiameter * 0.75;
  }

  /**
   * Updates the position (this.pos) so that the arm approaches the destination
   * position as defined by an easing algorithm.
   * @return none
   */
  ease() {
    var easingFactor = 10;
    var diffX = this.destPos.x - this.pos.x;
    var diffY = this.destPos.y - this.pos.y;
    print("pos x is ", this.pos.x, ". destpos x is " + this.destPos.x);
    this.pos.x += diffX / easingFactor;
    this.pos.y += diffY / easingFactor;
  }
}
