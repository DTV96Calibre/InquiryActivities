/* File: Matchbox.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * A simple class that encapsulates the matchbox drawn onscreen.
 */
function Matchbox() {
	this.img_bottom = images["matchbox"];
	this.img_cover = images["matchbox_cover"];

  /* Graphical properties */
  this.width;
  this.height;
  this.xOffset;
  this.yOffset;
  this.padding;

  /*
   * Sets the graphical properties of this matchbox based on the window size.
   */
  this.resize = function() {
    this.padding = config['matchboxYPaddingRatio'] * windowHeight;
    
    // The width and height of the matchbox depend on the window's aspect ratio
    if (wideAspectRatio) {
      this.height = windowHeight * config['matchboxHeightRatio'];
    } else {
      this.height = this.getHeightOnMobile();
    }
    
    var aspectRatio = this.img_bottom.elt.width / this.img_bottom.elt.height;
    this.width = this.height * aspectRatio;

    // The placement of the matchbox also depends on the window
    if (wideAspectRatio) {
      this.xOffset = windowWidth * config['panelXOffsetRatio'] / 2 - this.width / 2;
      this.yOffset = getTableLowerBoundary() - this.height;
    } else {
      this.xOffset = (getTableRightBoundary() + getButtonRightBoundary()) / 2
       - this.height / 2;
      this.yOffset = getTableLowerBoundary() + this.padding * 2;
    }    
  }

  /*
   * Returns the ideal height in pixels of this matchbox on a mobile device (or 
   * any screen whose aspect ratio is taller than it is wide).
   */
  this.getHeightOnMobile = function() {
    // Find the height if we were to scale it to fit underneath the info table
    var topYPos = getTableLowerBoundary();
    var padding = this.padding * 3;
    var heightOption1 = windowHeight - topYPos - padding;

    // Find the height if we were to scale its width to fill 1/2 of the window
    var maxWidth = windowWidth / 2.2;
    var aspectRatio = this.img_bottom.elt.width / this.img_bottom.elt.height;
    var heightOption2 = maxWidth / aspectRatio;

    // Take the minimum of the two heights to ensure the matchbox will fit
    return min(heightOption1, heightOption2);
  }

  /*
   * Renders the bottom of this matchbox (the match/cursor should always float
   * on top of this when hovering over).
   */
  this.drawBottom = function() {
    image(this.img_bottom, this.xOffset, this.yOffset, this.width, this.height);
  }

  /*
   * Renders the top of this matchbox (the match/cursor should always be hidden
   * underneath this when hovering over).
   */
  this.drawCover = function() {
    image(this.img_cover, this.xOffset, this.yOffset, this.width, this.height);
  }
}

