/* File: fire.js
 * Author: Julien Amblard
 *         Adapted by Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

var Fire  = function() {

  // Use global variables
  this.canvas = canvas;
  this.ctx = ctx;

  this.aFires     = [];
  this.aSpark     = [];
  this.aSpark2    = [];

  this.numParticles = 30;
  this.numSparks = 15;
  if (onMobile) {
    this.numParticles = 15;
  }


  this.mouse = {
    x : this.canvas.width * .5,
    y : this.canvas.height * .75,
  }

  this.init();

}
Fire.prototype.init = function()
{
  
  // this.canvas.addEventListener('mousemove', this.updateMouse.bind( this ), false);
  this.imageObj = new Image();
  // this.imageObj.src = document.getElementById('bg').getAttribute('src');
  this.pattern = this.ctx.createPattern( this.imageObj, 'repeat' );

}
Fire.prototype.run = function(){
  
  this.update();
  this.draw();

}

Fire.prototype.update = function(){

  this.aFires.push( new Flame( this.mouse ) );
  this.aSpark2.push( new Spark( this.mouse ) );

  for (var i = 0; i < this.numParticles; i++) {
    if (i < this.aFires.length) {
      if (this.aFires[i].alive )
        this.aFires[i].update();
      else
        this.aFires.splice( i, 1 );
    }
  }

  for (var i = 0; i < this.numSparks; i++) {
    if (i < this.aSpark2.length) {
      if( this.aSpark2[i].alive )
        this.aSpark2[i].update();
      else
        this.aSpark2.splice( i, 1 );
    }
  }
}

Fire.prototype.draw = function(){

  this.ctx.fillStyle = "rgba( 15, 5, 2, 1 )";

  this.clearCanvas();

  for (var i = 0; i < this.numParticles; i++) {
    if (i < this.aFires.length)
      this.aFires[i].draw(this.ctx);
  }

  this.ctx.globalCompositeOperation = "soft-light";//"soft-light";//"color-dodge";

  for (var i = 0; i < this.numSparks; i++) {
    if ((i % 2) === 0 && i < this.aSpark.length)
      this.aSpark[i].draw(this.ctx);
  }

  this.ctx.globalCompositeOperation = "color-dodge";//"soft-light";//"color-dodge";

  for (var i = 0; i < this.numSparks; i++) {
    if (i < this.aSpark2.length)
      this.aSpark2[i].draw(this.ctx);
  }
}

Fire.prototype.clearCanvas = function(){

  this.ctx.globalCompositeOperation = "source-over";
  this.ctx.fillRect( 0, 0, window.innerWidth, window.innerHeight );
}



var Flame = function( mouse ){

  this.cx = mouse.x;
  this.cy = mouse.y;
  this.x = rand( this.cx - 25, this.cx + 25);
  this.y = rand( this.cy - 5, this.cy + 5);
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
Flame.prototype.update = function()
{

  this.lx = this.x;
  this.ly = this.y;

  this.y -= this.vy;
  this.vy += 0.08;


  this.x += this.vx;

  if( this.x < this.cx )
    this.vx += 0.2;
  else
    this.vx -= 0.2;




  if(  this.r > 0 )
    this.r -= 0.3;
  
  if(  this.r <= 0 )
    this.r = 0;



  this.life -= 0.12;

  if( this.life <= 0 ){

    this.c.a -= 0.05;

    if( this.c.a <= 0 )
      this.alive = false;

  }else if( this.life > 0 && this.c.a < this.c.ta ){

    this.c.a += .08;

  }

}
Flame.prototype.draw = function( ctx ){

  this.grd1 = ctx.createRadialGradient( this.x, this.y, this.r*3, this.x, this.y, 0 );
  this.grd1.addColorStop( 0.5, "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l + "%, " + (this.c.a/20) + ")" );
  this.grd1.addColorStop( 0, "transparent" );

  this.grd2 = ctx.createRadialGradient( this.x, this.y, this.r, this.x, this.y, 0 );
  this.grd2.addColorStop( 0.5, "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l + "%, " + this.c.a + ")" );
  this.grd2.addColorStop( 0, "transparent" );


  ctx.beginPath();
  ctx.arc( this.x, this.y, this.r * 3, 0, 2*Math.PI );
  ctx.fillStyle = this.grd1;
  //ctx.fillStyle = "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l + "%, " + (this.c.a/20) + ")";
  ctx.fill();


  ctx.globalCompositeOperation = "overlay";
  ctx.beginPath();
  ctx.arc( this.x, this.y, this.r, 0, 2*Math.PI );
  ctx.fillStyle = this.grd2;
  ctx.fill();



  ctx.beginPath();
  ctx.moveTo( this.lx , this.ly);
  ctx.lineTo( this.x, this.y);
  ctx.strokeStyle = "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l + "%, 1)";
  ctx.lineWidth = rand( 1, 2 );
  ctx.stroke();
  ctx.closePath();

}








var Spark = function( mouse ){

  this.cx = mouse.x;
  this.cy = mouse.y;
  this.x = rand( this.cx -40, this.cx + 40);
  this.y = rand( this.cy, this.cy + 5);
  this.lx = this.x;
  this.ly = this.y;
  this.vy = rand( 1, 3 );
  this.vx = rand( -4, 4 );
  this.r = rand( 0, 1 );
  this.life = rand( 4, 8 );
  this.alive = true;
  this.c = {

    h : Math.floor( rand( 2, 40) ),
    s : 100,
    l : rand( 40, 100 ),
    a : rand( 0.8, 0.9 )

  }

}
Spark.prototype.update = function()
{

  this.lx = this.x;
  this.ly = this.y;

  this.y -= this.vy;
  this.x += this.vx;

  if( this.x < this.cx )
    this.vx += 0.2;
  else
    this.vx -= 0.2;

  this.vy += 0.08;
  this.life -= 0.1;

  if( this.life <= 0 ){

    this.c.a -= 0.05;

    if( this.c.a <= 0 )
      this.alive = false;

  }

}
Spark.prototype.draw = function( ctx ){

  ctx.beginPath();
  ctx.moveTo( this.lx , this.ly);
  ctx.lineTo( this.x, this.y);
  ctx.strokeStyle = "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l + "%, " + (this.c.a / 2) + ")";
  ctx.lineWidth = this.r * 2;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo( this.lx , this.ly);
  ctx.lineTo( this.x, this.y);
  ctx.strokeStyle = "hsla( " + this.c.h + ", " + this.c.s + "%, " + this.c.l + "%, " + this.c.a + ")";
  ctx.lineWidth = this.r;
  ctx.stroke();
  ctx.closePath();

}

rand = function( min, max ){ return Math.random() * ( max - min) + min; };
onresize = function () { fire.canvas.width = window.innerWidth; fire.canvas.height = window.innerHeight; };
