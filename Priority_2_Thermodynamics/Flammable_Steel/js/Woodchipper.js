/* File: Woodchipper.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the woodchipper, which appears 
 * whenever the user changes the wood using the slider.
 */
function Woodchipper() {
  Machine.call(this); // Inherit from Machine parent class
  Woodchipper.prototype = Object.create(Machine.prototype);

  this.MOVE_PCT = 0.02;
  this.imgID = "#woodchipper";
  this.direction = "left";

  /*
   * Initializes this Woodchipper object.
   */
  this.init = function() {
    this.opacity = 0;
    this.isActive = false;
    this.isFadingIn = false;
    this.isMoving = false;
    this.isFadingOut = false;
    this.pctDistanceMoved = 0;
    this.resize();

    enableInput(); // Make sure all onscreen elements are clickable
  }

  /*
   * Sets the graphical properties of this machine based on the window size.
   */
  this.resize = function() {
    this.distanceToMove = flammableRight.width * 0.8;
    $(this.imgID).css({ 'opacity': this.opacity });
    $(this.imgID).css({ 'width': this.getWidth() });
    $(this.imgID).css({ 'left': this.getXOffset() });
    $(this.imgID).css({ 'top': this.getYOffset() });
  }

  /*
   * Begins the machine's animation of moving across the screen and updating
   * the image of the material displayed according to the user-controlled
   * slider.
   */
  this.start = function() {
    // Set direction of movement to either left or right
    if (lastSliderValue <= currSliderValue) {
      this.direction = "left";
    } else {
      this.direction = "right";
    }
    
    this.init(); // Reset
    this.isActive = true;
    this.isFadingIn = true;
  }

  /*
   * Moves the woodchipper across the item it's sitting on top of by decreasing
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

  /* ==================================================================
                              Getter Functions
     ==================================================================
  */
 
  /*
   * Gets the width of this item.
   */
  this.getWidth = function() {
    var raw = windowWidth * config['woodchipperWidthRatio'];
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
      raw = windowWidth * config['itemRightXOffsetRatio'] + flammableRight.width / 6 
      - distanceMoved;
    } else {
      raw = windowWidth * config['itemRightXOffsetRatio'] - flammableRight.width / 1.5 
        + distanceMoved;
    }

    var pct = raw / windowWidth * 100;
    return pct + "%";
  }

  /*
   * Gets the vertical offset of this item.
   */
  this.getYOffset = function() {
    var raw = flammableRight.getBurntImageYOffset() - $(this.imgID).height() / 
      config['machineYOffsetRatio'];
    var pct = raw / windowHeight * 100;
    return pct + "%";
  }
}
