

function setup() {
  createCanvas(displayWidth, displayHeight);
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
