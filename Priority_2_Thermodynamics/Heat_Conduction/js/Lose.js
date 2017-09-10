/*
 * File: Lose.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

// Intro scene constructor function
function Lose()
{
    this.s;
    this.setup = function() {
      this.s = "The cat died a gruesome death";
      
      // Hide steam bubbles
      $("#steam-one").hide();
      $("#steam-two").hide();
      $("#steam-three").hide();
      $("#steam-four").hide();

      this.sceneManager.scene.setupExecuted = true;
      this.windowResized();
    }

    this.draw = function() {
      clear();
      this.drawText();
      this.drawCat();
       // Text wraps within text box
    }

    this.windowResized = function() {
      resizeCanvas(windowWidth, windowHeight);
      print("Resized canvas");
    }

    // this.mouseClicked = function() {
    //     print("mouse clicked");
    //     this.sceneManager.showNextScene();
    // }

    this.drawText = function() {
      fill(50);
      translate(width/2, height/2 + 100);
      textAlign(CENTER);
      text(this.s, -200, 0, 400, 600);
      translate(-1*(width/2), -1*(height/2 + 100));
    }

    this.drawCat = function() {
      image(images['cat'], windowWidth * 0.42, windowHeight * 0.25, windowWidth * 0.16, windowWidth * 0.17);
    }

}
