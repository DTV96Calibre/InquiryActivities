/* File: Extruder.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the extruder, which appears 
 * whenever the user changes the steel using the slider.
 */
function Extruder() {
  Machine.call(this); // Inherit from Machine parent class
  Extruder.prototype = Object.create(Machine.prototype);

  this.MOVE_PCT = 0.015;
  this.imgID = "#extruder";
  this.isMovingIn;
  this.isMovingOut;

  /*
   * Initializes this Extruder object.
   */
  this.init = function() {
    this.opacity = 0;
    this.isActive = false;
    this.isFadingIn = false;
    this.isMoving = false;
    this.isMovingIn = false;
    this.isMovingOut = false;
    this.isFadingOut = false;
    this.pctDistanceMoved = 0;
    this.resize();

    enableInput(); // Make sure all onscreen elements are clickable
  }

  /*
   * Sets the graphical properties of this machine based on the window size.
   */
  this.resize = function() {
    $(this.imgID).css({ 'opacity': this.opacity });
    $(this.imgID).css({ 'height': this.getHeight() });
    $(this.imgID).css({ 'left': this.getXOffset() });
    $(this.imgID).css({ 'top': this.getYOffset() });
    this.distanceToMove = windowWidth * config['itemRightXOffsetRatio']
     - this.getXOffsetPixels();
  }

  /*
   * Begins the machine's animation of moving across the screen and updating
   * the image of the material displayed according to the user-controlled
   * slider.
   */
  this.start = function() {
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
      this.isMovingIn = true;
    }
  }

  /*
   * Moves the extruder across the item it's sitting on top of by decreasing
   * its horizontal offset. 
   */
  this.move = function() {
    if (this.isMovingIn) {
      this.moveIn();
    }
    else if (this.isMovingOut) {
      this.moveOut();
    }

    // Make sure the steel's position has visually updated
    flammableRight.setXOffset();
  }

  /*
   * Moves the steel towards the extruder.
   */
  this.moveIn = function() {
    // Verify the new position is valid before updating
    var newPctDistanceMoved = this.pctDistanceMoved + this.MOVE_PCT;
    if (newPctDistanceMoved < 1 + this.MOVE_PCT) {
      this.pctDistanceMoved = newPctDistanceMoved;
    } else {
      this.isMovingIn = false;
      this.isMovingOut = true;
      this.shredItem(); // Change the item's image
      resizeInfoBoxes(); // Size of table header may have changed
    }
  }

  /*
   * Moves the steel away from the extruder.
   */
  this.moveOut = function() {
    // Verify the new position is valid before updating
    var newPctDistanceMoved = this.pctDistanceMoved - this.MOVE_PCT;
    if (newPctDistanceMoved >= this.MOVE_PCT) {
      this.pctDistanceMoved = newPctDistanceMoved;
    } else {
      this.isMoving = false;
      this.isMovingOut = false;
      this.isFadingOut = true;
    }
  }

  /* ==================================================================
                              Getter Functions
     ==================================================================
  */
 
  /*
   * Gets the height of this item.
   */
  this.getHeight = function() {
    /* Choose a height that wouldn't be too big compared to the steel images
     * and also wouldn't overflow from the gray panel */
    var option1 = windowHeight * config['sliderYOffsetRatio'] * 0.9;
    var option2 = flammableLeft.height * 3;
    var raw = min(option1, option2);
    var pct = raw / windowHeight * 100;
    return pct + "%";
  }

  /*
   * Gets the horizontal offset of this item (as a percentage of the window
   * width stored as a string).
   */
  this.getXOffset = function() {
    var width = $(this.imgID).width();
    var raw = windowWidth * config['panelXOffsetRatio'] + windowWidth * 
      config['panelWidthRatio'] / 2 - width / 2;
    var pct = raw / windowWidth * 100;
    return pct + "%";
  }

  /*
   * Gets the horizontal offset of this item (in raw pixels).
   */
  this.getXOffsetPixels = function() {
    var width = $(this.imgID).width();
    return windowWidth * config['panelXOffsetRatio'] + windowWidth * 
      config['panelWidthRatio'] / 2 - width / 2;
  }

  /*
   * Gets the vertical offset of this item.
   */
  this.getYOffset = function() {
    var height = $(this.imgID).height();
    var panelHeight = getSliderVerticalOffset() * config['panelHeightRatio'];
    var padding = windowHeight * config['panelYOffsetRatio'];
    var diff = panelHeight - height;
    var raw = padding + diff / 2;
    var pct = raw / windowHeight * 100;
    return pct + "%";
  }
}
