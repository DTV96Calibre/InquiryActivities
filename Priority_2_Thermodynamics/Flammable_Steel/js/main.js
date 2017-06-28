/* File: main.js
 * Dependencies: Fire.js, FlammableItem.js, Steel.js, Match.js, Matchbox.js,
 *               Wood.js
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
var WOOD0_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood0.png?raw=true";
var WOOD1_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood1.png?raw=true";
var WOOD2_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood2.png?raw=true";
var WOOD3_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood3.png?raw=true";
var WOOD4_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood4.png?raw=true";
var MATCH_UP_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchstick-up.png?raw=true";
var MATCH_DOWN_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchstick-down.png?raw=true";
var MATCHBOX_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchbox.png?raw=true";
var MATCHBOX_COVER_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchbox-cover.png?raw=true";

/************************ Onscreen elements ********************************/
var canvas;
var ctx;
var images; // The set of URLs that map to various images
var slider;
var fire;
var matchstick;
var matchbox;
var flammableLeft;
var flammableRight;

/************************ Simulation variables *****************************/

var initFinished = false;
var holdingMatch = false;
var wideAspectRatio; // Often true for desktop layouts and false for mobile
var config;

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

  wideAspectRatio = hasWideAspectRatio();
  initConfig();
  initImages();

  // Init fire, steel/wood, etc.
  flammableLeft = new Steel(false);
  flammableRight = new Steel(true);
  matchbox = new Matchbox();
  matchstick = new Match();
  fire = new Fire();

  // Init slider
  slider = createSlider(0, 4, 0); // Range: 0 to 4, default value is 0
  slider.changed(sliderChanged); // Add event handler

  initFinished = true;

  windowResized();
}

/*
 * Sets the location of various elements based on the aspect ratio of the
 * window (e.g. desktop is wide, mobile is thin). Mimics a "folding" technique 
 * that positions items differently depending on the user's layout.
 */
function initConfig() {
  var w = wideAspectRatio;
  config = {
    itemWidthRatio:         w ? 0.2 : 0.2,     // times windowWidth
    itemLeftXOffsetRatio:   w ? 0.333 : 0.167, // times windowWidth
    itemRightXOffsetRatio:  w ? 0.667 : 0.667, // times windowWidth
    itemYOffsetRatio:       w ? 0.333 : 0.333, // times windowHeight
    matchboxHeightRatio:    w ? 1.2 : 1.2,     // times matchstick.height
    matchboxPaddingRatio:   w ? 0.05 : 0.05,   // times windowWidth
    matchHeightRatio:       w ? 0.25 : 0.25,   // times windowHeight
    sliderYOffsetRatio:     w ? 1.5 : 1.5,     // times steelRight.height

    // Independent of window aspect ratio
    panelEdgeRoundness:     20, // degrees
    panelFillColor:         '#333333',
  }
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
    wood0: createImg(WOOD0_URL, windowResized),
    wood1: createImg(WOOD1_URL, windowResized),
    wood2: createImg(WOOD2_URL, windowResized),
    wood3: createImg(WOOD3_URL, windowResized),
    wood4: createImg(WOOD4_URL, windowResized),
    steel_fire: createImg(STEEL_FIRE_URL, windowResized),
    matchbox: createImg(MATCHBOX_URL, windowResized),
    matchbox_cover: createImg(MATCHBOX_COVER_URL, windowResized),
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

  if (flammableRight.cursorIsOver()) {
    flammableRight.setFire();
  }

  // Draw grey border around steel panel
  drawPanel();
  
  // Render onscreen elements
  flammableLeft.draw();
  flammableRight.draw();
  matchbox.drawBottom();
  matchstick.draw();
  fire.update();
  matchbox.drawCover();
}

/*
 * Draws the grey panel that surrounds both steel/wood objects.
 */
function drawPanel() {
  fill(config['panelFillColor']);
  var xPos = flammableLeft.xOffset * 0.8;
  var yPos = flammableLeft.yOffset * 0.4;
  var width = flammableRight.xOffset + flammableLeft.width - flammableLeft.xOffset / 1.5;
  var height = max(windowHeight * 0.6, flammableRight.yOffset + flammableLeft.height 
    * config['sliderYOffsetRatio']);
  var edge = config['panelEdgeRoundness'];
  rect(xPos, yPos, width, height, edge, edge, edge, edge);
}

/*
 * Built-in p5 function; called whenever the browser is resized.
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Don't resize objects if they haven't been instantiated yet
  if (!initFinished) return;

  // Check if folding or unfolding is necessary
  if (hasWideAspectRatio() != wideAspectRatio) {
    wideAspectRatio = !wideAspectRatio;
    initConfig();
  }

  // Update variables that scale with screen size
  flammableLeft.resize();
  flammableRight.resize();
  slider.position(flammableRight.xOffset, flammableLeft.yOffset + flammableLeft.height 
    * config['sliderYOffsetRatio']);
  matchbox.resize();
  matchstick.setToOriginPos();
  matchstick.resize();
}

/*
 * Callback function triggered when the user adjusts the slider. Updates the 
 * image used to represent the steel on the right.
 * @param sliderObj: A slider element
 */
function sliderChanged() {
  var intID = slider.value();
  var imageID = "wood" + intID;
  flammableRight.changeImage(imageID);
}

/* ==================================================================
                            Misc. Functions
   ==================================================================
*/

/*
 * Returns true if the screen is wider than it is tall. Affects the placement
 * of onscreen elements, which will 'fold' if a tall and narrow mobile 
 * layout is detected.
 */
function hasWideAspectRatio() {
  return windowWidth > windowHeight;
}

/*
 * Called whenever the user presses the mouse button.
 */
function mousePressed() {
  if (!initFinished) return;

  // Check if user picked up the match
  if (matchstick.cursorIsOver()) {
    holdingMatch = true;
  }
}

/*
 * Called whenever the user releases the mouse button.
 */
function mouseReleased() {
  holdingMatch = false;
}