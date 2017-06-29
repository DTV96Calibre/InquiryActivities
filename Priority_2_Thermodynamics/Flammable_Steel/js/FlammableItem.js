/* File: FlammableItem.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * A base class from which the Steel and Wood classes inherit.
 */
function FlammableItem(isMutable) {
  this.img;
  this.isMutable = isMutable;  // True for the item on the right
  this.hasCaughtFire = false;
  this.pctBurned = 0;

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
  }

  /*
   * Updates the image used to represent this flammable item.
   * @param imageID: A string used to index into the global var of images
   */
  this.changeImage = function(imageID) {
    this.img = images[imageID];
    this.resize();
  }

  /*
   * Returns true if the cursor is hovering over this item.
   */
  this.cursorIsOver = function() {
    return (mouseX > this.xOffset && mouseX < this.xOffset + this.width
         && mouseY > this.yOffset && mouseY < this.yOffset + this.height);
  }

  /* ==================================================================
                             Setter Functions
     ==================================================================
  */
 
  /*
   * Sets the width of this item.
   */
  this.setWidth = function() {
    this.width = windowWidth * config['itemWidthRatio'];
    // Draw certain images a little smaller
    if (this.img == images['wood1'] || this.img == images['ash']) {
      this.width *= 0.8;
    }
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

    // If an image was drawn to be smaller, it must also have a greater x offset
    if (this.img == images['wood1'] || this.img == images['ash']) {
      this.xOffset += this.width * 0.1;
    }
  }

  /*
   * Sets the vertical offset of this item.
   */
  this.setYOffset = function() {
    // Use max function to prevent image from disappearing offscreen
    this.yOffset = max(windowHeight * config['itemYOffsetRatio'] - this.height / 2,
     windowHeight * 0.15);

    // If an image was drawn to be smaller, it must also have a greater x offset
    if (this.img == images['ash']) {
      this.yOffset += this.height * 0.2;
    }
  }
}
