
// Globals

var dataSet = [];
dataSet.length = 256;
dataSet.fill("RD", 0, 128);
dataSet.fill("BL", 128, 256);

function getRgbColor(colorType) {
  var colorHash = {
    "RD":0xFF0000, // red
    "BL":0x0000FF, // blue
  };
  return colorHash[colorType];
}

var scene, camera, renderer, pc;
var canvas;
var world = null;
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var g_groundBody = null;
var test;
var METER = 100;
var OFFSET_X = 0;
var OFFSET_Y = 0;
var windowWidth = 400;
var windowHeight = 465;

///////////////////////////////////////////

function tick() {
  world.Step(timeStep, velocityIterations, positionIterations);

  var particles = world.particleSystems[0].GetPositionBuffer();
  var colors = [];
  for (var i = 0; i < particles.length / 2; i++) {       
    var x = particles[i * 2] * METER + OFFSET_X;
    var y = 465 - particles[(i * 2) + 1] * METER + OFFSET_Y;
    var z = 0;                                       
    var vertex = new THREE.Vector3(x, y, z);
    pc.geometry.vertices[i] = vertex;
  }
  pc.geometry.verticesNeedUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function WaveMachine() {
  var bdDef = new b2BodyDef();
  var body = world.CreateBody(bdDef);

  // Floor
  var wg = new b2PolygonShape();
  wg.SetAsBoxXYCenterAngle(
    windowWidth / METER / 2,
    0.05,
    new b2Vec2(windowWidth / METER / 2, windowHeight / METER + 0.05),
    0
  );
  body.CreateFixtureFromShape(wg, 5);

  // Left wall
  var wgl = new b2PolygonShape(); 
  wgl.SetAsBoxXYCenterAngle(
    0.05,
    windowHeight / METER / 2,
    new b2Vec2(-0.05, windowHeight / METER / 2),
    0
  );
  body.CreateFixtureFromShape(wgl, 5);

  // Right wall
  var wgr = new b2PolygonShape();
  wgr.SetAsBoxXYCenterAngle(
    0.05,
    windowHeight / METER / 2,
    new b2Vec2(windowWidth / METER + 0.05,
    windowHeight / METER / 2),
    0
  );
  body.CreateFixtureFromShape(wgr, 5);

  var psd = new b2ParticleSystemDef();
  psd.radius = 0.025;
  psd.dampingStrength = 0.2;
  var particleSystem = world.CreateParticleSystem(psd);
  var box = new b2PolygonShape();
  box.SetAsBoxXYCenterAngle(
    1.25, 
    1.25, 
    new b2Vec2(windowWidth / 2 / METER, -windowHeight / 4 / METER), 
    0
  );
  var particleGroupDef = new b2ParticleGroupDef();
  particleGroupDef.shape = box;
  var particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
}

WaveMachine.prototype.Step = function() {
  world.Step(timeStep, velocityIterations, positionIterations);
  this.time += 1 / 60;
}

////////////////////////////////////////////////////

function onload() {
  var gravity = new b2Vec2(0, 10);
  world = new b2World(gravity);
  init();
}

function init() {
  // Initialize graphical properties
  canvas = document.getElementById('liquidFun');
  var width = 465; 
  var height = 465;
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff));
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(200, 200, 500); // TODO: Change these?
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  // Attach element to DOM where LiquidFun will be rendered
  canvas.appendChild(renderer.domElement);

  testSwitch("WaveMachine");

  var particles = world.particleSystems[0].GetPositionBuffer();
  animateParticles(particles);

  tick();
}

function animateParticles(particles) {
  var geometry = new THREE.Geometry();
  var colors = [];
  for (var i = 0; i < particles.length / 2; i++) {       
    var x = particles[i * 2] * METER + OFFSET_X;
    var y = particles[(i * 2) + 1] * METER + OFFSET_Y;
    var z = 0;
    var vertex = new THREE.Vector3(x, y, z);
    var x0 = Math.floor( (x - 72) / 16 );
    var y0 = Math.floor( (242 + y) / 16 );
    var pos = x0 + y0 * 16;
    if ( x0 >= 0 && x0 < 16 
      && y0 >= 0 && y0 < 16
      && pos < dataSet.length ) {
        color = new THREE.Color(getRgbColor(dataSet[pos]));
    } else {
        color = new THREE.Color(0xffffff);
    }
    geometry.vertices.push(vertex);
    colors.push(color);
  }

  geometry.colors = colors;
  var material = new THREE.PointCloudMaterial({
    size : 5,
    transparent : true,
    opacity : 0.9,
    vertexColors : true
  });

  scene.remove(pc);
  pc = new THREE.PointCloud(geometry, material);
  scene.add(pc);
}

function testSwitch(testName) {
  world.SetGravity(new b2Vec2(0, 10));
  var bd = new b2BodyDef;
  g_groundBody = world.CreateBody(bd);
  test = new window[testName];
}

$(document).ready(onload);