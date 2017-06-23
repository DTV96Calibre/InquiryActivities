/* File: match.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the match, which can be dragged
 * by the user to ignite objects.
 */
function Match() {
  this.img = images['matchstick_down'];
  this.width;
  this.height;

  /*
   * Sets the graphical properties of this match based on the window size.
   */
  this.resize = function() {
    this.height = windowHeight / 4;
    var aspectRatio = this.img.elt.width / this.img.elt.height;
    this.width = this.height * aspectRatio;
  }

  /*
   * Renders this image onscreen.
   */
  this.draw = function() {
    image(this.img, mouseX - this.width / 1.5, mouseY - this.width / 1.5, this.width, this.height);
  }
}