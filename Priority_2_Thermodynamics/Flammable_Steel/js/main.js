/* File: main.js
 * Dependencies: Fire.js, FlammableItem.js, Steel.js, Match.js, Matchbox.js,
 *               Wood.js
 *
 * Author: Brooke Bullek (June 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 */

/************************ Graphical properties *****************************/
var FRAME_RATE = 60;
var BG_COLOR = "rgba(15, 5, 2, 1)"; // Background color of the canvas
var PANEL_COLOR = "rgba(51, 51, 51,"

var STEEL0_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel0.png?raw=true";
var STEEL1_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel1.png?raw=true";
var STEEL2_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel2.png?raw=true";
var STEEL3_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel3.png?raw=true";
var STEEL4_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steel4.png?raw=true";
var WOOD0_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood0.png?raw=true";
var WOOD1_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood1.png?raw=true";
var WOOD2_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood2.png?raw=true";
var WOOD3_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood3.png?raw=true";
var WOOD4_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/wood4.png?raw=true";
var MATCH_UP_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchstick-up.png?raw=true";
var MATCH_DOWN_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchstick-down.png?raw=true";
var MATCHBOX_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchbox.png?raw=true";
var MATCHBOX_COVER_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/matchbox-cover.png?raw=true";
var STEEL_FIRE_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/steelwool-fire.png?raw=true";
var ASH_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/ash.png?raw=true";

/************************ Fire config **************************************/
var NUM_FIRE_PARTICLES = 80;
var STEEL_FIRE_PARTICLE_SIZE = 12;
var WOOD_FIRE_PARTICLE_SIZE = 10;
var STEEL_FIRE_MAX_LIFE = 120;
var WOOD_FIRE_MAX_LIFE = 120;

/************************ Onscreen elements ********************************/
var canvas;
var ctx;
var slider;
var fire;
var matchstick;
var matchbox;
var flammableLeft;
var flammableRight;
var images; // The set of p5 image objects

/************************ Simulation variables *****************************/
var initFinished = false;
var holdingMatch = false;
var wideAspectRatio; // Often true for desktop layouts and false for mobile
var currentItem = "steel";
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
  initFlammableItems();
  matchbox = new Matchbox();
  matchstick = new Match();

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
    sliderYOffsetRatio:     w ? 1.5 : 1.5,     // times flammableRight.height
    panelWidthRatio:        w ? 0.6 : 0.75,     // times windowWidth

    // Independent of window aspect ratio
    panelEdgeRoundness:     20, // degrees
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
    matchbox: createImg(MATCHBOX_URL, windowResized),
    matchbox_cover: createImg(MATCHBOX_COVER_URL, windowResized),
    matchstick_up: createImg(MATCH_UP_URL, windowResized),
    matchstick_down: createImg(MATCH_DOWN_URL, windowResized),
    steel_fire: createImg(STEEL_FIRE_URL, windowResized),
    ash: createImg(ASH_URL, windowResized)
  }

  // Hide the images so they don't appear beneath the canvas when loaded
  for (x in images) {
    images[x].hide();
  }
}

/*
 * Sets the items on the left and right (to either steel or wood, depending
 * on the current setting).
 */
function initFlammableItems() {
  if (currentItem == "steel") {
    flammableLeft = new Steel(false);
    flammableRight = new Steel(true);
  }
  else if (currentItem == "wood") {
    flammableLeft = new Wood(false);
    flammableRight = new Wood(true);
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
  else if (currentItem == "wood" && flammableLeft.cursorIsOver()) {
    flammableLeft.setFire();
  }

  // Draw grey border around flammable objects panel
  drawPanel();
  
  // Render onscreen elements
  flammableLeft.draw();
  flammableRight.draw();
  matchbox.drawBottom();
  matchstick.draw();
  matchbox.drawCover();
}

/*
 * Draws the grey panel that surrounds both steel/wood objects.
 */
function drawPanel() {
  fill(PANEL_COLOR + '1)');
  var xPos = windowWidth * config['itemLeftXOffsetRatio'] * 0.9;
  var yPos = windowHeight * config['itemYOffsetRatio'] / 3;
  var width = windowWidth * config['panelWidthRatio'];
  var height = max(windowHeight * 0.6, getSliderVerticalOffset());
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
  flammableLeft.initFire();
  flammableRight.initFire();
  slider.position(flammableRight.xOffset, getSliderVerticalOffset());
  matchbox.resize();
  matchstick.setToOriginPos();
  matchstick.resize();
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

/*
 * Returns the y-offset of the onscreen slider, which strictly uses the
 * steel ingot image's size for positioning (to prevent the slider from
 * jerking up or down as the user changes the images).
 */
function getSliderVerticalOffset() {
  var itemRef = images['steel0'];
  var itemWidth = windowWidth * config['itemWidthRatio'];
  var aspectRatio = itemRef.elt.width / itemRef.elt.height;
  var itemHeight = itemWidth / aspectRatio;
  var itemYOffset = windowHeight * config['itemYOffsetRatio'] - itemHeight / 2;
  return itemYOffset + itemHeight * config['sliderYOffsetRatio'];
}

/* ==================================================================
              Interfacing with the DOM / Event Handlers
   ==================================================================
*/

/*
 * Callback function triggered when the user adjusts the slider. Updates the 
 * image used to represent the steel/wood on the right.
 */
function sliderChanged() {
  var intID = slider.value();
  var imageID = currentItem + intID;
  flammableRight.changeImage(imageID);

  // The flammable item image and the burnt image will both reset
  var overlayImageID = flammableRight.getBurntImage();
  $(overlayImageID).css({ 'opacity' : 0 });
  flammableRight.reset();
}

/*
 * Called whenever the user clicks the button to switch between wood and steel.
 */
function switchFlammableItem() {
  if (currentItem == "steel") {
    currentItem = "wood";
    $("#switchBtn").text('Toggle Steel');
  }
  else if (currentItem == "wood") {
    currentItem = "steel";
    $("#switchBtn").text('Toggle Wood');
  }

  initFlammableItems();
  windowResized();
  hideBurntImages();
  slider.value(0); // Reset slider to default
}

/*
 * Hide the images embedded in the HTML by setting their opacity to 0.
 */
function hideBurntImages() {
  $("#steel_fire").css({ 'opacity': 0 });
  $("#ash_right").css({ 'opacity': 0 });
  $("#ash_left").css({ 'opacity': 0 });
}

$(document).ready(function() {
  // Register event handlers
  $("#switchBtn").on('click', switchFlammableItem);
});