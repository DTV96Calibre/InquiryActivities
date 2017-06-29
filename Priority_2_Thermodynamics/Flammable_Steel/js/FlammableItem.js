/* File: FlammableItem.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * A base class from which the Steel and Wood classes inherit.
 */
function FlammableItem(isMutable) {
  /* Constants */
  this.BURNING_RATE = 0.03; // The change in opacity percentage per frame

  /* Other properties */
  this.img;
  this.isMutable = isMutable;  // True for the item on the right
  this.hasCaughtFire = false;
  this.isDoneBurning = false;
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
    this.update();
    image(this.img, this.xOffset, this.yOffset, this.width, this.height);

    // Draw this image with a lower opacity if it's currently burning
    if (this.hasCaughtFire) {
      var alpha = this.pctBurned;
      noStroke();
      fill(PANEL_COLOR + alpha + ')');
      rect(this.xOffset, this.yOffset, this.width, this.height);

      // Draw resulting image (i.e. ash or burnt wool) with inverted opacity
      this.updateBurntImage();
    }
  }

  /*
   * Updates this image by checking whether it's currently on fire. If so, 
   * advances the animation that shows this object burning (into ash for wood, 
   * or burnt wool for steel).
   */
  this.update = function() {
    if (this.isDoneBurning) return; // Nothing else to be done

    if (this.hasCaughtFire) {
      this.pctBurned += this.BURNING_RATE;
      if (this.pctBurned >= 1) {
        this.isDoneBurning = true;
      }
    }
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
   * Configures the image from the DOM that will be rendered once this item 
   * is burning.
   */
  this.updateBurntImage = function() {
    var overlayImageID = this.getBurntImage();
    var opacity = this.pctBurned;
    var width = this.width / windowWidth * 100 + "%";
    var xOffset = this.xOffset / windowWidth * 100 + "%";
    var yOffset = flammableLeft.yOffset / windowHeight * 100 + "%";
    $(overlayImageID).css({ 'opacity': opacity });
    $(overlayImageID).css({ 'width': width });
    $(overlayImageID).css({ 'left': xOffset });
    $(overlayImageID).css({ 'top': yOffset });
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
}
