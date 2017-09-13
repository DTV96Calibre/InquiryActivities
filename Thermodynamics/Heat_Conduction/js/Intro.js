/*
 * File: Intro.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

/**
 * Constructs the Intro scene.
 */
function Intro() {
  // The message displayed while this scene is active
  this.text;

  // The pirate cat that's drawn onscreen
  this.cat;

  /**
   * Initializes the Intro scene by hiding unnecessary CSS elements and setting
   * the welcome text.
   * @return none
   */
  this.setup = function() {
    // Hide steam bubbles
    $("#steam-one").hide();
    $("#steam-two").hide();
    $("#steam-three").hide();
    $("#steam-four").hide();

    this.text = "The cook on the SS Salty Kitty has lived a dangerous life " +
      "cooking for the most eccentric pirates on the seven seas. After his " +
      "most recent accident involving a poorly designed pot, he's hired you" +
      " to design a handle that won't burn him to death. He's entrusted his" +
      " last 3 lives to you...";

    this.cat = new Cat(isAlive = true);

    this.sceneManager.scene.setupExecuted = true;
    this.windowResized();
  }

  /**
   * Draws the Intro scene.
   * @return none
   */
  this.draw = function() {
    if (!this.sceneManager){
      print("SceneManager is gone");
      stop();
    }

    clear();
    this.drawText();
    this.cat.draw();  
  }

  /**
   * Called when the window is resized.
   * @return none
   */
  this.windowResized = function() {
    this.cat.resize();
    resizeCanvas(windowWidth, windowHeight);
  }

  /**
   * Scene manager function that fires whenever the user clicks the mouse 
   * while this scene is active.
   * @return none
   */
  this.mouseClicked = function() {
      this.sceneManager.showNextScene();
  }

  /**
   * Draws the text onscreen.
   * @return none
   */
  this.drawText = function() {
    fill(50);
    translate(width / 2, height / 2 + 100);
    textAlign(CENTER);
    text(this.text, -200, 0, 400, 600);
    translate(-1 * (width / 2), -1 * (height / 2 + 100));
  }
}
