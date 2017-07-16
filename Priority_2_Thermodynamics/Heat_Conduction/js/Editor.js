var joints = [];
var pot;
var arm;
var POT_H_OFFSET = 300;
var diameterSlider;

// A box in which joints can be placed
// x1 must be less than x2, y1 must be less than y2
var validZone = {x1:100, x2:200, y1:100, y2:200};

// Intro scene constructor function
function Editor(){
    // Member variables
    this.crosshair_pos = [0, 0];
    // Keep track of whether or not user can place joints or select joints
    this.mode = 'placing'; // modes: placing, selecting

    this.enter = function() {
      print("Entered editor");
    }

    this.setup = function() {
      // Setup DOM input elements
      diameterSlider = createSlider(10, 100, 50);
      finishButton = createButton('Finalize');
      // this is not bound to finishHandle here so manually bind it
      finishButton.mouseClicked(this.finishHandle.bind(this));
      resetButton = createButton('Reset Handle');
      resetButton.mouseClicked(this.resetHandle);

      // Initialize scene elements
      fill(51);
      noStroke();
      pot = new Pot({x:windowWidth-POT_H_OFFSET, y:windowHeight/2}, 51);
      arm = new Arm({x:100, y:100});

      joints.push(new Joint(pot.anchorPointDiameter, null, {x:0, y:0}));

      // Tell sceneManager setup is finished before resizing canvas
      this.sceneManager.scene.setupExecuted = true;
      this.windowResized(); //NOTE: Requires setupExecuted override above to prevent infinite recursion
      //demo1();
      print("offset:", 700 - pot.pos.x);
    }

    this.draw = function() {
      //background(86, 47, 14);
      clear();

      // draw valid zone
      fill(63, 191, 108, 127);
      quad(validZone.x1, validZone.y1, validZone.x1, validZone.y2, validZone.x2, validZone.y2, validZone.x2, validZone.y1);
      fill(51);

      joints[0].draw();
      pot.draw();

      if (inValidZone(mouseX, mouseY)){
        drawCrosshair()
      }

      //arm.setPos([mouseX, mouseY]);
      arm.draw();
      //print(cos(0.7853981633974483 + HALF_PI));
      highlightNearestJoint();
    }

    this.windowResized = function() {
      var HEIGHT_OF_SLIDER = 25;
      //diameterSlider.style('height', '25');
      pot.pos.x = windowWidth/2;
      finishButton.position(pot.pos.x, pot.pos.y);
      resetButton.position(pot.pos.x, pot.pos.y + 50);
      //pot.pos.x = windowWidth-POT_H_OFFSET;
      pot.locateAnchorPoint();

      // define the valid zone
      validZone.x2 = pot.anchorPoint.x;
      validZone.x1 = validZone.x2 - pot.potWidth;
      validZone.y2 = pot.anchorPoint.y + pot.anchorPointDiameter/2;
      validZone.y1 = validZone.y2 - pot.anchorPointDiameter;

      resizeCanvas(windowWidth, windowHeight-HEIGHT_OF_SLIDER);
      print("Resized canvas");
    }

    this.mouseClicked = function() {
      if (inValidZone(mouseX, mouseY) && this.mode == 'placing') {
        print("placing");
        var radius = diameterSlider.value();
        insertJoint(mouseX, mouseY, radius);
        print(joints);
      }
      if (inValidZone(mouseX, mouseY) && this.mode == 'selecting') {
        print("selecting");
        print(getNearestJoint({x:mouseX, y:mouseY}));
        this.selectNearestJoint();
      }
    }

    this.selectNearestJoint = function() {
      var joint = getNearestJoint({x:mouseX, y:mouseY});
      var jointPos = joint.getGlobalPos();
      arm.pos.x = jointPos.x;
      arm.pos.y = jointPos.y - 100;
      print("arm is now at " + arm.pos);
    }

    this.grabPot = function() {
      var randB = random([true, false]);
      if (randB) {
        this.sceneManager.showScene(Win);
      }
      else {
        this.sceneManager.showScene(Lose);
      }
      return;
    }

    this.finishHandle = function() {
      this.mode = 'selecting';
      print("handle finished");
    }

    this.resetHandle = function(){
      joints = [];
      joints.push(new Joint(pot.anchorPointDiameter, null, {x:0, y:0}));
    }
}
