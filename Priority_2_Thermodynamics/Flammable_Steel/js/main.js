/* File: main.js
 * Dependencies: fire.js
 *
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/************************ Graphical properties *****************************/
var FRAME_RATE = 60;
var BG_COLOR = "rgba(15, 5, 2, 1)"; // Background color of the canvas

/************************ Onscreen elements ********************************/
var canvas;
var ctx;
var fire;

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

  fire = new Fire();

  // Load image from URL
  img = createImg("https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel_0.png?raw=true");
  img2 = createImg("https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steelwool.png?raw=true");
  img2fire = createImg("https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steelwool-fire.png?raw=true");
  img.hide();
  img2.hide();
  img2fire.hide();
}

/*
 * Built-in p5.js function; runs 60 times per second and draws the onscreen
 * elements and animations.
 */
function draw() {
  background(BG_COLOR); // Clear the canvas

  if (cursorOverSteelWool()) {
  	mousedOverWool = true;
  }

  image(img, windowWidth / 5, 
  	windowHeight / 3, img.elt.width / 2, img.elt.height / 2);

  if (mousedOverWool) {
  	image(img2fire, windowWidth / 2, 
  		windowHeight / 3, img.elt.width / 2, img.elt.height / 2);
  } else {
	image(img2, windowWidth / 2, 
  		windowHeight / 3, img.elt.width / 2, img.elt.height / 2);
  }
  
  fire.update();
}

function cursorOverSteelWool() {
	return (mouseX > windowWidth / 2 && mouseX < windowWidth / 2 + img.elt.width / 2
		&& mouseY > windowHeight / 3 && mouseY < windowHeight / 3 + img.elt.height / 2);
}