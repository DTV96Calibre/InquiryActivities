/* File: steel.js
 * Dependencies: fire.js, util.js
 *
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

var FRAME_RATE = 45;

var onMobile;

var canvas;
var ctx;
var fire;

var img;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;

  frameRate(FRAME_RATE); // Cap frame rate

  fire = new Fire();

  // Load image from URL
  img = createImg("https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel_0.png?raw=true");
  img.hide();
}

function draw() {
  background("blue"); // Clear the canvas
  background("rgba( 15, 5, 2, 1 )");

  image(img, windowWidth / 2 - img.elt.width / 2, 
  	windowHeight / 2 - img.elt.height / 2, img.elt.width / 2, img.elt.height / 2);
  fire.update();
}