var j1;
var j2;

function setup() {
  createCanvas(700, 1000);
  print("initialized");
  fill(51);
  noStroke();
  demo1();
  j1.next = j2;
  j2.next = j3;
  j3.next = j4;
  j4.next = j5;
  j5.next = j6;
}

function draw() {
  //print("drawing");
  j1.draw();
  //print(cos(0.7853981633974483 + HALF_PI));
}

function demo1() {
  j1 = new Joint(100, null, {x:700, y:900});
  j2 = new Joint(10, j1, {x:200, y:700});
  j3 = new Joint(50, j2, {x:200, y:100});
  j4 = new Joint(40, j3, {x:600, y:300});
  j5 = new Joint(80, j4, {x:500, y:600});
  j6 = new Joint(20, j5, {x:300, y:300});
}
