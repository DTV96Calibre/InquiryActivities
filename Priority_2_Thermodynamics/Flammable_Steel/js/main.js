/* File: main.js
 * Dependencies: Fire.js, FlammableItem.js, Steel.js, Match.js, Matchbox.js,
 *               Wood.js, Machine.js, Woodchipper.js, Extruder.js
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
var WOODCHIPPER_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/woodchipper.png?raw=true";
var EXTRUDER_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Flammable_Steel/images/extruder.png?raw=true";

/************************ Math constants ***********************************/
var STEEL_DENSITY = 7.8; // Units: g / cm^3
var WOOD_DENSITY = 0.85; // Units: g / cm^3
var STEEL_MASS = 100; // Units: g
var WOOD_MASS = 100; // Units: g
var STEEL_DIAMETERS = [1, 0.5, 0.01, 0.005, 0.0025]; // Units: cm
var NUM_WOOD_PIECES = [1, 4, 16, 64, 256]; // Units: cm
var WOOD_BASE_PIECE_EDGE_LENGTH = 3; // Units: cm
var BURNING_RATE_COEFFICIENT = 20000;
var BURN_TIME_SCALE_FACTOR = 31.57; // To scale simulation time with 'real' time

/************************ Onscreen elements ********************************/
var canvas;
var ctx;
var fire;
var matchstick;
var matchbox;
var flammableLeft;
var flammableRight;
var machine;
var images; // The set of p5 image objects

/************************ Simulation variables *****************************/
var initFinished = false;
var holdingMatch = false;
var currSliderValue = 0;
var lastSliderValue = 0;
var wideAspectRatio; // Often true for desktop layouts and false for mobile
var currentItem = "wood";
var config;

// For enabling web transitions on pop-up help tooltip
var helpBoxPopUp;
var helpBtn;
var infoBoxPopUp;
var infoBtn;
var helpBtnActive = false;
var infoBtnActive = false;

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

  // Init fire, steel/wood, woodchipper/extruder, etc.
  machine = new Woodchipper();
  initFlammableItems();
  matchbox = new Matchbox();
  matchstick = new Match();
  machine.init();

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
    itemWidthRatio:         w ? 0.140 : 0.300, // times windowWidth
    itemLeftXOffsetRatio:   w ? 0.400 : 0.120, // times windowWidth
    itemRightXOffsetRatio:  w ? 0.670 : 0.570, // times windowWidth
    itemYOffsetRatio:       w ? 0.370 : 0.150, // times windowHeight
    matchHeightRatio:       w ? 0.800 : 0.800, // times matchbox.height
    matchboxXOffsetRatio:   w ? 1.000 : 0.050, // times windowWidth
    matchboxYPaddingRatio:  w ? 0.040 : 0.040, // times windowWidth
    matchboxHeightRatio:    w ? 0.270 : 0.150, // times windowHeight
    woodchipperWidthRatio:  w ? 0.200 : 0.360, // times windowWidth
    extruderWidthRatio:     w ? 0.070 : 0.160, // times windowWidth
    machineYOffsetRatio:    w ? 2.500 : 3.200, // times img.height
    sliderYOffsetRatio:     w ? 0.550 : 0.350, // times windowHeight
    panelHeightRatio:       w ? 1.100 : 1.100, // times sliderYPos
    panelWidthRatio:        w ? 0.600 : 0.900, // times windowWidth
    panelXOffsetRatio:      w ? 0.300 : 0.050, // times windowWidth
    panelYOffsetRatio:      w ? 0.065 : 0.065, // times windowHeight
    infoBoxHeightRatio:     w ? 0.850 : 0.500, // times windowHeight - panelHeight

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
    ash: createImg(ASH_URL, windowResized),
    woodchipper: createImg(WOODCHIPPER_URL, windowResized),
    extruder: createImg(EXTRUDER_URL, windowResized)
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
    machine = new Extruder();
  }
  else if (currentItem == "wood") {
    flammableLeft = new Wood(false);
    flammableRight = new Wood(true);
    machine = new Woodchipper();
  }

  // Init info boxes
  flammableLeft.updateTableData();
  flammableRight.updateTableData();

  hideImages();
  machine.init();
  resetSlider();

  // Set graphical properties
  flammableLeft.resize();
  flammableRight.resize();
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
  else if (flammableLeft.cursorIsOver()) {
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
  machine.draw();
}

/*
 * Draws the grey panel that surrounds both steel/wood objects.
 */
function drawPanel() {
  fill(PANEL_COLOR + '1)');
  var xPos = windowWidth * config['panelXOffsetRatio'];
  var yPos = windowHeight * config['panelYOffsetRatio'];
  var width = windowWidth * config['panelWidthRatio'];
  var height = getSliderVerticalOffset() * config['panelHeightRatio'];
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

    if (!wideAspectRatio) {
      hideTooltips();
    }
  }

  // Update variables that scale with screen size
  flammableLeft.resize();
  flammableRight.resize();
  flammableLeft.initFire();
  flammableRight.initFire();
  matchbox.resize();
  matchstick.setToOriginPos();
  matchstick.resize();
  machine.resize();

  // Update elements from the DOM
  resizeSlider();
  resizeInfoBoxes();
  resizeButtons();
}

/* ==================================================================
                            Getters and Setters
   ==================================================================
*/

/*
 * Returns the y-offset of the onscreen slider.
 */
function getSliderVerticalOffset() {
  if (wideAspectRatio) {
    return windowHeight * config['sliderYOffsetRatio'];
  } else {
    // On mobile screens, take extra precautions to position the slider
    return windowHeight * config['itemYOffsetRatio'] + flammableRight.width;
  }
}

/*
 * Returns the x-offset of the onscreen slider.
 */
function getSliderHorizontalOffset() {
  return flammableRight.xOffset + flammableRight.width * 0.1;
}

/*
 * Returns the distance in pixels from the top of the window to the lower
 * boundary of the table containing the objects' properties.
 */
function getTableLowerBoundary() {
  var tableTopYPos = (windowHeight * config['panelYOffsetRatio'] + 
    getSliderVerticalOffset() * config['panelHeightRatio']) * 1.05;
  var tableHeight = $("#leftInfoBox").height();
  return tableTopYPos + tableHeight;
}

/*
 * Returns the distance in pixels from the left of the window to the 
 * rightmost boundary of the table containing the objects' properties.
 */
function getTableRightBoundary() {
  var tableLeftXPos = windowHeight * config['panelXOffsetRatio'];
  var tableWidth = $("#leftInfoBox").width();
  return tableLeftXPos + tableWidth * 2;
}

/*
 * Returns the distance in pixels from the left of the window to the
 * rightmost boundary of the div containing the buttons.
 */
function getButtonRightBoundary() {
  var buttonLeftXPos = windowHeight * config['panelXOffsetRatio'];
  var buttonWidth = $('#switchBtn').width();
  return buttonLeftXPos + buttonWidth;
}

/* ==================================================================
              Interfacing with the DOM / Event Handlers
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
 * Callback function triggered when the user adjusts the slider. Updates the 
 * image used to represent the steel/wood on the right.
 */
function sliderChanged() {
  // Prevent the material from changing if it's been burnt
  if (flammableRight.img == flammableRight.burntImage) {
    var machineType = (currentItem == "wood") ? "woodchipper" : "extruder";
    var burntItemType = (currentItem == "wood") ? "ash" : "burnt steel wool";
    var msg = "Cannot send " + burntItemType + " through the " + machineType +
     ". Please press the Reset button to revert the " + currentItem + 
      " back to its original state first.";
    alert(msg);
    $("#slider").val(lastSliderValue);
    return;
  }

  currSliderValue = $("#slider").val();

  // Start the woodchipper or extruder which 'shreds' the item and updates it
  machine.start();

  // Prevent the user from clicking certain elements until animation finishes
  disableInput();
}

/*
 * Called whenever the user clicks the button to switch between wood and steel.
 */
function switchFlammableItem() {
  // Swap out one item for another
  if (currentItem == "steel") {
    currentItem = "wood";
    $("#switchBtn").text('Toggle Steel');
  }
  else if (currentItem == "wood") {
    currentItem = "steel";
    $("#switchBtn").text('Toggle Wood');
  }

  // The burn time for the steel ingot and wooden log aren't equivalent
  flammableLeft.resetBurnTime();

  initFlammableItems();
  windowResized();
}

/*
 * Resets the slider to its default value.
 */
function resetSlider() {
  $('#slider').val(0);
  lastSliderValue = 0;
  currSliderValue = 0;
}

/*
 * Hide the images embedded in the HTML by setting their opacity to 0.
 */
function hideBurntImages() {
  $("#steel_fire").css({ 'opacity': 0 });
  $("#ash_right").css({ 'opacity': 0 });
  $("#ash_left").css({ 'opacity': 0 });
}

/*
 * Adjusts the position of the slider.
 */
function resizeSlider() {
  var left = getSliderHorizontalOffset();
  var top = getSliderVerticalOffset();
  var width = config['itemWidthRatio'] * windowWidth * 0.95;
  $("#slider").css({ 'left': left + "px" });
  $("#slider").css({ 'top': top + "px" });
  $("#slider").css({ 'width': width + "px" });
}

/*
 * Adjusts the position and CSS attributes of the info panels that hold
 * information about surface area, volume, etc.
 */
function resizeInfoBoxes() {
  var width = config['panelWidthRatio'] * windowWidth / 2;
  var left = config['panelXOffsetRatio'] * windowWidth;
  var top = (windowHeight * config['panelYOffsetRatio'] + 
    getSliderVerticalOffset() * config['panelHeightRatio']) * 1.05;

  $("#leftInfoBox").css({ 'width': width + "px" });
  $("#rightInfoBox").css({ 'width': width + "px" });
  $("#leftInfoBox").css({ 'left': left + "px" });
  $("#rightInfoBox").css({ 'left': left + width + "px" });
  $("#leftInfoBox").css({ 'top': top + "px" });
  $("#rightInfoBox").css({ 'top': top + "px" });

  // Force boxes to be the same size
  var heightLeft = $("#leftInfoBox").height();
  var heightRight = $("#rightInfoBox").height();
  if (heightLeft != heightRight) {
    $("#leftInfoBox").css({ 'height': heightRight + "px" });
  }
}

/*
 * Adjust the buttons embedded in the HTML so they align with the matchbox.
 */
function resizeButtons() {
  /* Desktop screens */
  if (wideAspectRatio) {
    var width = matchbox.width;
    var xOffset = matchbox.xOffset;
    var yOffset = windowHeight * config['panelYOffsetRatio'];

    // Make top button line up with lower buttons even if they overflow
    var btnWidth = $('#resetBtn').outerWidth() + $('#infoBtn').outerWidth() +
      $('#helpBtn').outerWidth();
    btnWidth += 6;
    $('#switchBtn').css({ 'width' : btnWidth + "px"}); 
  } 
  /* Mobile screens */
  else {
    var width = windowWidth / 4;
    var xOffset = windowWidth * config['panelXOffsetRatio'];
    var yOffset = getTableLowerBoundary() + matchbox.padding;

    // Make toggle wood/steel button line up with reset button
    var btnWidth = $('#resetBtn').outerWidth();
    $('#switchBtn').css({ 'width' : btnWidth + "px"}); 
  }

  $(".main_button_box").css({ 'left': xOffset + "px" });
  $(".main_button_box").css({ 'top': yOffset + "px" });
  $(".main_button_box").css({ 'width': width + "px" });
}

/*
 * Makes sure that all of the images in the DOM have an opacity of 0.
 */
function hideImages() {
  $('#ash_left').css({'opacity' : 0});
  $('#ash_right').css({'opacity' : 0});
  $('#steel_fire').css({'opacity' : 0});
}

/*
 * Called when the user presses the help button.
 */
function toggleHelp() {
  if (wideAspectRatio) {
    toggleHelpDesktop();
  } else {
    toggleHelpMobile();
  }
}

/*
 * Called when the user presses the help button and is viewing the simulation
 * on a screen that is wider than it is tall.
 */
function toggleHelpDesktop() {
  if (infoBtnActive) {
    // Make info box disappear to make room for help box
    infoBoxPopUp.classList.toggle("appear");
    infoBtnActive = false;
  }
  helpBoxPopUp.classList.toggle("appear");
  helpBtnActive = !helpBtnActive;
}

/*
 * Called when the user presses the help button and is viewing the simulation
 * on a screen that is taller than it is wide.
 */
function toggleHelpMobile() {
  // Display text in an alert box since the static tooltip won't fit onscreen
  var text = "Click to pick up the match and drag it across the material " +
    "(wood or steel) to observe whether it's flammable and the relative rate " +
    "at which it burns.\n\nThe object on the left is a reference, but the " +
    "object on the right can be adjusted by changing the slider underneath " + 
    "it. Dragging the slider will result in sending the object through either " +
    "a woodchipper or steel extruder.\n\nRefer to the tables underneath the " +
    "objects for information including their density, mass, and surface area." +
    "\n\nNote: The time taken to burn in the simulation differs from the " +
    "estimated time that would be taken in reality. (The \"real life\" time " +
    "can be found in the table.)";
  alert(text);
}

/*
 * Called when the user presses the info button.
 */
function toggleInfo() {
  if (wideAspectRatio) {
    toggleInfoDesktop();
  } else {
    toggleInfoMobile();
  }
}

/*
 * Called when the user presses the info button and is viewing the simulation
 * on a screen that is wider than it is tall.
 */
function toggleInfoDesktop() {
  if (helpBtnActive) {
    // Make help box disappear to make room for info box
    helpBoxPopUp.classList.toggle("appear");
    helpBtnActive = false;
  }
  infoBoxPopUp.classList.toggle("appear");
  infoBtnActive = !infoBtnActive;
}

/*
 * Called when the user presses the info button and is viewing the simulation
 * on a screen that is taller than it is wide.
 */
function toggleInfoMobile() {
  // Display text in an alert box since the static tooltip won't fit onscreen
  var text = "This work is licensed under a Creative Commons Attribution-" +
    "ShareAlike 4.0 International License.\n\nProduced through the efforts of " +
    "Brooke Bullek in June 2017.\n\nAddress any questions to Dr. Margot Vigeant, " +
    "Bucknell University Department of Chemical Engineering at " +
    "mvigeant@bucknell.edu.";
  alert(text);
}

/*
 * Ensures that the help/info tooltips are both hidden. Prevents issues when the
 * user toggles a tooltip and resizes the window to take on the mobile layout.
 */
function hideTooltips() {
  if (helpBtnActive) {
    helpBoxPopUp.classList.toggle("appear");
    helpBtnActive = false;
  }
  else if (infoBtnActive) {
    infoBoxPopUp.classList.toggle("appear");
    infoBtnActive = false;
  }
}

/*
 * Disables the toggle wood/steel button and the slider in order to force
 * the user to wait until an event has finished.
 */
function disableInput() {
  $('#switchBtn').attr('disabled','disabled');
  document.getElementById("slider").disabled = true;
}

/*
 * Re-enables the toggle wood/steel button and the slider.
 */
function enableInput() {
  $("#switchBtn").removeAttr('disabled');
  document.getElementById("slider").disabled = false;
}

$(document).ready(function() {
  // Register event listeners
  $("#switchBtn").on('click', switchFlammableItem);
  $("#resetBtn").on('click', initFlammableItems);
  $("#slider").on('change', sliderChanged);

  // Enable web transitions on pop-up help tooltip
  helpBoxPopUp = document.getElementById('help-box');
  helpBtn = document.getElementById('helpBtn');
  helpBtn.addEventListener("click", function(){
    toggleHelp();
  }, false);

  // Enable web transitions on pop-up info tooltip
  infoBoxPopUp = document.getElementById('info-box');
  infoBtn = document.getElementById('infoBtn');
  infoBtn.addEventListener("click", function(){
    toggleInfo();
  }, false);
});
