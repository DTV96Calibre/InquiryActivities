/*
 * File: Editor.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var STEEL_BURN_SKIN_TEMP = 50; // TODO: This is a placeholder value in C

var POT_X_OFFSET_SCALE = 0.55; // times windowWidth
var POT_Y_OFFSET_SCALE = 0.5;  // times windowHeight
var POT_HEIGHT_SCALE = 0.34;   // times windowHeight
var TEXT_SIZE_SCALE = 0.1;    // times windowWidth

var VALID_ZONE_X_START = 100;  // pixels
var VALID_ZONE_X_FINAL = 200;  // pixels
var VALID_ZONE_Y_START = 100;  // pixels
var VALID_ZONE_Y_FINAL = 200;  // pixels

var HEIGHT_OF_SLIDER = 25;     // pixels

var joints = [];
var pot;
var arm;

// DOM elements
var controlPanel;
var sliderBox;
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

// Indicates whether DOM elements and callback functions have been set
var DOMElementsSet = false;

// A box in which joints can be placed
var validZone;

// True when the user has clicked 'Finalize Handle'
var doneBuildingPot;

// The number of 'lives' (or tries) the user has left before Game Over
var numLivesRemaining = 3;

// A reference to this scene as an object to be referenced by external buttons
var ref;

/**
 * Constructs the editor scene.
 */
function Editor() {
    this.crosshair_pos = [0, 0];

    // Keep track of whether user can place joints or select joints
    this.mode;

    // Holds a reference to the part of the handle the cat will pick up
    this.selectedJoint;

    // Progression of the burned paw/dropped pot animation (float from 0 to 1)
    this.animationProgress;

    // True when the cat has burned its paw and we're about to transition to the next scene
    this.catIsBurning;

    // True when the cat has dropped the pot and we're about to transition to the next scene
    this.catDroppedPot;

    // The array of cats to render when showing the remaining number of lives
    this.catLifeIcons = [new Cat(true, true), new Cat(true, true), new Cat(true, true)];

    // The text reading "Lives Remaining"
    this.remainingLivesText = images["lives_text"];

    ref = this;

    /**
     * Initializes the editor scene by creating various onscreen elements.
     * @return none
     */
    this.setup = function() {
      this.mode = 'placing'; // modes: placing, selecting
      this.selectedJoint = null;

      changeBackgroundImage("countertop");

      // DOM elements only need to be stored once
      if (!DOMElementsSet) {
        this.setDOMElements();
        DOMElementsSet = true;
      }

      showElements(); // Show necessary elements
      hideElements(); // Hide unnecessary elements

      validZone = {x1: VALID_ZONE_X_START, x2: VALID_ZONE_X_FINAL, 
        y1: VALID_ZONE_Y_START, y2: VALID_ZONE_Y_FINAL};

      // Variables holding the state of the transition to the Lose state
      this.catIsBurning = false;
      this.catDroppedPot = false;
      this.animationProgress = 0;

      // Initialize scene elements
      fill(51);
      noStroke();
      var potXPos = windowWidth * POT_X_OFFSET_SCALE;
      var potYPos = windowHeight * POT_Y_OFFSET_SCALE;
      pot = new Pot({x : potXPos, y : potYPos});
      pot.steam.updateOrigin();

      arm = new Arm({x: 0, y: 0});      

      resetHandle();

      // Tell sceneManager setup is finished before resizing canvas
      this.sceneManager.scene.setupExecuted = true;

      doneBuildingPot = false;

      // NOTE: Requires setupExecuted override above to prevent infinite recursion
      this.windowResized();
    }

    /**
     * Removes all DOM elements created in this scene.
     * @return none
     */
    this.tearDown = function() {
    	controlPanel.hide();
      helpBtn.hide();
      infoBtn.hide();
      helpBoxPopUp.hide();
      infoBoxPopUp.hide();

      // Set to false so setup() will be run again next time we load this scene
      this.sceneManager.scene.setupExecuted = false;
    }

    /**
     * Grabs DOM elements from the HTML page to be referenced by JS, and
     * assigns callback functions to buttons and the slider.
     */
    this.setDOMElements = function() {
      // Setup DOM input elements
      sliderBox = $("#sliderBox");
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
    }

    /**
     * Draws the entire editor scene, including the pot, arm, and joints.
     * @return none
     */
    this.draw = function() {
      clear();

      if (!doneBuildingPot) {
        drawCrosshairPreview();
      }

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

      // Render the remaining number of lives
      this.drawNumLives();

      // Draw the 'losing' animation (burned paw or dropped pot), if applicable
      this.drawLosingAnimation();

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

      arm.resize();

      // Set horizontal spacing between "lives remaining" cat icons
      var offset = windowWidth * 0.05;
      for (var i = 0; i < this.catLifeIcons.length; i++) {
        this.catLifeIcons[i].resize();
        this.catLifeIcons[i].xOffset = windowWidth * 0.8 + offset * i;
      }

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
      // Don't let the textbox float over the cat's paw
      if (helpBtnActive) {
        toggleHelp();
      }
      else if (infoBtnActive) {
        toggleInfo();
      }

      this.selectedJoint = getNearestJoint({x:mouseX, y:mouseY});
      var jointPos = this.selectedJoint.getGlobalPos();
      arm.setPos({x: jointPos.x, y: jointPos.y - windowWidth * ARM_SIZE_SCALE});
    }

    /**
     * Renders the user's current number of lives as text in the upper-right 
     * region of the screen.
     */
    this.drawNumLives = function() {
      // Draw "Lives Remaining" text
      var textWidth = windowWidth * TEXT_SIZE_SCALE;
      var textHeight = textWidth / 6;
      image(this.remainingLivesText, windowWidth * 0.825, 
        this.catLifeIcons[0].height * 1.6, textWidth, textHeight);

      tint(255, 127);
      // Draw array of cat icons representing remaining number of lives
      for (var i = 0; i < this.catLifeIcons.length; i++) {
        this.catLifeIcons[i].draw();
      }
    }

    /**
     * The cat loses a life, and the user is presented with either a losing 
     * screen or a screen that says 'try again' depending on how many lives
     * remain.
     */
    this.loseOneLife = function() {
      numLivesRemaining--;
      this.catLifeIcons[numLivesRemaining].setAliveStatus(false);

      this.tearDown();

      // If no lives left, the player loses. Else they get to try again
      if (numLivesRemaining == 0) {
        ref.sceneManager.showScene(Lose);
      } else {
        ref.sceneManager.showScene(TryAgain);
      }
    }

    /**
     * If the user has been unsuccessful in designing the pot (either by having
     * the cat touch a joint that is too hot, or having the cat pick up a 
     * joint that can't support its weight), steps through the appropriate
     * animation.
     * @return none
     */
    this.drawLosingAnimation = function() {
      // Transition to the Lose scene if animation has finished
      if (this.animationProgress >= 0.97) {
        this.loseOneLife();
      }

      // Else animation isn't done. Draw the burning paw animation?
      if (this.catIsBurning) {
        this.drawBurnedPaw(1.0 - this.animationProgress);
        this.animationProgress += 0.015;
      }
      // Or possibly draw the shaking paw animation
      else if (this.catDroppedPot) {
        this.drawSweatDrop(this.animationProgress);
        this.animationProgress += 0.02;
      }
    }

    /**
     * Draws a 'burn' spot (a red ellipse that gradually fades to indicate that
     * cat's paw has been scorched).
     * @param {num} alpha: A value from 0 to 1.0
     * @return none
     */
    this.drawBurnedPaw = function(alpha) {
      c = color('hsba(17, 100%, 78%, ' + alpha + ')');
      fill(c); // Use updated 'c' as fill color
      var ellipseSize = (arm.width / 2) * (this.animationProgress);
      var ellipseX = arm.pos.x + arm.width / 1.4;
      var ellipseY = arm.pos.y + arm.height / 1.3;
      ellipse(ellipseX, ellipseY, ellipseSize, ellipseSize); // Draw ellipse
    }

    /**
     * Draws a drop of sweat falling down the cat's arm as he struggles to
     * pick up the pot.
     * @param  {num} progress: A value from 0 to 1.0
     * @return none
     */
    this.drawSweatDrop = function(progress) {
      var imgWidth = arm.width / 7;
      var imgXPos = arm.pos.x + arm.width / 4;
      var imgYPos = arm.pos.y * 1.2 + arm.height / 3 * progress;
      image(images['sweat'], imgXPos, imgYPos, imgWidth, imgWidth * 1.7);
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
  doneBuildingPot = true;
  resetButton.hide();
  finishButton.hide();
  sliderBox.hide();
  grabPotButton.show();
  pot.hasWater = true;
  showSteam();
  changeBackgroundImage("stovetop");
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
  var canLiftPot = (ref.selectedJoint.findTorque() < arm.findTorque())
    && (ref.selectedJoint != joints[joints.length - 1]);

  print("Grabbing pot. Temp was " + temp + ", threshold to burn cat is " + STEEL_BURN_SKIN_TEMP);

  if (temp >= STEEL_BURN_SKIN_TEMP) {
    ref.catIsBurning = true;
  }
  else if (!canLiftPot) {
    ref.catDroppedPot = true;
  }
  else {
    ref.tearDown();
    ref.sceneManager.showScene(Win);
  }
}

/**
 * Event-handling function; removes all joints from the pot handle.
 * @return none
 */
resetHandle = function() {
  joints = [];
  joints.push(new Joint(pot.anchorPointDiameter, null, {x:0, y:0}));
  // This flag must be set for the root joint for temp calculations to work correctly
  joints[0].isRoot = true;
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
  // Show remaining DOM elements
  controlPanel.show();
  sliderBox.show();
  helpBoxPopUp.show();
  infoBoxPopUp.show();
  helpBtn.show();
  infoBtn.show();
  resetButton.show();
  finishButton.show();

  // Display help text immediately
  toggleHelp();
}

/**
 * Shows the steam bubbles that appear once the pot of boiling water is
 * placed on the stove.
 * @return none
 */
showSteam = function() {
  $("#steam-one").show();
  $("#steam-two").show();
  $("#steam-three").show();
  $("#steam-four").show();
}
