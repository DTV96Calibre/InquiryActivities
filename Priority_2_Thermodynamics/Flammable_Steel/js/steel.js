/* File: steel.js
 * Dependencies: fire.js, spark.js
 *
 * Authors: Brooke Bullek (May 2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * (c) Margot Vigeant 2017
 */

var canvas;
var ctx;
var fire;

function setup() {
  canvas = createCanvas(400, 400);
  ctx = canvas.drawingContext;

  fire = new Fire();
  fire.start();
}

function draw() {
  // background(255); // Clear the canvas
}