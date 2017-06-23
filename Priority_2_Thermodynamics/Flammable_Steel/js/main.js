/* File: main.js
 * Dependencies: fire.js, steel.js, matchstick.js
 *
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/************************ Graphical properties *****************************/
var FRAME_RATE = 30;
var BG_COLOR = "rgba(15, 5, 2, 1)"; // Background color of the canvas

var STEEL0_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel0.png?raw=true";
var STEEL1_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel1.png?raw=true";
var STEEL2_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel2.png?raw=true";
var STEEL3_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel3.png?raw=true";
var STEEL4_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel4.png?raw=true";
var STEEL_FIRE_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steelwool-fire.png?raw=true";
var MATCH_UP_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchstick-up.png?raw=true";
var MATCH_DOWN_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchstick-down.png?raw=true";

/************************ Onscreen elements ********************************/
var canvas;
var ctx;
var images; // The set of URLs that map to various images
var slider;

var fire;
var matchstick;
var steelLeft;
var steelRight;

/************************ Simulation variables *****************************/

var initFinished = false;

/* ==================================================================
                        Initialization Functions
   ==================================================================
*/

/*
 * Built-in p5.js function; runs once the page loads and initializes the canvas
 * and other properties.
 */
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;
  frameRate(FRAME_RATE);
  initImages();

  // Init fire and steel
  fire = new Fire();
  steelLeft = new Steel(false);
  steelRight = new Steel(true);
  initFinished = true;

  // Init slider
  slider = createSlider(0, 4, 0); // Range: 0 to 4, default value is 0
  slider.changed(sliderChanged); // Event handler

  // Init matchstick
  matchstick = new Match();

  windowResized();
}

/*
 * Initializes the image elements that will be rendered on the p5 canvas.
 */
function initImages() {
  /* Load each of the images and resize them via a callback function.
   * (This is necessary because createImg is asynchronous) */
  images = {
    steel0: createImg(STEEL0_URL, windowResized),
    steel1: createImg(STEEL1_URL, windowResized),
    steel2: createImg(STEEL2_URL, windowResized),
    steel3: createImg(STEEL3_URL, windowResized),
    steel4: createImg(STEEL4_URL, windowResized),
    steel_fire: createImg(STEEL_FIRE_URL, windowResized),
    matchstick_up: createImg(MATCH_UP_URL, windowResized),
    matchstick_down: createImg(MATCH_DOWN_URL, windowResized)
  }

  // Hide the images so they don't appear beneath the canvas when loaded
  for (x in images) {
    images[x].hide();
  }
}

/* ==================================================================
                        Rendering/Update Functions
   ==================================================================
*/

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
  matchstick.draw();
  fire.update();
}

/*
 * Built-in p5 function; called whenever the browser is resized.
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  /* Update variables that scale with screen size */

  // Don't resize objects if they haven't been instantiated yet
  if (initFinished) {
    steelLeft.resize();
    steelRight.resize();
    matchstick.resize();
    slider.position(steelRight.xOffset, steelRight.yOffset + steelRight.height 
      * 1.5);
  }
}

/*
 * Callback function triggered when the user adjusts the slider. Updates the 
 * image used to represent the steel on the right.
 * @param sliderObj: A slider element
 */
function sliderChanged() {
  var intID = slider.value();
  var imageID = "steel" + intID;
  steelRight.changeImage(imageID);
}