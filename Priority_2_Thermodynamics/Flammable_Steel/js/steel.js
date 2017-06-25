/* File: steel.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the steel (which is rendered in 
 * discrete intervals from solid to extra-fine wool).
 */
function Steel(isMutable) {
  this.img = images['steel0']; // Image is initialized to the solid steel ingot
  this.isMutable = isMutable;  // True for the steel on the right
  this.hasCaughtFire = false;

  /* Graphical properties */
  this.width;
  this.height;
  this.xOffset;
  this.yOffset;

  /*
   * Sets the graphical properties of this steel piece based on the window
   * size.
   */
  this.resize = function() {
    this.width = windowWidth * config['steelWidthRatio'];
    var aspectRatio = this.img.elt.width / this.img.elt.height;
    this.height = this.width / aspectRatio;

    // Horizontal offset depends on which steel is being drawn
    if (this.isMutable) {
      this.xOffset = windowWidth * config['steelRightXOffsetRatio'];
    } else {
      this.xOffset = windowWidth * config['steelLeftXOffsetRatio'];
    }

    this.yOffset = windowHeight * config['steelYOffsetRatio'] - this.height / 2;
  }

  /*
   * Renders this image onscreen.
   */
  this.draw = function() {
    image(this.img, this.xOffset, this.yOffset, this.width, this.height);
  }

  /*
   * Updates the image used to represent this steel.
   * @param imageID: A string used to index into the global var of images
   */
  this.changeImage = function(imageID) {
    // Immutable steel can't change in appearance
    if (this.isMutable) {
      this.img = images[imageID];
      this.resize();
    }
  }

  /*
   * Sets this steel on fire, which updates its appearance.
   */
  this.setFire = function() {
    // Steel that is too thick can't catch fire
    if (this.img == images["steel4"] && holdingMatch) {
      this.hasCaughtFire = true;
      this.changeImage('steel_fire');
    }
  }

  /*
   * Returns true if the cursor is hovering over this steel.
   */
  this.cursorIsOver = function() {
    return (mouseX > this.xOffset && mouseX < this.xOffset + this.width
         && mouseY > this.yOffset && mouseY < this.yOffset + this.height);
  }
}