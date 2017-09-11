/*
 * File: Intro.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

// Intro scene constructor function
function Intro()
{
    this.s;
    this.setup = function() {
      changeBackgroundImage("waves");
      
      // Hide steam bubbles
      $("#steam-one").hide();
      $("#steam-two").hide();
      $("#steam-three").hide();
      $("#steam-four").hide();

      this.s = "The cook on the SS Salty Kitty has lived a dangerous life cooking for the most eccentric pirates on these seven seas. After his most recent accident involving a poorly designed pot, he's hired you to design a handle that won't burn him to death. He's entrusted his last 3 lives to you...";
      this.sceneManager.scene.setupExecuted = true;
      this.windowResized();
    }

    this.draw = function() {
      if (!this.sceneManager){
	      print("SceneManager is gone");
	      stop();
      }
      clear();
      this.drawText();
      this.drawCat();
       // Text wraps within text box
    }

    this.windowResized = function() {
      resizeCanvas(windowWidth, windowHeight);
      print("Resized canvas");
    }

    this.mouseClicked = function() {
        print("mouse clicked");
        this.sceneManager.showNextScene();
    }

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
