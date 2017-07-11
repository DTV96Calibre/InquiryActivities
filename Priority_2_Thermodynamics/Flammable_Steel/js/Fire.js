/* File: Fire.js
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the "fire" particle effects used 
 * to indicate the burning steel wool / tip of match.
 * @param object: The object that this fire is attached to (match/steel/wood)
 * @param numParticlesToSpawn: Particles to spawn per frame
 * @param maxLife: The number of frames each particle is active
 * @param size: The radius of the flame particles
 * @param width: The length in pixels along which particles will spawn
 */
function Fire(object, numParticlesToSpawn, maxLife, size, width) {
  this.canvas = canvas;
  this.ctx = ctx;
  this.particles = [];
  this.object = object;
  this.numParticlesToSpawn = numParticlesToSpawn;
  this.maxLife = maxLife; // Higher value => particles disintegrate more slowly
  this.speed = 2;         // Higher value => particles rise faster
  this.size = size;       // Higher value => radius of the particles gets larger
  this.width = width;     // Higher value => particles spawn in larger area
  this.originX;
  this.originY;

  // Orange-reddish colors to paint flame particles for a "gradient" effect
  this.colors = ["rgba(232,179,0,",
                 "rgba(195,44,9,", "rgba(173,38,8,", "rgba(117,6,6,"];

  /*
   * Advances the particle effect by one frame. This function should be called
   * by the main (draw()) loop in main.js as long as this fire is active.
   */
  this.update = function() {
    // If this fire has an invalid size, it shouldn't be burning any longer
    if (this.size < 0) return;
    
    // The only flame that needs its location updated is the match
    if (this.object == matchstick) {
      this.updateOrigin();
    }
    
    this.spawnParticles();
    
    // Iterate through the array of flame particles and draw them
    for (i = 0; i < this.particles.length; i++) {
      this.ctx.fillStyle = this.getParticleColor(i);
      this.ctx.beginPath();

      // Properties for drawing an arc
      var xPos = this.particles[i].x;
      var yPos = this.particles[i].y;
      var radius = (this.maxLife - this.particles[i].life) / this.maxLife * 
        (this.size / 2) + (this.size / 2);

      // Prevent crashes when fed negative values
      if (radius < 0) return;

      // Draw the particle as an ellipse that gradually shrinks as it ages
      this.ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // Move the particle based on its horizontal and vertical speeds
      this.particles[i].x += this.particles[i].xs;
      this.particles[i].y += this.particles[i].ys;
      
      this.particles[i].life++; // Particle is now older by 1 frame

      // If the particle has outlived its lifespan, remove it from the array
      if (this.particles[i].life >= this.maxLife) {
        this.particles.splice(i, 1);
        i--;
      }
    }
  }

  /*
   * Updates the origin (spawn position) of this fire.
   */
  this.updateOrigin = function() {
    this.originX = object.xOffset;
    this.originY = object.yOffset;
  }

  /*
   * Generates a set number of particles that will be added to this flame.
   */
  this.spawnParticles = function() {
    for (i = 0; i < this.numParticlesToSpawn; i++) {
      // Particles move at randomized speeds
      var horizontalSpeed = (Math.random() * 2 * this.speed - this.speed) / 2;
      var verticalSpeed = 0 - Math.random() * 2 * this.speed;

      var p;
      // The distance between particles depends on the object that's burning
      if (this.object == matchstick) {
        p = new Particle(this.originX, this.originY, horizontalSpeed, 
          verticalSpeed);
      }
      else {
        var xOffset = (i / this.numParticlesToSpawn) * this.width;
        var yOffset = this.object.height * 0.9 - (i / 10) * 
          (this.object.height / this.numParticlesToSpawn / 2);
        p = new Particle(this.originX + xOffset, this.originY + yOffset, 
          horizontalSpeed, verticalSpeed);
      }
      
      this.particles.push(p);
    }
  }

  /*
   * Returns an RGB color value (including an alpha level) for the given
   * particle -- older particles have traveled further from the center of the
   * flame and have a more reddish / opaque color.
   * @param particleIndex: An integer used to index into this.particles array
   */
  this.getParticleColor = function(particleIndex) {
    var particle = this.particles[particleIndex];

    // Alpha (level of opacity) depends on the age of this particle
    var remainingLife = this.maxLife - particle.life;
    var alpha = (remainingLife / this.maxLife) * 0.4;

    /* "Younger" particles override this alpha setting and are almost 
     * transparent (to offset the intensity of the yellow color) */
    if (remainingLife > this.maxLife * 0.8) {
      alpha = 0.09;
    }

    // Grab the color that most closely aligns with the age of this particle
    var colorIndex = Math.floor((particle.life / this.maxLife) * this.colors.length);

    if (this.object != matchstick) {
      // Make particles only burn with a yellow at center for first 20% of life
      if (colorIndex == 0 && remainingLife < this.maxLife * 0.8) {
        colorIndex = 1;
      }
    }

    return this.colors[colorIndex] + alpha + ")"; // Assemble RGBA string
  }
}

/*
 * This class encapsulates the behavior of the individual "fire" particles 
 * stored in the array of a Fire object.
 */
function Particle(x, y, xs, ys) {
  this.x = x;    // Horizontal coordinate
  this.y = y;    // Vertical coordinate
  this.xs = xs;  // Horizontal speed
  this.ys = ys;  // Vertical speed
  this.life = 0; // Number of frames this particle has been alive for
}
