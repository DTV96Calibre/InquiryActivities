var joints = [];
var pot;
var arm;
var POT_H_OFFSET = 300;
var diameterSlider;

var STEEL_BURN_SKIN_TEMP = 50; // TODO: This is a placeholder value in C


// A box in which joints can be placed
// x1 must be less than x2, y1 must be less than y2
var validZone = {x1:100, x2:200, y1:100, y2:200};

// Intro scene constructor function
function Editor(){
    // Member variables
    this.crosshair_pos = [0, 0];
    // Keep track of whether or not user can place joints or select joints
    this.mode = 'placing'; // modes: placing, selecting
    this.selectedJoint = null;

    this.enter = function() {
      print("Entered editor");
    }

    this.setup = function() {
      // Setup DOM input elements
      diameterSlider = createSlider(10, 100, 50);
      finishButton = createButton('Finalize Handle');
      // 'this' is not bound to finishHandle here so manually bind it
      finishButton.mouseClicked(this.finishHandle.bind(this));
      resetButton = createButton('Reset Handle');
      resetButton.mouseClicked(this.resetHandle);

      // Initialize scene elements
      fill(51);
      noStroke();
      pot = new Pot({x:windowWidth-POT_H_OFFSET, y:windowHeight/2}, 51);
      arm = new Arm({x:100, y:100});

      // The first joint must be manually added as the insertJoint function assumes one already exists
      joints.push(new Joint(pot.anchorPointDiameter, null, {x:0, y:0}));
      // This flag must be set for the root joint for temp calculations to work correctly
      joints[0].isRoot = true;

      // Tell sceneManager setup is finished before resizing canvas
      this.sceneManager.scene.setupExecuted = true;
      this.windowResized(); //NOTE: Requires setupExecuted override above to prevent infinite recursion
      //demo1();
      print("offset:", 700 - pot.pos.x);
    }

    // Remove all DOM elements created in this scene
    this.tearDown = function(){
	diameterSlider.remove();
	finishButton.remove();
	/* resetButton is removed by another function so only remove
	 * if resetButton still exists
	 */
	if(resetButton){resetButton.remove();}
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

      arm.draw();
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
      this.selectedJoint = getNearestJoint({x:mouseX, y:mouseY});
      var jointPos = this.selectedJoint.getGlobalPos();
      arm.destPos.x = jointPos.x;
      arm.destPos.y = jointPos.y - 100;
      print("arm is currently at " + arm.pos);
      print("arm destination now at " + arm.destPos);
    }

    /* Evaluates the handle and switches to appropriate end scene
     * Runs clean up functions before switching scenes
     */
    this.grabPot = function() {
      var temp = this.selectedJoint.getTemp();
      // var randB = random([true, false]);
      this.tearDown();
      if (temp < STEEL_BURN_SKIN_TEMP) {
        this.sceneManager.showScene(Win);
      }
      else {
        this.sceneManager.showScene(Lose);
      }
      return;
    }
    /* Finalizes the handle by switching modes and changing buttons
     * so that the user can no longer edit joints and must now
     * select a joint for grabbing.
     */
    this.finishHandle = function() {
      this.mode = 'selecting';
      print("handle finished");
      finishButton.mouseClicked(this.grabPot.bind(this));
      finishButton.elt.outterText = "Grab Pot";
      finishButton.elt.textContent = "Grab Pot";
      resetButton.remove();
    }

    this.resetHandle = function(){
      joints = [];
      joints.push(new Joint(pot.anchorPointDiameter, null, {x:0, y:0}));
    }
}
