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

  this.mass = STEEL_MASS; // Units: g
  this.density = STEEL_DENSITY; // Units: g / cm^3
  this.radius = STEEL_DIAMETERS[0] / 2; // Units: cm

  this.img = images['steel0']; // Image is initialized to the solid steel ingot
  this.burntImage = images['steel_fire'];

  this.fireSize = STEEL_FIRE_PARTICLE_SIZE;
  this.fireMaxLife = STEEL_FIRE_MAX_LIFE;
  this.fire;

  /*
   * Sets this steel on fire, which updates its appearance.
   */
  this.setFire = function() {
    // Steel that is too thick can't catch fire
    if (this.img == images["steel4"] && holdingMatch && this.pctBurned == 0) {
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
    this.initFire();
  }

  /*
   * Updates the image used to represent this steel.
   * @param imageID: A string used to index into the global var of images
   */
  this.changeImage = function(imageID) {
    // Update the radius of this steel to be used in calculations
    var num = imageID.charAt(imageID.length - 1);
    this.setRadius(int(num));

    // Update the image and resize appropriately
    this.img = images[imageID];
    this.resize();

    // Update the table of info since the nature of the material has changed
    this.updateTableData(); // From FlammableItem parent class
  }

  /*
   * Sets the radius of the steel according to the given index (e.g. 0 is the
   * thickest steel, 4 is the finest).
   * @param index: An int
   */
  this.setRadius = function(index) {
    this.radius = STEEL_DIAMETERS[index] / 2;
  }

  /*
   * Computes and returns the volume of this steel based on its density and 
   * mass.
   */
  this.calculateVolume = function() {
    return this.mass / this.density;
  }

  /*
   * Computes and returns the 'height' of this piece, which is needed for
   * computing the surface area.
   */
  this.calculateHeight = function() {
    var volume = this.calculateVolume();
    // Each piece of steel is treated as a cylinder, so use cylinder volume eq.
    var height = volume / (Math.PI * Math.pow(this.radius, 2));
    return height;
  }

  /*
   * Computes and returns the surface area of this steel.
   */
  this.calculateSurfArea = function() {
    var height = this.calculateHeight();
    var surfArea = (2 * Math.PI * this.radius) * (height + this.radius);
    return surfArea;
  }
}
