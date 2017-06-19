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
    this.anchorPointDiameter = 100;
    // Calculate position of anchorpoint relative to pot pos
    this.anchorPoint = {x:0, y:0};
    this.anchorPoint.y = pos.y - this.potHeight / 2 + this.anchorPointDiameter / 2;
    this.anchorPoint.x = pos.x - this.potWidth / 2;
  }

  draw(){
  	noStroke();
  	strokeWeight(3);
    fill(this.metalColor);
  	rect(369,200,238,246); // Pot body
  	ellipse(this.anchorPoint.x,this.anchorPoint.y, this.anchorPointDiameter); // Handle joints
    fill(255);
    rect(375, 216, 206, 214);
  }

  getHandleAnchorPoint(){
    return this.handleAnchorPoint;
  }
  setPosRelativeToHandle(pos){
  }
}
