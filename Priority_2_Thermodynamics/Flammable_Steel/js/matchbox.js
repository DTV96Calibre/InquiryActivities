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
  this.padding; // Length of margin to draw away from the lefthand corner

	/*
   * Sets the graphical properties of this matchbox based on the window size.
   */
  this.resize = function() {
    this.height = windowHeight * config['matchHeightRatio']
     * config['matchboxHeightRatio'];
    var aspectRatio = this.img_bottom.elt.width / this.img_bottom.elt.height;
    this.width = this.height * aspectRatio;
    this.padding = windowWidth * config['matchboxPaddingRatio'];
    this.xOffset = this.padding;
    this.yOffset = windowHeight - this.height - this.padding;
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
