/*
 * File: Editor.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var STEEL_BURN_SKIN_TEMP = 50; // TODO: This is a placeholder value in C
var POT_H_OFFSET = 300;
var HEIGHT_OF_SLIDER = 25;

var joints = [];
var pot;
var arm;

// DOM elements
var jointSizeSlider;
var finishButton;
var resetButton;

// A box in which joints can be placed
var validZone;

/**
 * Constructs the editor scene.
 */
function Editor() {
    this.crosshair_pos = [0, 0];

    // Keep track of whether user can place joints or select joints
    this.mode = 'placing'; // modes: placing, selecting
    this.selectedJoint = null;

    /**
     * Initializes the editor scene by creating various onscreen elements.
     * @return none
     */
    this.setup = function() {
      // Setup DOM input elements
      jointSizeSlider = createSlider(10, 100, 50);
      finishButton = createButton('Finalize Handle');
      resetButton = createButton('Reset Handle');

      // 'this' is not yet bound to these buttons so manually bind them
      finishButton.mouseClicked(this.finishHandle.bind(this));
      resetButton.mouseClicked(this.resetHandle);

      validZone = {x1:100, x2:200, y1:100, y2:200};

      // Initialize scene elements
      fill(51);
      noStroke();
      var potXPos = windowWidth-POT_H_OFFSET;
      var potYPos = windowHeight / 2;
      pot = new Pot({x : potXPos, y : potYPos});
      pot.steam.updateOrigin();
      arm = new Arm({x:100, y:100});

      // Show steam bubbles
      $("#steam-one").show();
      $("#steam-two").show();
      $("#steam-three").show();
      $("#steam-four").show();

      // The first joint must be manually added as the insertJoint function assumes one already exists
      joints.push(new Joint(pot.anchorPointDiameter, null, {x:0, y:0}));
      // This flag must be set for the root joint for temp calculations to work correctly
      joints[0].isRoot = true;

      // Tell sceneManager setup is finished before resizing canvas
      this.sceneManager.scene.setupExecuted = true;

      // NOTE: Requires setupExecuted override above to prevent infinite recursion
      this.windowResized();
    }

    /**
     * Removes all DOM elements created in this scene.
     * @return none
     */
    this.tearDown = function(){
    	jointSizeSlider.remove();
    	finishButton.remove();

    	// The reset button is removed by another function, so only remove if it still exists
    	if (resetButton) {
        resetButton.remove();
      }
    }

    /**
     * Draws the entire editor scene, including the pot, arm, and joints.
     * @return {[type]} [description]
     */
    this.draw = function() {
      clear();

      // Draw valid zone
      fill(63, 191, 108, 127);
      quad(validZone.x1, validZone.y1, validZone.x1, validZone.y2, validZone.x2,
       validZone.y2, validZone.x2, validZone.y1);

      // Draw joints and pot
      fill(51);
      joints[0].draw();
      pot.draw();
      arm.draw();
      highlightNearestJoint();

      // Draws the shadow of a joint if the user's mouse is positioned correctly
      if (inValidZone(mouseX, mouseY)) {
        drawCrosshair();
      }
    }

    /**
     * Called when the window is resized.
     * @return none
     */
    this.windowResized = function() {
      pot.pos.x = windowWidth/2;
      finishButton.position(pot.pos.x, pot.pos.y);
      resetButton.position(pot.pos.x, pot.pos.y + 50);
      //pot.pos.x = windowWidth-POT_H_OFFSET;
      pot.potHeight = 0.34 * windowHeight;
      pot.potWidth = pot.potHeight;
      pot.anchorPointDiameter = 75;//pot.potHeight / 3.5;
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
        var radius = jointSizeSlider.value();
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
