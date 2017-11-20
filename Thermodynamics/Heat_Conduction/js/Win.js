/*
 * File: Win.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

/**
 * Constructs the 'winning' scene.
 */
function Win() {

  // The message displayed while this scene is active
  this.text;

  // The pirate cat that's drawn onscreen
  this.cat;

  /**
   * Initializes the Win scene by hiding unnecessary CSS elements and setting
   * the final text.
   * @return none
   */
  this.setup = function() {
    changeBackgroundImage("nothing"); // Remove background img

    this.text = "You saved this cat's bacon";
    this.cat = new Cat(isAlive = true, isIcon = false);
    
    // Hide steam bubbles
    $("#steam-one").hide();
    $("#steam-two").hide();
    $("#steam-three").hide();
    $("#steam-four").hide();

    this.sceneManager.scene.setupExecuted = true;
    this.windowResized();
  }

  /**
   * Draws the Win scene.
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
   * Draws the text onscreen.
   * @return none
   */
  this.drawText = function() {
    fill(50);
    textSize(12);
    translate(width / 2, height / 2 + 100);
    textAlign(CENTER);
    text(this.text, -200, 0, 400, 600);
    translate(-1 * (width / 2), -1 * (height / 2 + 100));
  }
}
