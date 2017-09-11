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
  this.num = 0;
  this.burntImage = images['steel_fire'];

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
    this.num = int(imageID.charAt(imageID.length - 1));
    this.setRadius();

    // Update the image and resize appropriately
    this.img = images[imageID];
    this.resize();

    // Update the table of info since the nature of the material has changed
    this.updateTableData(); // From FlammableItem parent class
  }

  /*
   * Sets the horizontal offset of this steel.
   */
  this.setXOffset = function() {
    // Horizontal offset depends on which item (left or right) is being drawn
    if (this.isMutable) {
      var moved = machine.pctDistanceMoved * machine.distanceToMove;
      this.xOffset = windowWidth * config['itemRightXOffsetRatio'] - moved;
    } else {
      this.xOffset = windowWidth * config['itemLeftXOffsetRatio'];
    }
  }

  /*
   * Sets the radius of the steel according to the this.num (e.g. 0 is the
   * thickest steel, 4 is the finest).
   */
  this.setRadius = function() {
    this.radius = STEEL_DIAMETERS[this.num] / 2;
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

  /*
   * Returns a string describing this material (to be displayed as a title
   * of the table holding mathematical properties for this steel).
   */
  this.getDescriptor = function() {
    var temp;
    switch(this.num) {
      case 0:
        temp = "Ingot";
        break;
      case 1:
        temp = "Beam";
        break;
      case 2:
        temp = "Wool -- Extra Coarse (Grade 4)";
        break;
      case 3:
        temp = "Wool -- Fine (Grade 0)";
        break;
      case 4:
        temp = "Wool -- Super Fine (Grade 0000)";
        break;
    }

    return "(Steel) " + temp;
  }
}
