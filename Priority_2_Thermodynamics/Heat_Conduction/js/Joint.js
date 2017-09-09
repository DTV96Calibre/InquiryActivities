/*
 * File: Joint.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var ROOT_TEMP = 100; // 100C, temp of boiling water
var KW_CMK = 0.00043; // kW/cm-K
var ENERGY_IN_KJS = 0.001; // TODO: Clarify this

/**
 * This class represents the joints that link segments of the pot handle.
 */
class Joint {
  /**
   * Constructor for a Joint object
   * @param  {int} radius: The radius in pixels of this Joint
   * @param  {prev} prev: The previous Joint linked to this one
   * @param  {next} next: The next Joint linked to this one
   * @return none
   */
  constructor(radius, prev, pos){
    this.radius = radius;
    this.prev = prev;
    this.pos = pos; // NOTE: This is relative to the the global pot.anchorPoint object of form {x:_, y:_}
    this.next = null; // Stores the next joint object if it exists
    this.isRoot = false;
  }

  /**
   * Draws the joint as well as the metal segments connecting them. This 
   * function is called once per frame while the Editor scene is active.
   * @return none
   */
  draw() {
    ellipse(this.pos.x + pot.anchorPoint.x, this.pos.y + pot.anchorPoint.y, this.radius);
    if (this.next) {
      this.drawSegment();
      this.next.draw();
    }
  }

  /**
   * Returns the absolute position of this Joint onscreen.
   * @return {array} an x and y coordinate
   */
  getGlobalPos() {
    return {x:this.pos.x + pot.anchorPoint.x, y:this.pos.y + pot.anchorPoint.y};
  }

  /**
   * Calculates the distance between this Joint and the preceding Joint.
   * @return {int} the distance in pixels
   */
  findDistanceFromPrev() {
    if (this.isRoot){
      return 0;
    }
    return sqrt(sq(this.pos.x - this.prev.pos.x) + sq(this.pos.y - this.prev.pos.y));
  }

  /**
   * Returns the temperature of the pot handle at this Joint.
   * @return {int} a temperature in Celsius
   */
  getTemp() {
    if (this.isRoot){
      return ROOT_TEMP;
    } else {
      var currentArea = PI * sq(this.radius);
      return this.prev.getTemp() - (ENERGY_IN_KJS * this.findDistanceFromPrev() 
        * currentArea/KW_CMK);
    }
  }

  /**
   * Draws the metal segment connecting this Joint to the next one.
   * @return none
   */
  drawSegment() {
    // Avoid drawing another segment if this is the last Joint
    if (!this.next) return;

    var pos1 = this.pos;
    var rad1 = this.radius;
    var pos2 = this.next.pos;
    var rad2 = this.next.radius;

    // Angle, relative to x axis, of normal that points from pos1 to pos2
    var normal = atan((pos2.y - pos1.y) / (pos2.x - pos1. x));
    var normalPlus90 = normal + HALF_PI;
    var normalMinus90 = normal - HALF_PI;
    if (normalPlus90 > 2 * PI) {
      normalPlus90 -= 2 * PI;
    }
    if (normalMinus90 < 0) {
      normalMinus90 += 2 * PI;
    }

    var p1 = Joint.pointFromCircle(rad1, normalMinus90);
    var p2 = Joint.pointFromCircle(rad2, normalMinus90);
    var p4 = Joint.pointFromCircle(rad1, normalPlus90);
    var p3 = Joint.pointFromCircle(rad2, normalPlus90);

    var pos1xAbsolute = pos1.x + pot.anchorPoint.x;
    var pos1yAbsolute = pos1.y + pot.anchorPoint.y;
    var pos2xAbsolute = pos2.x + pot.anchorPoint.x;
    var pos2yAbsolute = pos2.y + pot.anchorPoint.y;

    p1.x += pos1xAbsolute;
    p1.y += pos1yAbsolute;
    p2.x += pos2xAbsolute;
    p2.y += pos2yAbsolute;
    p4.x += pos1xAbsolute;
    p4.y += pos1yAbsolute;
    p3.x += pos2xAbsolute;
    p3.y += pos2yAbsolute;

    quad(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y); // Draw quadrilateral
  }

  /**
   * Calculates the point of a circle at a given angle.
   * @param  {int} radius: The radius in pixels of a circle
   * @param  {int} angle: The angle in degrees
   * @return {array} A 2D point with x, y coordinates at the specified angle
   */
  static pointFromCircle(radius, angle) {
    var x = cos(angle) * radius / 2;
    var y = sin(angle) * radius / 2;
    return {x: x, y: y};
  }
}
