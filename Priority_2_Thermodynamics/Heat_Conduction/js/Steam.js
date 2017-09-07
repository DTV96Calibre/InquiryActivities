/* File: Steam.js
 * Author: Daniel Vasquez & Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the behavior of the "steam" particle effects used 
 * to indicate the boiling water in the pot.
 */
function Steam() {
  this.particles = [];
  this.numParticlesToSpawn = 1;
  this.maxLife = 200; // Higher value => particles disintegrate more slowly
  this.speed = 0.3;         // Higher value => particles rise faster
  this.size = 15;       // Higher value => radius of the particles gets larger
  this.width;     // Higher value => particles spawn in larger area
  this.originX;
  this.originY;

  /*
   * Advances the particle effect by one frame. This function should be called
   * by the main (draw()) loop in main.js as long as the steam is active.
   */
  this.update = function() {
    // If this steam has an invalid size, don't render or update it
    if (this.size < 0) return;
    
    this.spawnParticles();
    
    // Iterate through the array of steam particles and draw them
    for (i = 0; i < this.particles.length; i++) {
      var particle = this.particles[i];

      // Alpha (level of opacity) depends on the age of this particle
      var remainingLife = this.maxLife - particle.life;
      var alpha = (remainingLife / this.maxLife) * 0.4;
      fill("rgba(192,192,192," + alpha + ")");

      // Properties for drawing an arc
      var xPos = this.particles[i].x;
      var yPos = this.particles[i].y;
      var radius = (this.maxLife - this.particles[i].life) / this.maxLife * 
        (this.size / 2) + (this.size / 2);

      // Prevent crashes when fed negative values
      if (radius < 0) return;

      // Draw the particle as an ellipse that gradually shrinks as it ages
      ellipse(xPos, yPos, radius, radius);
      
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
   * Updates the origin (spawn position) of this steam.
   */
  this.updateOrigin = function() {
    this.originX = pot.pos.x + pot.potThickness * 2;
    this.originY = pot.pos.y - this.size / 2;
    this.width = pot.potWidth * 0.8 - pot.potThickness * 1.5;
  }

  /*
   * Generates a set number of particles that will be added to this steam.
   */
  this.spawnParticles = function() {
    for (i = 0; i < this.numParticlesToSpawn; i++) {
      // Particles move at randomized speeds
      var horizontalSpeed = (Math.random() * 2 * this.speed - this.speed) / 2;
      var verticalSpeed = 0 - Math.random() * 2 * this.speed;

      // Create a new particle
      var xOffset = Math.random() * this.width;
      var yOffset = pot.potHeight * 0.9;
      var p = new Particle(this.originX + xOffset, this.originY + yOffset, 
          horizontalSpeed, verticalSpeed);
      
      this.particles.push(p);
    }
  }
}

/*
 * This class encapsulates the behavior of the individual particles 
 * stored in the array of a Steam object.
 */
function Particle(x, y, xs, ys) {
  this.x = x;    // Horizontal coordinate
  this.y = y;    // Vertical coordinate
  this.xs = xs;  // Horizontal speed
  this.ys = ys;  // Vertical speed
  this.life = 0; // Number of frames this particle has been alive for
}
