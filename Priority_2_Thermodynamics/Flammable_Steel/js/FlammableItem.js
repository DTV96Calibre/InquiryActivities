/* File: FlammableItem.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * A base class from which the Steel and Wood classes inherit.
 */
function FlammableItem(isMutable) {
  /* Constants */
  this.BURNING_RATE = 0.015; // The change in opacity percentage per frame
  this.NUM_FRAMES_TO_STALL = 5;

  /* Other properties */
  this.img;
  this.isMutable = isMutable; // True for the item on the right
  this.isBurning = false;
  this.pctBurned = 0;
  this.isSwappingBurntImage;
  this.numFramesStalled;

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
      var alpha = this.pctBurned;
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
      this.fire.originX = this.xOffset + this.height * this.pctBurned;
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
    this.pctBurned += this.BURNING_RATE;
    if (this.pctBurned >= 1) {
      this.isBurning = false; // Finished burning
      this.img = this.burntImage;
      this.resize();
      this.isSwappingBurntImage = true;
    } else {
      this.updateBurntImage();
    }
  }

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
   * Initializes the fire object that provides a burning 'animation' once this
   * item has been lit on fire.
   */
  this.initFire = function() {
    this.fire = new Fire(this, NUM_FIRE_PARTICLES, this.fireMaxLife,
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

  /* ==================================================================
                         Interacting with the DOM
     ==================================================================
  */
 
  /*
   * Configures the image from the DOM that will be rendered once this item 
   * is burning.
   */
  this.updateBurntImage = function() {
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
    var idPrefix;
    if (this.isMutable) {
      idPrefix = "#right";
    } else {
      idPrefix = "#left";
    }

    var volume = this.calculateVolume();
    var surfArea = this.calculateSurfArea();

    // Fill in the data accordingly
    $(idPrefix + "Density").html(this.density);
    $(idPrefix + "Mass").html(this.mass.toFixed(1));
    $(idPrefix + "Volume").html(volume.toFixed(2));
    $(idPrefix + "SurfArea").html(surfArea.toFixed(2));
  }
}
