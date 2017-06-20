/* File: main.js
 * Dependencies: fire.js, steel.js
 *
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/************************ Graphical properties *****************************/
var FRAME_RATE = 60;
var BG_COLOR = "rgba(15, 5, 2, 1)"; // Background color of the canvas

var STEEL0_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel_0.png?raw=true";
var STEEL1_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steelwool.png?raw=true";
var STEEL1_FIRE_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steelwool-fire.png?raw=true";

/************************ Onscreen elements ********************************/
var canvas;
var ctx;
var images; // The set of URLs that map to the steel images

var fire;
var steelLeft;
var steelRight;

/************************ Simulation variables *****************************/

var mousedOverWool = false;

/*
 * Built-in p5.js function; runs once the page loads and initializes the canvas
 * and other properties.
 */
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;
  frameRate(FRAME_RATE); // Cap frame rate
  initImages();

  // Init fire and steel
  fire = new Fire();
  steelLeft = new Steel(false);
  steelRight = new Steel(true);
  steelRight.changeImage("steel1");
  steelLeft.resize();
  steelRight.resize();
}

/*
 * Built-in p5.js function; runs 60 times per second and draws the onscreen
 * elements and animations.
 */
function draw() {
  background(BG_COLOR); // Clear the canvas

  if (steelRight.cursorIsOver()) {
    steelRight.setFire();
  }
  
  // Render onscreen elements
  steelLeft.draw();
  steelRight.draw();
  fire.update();
}

/*
 * Initializes the image elements that will be rendered on the p5 canvas.
 */
function initImages() {
  images = {
    steel0: createImg(STEEL0_URL),
    steel1: createImg(STEEL1_URL),
    steel1_fire: createImg(STEEL1_FIRE_URL)
  }

  // Hide the images so they don't appear beneath the canvas when loaded
  for (x in images) {
    images[x].hide();
  }
}
