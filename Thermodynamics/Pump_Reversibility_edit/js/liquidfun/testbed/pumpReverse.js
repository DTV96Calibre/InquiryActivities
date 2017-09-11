var bd;
var shape;
var ground;

// Units along Box2D's coordinate system to place walls
var tank1LeftPos = -1.84;
var tank1RightPos = -0.68;
var tank1BottomPos = 0.92;
var tank1TopPos = 1.6;
var tank1OpeningLeftPos = -1.3;
var tank1OpeningRightPos = -1.16;
var lowerPipeBottomPos = 0.75;
var lowerPipeBottomPos2 = lowerPipeBottomPos - 0.07;
var lowerPipeRightPos = tank1OpeningLeftPos + 1.53;
var lowerPipeTopPos = 0.81;
var upperPipeLowerPos = 1;
var upperPipeLeftPos = lowerPipeRightPos + 0.30;
var upperPipeTopPos = lowerPipeTopPos + 2.16;
var upperPipeRightPos = 0.68;
var tank2LeftPos = 0;
var tank2RightPos = 1.19;
var tank2TopPos = 3.6;

var particles;
var stirrerIsMoving = false;

function TestLiquidTimer() {
  camera.position.y = 2;
  camera.position.z = 3;
  bd = new b2BodyDef;
  ground = world.CreateBody(bd);

  shape = new b2ChainShape;
  shape.vertices.push(new b2Vec2(-2, 0));
  shape.vertices.push(new b2Vec2(2, 0));
  shape.vertices.push(new b2Vec2(2, 4));
  shape.vertices.push(new b2Vec2(-2, 4));
  shape.CreateLoop();
  ground.CreateFixtureFromShape(shape, 0.0);

  var psd = new b2ParticleSystemDef();
  psd.radius = 0.018;
  var particleSystem = world.CreateParticleSystem(psd);

  // Create particles
  shape = new b2PolygonShape;
  var particleStartPosX = (tank1LeftPos + tank1RightPos) / 2;
  shape.SetAsBoxXYCenterAngle(0.55, 0.22, new b2Vec2(particleStartPosX, 1.25), 0);
  var pd = new b2ParticleGroupDef;
  pd.color.Set(0, 0, 255, 255); // Blue
  pd.flags = b2_tensileParticle | b2_viscousParticle;
  pd.shape = shape;
  particleSystem.CreateParticleGroup(pd);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(0.55, 0.22, new b2Vec2(particleStartPosX, 1.25), 0);
  var pd = new b2ParticleGroupDef;
  pd.color.Set(0, 0, 255, 255); // Blue
  pd.flags = b2_tensileParticle | b2_viscousParticle;
  pd.shape = shape;
  particleSystem.CreateParticleGroup(pd);

  constructTank1Box();
  constructLowerPipe();
  constructUpperPipe();
  constructTank2Box();

  // Remove outer walls
  world.DestroyBody(world.bodies[1]);

  // CreateStirrer();
}

/*
 * Generates the walls around tank 1 that keeps the liquid contained.
 */
function constructTank1Box() {
  // Draw bottom wall
  body = world.CreateBody(bd);
  shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1LeftPos, tank1BottomPos), new b2Vec2(tank1OpeningLeftPos, tank1BottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw partition blocking access to pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos, tank1BottomPos), new b2Vec2(tank1OpeningRightPos, tank1BottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Continue drawing bottom wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos, tank1BottomPos), new b2Vec2(tank1RightPos, tank1BottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw left wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1LeftPos, tank1BottomPos), new b2Vec2(tank1LeftPos, tank1TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw right wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1RightPos, tank1BottomPos), new b2Vec2(tank1RightPos, tank1TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw top wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1LeftPos, tank1TopPos), new b2Vec2(tank1RightPos, tank1TopPos));
  body.CreateFixtureFromShape(shape, 0.1);
}

/*
 * Generates the walls around the bottom water pipe.
 */
function constructLowerPipe() {
  // Draw lower half of pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos, tank1BottomPos), new b2Vec2(tank1OpeningLeftPos, lowerPipeBottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos, lowerPipeBottomPos), new b2Vec2(tank1OpeningLeftPos + 0.05, lowerPipeBottomPos - 0.07));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos + 0.05, lowerPipeBottomPos2), new b2Vec2(lowerPipeRightPos, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw upper half of pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos, tank1BottomPos), new b2Vec2(tank1OpeningRightPos, lowerPipeBottomPos2 + 0.15));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos, lowerPipeBottomPos2 + 0.15), new b2Vec2(tank1OpeningRightPos + 0.052, lowerPipeBottomPos2 + 0.13));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos + 0.052, lowerPipeBottomPos2 + 0.13), new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Barrier blocking right-side of lower pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeTopPos), new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  // Barrier blocking the bottom of the lower pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos, lowerPipeBottomPos2), new b2Vec2(lowerPipeRightPos + 0.15, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.15, lowerPipeBottomPos2), new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);
}

/*
 * Generates the walls around the upper water pipe.
 */
function constructUpperPipe() {
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeTopPos), new b2Vec2(upperPipeLeftPos, lowerPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(upperPipeLeftPos, lowerPipeTopPos), new b2Vec2(upperPipeLeftPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeBottomPos2), new b2Vec2(upperPipeRightPos, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(upperPipeRightPos, lowerPipeBottomPos2), new b2Vec2(upperPipeRightPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);
}

/*
 * Generates the walls around tank 2 that keeps the liquid contained.
 */
function constructTank2Box() {
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2LeftPos, upperPipeTopPos), new b2Vec2(upperPipeLeftPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(upperPipeRightPos, upperPipeTopPos), new b2Vec2(tank2RightPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2LeftPos, upperPipeTopPos), new b2Vec2(tank2LeftPos, tank2TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2LeftPos, tank2TopPos), new b2Vec2(tank2RightPos, tank2TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2RightPos, upperPipeTopPos), new b2Vec2(tank2RightPos, tank2TopPos));
  body.CreateFixtureFromShape(shape, 0.1);
}

/*
 * Removes the barrier blocking the pipe leading from tank 1 in order to allow
 * the fluid to flow out.
 */
function openTank1() {
  world.DestroyBody(world.bodies[3]);
}

/*
 * Removes the barrier blocking the pipe leading from the lower pipe into the
 * pump in order to allow the fluid to flow into the upper pipe.
 */
function openLowerPipe() {
  world.DestroyBody(world.bodies[14]);
}

function moveStirrer() {
  // Magnitude of the force applied to the body.
  var k_forceMagnitude = 10.0;
  // How often the force vector rotates.
  var k_forceOscillationPerSecond = 0.2;
  var k_forceOscillationPeriod = 1.0 / k_forceOscillationPerSecond;
  // Maximum speed of the body.
  var k_maxSpeed = 2.0;

  oscillationOffset += (1.0 / 60.0);
  if (oscillationOffset > k_forceOscillationPeriod) {
    oscillationOffset -= k_forceOscillationPeriod;
  }

  // Calculate the force vector.
  var forceVector = new b2Vec2(0, -0.1);
  b2Vec2.MulScalar(forceVector, forceVector, k_forceMagnitude);
  stirrer.ApplyForceToCenter(forceVector, true);
}
