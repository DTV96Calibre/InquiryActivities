class Joint{
  constructor(radius, prev, pos){
    this.radius = radius;
    this.prev = prev;
    this.pos = pos; //NOTE: This is relative to the the global pot.anchorPoint object of form {x:_, y:_}
    this.next = null;
  }
  draw(){
    ellipse(this.pos.x + pot.anchorPoint.x, this.pos.y + pot.anchorPoint.y, this.radius);
    if (this.next) {
      Joint.drawPipe(this.pos, this.radius, this.next.pos, this.next.radius);
      this.next.draw();
    }
  }
  getGlobalPos(){
    return {x:this.pos.x + pot.anchorPoint.x, y:this.pos.y + pot.anchorPoint.y};
  }
  static pointFromCircle(radius, angle) {
    var x = cos(angle)*radius/2;
    //print("x:"+x);
    //print("angle:"+angle);
    //print("cos(angle):"+cos(angle));
    var y = sin(angle)*radius/2;
    return {x: x, y: y};
  }

  static drawPipe(pos1, rad1, pos2, rad2){
    // angle, relative to x axis, of normal that points from pos1 to pos2
    var normal = atan((pos2.y - pos1.y) / (pos2.x - pos1. x));
    //print("normal:"+normal);
    var normalPlus90 = normal + HALF_PI;
    var normalMinus90 = normal - HALF_PI;
    if (normalPlus90 > 2*PI) {
      normalPlus90 -= 2*PI;
    }
    if (normalMinus90 < 0) {
      normalMinus90 += 2*PI;
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
    quad(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
  }
}
