/* File: FlammableItem.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * A base class from which the Steel and Wood classes inherit.
 */
function FlammableItem(isMutable) {
  /* Constants */
  this.NUM_FRAMES_TO_STALL = 5;

  /* Other properties */
  this.img;
  this.isMutable = isMutable; // True for the item on the right
  this.position = isMutable ? "right" : "left";
  this.isBurning = false;
  this.pctBurned = 0;
  this.isSwappingBurntImage;
  this.numFramesStalled;

  this.burningRate; // The change in opacity percentage per frame
  this.numFireParticles;
  this.fireSize;
  this.fireMaxLife;
  this.fire;

  /* Graphical properties */
  this.width;
  this.height;
  this.xOffset;
  this.yOffset;

  /*
   * Sets the graphical properties of this object based on the window size.
   */
  this.resize = function() {
    this.setWidth();
    this.setHeight();
    this.setXOffset();
    this.setYOffset();
  }

  /*
   * Renders this image onscreen.
   */
  this.draw = function() {
    image(this.img, this.xOffset, this.yOffset, this.width, this.height);

    // Draw this image with a lower opacity if it's currently burning
    if (this.isBurning) {
      var alpha = this.getAlphaLevel();
      noStroke();
      fill(PANEL_COLOR + alpha + ')');
      rect(this.xOffset, this.yOffset, this.width, this.height);

      // Draw resulting image (i.e. ash or burnt wool) with inverted opacity
      this.update();

      // Draw flame
      this.fire.update();
      this.fire.size = this.fireSize * (1 - this.pctBurned);
      this.fire.maxLife = this.fireMaxLife * (1 - this.pctBurned);
      this.fire.width = this.width * (1 - this.pctBurned);
      this.fire.originX = this.xOffset + this.width / 2 - this.fire.width / 2;
    }
    // Else we may be transitioning the burnt image from the DOM to the p5 canvas
    else if (this.isSwappingBurntImage) {
      this.swapBurntImage();
    }
  }

  /*
   * Updates this image by checking whether it's currently on fire. If so, 
   * advances the animation that shows this object burning (into ash for wood, 
   * or into burnt wool for steel).
   */
  this.update = function() {
    this.pctBurned += this.burningRate;

    // Stop burning animation of log or steel prematurely
    if (this.img == images['wood0'] || (currentItem == "steel" && this.img != images['steel4'])) {
      if (!(holdingMatch && this.cursorIsOver())) {
        this.pctBurned = 0;
        this.isBurning = false;
        this.setBurnTime();
      }
    }

    if (this.pctBurned >= 1) {
      this.isBurning = false; // Finished burning
      this.setBurnTime();
      this.img = this.burntImage;
      this.resize();
      this.isSwappingBurntImage = true;
    } else {
      this.updateBurntImage();
    }
  }

  /*
   * Initializes the fire object that provides a burning 'animation' once this
   * item has been lit on fire.
   */
  this.initFire = function() {
    this.fire = new Fire(this, this.numFireParticles, this.fireMaxLife,
      this.fireSize, this.width);
    this.fire.updateOrigin();
  }

  /*
   * Returns true if the cursor is hovering over this item.
   */
  this.cursorIsOver = function() {
    return (mouseX > this.xOffset && mouseX < this.xOffset + this.width
         && mouseY > this.yOffset && mouseY < this.yOffset + this.height);
  }

  /*
   * Sets this material on fire, which updates its appearance. Note that some
   * materials (most steel and the wooden log) won't sustain a flame from the
   * match.
   */
  this.setFire = function() {
    if (holdingMatch && this.pctBurned == 0) {
      this.isBurning = true;
      this.burningRate = this.getBurningRate();
      this.setFireProperties();
      this.initFire();
    }
  }

  /* ==================================================================
                         Mathematical Functions
     ==================================================================
  */
 
  /*
   * Returns the total time this item will take to burn (in seconds).
   */
  this.getTotalBurnTime = function() {
    return BURNING_RATE_COEFFICIENT / this.calculateSurfArea();
  }

  /*
   * Returns the rate at which this item will burn. Note that this returns a
   * non-negative and non-zero number regardless of whether the item can
   * actually burn (e.g. a steel ingot won't burn but will still have a 
   * burning rate).
   */
  this.getBurningRate = function() {
    var totalBurnTime = this.getTotalBurnTime();
    var numFramesToBurn = totalBurnTime * FRAME_RATE;
    return 1 / numFramesToBurn;
  }

  /* Sets the properties of this item's flame (only active while the item 
   * is burning) according to the speed at which this item will burn. Slower
   * burning times will yield fewer, smaller flame particles and faster
   * burning times will yield a more explosive flame.
   */
  this.setFireProperties = function() {
    if (this.img == images['wood0']) { // Log
      this.numFireParticles = 8;
      this.fireSize = 3;
      this.fireMaxLife = 40;
    }
    else if (this.img == images['wood1']) { // Planks
      this.numFireParticles = 25;
      this.fireSize = 5;
      this.fireMaxLife = 30;
    }
    else if (this.img == images['wood2']) { // Kindling
      this.numFireParticles = 35;
      this.fireSize = 5;
      this.fireMaxLife = 45;
    }
    else if (this.img == images['wood3']) { // Woodchips
      this.numFireParticles = 40;
      this.fireSize = 6;
      this.fireMaxLife = 60;
    }
    else if (this.img == images['wood4']) { // Sawdust
      this.numFireParticles = 65;
      this.fireSize = 10;
      this.fireMaxLife = 120;
    }
    else if (this.img == images['steel4']) { // Grade 0000 wool
      this.numFireParticles = 50;
      this.fireSize = 8;
      this.fireMaxLife = 50;
    }
    else {
      this.numFireParticles = 0;
      this.fireSize = 0;
      this.fireMaxLife = 0;
    }
  }

  /* ==================================================================
                          Getter & Setter Functions
     ==================================================================
  */
 
  /*
   * Sets the width of this item.
   */
  this.setWidth = function() {
    this.width = windowWidth * config['itemWidthRatio'];
  }

  /*
   * Sets the height of this item.
   */
  this.setHeight = function() {
    var aspectRatio = this.img.elt.width / this.img.elt.height;
    this.height = this.width / aspectRatio;
  }

  /*
   * Sets the horizontal offset of this item.
   */
  this.setXOffset = function() {
    // Horizontal offset depends on which item (left or right) is being drawn
    if (this.isMutable) {
      this.xOffset = windowWidth * config['itemRightXOffsetRatio'];
    } else {
      this.xOffset = windowWidth * config['itemLeftXOffsetRatio'];
    }
  }

  /*
   * Sets the vertical offset of this item.
   */
  this.setYOffset = function() {
    // Use max function to prevent image from disappearing offscreen
    this.yOffset = max(windowHeight * config['itemYOffsetRatio'] - this.height / 2,
     windowHeight * 0.15);
  }

  /*
   * Get the ideal vertical offset exclusively for this item's burnt image. This
   * preserves a common yOffset for the html DOM and p5 image elements
   * regardless of which item was set on fire.
   */
  this.getBurntImageYOffset = function() {
    var aspectRatio = this.burntImage.elt.width / this.burntImage.elt.height;
    var height = windowWidth * config['itemWidthRatio'] / aspectRatio;
    return max(windowHeight * config['itemYOffsetRatio'] - height / 2,
     windowHeight * 0.15);
  }

  /*
   * Get the alpha level for the opaque layer to be drawn over the image of
   * this item to provide a 'fading out' effect. Some items aren't burnable
   * and therefore should never fade, so the alpha level for the overlay of
   * these items is always 0.
   */
  this.getAlphaLevel = function() {
    if (this.img == images['wood0'] ||
        (currentItem == "steel" && this.img != images['steel4'])) 
      return 0;

    // Otherwise, alpha level is proportional to the percent that has burned away
    return this.pctBurned;
  }

  /* ==================================================================
                         Interacting with the DOM
     ==================================================================
  */
 
  /*
   * Returns the image from the DOM that will be rendered once this item
   * is burning.
   */
  this.getBurntImage = function() {
    if (currentItem == 'steel') {
      return "#steel_fire";
    } else if (currentItem == 'wood') {
      if (this.isMutable) {
        return "#ash_right";
      }
      return "#ash_left";
    }
  }
 
  /*
   * Configures the image from the DOM that will be rendered once this item 
   * is burning.
   */
  this.updateBurntImage = function() {
    // Don't fade in the burnt image if this material isn't burnable by the match
    if (this.img == images['wood0'] || (currentItem == "steel" && 
      this.img != images['steel4'])) return;

    var overlayImageID = this.getBurntImage();
    var opacity = this.pctBurned;
    var width = this.width / windowWidth * 100 + "%";
    var xOffset = this.xOffset / windowWidth * 100 + "%";
    var yOffset = this.getBurntImageYOffset() / windowHeight * 100 + "%";
    
    $(overlayImageID).css({ 'opacity': opacity });
    $(overlayImageID).css({ 'width': width });
    $(overlayImageID).css({ 'left': xOffset });
    $(overlayImageID).css({ 'top': yOffset });
  }

  /*
   * Handles the switch between the image of this burnt material on the DOM and
   * the p5 canvas. The DOM element is necessary at first to adjust the opacity 
   * of the image while the simulation is running, but later the p5 element is
   * ideal so the cursor may be drawn on top of the image instead of behind it.
   */
  this.swapBurntImage = function() {
    if (this.numFramesStalled < this.NUM_FRAMES_TO_STALL) {
      /* Stall a small number of frames to prevent blank space as image loads.
       * Effectively, both images (DOM element and p5 canvas element) are being
       * drawn simultaneously for a short period. */
      this.numFramesStalled += 1;
    } else {
      // Done swapping; the DOM img element may be removed now
      this.isSwappingBurntImage = false;
      var overlayImageID = this.getBurntImage();
      $(overlayImageID).css({ 'opacity': 0 });
    }
  }

  /*
   * Fills the table data with the properties of this material.
   */
  this.updateTableData = function() {
    // Retrieve the prefix to the ID of the element
    var idPrefix = "#" + this.position;

    var surfArea = this.calculateSurfArea();

    // Fill in the data accordingly
    $(idPrefix + "Density").html(this.density);
    $(idPrefix + "Mass").html(this.mass.toFixed(1));
    $(idPrefix + "SurfArea").html(surfArea.toFixed(2));

    // Don't reset the burn time on the left item
    if (this.isMutable) {
      this.resetBurnTime();
    }

    // Set the title
    $(idPrefix + "TableTitle").html(this.getDescriptor());
  }

  /*
   * Sets the table data for this item's time taken to burn to a question mark.
   */
  this.resetBurnTime = function() {
    var idPrefix = "#" + this.position;
    $(idPrefix + "BurnTime").html('?');
    $(idPrefix + "BurnTimeUnits").html('');
  }

  /*
   * Fills in the total burn time of this material.
   * @param totalBurnTime: A string to display in the table entry
   */
  this.setBurnTime = function() {
    // Retrieve the prefix to the ID of the element
    var idPrefix = "#" + this.position;

    // If this item isn't flammable, don't set a value for its burn time
    if (currentItem == "steel" && this.img != images['steel4']) {
      $(idPrefix + "BurnTime").html("N/A");
      return;
    }

    var totalBurnTime = this.getTotalBurnTime() * BURN_TIME_SCALE_FACTOR;
    var units = "seconds";

    // Update the units if necessary
    if (totalBurnTime > 3600) {
      totalBurnTime /= 3600;
      units = "hours";
    }
    else if (totalBurnTime > 60) {
      totalBurnTime /= 60;
      units = "minutes";
    }

    $(idPrefix + "BurnTime").html(totalBurnTime.toFixed(2));
    $(idPrefix + "BurnTimeUnits").html(units);
  }
}
