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

var mousedOverWool = false;

var img;

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

function draw() {
  background("blue"); // Clear the canvas
  background("rgba( 15, 5, 2, 1 )");

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