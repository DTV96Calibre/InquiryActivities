

function setup() {
  createCanvas(displayWidth, displayHeight);
  mgr = new SceneManager();
      // Preload scenes. Preloading is normally optional
      // ... but needed if showNextScene() is used.
      mgr.addScene ( Intro );
      mgr.addScene ( Editor );
      mgr.showNextScene();

  print("initialized");
}
function draw() {
  mgr.draw();
}

function mousePressed(){
  mgr.mousePressed();
}

/* TODO: Functionality needs library implementation
*/
function mouseClicked(){
  mgr.scene.oScene.mouseClicked();
}
/* TODO: Functionality needs library implementation
*/
function windowResized(){
  mgr.scene.oScene.windowResized();
}
