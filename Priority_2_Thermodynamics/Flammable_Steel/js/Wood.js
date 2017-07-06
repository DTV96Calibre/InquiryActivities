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

  this.mass = WOOD_MASS; // Units: g
  this.density = WOOD_DENSITY; // Units: g / cm^3
  this.numPieces = NUM_WOOD_PIECES[0];

  this.img = images['wood0']; // Image is initialized to the wood log
  this.burntImage = images['ash'];

  this.fireSize = WOOD_FIRE_PARTICLE_SIZE;
  this.fireMaxLife = WOOD_FIRE_MAX_LIFE;
  this.fire;

  /*
   * Sets this wood on fire, which updates its appearance.
   */
  this.setFire = function() {
    if (holdingMatch && this.pctBurned == 0) {
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
   * Updates the image used to represent this wood.
   * @param imageID: A string used to index into the global var of images
   */
  this.changeImage = function(imageID) {
    // Update the number of pieces of wood to be used in calculations
    var num = imageID.charAt(imageID.length - 1);
    this.setNumPieces(int(num));

    // Update the image and resize appropriately
    this.img = images[imageID];
    this.resize();

    // Update the table of info since the nature of the material has changed
    this.updateTableData(); // From FlammableItem parent class
  }

  /*
   * Sets the number of pieces of wood according to the given index (e.g. 0
   * corresponds to the log, 4 corresponds to the sawdust).
   * @param index: An int
   */
  this.setNumPieces = function(index) {
    this.numPieces = NUM_WOOD_PIECES[index];
  }

  /*
   * Computes and returns the volume of this wood based on its density and 
   * mass.
   */
  this.calculateVolume = function() {
    return this.mass / this.density;
  }

  /*
   * Returns the edge length of one piece of wood.
   */
  this.calculateEdgeLength = function() {
    return WOOD_BASE_PIECE_EDGE_LENGTH / this.numPieces;
  }

  /*
   * Computes and returns the surface area of one piece of wood.
   */
  this.calculateSurfAreaOne = function() {
    // Calculate the dimensions and volume of 1 piece of wood
    var edgeLengthOne = this.calculateEdgeLength();
    var width = edgeLengthOne;
    var height = edgeLengthOne;
    var volumeOne = this.calculateVolume() / this.numPieces;

    // Find length using rectangular prism eq. V = w * h * l
    var length = volumeOne / (width * height);

    // Find surf. area using rectangular prism eq. S = 2 * (lw + wh + lh)
    var surfAreaOne = 2 * (length * width + width * height + length * height);
    return surfAreaOne;
  }

  /*
   * Returns the total surface area summed across all pieces of wood.
   */
  this.calculateSurfArea = function() {
    return this.calculateSurfAreaOne() * this.numPieces;
  }
}
