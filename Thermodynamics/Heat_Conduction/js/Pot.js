/*
 * File: Pot.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

class Pot{
  constructor(pos) {
    /* Static constants */

    // Colors
    Pot.METAL_COLOR = 52;
    Pot.INSIDE_COLOR = 128;
    Pot.WATER_COLOR = 'rgba(63, 191, 189, 0.62)';

    // Constants for mathematical calculations
    Pot.QUARTS_WATER_IN_POT = 10;
    Pot.WEIGHT_1_QUART_WATER_IN_POUNDS = 2;
    Pot.WEIGHT_OF_WATER = Pot.QUARTS_WATER_IN_POT * Pot.WEIGHT_1_QUART_WATER_IN_POUNDS;
    Pot.WIDTH = 300; // Only used for calculating center of gravity

    // Graphical constants (for drawing the pot)
    Pot.X_OFFSET_SCALE = 0.55;    // times windowWidth
    Pot.Y_OFFSET_SCALE = 0.5;     // times windowHeight
    Pot.HEIGHT_SCALE = 0.34;      // times windowHeight
    Pot.THICKNESS_SCALE = 0.08;   // times this.potWidth
    Pot.ANCHOR_POINT_SCALE = 0.3; // times this.potHeight

    this.pos = pos;
    this.potHeight;
    this.potWidth;
    this.potThickness;
    this.anchorPointDiameter;
    this.steam = new Steam();
    this.hasWater = false;

    // Calculate position of anchorpoint relative to pot pos
    this.anchorPoint = {x:0, y:0};

    this.resize();
  }

  draw() {
    // Draw pot body
  	noStroke();
  	strokeWeight(3);
    fill(Pot.METAL_COLOR);
  	rect(this.pos.x, this.pos.y, this.potWidth, this.potHeight);

    // Draw handle joint
  	ellipse(this.anchorPoint.x, this.anchorPoint.y, this.anchorPointDiameter);

    // Draw inside of pot
    fill(Pot.INSIDE_COLOR);
    rect(this.pos.x + this.potThickness, this.pos.y, this.potWidth - 
      this.potThickness * 2, this.potHeight - this.potThickness);

    // Draw water inside pot
    if (this.hasWater) {
      fill(Pot.WATER_COLOR);
      rect(this.pos.x + this.potThickness, this.pos.y + this.waterLevelFromTop, 
        this.potWidth - this.potThickness * 2,
        this.potHeight - this.potThickness - this.waterLevelFromTop);
      fill(Pot.INSIDE_COLOR);
    }
  }

  resize() {
    this.potHeight = windowHeight * Pot.HEIGHT_SCALE;
    this.potWidth = this.potHeight;
    this.potThickness = this.potWidth * Pot.THICKNESS_SCALE;
    this.waterLevelFromTop = 0.05 * windowHeight;
    this.pos.x = windowWidth * Pot.X_OFFSET_SCALE;
    this.pos.y = windowHeight * Pot.Y_OFFSET_SCALE;
    this.anchorPointDiameter = this.potHeight * Pot.ANCHOR_POINT_SCALE;
    this.locateAnchorPoint();
  }

  getHandleAnchorPoint() {
    return this.anchorPoint;
  }

  locateAnchorPoint() {
    this.anchorPoint.y = this.pos.y + this.anchorPointDiameter / 2;
    this.anchorPoint.x = this.pos.x;
  }
}
