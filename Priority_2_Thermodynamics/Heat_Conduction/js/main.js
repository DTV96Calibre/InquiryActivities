var joints = [];
var pot;

function setup() {
  createCanvas(700, 1000);
  print("initialized");
  fill(51);
  noStroke();
  demo1();
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
  insertJoint(mouseX, mouseY, 50);
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
  pot = new Pot({x:700, y:900}, 51);
  joints.push(new Joint(100, null, {x:700, y:900}));
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
