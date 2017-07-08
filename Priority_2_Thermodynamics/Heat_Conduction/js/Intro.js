// Intro scene constructor function
function Intro()
{
    this.s;
    this.setup = function() {
      s = "The cook on the SS Salty Kitty has lived a dangerous life cooking for the most eccentric pirates on these seven seas. After his most recent accident involving a poorly designed pot, he's hired you to design a handle that won't burn him to death. He's entrusted his last 3 lives to you...";
    }

    this.draw = function() {
      clear();
      fill(50);
      text(s, 10, 10, 400, 600); // Text wraps within text box
    }
    this.mouseClicked = function() {
        print("mouse clicked");
        this.sceneManager.showNextScene();
    }
}
