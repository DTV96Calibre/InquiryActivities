/* File: fire.js
 * Author: Julien Amblard
 *         Adapted by Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/*
 * This class encapsulates the onscreen fire graphics (drawn on the tip of
 * the match as well as when the steel wool ignites).
 */
var Fire = function() {
  // Constants (more like pseudo-constants)
  this.MAX_NUM_PARTICLES = 50;
  this.MAX_NUM_PARTICLES_MOBILE = 15;
  this.MAX_NUM_SPARKS = 15;

  // Use global variables to link our p5.js canvas element and a 2D context
  this.canvas = canvas;
  this.ctx = ctx;

  // Arrays of particles that will be updated + rendered once per frame
  this.flameArray = [];
  this.dullSparkArray = [];
  this.brightSparkArray = [];

  // Graphical properties
  this.numParticles = this.getMaxNumParticles();
  this.numSparks = this.MAX_NUM_SPARKS;
  this.centerPosX = this.canvas.width * .5;
  this.centerPosY = this.canvas.height * .75;

  this.init();
}

/*
 * Checks which platform the user is running this simulation on and limits
 * the maximum number of rendered particles accordingly. (Flame effect can
 * be laggy on mobile.)
 */
Fire.prototype.getMaxNumParticles = function() {
  if (/Android | webOS | iPhone | iPad | iPod/i.test(navigator.userAgent)) {
    // on mobile
    return this.MAX_NUM_PARTICLES_MOBILE;
  } else return this.MAX_NUM_PARTICLES;
}

/*
 * Initializes this Fire object.
 */
Fire.prototype.init = function() {
  this.imageObj = new Image();
  this.pattern = this.ctx.createPattern(this.imageObj, 'repeat');
}

/*
 * Advances the fire animation by one frame by updating and rendering its
 * particles.
 */
Fire.prototype.run = function() {
  this.update();
  this.draw();
}

/*
 * Updates this Fire animation's arrays of particles (flames and sparks).
 */
Fire.prototype.update = function() {
  this.flameArray.push(new Flame(this.centerPosX, this.centerPosY));
  this.brightSparkArray.push(new Spark(this.centerPosX, this.centerPosY));

  for (var i = 0; i < this.numParticles; i++) {
    if (i < this.flameArray.length) {
      if (this.flameArray[i].alive )
        this.flameArray[i].update();
      else
        this.flameArray.splice( i, 1 );
    }
  }

  for (var i = 0; i < this.numSparks; i++) {
    if (i < this.brightSparkArray.length) {
      if( this.brightSparkArray[i].alive )
        this.brightSparkArray[i].update();
      else
        this.brightSparkArray.splice( i, 1 );
    }
  }
}

/*
 * Draws this Fire animation's arrays of particles (flames and sparks).
 */
Fire.prototype.draw = function(){
  this.ctx.fillStyle = "rgba( 15, 5, 2, 1 )";

  this.clearCanvas();

  for (var i = 0; i < this.numParticles; i++) {
    if (i < this.flameArray.length)
      this.flameArray[i].draw(this.ctx);
  }

  this.ctx.globalCompositeOperation = "soft-light";

  for (var i = 0; i < this.numSparks; i++) {
    if ((i % 2) === 0 && i < this.dullSparkArray.length)
      this.dullSparkArray[i].draw(this.ctx);
  }

  this.ctx.globalCompositeOperation = "color-dodge";

  for (var i = 0; i < this.numSparks; i++) {
    if (i < this.brightSparkArray.length)
      this.brightSparkArray[i].draw(this.ctx);
  }
}

/*
 * Clears the area of this canvas while applying a "source-over" effect (i.e.
 * previous fire particles linger underneath).
 */
Fire.prototype.clearCanvas = function(){
  this.ctx.globalCompositeOperation = "source-over";
  this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight );
}

/* ==================================================================
                               Flame Class
   ==================================================================
*/

/*
 * This class encapsulates the individual flame particles (red/orange ellipses
 * that burst and pop as they float toward the top of the screen).
 */
var Flame = function(centerPosX, centerPosY) {
  this.cx = centerPosX;
  this.cy = centerPosY;
  this.x = rand(this.cx - 25, this.cx + 25);
  this.y = rand(this.cy - 5, this.cy + 5);
  this.lx = this.x;
  this.ly = this.y;
  this.vy = rand( 1, 3 );
  this.vx = rand( -1, 1 );
  this.r = rand( 30, 40 );
  this.life = rand( 2, 7 );
  this.alive = true;

  this.c = {
    h : Math.floor( rand( 2, 40) ),
    s : 100,
    l : rand( 80, 100 ),
    a : 0,
    ta : rand( 0.8, 0.9 )
  }
}

/*
 * Updates various properties of this flame particle, including its alpha
 * (opacity) and remaining lifespan.
 */
Flame.prototype.update = function() {

  this.lx = this.x;
  this.ly = this.y;

  this.y -= this.vy;
  this.vy += 0.08;

  this.x += this.vx;

  if (this.x < this.cx)
    this.vx += 0.2;
  else
    this.vx -= 0.2;

  if (this.r > 0)
    this.r -= 0.3;
  
  if (this.r <= 0)
    this.r = 0;

  this.life -= 0.12;

  if (this.life <= 0) {
    this.c.a -= 0.05;
    if (this.c.a <= 0)
      this.alive = false;
  }
  else if (this.life > 0 && this.c.a < this.c.ta) {
    this.c.a += .08;
  }
}

/*
 * Draws this flame particle.
 */
Flame.prototype.draw = function(ctx) {
  this.grd1 = ctx.createRadialGradient(this.x, this.y, this.r * 3, this.x, 
    this.y, 0);
  this.grd1.addColorStop(0.5, "hsla( " + this.c.h + ", " + this.c.s + "%, " + 
    this.c.l + "%, " + (this.c.a / 20) + ")");
  this.grd1.addColorStop(0, "transparent");

  this.grd2 = ctx.createRadialGradient(this.x, this.y, this.r, this.x, this.y,
   0);
  this.grd2.addColorStop(0.5, "hsla( " + this.c.h + ", " + this.c.s + "%, " +
   this.c.l + "%, " + this.c.a + ")");
  this.grd2.addColorStop(0, "transparent");

  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r * 3, 0, 2 * Math.PI);
  ctx.fillStyle = this.grd1;
  ctx.fill();

  ctx.globalCompositeOperation = "overlay";
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
  ctx.fillStyle = this.grd2;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(this.lx , this.ly);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l +
   "%, 1)";
  ctx.lineWidth = rand(1, 2);
  ctx.stroke();
  ctx.closePath();
}

/* ==================================================================
                              Spark Class
   ==================================================================
*/

/*
 * This class encapsulates the spark particles (small multicolored strokes that
 * float to the top of the screen).
 */
var Spark = function(centerPosX, centerPosY) {
  this.cx = centerPosX;
  this.cy = centerPosY;
  this.x = rand(this.cx -40, this.cx + 40);
  this.y = rand(this.cy, this.cy + 5);
  this.lx = this.x;
  this.ly = this.y;
  this.vy = rand(1, 3);
  this.vx = rand(-4, 4);
  this.r = rand(0, 1);
  this.life = rand(4, 8);
  this.alive = true;

  this.c = {
    h : Math.floor(rand(2, 40)),
    s : 100,
    l : rand(40, 100),
    a : rand(0.8, 0.9)
  }
}

/*
 * Updates this spark by advancing its animation by 1 frame.
 */
Spark.prototype.update = function() {
  this.lx = this.x;
  this.ly = this.y;

  this.y -= this.vy;
  this.x += this.vx;

  if (this.x < this.cx)
    this.vx += 0.2;
  else
    this.vx -= 0.2;

  this.vy += 0.08;
  this.life -= 0.1;

  if (this.life <= 0) {
    this.c.a -= 0.05;

    if (this.c.a <= 0)
      this.alive = false;
  }
}

/*
 * Draws this spark.
 */
Spark.prototype.draw = function( ctx ){
  ctx.beginPath();
  ctx.moveTo( this.lx , this.ly);
  ctx.lineTo( this.x, this.y);
  ctx.strokeStyle = "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l + 
    "%, " + (this.c.a / 2) + ")";
  ctx.lineWidth = this.r * 2;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo( this.lx , this.ly);
  ctx.lineTo( this.x, this.y);
  ctx.strokeStyle = "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l +
    "%, " + this.c.a + ")";
  ctx.lineWidth = this.r;
  ctx.stroke();
  ctx.closePath();
}

// onresize = function() { 
//   fire.canvas.width = window.innerWidth;
//   fire.canvas.height = window.innerHeight; 
// };
