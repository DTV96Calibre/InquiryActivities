/* File: steel.js
 * Dependencies: fire.js
 *
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

var onMobile;

var canvas;
var ctx;
var fire;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;

  frameRate(30);

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    onMobile = 1;
  } else onMobile = 0;

  fire = new Fire();
}

function draw() {
  // background(0); // Clear the canvas
  background("rgba( 15, 5, 2, 1 )");
  fire.run();

}