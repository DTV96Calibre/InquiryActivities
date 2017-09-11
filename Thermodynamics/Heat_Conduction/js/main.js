/*
 * File: main.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var CAT_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Heat_Conduction/images/Cat.png?raw=true";

function setup() {
  createCanvas(displayWidth, displayHeight);
  initImages();
  mgr = new SceneManager();
      // Wire links supported p5 functions to sceneManager
      mgr.wire();
      // Preload scenes. Preloading is normally optional
      // ... but needed if showNextScene() is used.
      mgr.addScene ( Intro );
      mgr.addScene ( Editor );
      mgr.showNextScene();

  print("initialized");
}

/*
 * Initializes the image elements that will be rendered on the p5 canvas.
 */
function initImages() {
  images = {
    cat: createImg(CAT_URL)
  }

  // Hide the images so they don't appear beneath the canvas when loaded
  for (x in images) {
    images[x].hide();
  }
}