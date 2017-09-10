/*
 * File: utility.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

function drawCrosshair(){
  fill(51, 51, 51, 127);
  stroke(255);
  strokeWeight(1);
  this.crosshair_pos = [mouseX, mouseY];
  ellipse(this.crosshair_pos[0], this.crosshair_pos[1], int(jointSizeSlider.val()));
  noStroke();
}

/* Given a tap location and radius of new joint, creates and links
 * a new joint to the pipe. Assumes pipe is already populated with
 * at least one joint!
 * @param x: x coordinate of new joint
 * @param y: y coordinate of new joint
 * @param radius: radius of new joint
 */
function insertJoint(x, y, radius) {
  // Joints are drawn relative to the anchorpoint so calculate offset
  var jointXOffset = x - pot.anchorPoint.x;
  var jointYOffset = y - pot.anchorPoint.y;
  
  // check if too close to last joint
  var xDiff = joints[joints.length-1].pos.x - jointXOffset;
  if (xDiff < 50 && xDiff > 0) {
    return;
  }

  // Limit new joints to only be created to the left of the previous joints
  // Erase nodes until new joint is in valid location
  while(jointXOffset >= joints[joints.length-1].pos.x) {
    if (joints.length - 1 <= 0) {
      return;
    }
    else {
      joints.pop();
      print("popped");
      joints[joints.length-1].next = null;
    }
  }

  joints.push(new Joint(radius, joints[joints.length-1], {x:jointXOffset, y:jointYOffset}));
  joints[joints.length-2].next = joints[joints.length-1];
}

function getDistance(pos1, pos2){
  var x1 = pos1.x;
  var y1 = pos1.y;
  var x2 = pos2.x;
  var y2 = pos2.y;
  return abs(sqrt(sq(x2-x1) + sq(y2-y1)));
}

/* Recursively calculates temperature of each node in the pipe chain.
 * @param currentJoint: A joint whose temperature is already known.
 */
function heatTransferTraverse(currentJoint){
  if (!currentJoint.next){
    return
  }
  var length = getDistance(currentJoint.pos, currentJoint.next.pos);
  currentJoint.next.temp = getNewTemp(currentJoint.radius*2, currentJoint.next.radius*2, length, currentJoint.temp);
  heatTransferTraverse(currentJoint.next);
}

function getNewTemp(d1, d2, length, t1){
  return t1 - t1/10;
}

/* Returns the joint that is closest to a given position pos.
 */
function getNearestJoint(pos) {
  var relativePos = {x:pos.x - pot.anchorPoint.x, y:pos.y - pot.anchorPoint.y};
  var nearest = 0; //index of nearest
  var current = 0;
  var length = joints.length; // length of the list of joints
  var distance = getDistance(joints[nearest].pos, relativePos);
  var nextDistance;
  for (current = 1; current < length; current += 1){
    nextDistance = getDistance(joints[current].pos, relativePos);
    if (distance > nextDistance) {
      nearest = current;
      distance = nextDistance;
    }
  }
  return joints[nearest];
}

function highlightNearestJoint(){
  var nearest = getNearestJoint({x:mouseX, y:mouseY});
  stroke(255);
  ellipse(nearest.pos.x + pot.anchorPoint.x, nearest.pos.y + pot.anchorPoint.y, nearest.radius);
  noStroke();
}

function inValidZone(x, y){
  if (x <= validZone.x2 && x >= validZone.x1){
    if (y <= validZone.y2 && y >= validZone.y1){
      return true;
    }
  }
  return false;
}

function changeBackgroundImage(imageID) {
  if (imageID == "waves") {
    $('body').css('background-image', 'url(https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Heat_Conduction/images/waves-bg.jpg?raw=true)');
  }
  else if (imageID == "countertop") {
    $('body').css('background-image', 'url(https://github.com/DTV96Calibre/InquiryActivities/blob/master/Priority_2_Thermodynamics/Heat_Conduction/images/kitchen-bg.jpg?raw=true)');
  }
}