/*
 * File: Cat.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

// Constants denoting the relative size of the cat w.r.t. screen size
var CAT_X_OFFSET_SCALING = 0.42;
var CAT_Y_OFFSET_SCALING = 0.25;
var CAT_WIDTH_SCALING    = 0.16;
var CAT_HEIGHT_SCALING   = 0.17;

class Cat {

  /**
   * Constructs a Cat object.
   * @param {Boolean} isAlive: true if the cat should be drawn with eyes open
   * @return none
   */
  constructor(isAlive, isIcon) {
    // Dictates whether the cat's eyes are open (alive) or closed (not alive)
    if (isAlive) {
      this.img = images['cat_alive'];
    } else {
      this.img = images['cat_dead'];
    }

    // Dictates the relative sizing of the cat (full-sized or icon)
    this.isIcon = isIcon;

    // Set initial dimensions
    this.resize();
  }

  /**
   * Resizes the dimensions of this cat.
   * @return none
   */
  resize() {
    // The full-sized cat has different dimensions than the mini (icon) cat
    if (!this.isIcon) {
      this.xOffset = windowWidth * CAT_X_OFFSET_SCALING;
      this.yOffset = windowHeight * CAT_Y_OFFSET_SCALING;
      this.width = windowWidth * CAT_WIDTH_SCALING;
      this.height = windowWidth * CAT_HEIGHT_SCALING;
    } else {
      // x-offset is set dynamically for arrays of cat icons
      this.yOffset = windowHeight * 0.05;
      this.width = windowWidth * CAT_WIDTH_SCALING / 3;
      this.height = windowWidth * CAT_HEIGHT_SCALING / 3;
    }
  }

  /**
   * Changes the status of the cat as alive or dead.
   * @param {Boolean} isAlive: True if the cat's eyes are open, false if not
   * @return none
   */
  setAliveStatus(isAlive) {
    this.isAlive = isAlive;
    if (isAlive) {
      this.img = images['cat_alive'];
    } else {
      this.img = images['cat_dead'];
    }
  }

  /**
   * Draws the cat onscreen.
   * @return none
   */
  draw() {
    image(this.img, this.xOffset, this.yOffset, this.width, this.height);
  }
}
