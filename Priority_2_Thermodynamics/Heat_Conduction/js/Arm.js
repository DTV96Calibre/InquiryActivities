/*
 * File: Arm.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

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
    this.shoulderOffset = [-100, -100]; // shoulder is drawn to the upper left
    this.handDiameter = 100;
    this.handColor = 63;
    this.armThickness = 75;
    this.armColor = 127;
  }

  /**
   * Sets the pos attribute.
   * @param none
   */
  setPos(pos) {
    this.pos = pos;
  }

  /**
   * Draws the arm. This function is called once per frame while the arm is
   * onscreen.
   * @return none
   */
  draw() {
    // Move arm toward destination
    ease(this.pos, this.destPos);

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
}

/**
 * Updates the position (this.pos) so that the arm approaches the destination
 * position as defined by an easing algorithm.
 * @param {array} pos: An initial horizontal and vertical position
 * @param {array} destPos: A final horizontal and vertical position
 * @return none
 */
function ease(pos, destPos){
  // TODO: Finish
  /*var easingFactor = 100;
  var diffX = destPos.x - pos.x;
  var diffY = destPos.y - pos.y;
  pos.x += diffX / easingFactor;
  pos.y += diffY / easingFactor;
  */
}
