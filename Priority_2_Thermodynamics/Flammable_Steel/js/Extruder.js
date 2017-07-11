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

  this.imgID = "#extruder";

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
   * Moves the extruder across the item it's sitting on top of by decreasing
   * its horizontal offset. 
   */
  this.move = function() {
    // Verify the new position is valid before updating
    // var newPctDistanceMoved = this.pctDistanceMoved + this.MOVE_PCT;
    // if (newPctDistanceMoved <= 1) {
    //   // Change the item's image if the machine is positioned appropriately
    //   if (this.pctDistanceMoved < 0.5 && newPctDistanceMoved >= 0.5) {
    //     this.shredItem();
    //   }

    //   this.pctDistanceMoved = newPctDistanceMoved;
    //   $(this.imgID).css({ 'left': this.getXOffset() });
    // } else {
    //   this.isMoving = false;
    //   this.isFadingOut = true;
    // }
  }

  /* ==================================================================
                              Getter Functions
     ==================================================================
  */
 
  /*
   * Gets the width of this item.
   */
  this.getWidth = function() {
    var raw = windowWidth * config['extruderWidthRatio'];
    var pct = raw / windowWidth * 100;
    return pct + "%";
  }

  /*
   * Gets the horizontal offset of this item.
   */
  this.getXOffset = function() {
    var raw = windowWidth * config['panelXOffsetRatio'] + windowWidth * 
      config['panelWidthRatio'] / 2 - this.width / 2;
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
