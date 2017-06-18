/* File: steel.js
 * Dependencies: fire.js, spark.js
 *
 * Authors: Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

var onMobile;

var canvas;
var ctx;
var fire;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    onMobile = 1;
  } else onMobile = 0;

  alert("onMobile status: " + onMobile);

  fire = new Fire();
}

function draw() {
  // background(0); // Clear the canvas
  background("rgba( 15, 5, 2, 1 )");
  fire.run();

}