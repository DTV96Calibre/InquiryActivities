/* File: Steel.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the steel (which is rendered in 
 * discrete intervals from solid to extra-fine wool).
 */
function Steel(isMutable) {
  FlammableItem.call(this, isMutable); // Inherit from FlammableItem parent class
  Steel.prototype = Object.create(FlammableItem.prototype);

  this.img = images['steel0']; // Image is initialized to the solid steel ingot

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
}
