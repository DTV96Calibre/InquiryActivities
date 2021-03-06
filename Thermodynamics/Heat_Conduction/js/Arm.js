/*
 * File: Arm.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var ARM_SIZE_SCALE = 0.092; // times windowWidth
var ARM_TORQUE = 12; // Units: N*m

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
    this.img = images['arm'];
    this.destPos = pos;
    this.resize();
  }

  /**
   * Sets the destination position of this Arm so that it will begin to move.
   */
  setPos(newPos) {
    this.destPos = {x: newPos.x - this.width, y: newPos.y - this.height / 2};
  }

  /**
   * Returns the torque of applying a force to this joint as the cat attempts
   * to pick up the pot.
   * @return {int} the torque in Newton-meters
   */
  findTorque() {
    // Cat has a constant torque. This is basically the strength of the cat
    return ARM_TORQUE;
  }

  /**
   * Draws the arm. This function is called once per frame while the arm is
   * onscreen.
   * @return none
   */
  draw() {
    this.ease(); // Move arm toward destination

    // Render image
    image(this.img, this.pos.x, this.pos.y, this.width, this.height);
  }

  /**
   * Resizes the arm; this function is called by the Editor scene whenever the
   * window is resized.
   * @return none
   */
  resize() {
    this.width = windowWidth * ARM_SIZE_SCALE;
    this.height = windowWidth * ARM_SIZE_SCALE * 1.25;
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
    this.pos.x += diffX / easingFactor;
    this.pos.y += diffY / easingFactor;
  }
}
