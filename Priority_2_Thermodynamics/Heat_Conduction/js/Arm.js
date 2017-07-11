class Arm{
  constructor(pos){
    this.pos = []; // array should be faster than object
    this.pos = pos;
    this.shoulderOffset = [-100, -100];
    this.handDiameter = 100;
    this.handColor = 63
    this.armThickness = 75;
    this.armColor = 127;
    print(this.pos + " is arm pos");
  }
  draw(){

    //draw arm
    stroke(this.armColor);
    strokeWeight(this.armThickness);
    line(this.pos[0], this.pos[1], this.pos[0]+this.shoulderOffset[0], this.pos[1]+this.shoulderOffset[1]);
    strokeWeight(1); //restore strokeWeight to default
    // the rest of the sketch uses no stroke so disable stroke before finishing
    noStroke();

    // draw hand
    fill(this.handColor);
    ellipse(this.pos[0], this.pos[1], this.handDiameter);

  }
  setPos(pos){
    this.pos = pos;
  }
}
