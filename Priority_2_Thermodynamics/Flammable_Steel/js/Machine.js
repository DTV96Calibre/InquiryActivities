/* File: Machine.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the steel (which is rendered in 
 * discrete intervals from solid to extra-fine wool).
 */
function Machine() {
  /* Constants */
  this.FADE_IN_PCT = 0.02; // 0.01 = 1% opacity per frame
  this.MOVE_PCT = 0.01;

  /* Misc. properties */
  this.imgID = "#woodchipper";
  this.direction = "left";
  this.opacity;
  this.isActive;
  this.isFadingIn;
  this.isMoving;
  this.isFadingOut;
  this.distanceToMove;
  this.pctDistanceMoved;

  /*
   * Initializes this Machine object.
   */
  this.init = function() {
    this.opacity = 0;
    this.isActive = false;
    this.isFadingIn = false;
    this.isMoving = false;
    this.isFadingOut = false;
    this.pctDistanceMoved = 0;
    this.resize();
  }

  /*
   * Sets the graphical properties of this machine based on the window size.
   */
  this.resize = function() {
    this.distanceToMove = flammableRight.width;
    $(this.imgID).css({ 'opacity': this.opacity });
    $(this.imgID).css({ 'width': this.getWidth() });
    $(this.imgID).css({ 'left': this.getXOffset() });
    $(this.imgID).css({ 'top': this.getYOffset() });
  }

  /*
   * Renders this image onscreen.
   */
  this.draw = function() {
    if (this.isActive) {
      this.update();
    }
  }

  /*
   * Updates this image by progressing through various stages of the animation
   * (fading in, moving across the image, and fading out).
   */
  this.update = function() {
    if (this.isFadingIn) {
      this.fadeIn();
    }
    else if (this.isMoving) {
      this.move();
    }
    else if (this.isFadingOut) {
      this.fadeOut();
    }
  }

  /*
   * Begins the machine's animation of moving across the screen and updating
   * the image of the material displayed according to the user-controlled \
   * slider.
   */
  this.start = function() {
    // Set direction of movement to either left or right
    if (lastSliderValue <= slider.value()) {
      this.direction = "left";
    } else {
      this.direction = "right";
    }
    
    this.init(); // Reset
    this.isActive = true;
    this.isFadingIn = true;
  }

  /*
   * Increases the opacity of the machine by a small amount which, over time,
   * gives the effect of the object 'fading in.'
   */
  this.fadeIn = function() {
    // Verify the new opacity is valid before updating
    var newOpacity = this.opacity + this.FADE_IN_PCT;
    if (newOpacity <= 1) {
      this.opacity = newOpacity;
      $(this.imgID).css({ 'opacity': this.opacity });
    } else {
      this.opacity = 1;
      $(this.imgID).css({ 'opacity': 1 });
      this.isFadingIn = false;
      this.isMoving = true;
    }
  }

  /*
   * Moves the machine across the item it's sitting on top of by decreasing
   * its horizontal offset. 
   */
  this.move = function() {
    // Verify the new position is valid before updating
    var newPctDistanceMoved = this.pctDistanceMoved + this.MOVE_PCT;
    if (newPctDistanceMoved <= 1) {
      // Change the item's image if the machine is positioned appropriately
      if (this.pctDistanceMoved < 0.5 && newPctDistanceMoved >= 0.5) {
        this.shredItem();
      }

      this.pctDistanceMoved = newPctDistanceMoved;
      $(this.imgID).css({ 'left': this.getXOffset() });
    } else {
      this.isMoving = false;
      this.isFadingOut = true;
    }
  }

  /*
   * Decreases the opacity of the machine by a small amount, giving the
   * impression of 'fading out.'
   */
  this.fadeOut = function() {
    // Verify the new opacity is valid before updating
    var newOpacity = this.opacity - this.FADE_IN_PCT;
    if (newOpacity >= 0) {
      this.opacity = newOpacity;
      $(this.imgID).css({ 'opacity': this.opacity });
    } else {
      this.opacity = 0;
      $(this.imgID).css({ 'opacity': 0 });
      this.isFadingOut = false;
      this.isActive = false;
    }
  }

  /*
   * Transitions the material (wood or steel) into the item indicated by the
   * slider.
   */
  this.shredItem = function() {
    // Change the image
    var intID = slider.value();
    var imageID = currentItem + intID;
    flammableRight.changeImage(imageID);

    // The flammable item image and the burnt image will both reset
    var overlayImageID = flammableRight.getBurntImage();
    $(overlayImageID).css({ 'opacity' : 0 });
    flammableRight.reset();

    lastSliderValue = intID;
  }

  /* ==================================================================
                              Getter Functions
     ==================================================================
  */
 
  /*
   * Gets the width of this item.
   */
  this.getWidth = function() {
    var raw = windowWidth * config['machineWidthRatio'];
    var pct = raw / windowWidth * 100;
    return pct + "%";
  }

  /*
   * Gets the horizontal offset of this item.
   */
  this.getXOffset = function() {
    var distanceMoved = this.distanceToMove * this.pctDistanceMoved;
    var raw;

    if (this.direction == "left") {
      raw = windowWidth * config['itemRightXOffsetRatio'] - distanceMoved;
    } else {
      raw = windowWidth * config['itemRightXOffsetRatio'] - flammableRight.width 
        + distanceMoved;
    }

    var pct = raw / windowWidth * 100;
    return pct + "%";
  }

  /*
   * Gets the vertical offset of this item.
   */
  this.getYOffset = function() {
    var raw = flammableRight.getBurntImageYOffset() - $(this.imgID).height() / 2;
    var pct = raw / windowHeight * 100;
    return pct + "%";
  }
}
