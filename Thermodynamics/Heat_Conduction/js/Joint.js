/*
 * File: Joint.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var ROOT_TEMP = 100; // 100C, temp of boiling water
var KW_CMK = 0.00043; // kW/cm-K
var ENERGY_IN_KJS = 0.0008; // TODO: Clarify this
var ROOM_TEMP = 23; // In Celsius (~ 73 degrees Fahrenheit)

/**
 * This class represents the joints that link segments of the pot handle.
 */
class Joint {
  /**
   * Constructor for a Joint object
   * @param {int} radius: The radius in pixels of this Joint
   * @param {Joint} prev: The previous Joint linked to this one
   * @param {(int, int)} pos: The x, y coordinates relative to pot.anchorPoint
   * @param {(float, float)} ratio: The relative ratio of the placement within the valid zone
   * @return none
   */
  constructor(radius, prev, pos, ratio) {
    this.rawRadius = radius; // From 1 to 100
    this.radius = this.rawRadius * Pot.ANCHOR_POINT_SCALE * windowHeight * Pot.HEIGHT_SCALE / 100;
    this.prev = prev;
    this.pos = pos; // NOTE: This is relative to the the global pot.anchorPoint object of form {x:_, y:_}
    this.ratio = ratio;
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

  /*
   * Resizes the joint's radius and position relative to the valid zone (green
   * highlighted area where the pot handle can be built).
   * @param {int} validZoneWidth: The width (in pixels) of the valid zone
   * @param {int} validZoneHeight: The height (in pixels) of the valid zone
   */
  resize(validZoneWidth, validZoneHeight) {
    this.radius = this.rawRadius * Pot.ANCHOR_POINT_SCALE * windowHeight * Pot.HEIGHT_SCALE / 100;
    this.pos.x = this.ratio.x * validZoneWidth;
    this.pos.y = this.ratio.y * validZoneHeight;
  }

  /**
   * Returns the absolute position of this Joint onscreen.
   * @return {array} an x and y coordinate
   */
  getGlobalPos() {
    return {x: this.pos.x + pot.anchorPoint.x, y: this.pos.y + pot.anchorPoint.y};
  }

  /**
   * Calculates the distance between this Joint and the preceding Joint.
   * @return {int} the distance in pixels
   */
  findDistanceFromPrev() {
    if (this.isRoot) {
      return 0;
    }
    return sqrt(sq(this.pos.x - this.prev.pos.x) + sq(this.pos.y - this.prev.pos.y));
  }

  /**
   * Returns the sin of the angle formed by this joint and the base of the pot.
   * @return {int} sin (angle)
   */
  findSineOfAngle() {
    var adjacent = this.pos.x - Pot.WIDTH / 2;
    var opposite = this.pos.y;
    var hypotenuse = Math.sqrt(Math.pow(adjacent, 2) + Math.pow(opposite, 2));
    // Find sine of angle formed by this triangle
    return Math.sin(Math.abs(opposite / hypotenuse));
  }

  /**
   * Returns the torque of applying a force to this joint as the cat attempts
   * to pick up the pot.
   * @return {int} the torque in Newton-meters
   */
  findTorque() {
    // SUBTRACT 1/2 of pot width because joints' positions are negative
    var r = Math.abs(this.pos.x - Pot.WIDTH / 2) / 100;
    var F = Pot.WEIGHT_OF_WATER * 9.81;
    var sinTheta = this.findSineOfAngle();
    var torque = r * F * sinTheta;
    return torque;
  }

  /**
   * Returns the temperature of the pot handle at this Joint.
   * @return {int} a temperature in Celsius
   */
  getTemp() {
    if (this.isRoot) {
      return ROOT_TEMP;
    } else {
      var currentArea = PI * sq(this.radius / 100);
      var heatLoss = ENERGY_IN_KJS * this.findDistanceFromPrev() * currentArea / KW_CMK;
      var newTemp = this.prev.getTemp() - heatLoss;
      // Prevent pot temperature from becoming colder than the environment
      return max(newTemp, ROOM_TEMP);
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
