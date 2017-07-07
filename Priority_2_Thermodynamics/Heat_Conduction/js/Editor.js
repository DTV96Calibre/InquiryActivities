var joints = [];
var pot;
var POT_H_OFFSET = 300;
var diameterSlider;

// Intro scene constructor function
function Editor()
{
    this.enter = function() {
      print("Entered editor");
    }
    this.setup = function() {
      diameterSlider = createSlider(10, 100, 50);

      fill(51);
      noStroke();
      pot = new Pot({x:windowWidth-POT_H_OFFSET, y:windowHeight/2}, 51);

      joints.push(new Joint(100, null, pot.anchorPoint));

      //this.windowResized(); TODO: This causes stack call overflow
      //demo1();
      print("offset:", 700 - pot.pos.x);
    }

    this.draw = function() {
      clear();
      //print("drawing");
      fill(51);
      joints[0].draw();
      pot.draw();
      //print(cos(0.7853981633974483 + HALF_PI));
    }

    this.mouseClicked = function() {
      var radius = diameterSlider.value();
      insertJoint(mouseX, pot.anchorPoint.y, radius);
      print(joints);
    }
    this.windowResized = function() {
      var HEIGHT_OF_SLIDER = 25;
      //diameterSlider.style('height', '25');
      pot.pos.x = windowWidth-POT_H_OFFSET;
      resizeCanvas(windowWidth, windowHeight-HEIGHT_OF_SLIDER);
      print("Resized canvas");
    }
}

function demo1() {
  insertJoint(200, 700, 10);
  insertJoint(200, 100, 50);
  insertJoint(600, 300, 40);
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
/* Recursively calculates temperature of each node in the pipe chain.
 * @param currentJoint: A joint whose temperature is already known.
 */
function heatTransferTraverse(currentJoint){
  if (!currentJoint.next){
    return
  }
  var length = getDistance(currentJoint.pos, currentJoint.next.pos);
  currentJoint.next.temp = getNewTemp(currentJoint.radius*2, currentJoint.next.radius*2, length, currentJoint.temp);
  heatTransferTraverse(currentJoint.next);
}

function getNewTemp(d1, d2, length, t1){
  return t1 - t1/10;
}
