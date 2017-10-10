/*
 * File: main.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var CAT_ALIVE_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/cat-alive.png?raw=true";
var CAT_DEAD_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/cat-dead.png?raw=true";
var KITCHEN_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/kitchen-bg.jpg?raw=true";
var STOVETOP_URL = "http://www.netway.com/~sanford/2011-05-15%20Kitchen%20Stove.JPG";

// Global var that holds references to any images loaded into the project
var images;

/**
 * Initialize the simulation by setting the canvas size, loading images, and
 * creating scenes for the p5 Scene Manager library.
 * @return none
 */
function setup() {
  createCanvas(displayWidth, displayHeight);
  initImages();
  mgr = new SceneManager();
      // Wire links supported p5 functions to sceneManager
      mgr.wire();
      // Preload scenes. Preloading is normally optional
      // ... but needed if showNextScene() is used.
      mgr.addScene (Intro);
      mgr.addScene (Editor);
      mgr.showNextScene();
}

/**
 * Initializes the image elements that will be rendered on the p5 canvas.
 * @return none
 */
function initImages() {
  images = {
    cat_alive: createImg(CAT_ALIVE_URL),
    cat_dead: createImg(CAT_DEAD_URL)
  }

  // Hide the images so they don't appear beneath the canvas when loaded
  for (x in images) {
    images[x].hide();
  }
}