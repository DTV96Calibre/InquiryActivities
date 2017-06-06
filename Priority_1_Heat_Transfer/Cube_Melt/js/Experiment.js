/* File: Experiment.js
 * Dependencies: snowMelt.js, IceCube.js, Cup.js
 * 
 * Authors: Daniel Vasquez and Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

/*
 * This class contains one set of broken/unbroken IceCube/Cup objects necessary
 * to carry out the experiment.
 * @param type: A string (either 'broken' or 'unbroken', referring to whether 
 * the ice block is breakable via hammer)
 */
function Experiment(type, ice) {
  /* Class attributes */
  this.type = type;
  this.ice = ice;
  this.cup;

  // The percent of the cup's depth that the ice will fall into before floating.
  this.PERCENT_ICE_SUBMERGED = 0.75;

  // How quickly the ice drops as a percentage of the total distance to drop. 0.01 = 1% per frame.
  this.ICE_FALLING_DISTANCE_PER_FRAME = 0.01;

  /*
   * Initializes this experiment.
   */
  this.init = function() {
    // this.ice = new IceCube();
    this.cup = new Cup();

    // Set the properties of the IceCube

    if (this.type == 'unbroken') {
      this.ice.xOffset = windowWidth / 8;
      this.ice.totalNumDivisions = 0;
    }
    else if (this.type == 'broken') {
      this.ice.xOffset = windowWidth / 2 - windowWidth / 8;
      this.ice.totalNumDivisions = MAX_DIVISIONS;
    }
    else {
      throw new Error("Experiment obj needs to be of type 'broken' or 'unbroken'.");
    }

    this.ice.initializeArray();
    this.ice.setDivisions(0);

    // Set the properties of the Cup

    var xLength = windowWidth / 4;
    var yLength = windowHeight / 2;
    var yOffset = windowHeight / 2;

    this.cup.setDimensions();

    if (this.type == 'unbroken') {
      this.cup.initializeBuffer(xLength, yLength, 0, yOffset);
    }
    else if (this.type == 'broken') {
      this.cup.initializeBuffer(xLength, yLength, windowWidth / 4, yOffset);
    }
    else {
      throw new Error("Experiment obj needs to be of type 'broken' or 'unbroken'.");
    }
  }

  /*
   * Draws the components of this experiment onscreen.
   */
  this.display = function() {
    this.cup.display();
    this.ice.display();

    // Redraw liquid on top to give graphical 'submerged' effect to ice cubes
    this.cup.displayLiquid(true);

    // Update the positioning of the ice cube if it's falling
    if (this.ice.hasDropped) {
      this.dropIceIntoCup();
    }
  }

  /*
   * Resizes the experiment. Called whenever the window is resized.
   */
  this.resize = function() {
    // Set attributes that depend on type (broken vs. unbroken)
    if (this.type == 'unbroken') {
      this.ice.xOffset = windowWidth / 8;
    }
    else if (this.type == 'broken') {
      this.ice.xOffset = windowWidth / 2 - windowWidth / 8;
      this.cup.xOffset = windowWidth / 4;
    }
    else {
      throw new Error("Experiment obj needs to be of type 'broken' or 'unbroken'.");
    }

    this.ice.resize();
    this.cup.resize();

    // Recalculate how many pixels the ice needs to fall to drop into the cup
    this.ice.distanceToFall = windowHeight / 2;
  }
  
  /*
   * Begins to drop the array of ice cube(s) into a cup of liquid beneath.
   * Triggers the sequence that 1) makes the ice fall and 2) makes the ice
   * bob back to the surface after it finishes falling.
   */
  this.beginDroppingIce = function() {
    this.ice.hasDropped = true;
    this.ice.isFalling = true;
    hasChanged = true;
  }

  /*
   * Continues to drop the ice vertically downward into the liquid.
   */
  this.dropIceIntoCup = function() {
    if (this.ice.isFalling) {
      // Stage 1 (falling)
      this.ice.pctDistanceFallen += this.ICE_FALLING_DISTANCE_PER_FRAME;
      this.displaceLiquidInCup();
      hasChanged = true;

      if (this.ice.pctDistanceFallen >= 1) {
        this.ice.isFalling = false;
      }
    }

    else {
      // Stage 2 (floating)
      this.floatIceToSurface();
    }
  }

  /*
   * Causes the ice to bob back to the surface of the liquid.
   */
  this.floatIceToSurface = function() {

  }

  /*
   * Gradually increases the liquid level in the cup due to displacement.
   */
  this.displaceLiquidInCup = function() {
    /* The percentage the ice must have already fallen in order for the liquid
       to begin rising.
     */
    var startPct = 0.65;

    if (this.ice.pctDistanceFallen > startPct) {
      this.cup.pctDisplaced += this.ICE_FALLING_DISTANCE_PER_FRAME * (1 / startPct);
    }
  }

  /*
   * Returns true if the cursor is hovering over this experiment's ice cube.
   */
  this.cursorIsOverIce = function() {
    var halfBlockSize = this.ice.findArrayRange() / 2;
    var xLeft = this.ice.xOffset - halfBlockSize;
    var xRight = this.ice.xOffset + halfBlockSize;
    var yTop = this.ice.yOffset - halfBlockSize;
    var yBottom = this.ice.yOffset + halfBlockSize;

    return (mouseX >= xLeft && mouseX <= xRight) &&
           (mouseY >= yTop && mouseY <= yBottom);
  }
}

/***************** Other functions ******************/

/**
 * Detects whether the cursor is hovering over either ice block.
 */
function cursorOverIceCubes() {
  return unbrokenExp.cursorIsOverIce() || brokenExp.cursorIsOverIce();
}
