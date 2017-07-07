// Intro scene constructor function
function Intro()
{
    this.s;
    this.setup = function() {
      s = "The quick brown fox jumped over the lazy dog.";
    }

    this.draw = function() {
      clear();
      fill(50);
      text(s, 10, 10, 70, 80); // Text wraps within text box
    }
    this.mousePressed = function() {
        print("mouse pressed");
        this.sceneManager.showNextScene();
    }
}
