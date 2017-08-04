// shouldnt be a global :(
var particleColors = [
  new b2ParticleColor(0xff, 0x00, 0x00, 0xff), // red
  new b2ParticleColor(0x00, 0xff, 0x00, 0xff), // green
  new b2ParticleColor(0x00, 0x00, 0xff, 0xff), // blue
  new b2ParticleColor(0xff, 0x8c, 0x00, 0xff), // orange
  new b2ParticleColor(0x00, 0xce, 0xd1, 0xff), // turquoise
  new b2ParticleColor(0xff, 0x00, 0xff, 0xff), // magenta
  new b2ParticleColor(0xff, 0xd7, 0x00, 0xff), // gold
  new b2ParticleColor(0x00, 0xff, 0xff, 0xff) // cyan
];
var container;
var world = null;
var threeRenderer;
var renderer;
var camera;
var scene;
var objects = [];
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var test = {};
var projector = new THREE.Projector();
var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var g_groundBody = null;

var stirrer;
var joint;
var oscillationOffset = 0;

var windowWidth = 700;
var windowHeight = 600;

// The ID of the div for this renderer in the html page
var divID = "liquidFunContainer";

//var GenerateOffsets = Module.cwrap("GenerateOffsets", 'null');

function initTestbed() {
  camera = new THREE.PerspectiveCamera(70
    , windowWidth / windowHeight
    , 1, 1000);
  threeRenderer = new THREE.WebGLRenderer();
  threeRenderer.setClearColor(0xffffff);
  threeRenderer.setSize(windowWidth, windowHeight);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
  scene = new THREE.Scene();
  camera.lookAt(scene.position);

  document.getElementById(divID).appendChild(this.threeRenderer.domElement);

  this.mouseJoint = null;

  // hack
  renderer = new Renderer();
  var gravity = new b2Vec2(0, -10);
  world = new b2World(gravity);
  Testbed();
}

function testSwitch(testName) {
  ResetWorld();
  world.SetGravity(new b2Vec2(0, -10));
  var bd = new b2BodyDef;
  g_groundBody = world.CreateBody(bd);
  test = new window[testName];
}

function Testbed(obj) {
  var that = this;
  testSwitch("TestLiquidTimer");
  render();
}

var render = function() {
  // bring objects into world
  renderer.currentVertex = 0;
  if (test.Step !== undefined) {
    test.Step();
  } else {
    Step();
  }
  renderer.draw();

  threeRenderer.render(scene, camera);
  requestAnimationFrame(render);
};

function ResetWorld() {
  if (world !== null) {
    while (world.joints.length > 0) {
      world.DestroyJoint(world.joints[0]);
    }

    while (world.bodies.length > 0) {
      world.DestroyBody(world.bodies[0]);
    }

    while (world.particleSystems.length > 0) {
      world.DestroyParticleSystem(world.particleSystems[0]);
    }
  }
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 100;
}

function Step() {
  world.Step(timeStep, velocityIterations, positionIterations);
  // world.particleSystems[0].particleGroups[0].ApplyForce(new b2Vec2(10, 10));
  // moveStirrer();
}

/**@constructor*/
function QueryCallback(point) {
  this.point = point;
  this.fixture = null;
}

/**@return bool*/
QueryCallback.prototype.ReportFixture = function(fixture) {
  var body = fixture.body;
  if (body.GetType() === b2_dynamicBody) {
    var inside = fixture.TestPoint(this.point);
    if (inside) {
      this.fixture = fixture;
      return true;
    }
  }
  return false;
};

/*
 * Creates a dynamic body that can be used to push liquid particles.
 */
function CreateStirrer() {
  // Shape of the stirrer
  var shape = new b2PolygonShape;
  shape.vertices.push(new b2Vec2(-1.3, 1.3));
  shape.vertices.push(new b2Vec2(-1.3, 1.1));
  shape.vertices.push(new b2Vec2(-1.1, 1.3));
  shape.vertices.push(new b2Vec2(-1.1, 1.1));

  // Create the stirrer
  var bd = new b2BodyDef;
  bd.type = b2_dynamicBody;
  stirrer = world.CreateBody(bd);
  stirrer.CreateFixtureFromShape(shape, 1.0);

  CreateJoint();
}

function CreateJoint() {
  var prismaticJointDef = new b2PrismaticJointDef();
  prismaticJointDef.bodyA = g_groundBody;
  prismaticJointDef.bodyB = stirrer;
  prismaticJointDef.collideConnected = true;
  prismaticJointDef.localAxisA.Set(1,0);
  prismaticJointDef.localAnchorA = stirrer.GetPosition();
  joint = world.CreateJoint(prismaticJointDef);
}

function ToggleJoint() {
  if (joint) {
    world.DestroyJoint(joint);
    joint = null;
  } else {
    CreateJoint();
  }
}