/* File: fire.js
 * Dependencies: util.js
 *
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

function Fire() {
  this.canvas = canvas;
  this.ctx = ctx;

  this.width = 200;
  this.height = 200;
  this.particles = [];
  this.max = 20;

  this.speed = 3;
  this.size = 4;

  // Three orange-reddish colors
  this.colors = ["rgba(232, 179, 0,", "rgba(232,70,0", "rgba(173,38,8,", "rgba(117,6,6,"];


  this.update = function() {
    //Adds ten new particles every frame
    for (var i=0; i<10; i++) {
      
      //Adds a particle at the mouse position, with random horizontal and vertical speeds
      var p = new Particle(mouseX, mouseY, (Math.random()*2*this.speed-this.speed)/2, 0-Math.random()*2*this.speed);
      this.particles.push(p);
    }
    
    //Clear the this.ctx so we can draw the new frame
    this.ctx.fillStyle = "rgba( 15, 5, 2, 1 )";
    // this.ctx.clearRect(0, 0, width, height); // TODO: Experiment w this.
    
    //Cycle through all the particles to draw them
    for (i=0; i < this.particles.length; i++) {
      
      //Set the file colour to an RGBA value where it starts off red-orange, but progressively gets more grey and transparent the longer the particle has been alive for
      // var x = (260-(this.particles[i].life*2));
      // var y = ((this.particles[i].life*2)+50);
      // var z = (this.particles[i].life*2);
      // var a = (((this.max-this.particles[i].life)/this.max)*0.4);
      // this.ctx.fillStyle = "rgba("+x+","+y+","+z+","+a+")";

      // METHOD 1 (Comment out one or the other)
      var youth = this.max - this.particles[i].life;
      var a = (((this.max-this.particles[i].life)/this.max)*0.4);
      // a = 0.05;

      if (youth > this.max * 0.8) {
        a = 0.09;
      }
      // END METHOD 1
      // METHOD 2
      var x = Math.floor((this.particles[i].life / this.max) * this.colors.length);
      this.ctx.fillStyle = this.colors[x] + a + ")";
      // END METHOD 2
      
      this.ctx.beginPath();
      //Draw the particle as a circle, which gets slightly smaller the longer it's been alive for
      this.ctx.arc(this.particles[i].x,this.particles[i].y,(this.max-this.particles[i].life)/this.max*(this.size/2)+(this.size/2),0,2*Math.PI);
      this.ctx.fill();
      
      //Move the particle based on its horizontal and vertical speeds
      this.particles[i].x+=this.particles[i].xs;
      this.particles[i].y+=this.particles[i].ys;
      
      this.particles[i].life++;
      //If the particle has lived longer than we are allowing, remove it from the array.
      if (this.particles[i].life >= this.max) {
        this.particles.splice(i, 1);
        i--;
      }
    }
  }

  this.getRandomColor = function() {
     return this.colors[Math.floor(Math.random() * this.colors.length)];
  }


}

//The class we will use to store particles. It includes x and y
//coordinates, horizontal and vertical speed, and how long it's
//been "alive" for.
function Particle(x, y, xs, ys) {
  this.x = x;
  this.y = y;
  this.xs = xs;
  this.ys = ys;
  this.life = 0;
}