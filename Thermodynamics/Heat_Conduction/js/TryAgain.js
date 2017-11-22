/*
 * File: TryAgain.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

/**
 * Constructs the scene that prompts the user to try again after burning the
 * cat or creating a poorly designed pot.
 */
function TryAgain() {
    
    // The message displayed while this scene is active
  this.text;

  // The pirate cat that's drawn onscreen
  this.cat;

  /**
   * Initializes the Try Again scene by hiding unnecessary CSS elements 
   * and setting the final text.
   * @return none
   */
  this.setup = function() {
    changeBackgroundImage("nothing"); // Remove background img

    this.text = "Try again";
    
    this.cat = new Cat(isAlive = false, isIcon = false);
    this.cat.img = images['cat_fainted'];
    
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
   * Sets the contents of the onscreen text based on whether the cat was burned
   * or wasn't strong enough to lift the pot.
   * @return none
   */
  this.setText = function() {
    if (ref.catIsBurning) {
      this.text = "The pot was too hot!";
    } 
    else if (ref.catDroppedPot) {
      this.text = "The cat isn't strong enough to lift the pot from there!";
    }

    this.text += " Click anywhere to try again."
  }

  /**
   * Draws the text onscreen.
   * @return none
   */
  this.drawText = function() {
    this.setText(); // Set text based on cause of death
    fill(50);
    textSize(12);
    translate(width / 2, height / 2 + 100);
    textAlign(CENTER);
    text(this.text, -200, 0, 400, 600);
    translate(-1 * (width / 2), -1 * (height / 2 + 100));
  }

  /**
   * Scene manager function that fires whenever the user clicks the mouse 
   * while this scene is active.
   * @return none
   */
  this.mouseClicked = function() {
    // Avoid advancing too quickly back to the Editor screen
    if (this.sceneManager.scene.setupExecuted) {
      this.sceneManager.scene.setupExecuted = false;
      this.sceneManager.showScene(Editor);
    }
  }
}
