var joints = [];
var pot;
var POT_H_OFFSET = 300;
var diameterSlider;

function setup() {
  createCanvas(displayWidth, displayHeight);

  print("initialized");

  diameterSlider = createSlider(10, 100, 50);

  fill(51);
  noStroke();
  pot = new Pot({x:windowWidth-POT_H_OFFSET, y:windowHeight/2}, 51);

  joints.push(new Joint(100, null, pot.anchorPoint));

  windowResized();
  //demo1();
  print("offset:", 700 - pot.pos.x);
}

function draw() {
  clear();
  //print("drawing");
  fill(51);
  joints[0].draw();
  pot.draw();
  //print(cos(0.7853981633974483 + HALF_PI));
}

function mouseClicked() {
  var radius = diameterSlider.value();
  insertJoint(mouseX, pot.anchorPoint.y, radius);
  print(joints);
}

/* Given a tap location and radius of new joint, creates and links
 * a new joint to the pipe. Assumes pipe is already populated with
 * at least one joint!
 * @param x: x coordinate of new joint
 * @param y: y coordinate of new joint
 * @param radius: radius of new joint
 */
function insertJoint(x, y, radius) {
  joints.push(new Joint(radius, joints[joints.length-1], {x:x, y:y}));
  joints[joints.length-2].next = joints[joints.length-1];
}


function demo1() {

  insertJoint(200, 700, 10);
  insertJoint(200, 100, 50);
  insertJoint(600, 300, 40);
  // j1 = new Joint(100, null, {x:700, y:900});
  // j2 = new Joint(10, j1, {x:200, y:700});
  // j3 = new Joint(50, j2, {x:200, y:100});
  // j4 = new Joint(40, j3, {x:600, y:300});
  // j5 = new Joint(80, j4, {x:500, y:600});
  // j6 = new Joint(20, j5, {x:300, y:300});

}

function windowResized() {
  var HEIGHT_OF_SLIDER = 25;
  //diameterSlider.style('height', '25');
  pot.pos.x = windowWidth-POT_H_OFFSET;
  resizeCanvas(windowWidth, windowHeight-HEIGHT_OF_SLIDER);
  print("Resized canvas");
}
