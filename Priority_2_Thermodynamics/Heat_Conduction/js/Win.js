/*
 * File: Win.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

// Intro scene constructor function
function Win()
{
    this.s;
    this.setup = function() {
      this.s = "You saved this cat's bacon";
      
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
      /*
      var scaleFactor = 2;
      var headCenter = [width/(2*scaleFactor),height/(2*scaleFactor)];
      noFill();
      noStroke();
      fill(23, 23, 52);
      scale(scaleFactor);
      translate(headCenter[0], headCenter[1]);
      rotate(.2);
      ellipse(0,0,90,75);
      fill(243, 233, 149);
      ellipse(-17,-5, 30, 20);
      ellipse(17,-5, 30, 20);
      fill(175, 49, 23);
      ellipse(-17,-5, 15, 15);
      ellipse(17,-5, 15, 15);
      fill(23, 23, 52);
      // Ears
      triangle(-40,-15,-45,-45,-10,-33);
      triangle(40,-15,45,-45,10,-33);
      // Nose
      // stroke(161,198,198);
      fill(219,112,147);
      // strokeWeight(2);
      // noFill();
      triangle(0,15,-5,8,5,8);
      translate(-headCenter[0],-headCenter[1]);
      */
    }

}
