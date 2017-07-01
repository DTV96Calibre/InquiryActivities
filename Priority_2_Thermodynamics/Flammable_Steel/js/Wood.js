/* File: Wood.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the wood (which is rendered in 
 * discrete intervals from log->planks->sticks->woodchips->sawdust).
 */
function Wood(isMutable) {
  FlammableItem.call(this, isMutable); // Inherit from FlammableItem parent class
  Steel.prototype = Object.create(FlammableItem.prototype);

  this.img = images['wood0']; // Image is initialized to the wood log
  this.fire = new Fire(this, 100, 40, 8);

  /*
   * Sets this wood on fire, which updates its appearance.
   */
  this.setFire = function() {
    if (holdingMatch && !this.isBurning) {
      this.isBurning = true;
    }
  }

  /*
   * Resets the properties that control the burning crossfade animation to
   * default.
   */
  this.reset = function() {
    this.isBurning = false;
    this.pctBurned = 0;
    this.fire = new Fire(this, 100, 40, 8);
  }
}
