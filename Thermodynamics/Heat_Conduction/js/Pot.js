/*
 * File: Pot.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var METAL_COLOR = 52;
var INSIDE_COLOR = 128;
var WATER_COLOR = 'rgba(63, 191, 189, 0.62)';

class Pot{
  constructor(pos){
    this.pos = pos;
    this.metalColor = METAL_COLOR;
    this.insideColor = INSIDE_COLOR;
    this.waterColor = WATER_COLOR;
    this.potHeight = 0.34 * windowHeight;
    this.potWidth = this.potHeight;
    this.potThickness = 20;
    this.anchorPointDiameter = 75;//this.potHeight / 3.5;
    this.steam = new Steam();

    this.waterLevelFromTop = 0.12 * windowHeight;
    // Calculate position of anchorpoint relative to pot pos
    this.anchorPoint = {x:0, y:0};
    this.locateAnchorPoint();
  }

  draw(){
  	noStroke();
  	strokeWeight(3);
    fill(this.metalColor);
  	rect(this.pos.x,this.pos.y,this.potWidth,this.potHeight); // Pot body
  	ellipse(this.anchorPoint.x,this.anchorPoint.y, this.anchorPointDiameter); // Handle joints
    fill(this.insideColor);
    rect(this.pos.x+this.potThickness, this.pos.y, this.potWidth - this.potThickness*2, this.potHeight-this.potThickness); // Inside of pot
    fill(this.waterColor);
    rect(this.pos.x+this.potThickness, this.pos.y+this.waterLevelFromTop, this.potWidth - this.potThickness*2, this.potHeight-this.potThickness-this.waterLevelFromTop); // Water in pot
    // this.steam.updateOrigin();
    // this.steam.update();
  }

  getHandleAnchorPoint(){
    return this.anchorPoint;
  }

  locateAnchorPoint(){
    this.anchorPoint.y = this.pos.y + this.anchorPointDiameter / 2;
    this.anchorPoint.x = this.pos.x;
  }
  setPosRelativeToHandle(pos){
  }
}
