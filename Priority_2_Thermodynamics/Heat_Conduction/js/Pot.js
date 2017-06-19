var METAL_COLOR = 52;
var INSIDE_COLOR = 128;
var WATER_COLOR = 'rgba(63, 191, 189, 0.62)';

class Pot{
  constructor(pos){
    this.pos = pos;
    this.metalColor = METAL_COLOR;
    this.insideColor = INSIDE_COLOR;
    this.waterColor = WATER_COLOR;
    this.potHeight = 246;
    this.potWidth = 238;
    this.potThickness = 20;
    this.anchorPointDiameter = 100;

    this.waterLevelFromTop = 100;
    // Calculate position of anchorpoint relative to pot pos
    this.anchorPoint = {x:0, y:0};
    this.anchorPoint.y = pos.y + this.anchorPointDiameter / 2;
    this.anchorPoint.x = pos.x;
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
  }

  getHandleAnchorPoint(){
    return this.handleAnchorPoint;
  }
  setPosRelativeToHandle(pos){
  }
}
