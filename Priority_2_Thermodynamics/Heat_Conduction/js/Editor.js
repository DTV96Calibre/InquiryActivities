var joints = [];
var pot;
var arm;
var POT_H_OFFSET = 300;
var diameterSlider;

// Intro scene constructor function
function Editor(){
    // Member variables
    this.crosshair_pos = [0, 0];

    this.enter = function() {
      print("Entered editor");
    }

    this.setup = function() {
      diameterSlider = createSlider(10, 100, 50);

      fill(51);
      noStroke();
      pot = new Pot({x:windowWidth-POT_H_OFFSET, y:windowHeight/2}, 51);
      arm = new Arm([100, 100]);

      joints.push(new Joint(100, null, pot.anchorPoint));

      // Tell sceneManager setup is finished before resizing canvas
      this.sceneManager.scene.setupExecuted = true;
      this.windowResized(); //NOTE: Requires setupExecuted override above to prevent infinite recursion
      //demo1();
      print("offset:", 700 - pot.pos.x);
    }

    this.draw = function() {
      //background(86, 47, 14);
      clear();
      fill(51);
      joints[0].draw();
      pot.draw();
      fill(51, 51, 51, 127);
      this.crosshair_pos = [mouseX, mouseY];
      ellipse(this.crosshair_pos[0], pot.anchorPoint.y, diameterSlider.value());

      arm.setPos([mouseX, mouseY]);
      arm.draw();
      //print(cos(0.7853981633974483 + HALF_PI));
    }

    this.windowResized = function() {
      var HEIGHT_OF_SLIDER = 25;
      //diameterSlider.style('height', '25');
      pot.pos.x = windowWidth-POT_H_OFFSET;
      resizeCanvas(windowWidth, windowHeight-HEIGHT_OF_SLIDER);
      print("Resized canvas");
    }

    this.mouseClicked = function() {
      if (mouseY < 200) {
        var radius = diameterSlider.value();
        insertJoint(mouseX, pot.anchorPoint.y, radius);
        print(joints);
      }
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
