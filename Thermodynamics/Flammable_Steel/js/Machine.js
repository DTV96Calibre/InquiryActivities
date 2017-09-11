/* File: Machine.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * A base class from which the Woodchipper and Extruder classes inherit.
 */
function Machine() {
  /* Constants */
  this.FADE_IN_PCT = 0.02; // 0.01 = 1% opacity per frame

  /* Misc. properties */
  this.opacity;
  this.isActive;
  this.isFadingIn;
  this.isMoving;
  this.isFadingOut;
  this.distanceToMove;
  this.pctDistanceMoved;

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
      $(this.imgID).css({ 'opacity': 0 });
      this.init();
    }
  }

  /*
   * Transitions the material (wood or steel) into the item indicated by the
   * slider.
   */
  this.shredItem = function() {
    // Change the image
    var intID = currSliderValue;
    var imageID = currentItem + intID;
    flammableRight.changeImage(imageID);

    // The flammable item image and the burnt image will both reset
    var overlayImageID = flammableRight.getBurntImage();
    $(overlayImageID).css({ 'opacity' : 0 });
    flammableRight.reset();

    lastSliderValue = intID;
  }
}
