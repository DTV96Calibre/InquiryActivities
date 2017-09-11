/* File: Match.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the match, which can be dragged
 * by the user to ignite objects.
 */
function Match() {
  this.img = images['matchstick_down'];
  this.fire = new Fire(this, 10, 20, 4);
  
  /* Graphical properties */
  this.width;
  this.height;
  this.xOffset;
  this.yOffset = 0;

  /*
   * Sets the position of this match to the origin so that it's sitting inside
   * the matchbox.
   */
  this.setToOriginPos = function() {
    this.xOffset = matchbox.xOffset + matchbox.width * 0.70;
    this.yOffset = matchbox.yOffset - matchbox.height / 10;
  }

  /*
   * Sets the graphical properties of this match based on the size of the
   * matchbox.
   */
  this.resize = function() {
    this.height = matchbox.height * config['matchHeightRatio'];
    var aspectRatio = this.img.elt.width / this.img.elt.height;
    this.width = this.height * aspectRatio;
  }

  /*
   * Renders this image onscreen.
   */
  this.draw = function() {
    // Horizontal and vertical offsets update every frame when holding match
    if (holdingMatch) {
      this.xOffset = mouseX;
      this.yOffset = mouseY;
    }

    image(this.img, this.xOffset - this.width / 1.5, 
      this.yOffset - this.width / 1.5, this.width, this.height);

    // Draw the flame on the tip of the match
    this.fire.update();
  }

  /*
   * Returns true if the cursor is hovering over this match.
   */
  this.cursorIsOver = function() {
    // Adjust offsets so they correspond with skewed positioning of matchstick
    var tempXOffset = this.xOffset - this.width / 1.5;
    var tempYOffset = this.yOffset - this.width / 1.5;

    return (mouseX > tempXOffset && mouseX < tempXOffset + this.width
         && mouseY > tempYOffset && mouseY < tempYOffset + this.height);
  }
}

