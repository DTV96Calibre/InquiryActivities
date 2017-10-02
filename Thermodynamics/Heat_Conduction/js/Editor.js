/*
 * File: Editor.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var STEEL_BURN_SKIN_TEMP = 50; // TODO: This is a placeholder value in C

var POT_X_OFFSET_SCALE = 0.55; // times windowWidth
var POT_Y_OFFSET_SCALE = 0.5;  // times windowHeight
var POT_HEIGHT_SCALE = 0.34;   // times windowHeight

var VALID_ZONE_X_START = 100;  // pixels
var VALID_ZONE_X_FINAL = 200;  // pixels
var VALID_ZONE_Y_START = 100;  // pixels
var VALID_ZONE_Y_FINAL = 200;  // pixels

var ARM_SIZE = 100;            // pixels
var HEIGHT_OF_SLIDER = 25;     // pixels

var joints = [];
var pot;
var arm;

// DOM elements
var controlPanel;
var jointSizeSlider;
var finishButton;
var resetButton;
var grabPotButton;

// For enabling web transitions on pop-up help tooltip
var helpBoxPopUp;
var helpBtn;
var infoBoxPopUp;
var infoBtn;
var helpBtnActive = false;
var infoBtnActive = false;

// A box in which joints can be placed
var validZone;

var ref;

/**
 * Constructs the editor scene.
 */
function Editor() {
    this.crosshair_pos = [0, 0];

    // Keep track of whether user can place joints or select joints
    this.mode = 'placing'; // modes: placing, selecting
    this.selectedJoint = null;

    ref = this;

    /**
     * Initializes the editor scene by creating various onscreen elements.
     * @return none
     */
    this.setup = function() {
      changeBackgroundImage("countertop");

      // Setup DOM input elements
      jointSizeSlider = $('#jointSizeSlider');
      controlPanel = $('#controlPanel');
      finishButton = $('#finishBtn');
      resetButton = $('#resetBtn');
      grabPotButton = $('#grabPotBtn');

      // For enabling web transitions on pop-up help tooltip
      helpBoxPopUp = $('#help-box');
      helpBtn = $('#helpBtn');
      helpBtn.on('click', toggleHelp);

      // For enabling web transitions on pop-up info tooltip
      infoBoxPopUp = $('#info-box');
      infoBtn = $('#infoBtn');
      infoBtn.on('click', toggleInfo);

      // Set up other event handlers
      finishButton.on('click', finishHandle);
      resetButton.on('click', resetHandle);
      grabPotButton.on('click', grabPot);

      showElements(); // Show necessary elements
      hideElements(); // Hide unnecessary elements

      validZone = {x1: VALID_ZONE_X_START, x2: VALID_ZONE_X_FINAL, 
        y1: VALID_ZONE_Y_START, y2: VALID_ZONE_Y_FINAL};

      // Initialize scene elements
      fill(51);
      noStroke();
      var potXPos = windowWidth * POT_X_OFFSET_SCALE;
      var potYPos = windowHeight * POT_Y_OFFSET_SCALE;
      pot = new Pot({x : potXPos, y : potYPos});
      pot.steam.updateOrigin();

      arm = new Arm({x: ARM_SIZE, y: ARM_SIZE});      

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
    	controlPanel.hide();
    }

    /**
     * Draws the entire editor scene, including the pot, arm, and joints.
     * @return none
     */
    this.draw = function() {
      clear();

      drawCrosshairPreview();

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
      pot.pos.x = windowWidth * POT_X_OFFSET_SCALE;
      pot.pos.y = windowHeight * POT_Y_OFFSET_SCALE;
      pot.potHeight = windowHeight * POT_HEIGHT_SCALE;
      pot.potWidth = pot.potHeight;
      pot.anchorPointDiameter = 75;
      pot.locateAnchorPoint();

      // Define the valid zone
      validZone.x2 = pot.anchorPoint.x;
      validZone.x1 = validZone.x2 - pot.potWidth;
      validZone.y2 = pot.anchorPoint.y + pot.anchorPointDiameter / 2;
      validZone.y1 = validZone.y2 - pot.anchorPointDiameter;

      resizeCanvas(windowWidth, windowHeight);
    }

    /**
     * Scene manager function that fires whenever the user clicks the mouse 
     * while this scene is active.
     * @return none
     */
    this.mouseClicked = function() {
      if (!inValidZone(mouseX, mouseY)) return;

      if (this.mode == 'placing') {
        var radius = int(jointSizeSlider.val());
        insertJoint(mouseX, mouseY, radius);
      }
      if (this.mode == 'selecting') {
        getNearestJoint({x:mouseX, y:mouseY});
        this.selectNearestJoint();
      }
    }

    /**
     * Places the cat's paw over the closest joint.
     * @return none
     */
    this.selectNearestJoint = function() {
      this.selectedJoint = getNearestJoint({x:mouseX, y:mouseY});
      var jointPos = this.selectedJoint.getGlobalPos();
      arm.destPos.x = jointPos.x;
      arm.destPos.y = jointPos.y - 100;
    }
}

/***************************** Event handlers *********************************/

/**
 * Event-handling function; finalizes the handle by switching modes so that the
 * user can no longer edit joints and must now select a joint for grabbing.
 * @return none
 */
finishHandle = function() {
  ref.mode = 'selecting';
  resetButton.hide();
  finishButton.hide();
  grabPotButton.show();
}

/**
 * Event-handling function; evaluates the handle and switches to appropriate 
 * end scene. Runs clean up functions before switching scenes.
 * @return none
 */
grabPot = function() {
  if (ref.selectedJoint == null) {
    alert("Please click on a joint for the cat to touch");
    return;
  }

  var temp = ref.selectedJoint.getTemp();
  ref.tearDown();

  if (temp < STEEL_BURN_SKIN_TEMP) {
    ref.sceneManager.showScene(Win);
  }
  else {
    ref.sceneManager.showScene(Lose);
  }
}

/**
 * Event-handling function; removes all joints from the pot handle.
 * @return none
 */
resetHandle = function() {
  joints = [];
  joints.push(new Joint(pot.anchorPointDiameter, null, {x:0, y:0}));
}

/**
 * Event-handling function; toggles the help box.
 * @return none
 */
toggleHelp = function() {
  if (infoBtnActive || !helpBtnActive) {
    // Make info box disappear to make room for help box
    infoBoxPopUp.removeClass("appear");
    infoBtnActive = false;
    helpBoxPopUp.addClass("appear");
    helpBtnActive = true;
  } else {
    helpBoxPopUp.removeClass("appear");
    helpBtnActive = false;
  }
}

/**
 * Event-handling function; toggles the info box.
 * @return none
 */
toggleInfo = function() {
  if (helpBtnActive || !infoBtnActive) {
    // Make help box disappear to make room for info box
    helpBoxPopUp.removeClass("appear");
    helpBtnActive = false;
    infoBoxPopUp.addClass("appear");
    infoBtnActive = true;
  } else {
    infoBoxPopUp.removeClass("appear");
    infoBtnActive = false;
  } 
}

/************************ Show/hide DOM elements ******************************/

/**
 * Hides onscreen elements that shouldn't be present for the Editor scene.
 * @return none
 */
hideElements = function() {
  grabPotButton.hide(); 
}

/**
 * Shows onscreen elements that should be present for the Editor scene.
 * @return none
 */
showElements = function() {
  // Show steam bubbles
  $("#steam-one").show();
  $("#steam-two").show();
  $("#steam-three").show();
  $("#steam-four").show();

  // Show remaining DOM elements
  controlPanel.show();
  jointSizeSlider.show();
  helpBoxPopUp.show();
  infoBoxPopUp.show();
  helpBtn.show();
  infoBtn.show();

  // Display help text immediately
  toggleHelp();
}