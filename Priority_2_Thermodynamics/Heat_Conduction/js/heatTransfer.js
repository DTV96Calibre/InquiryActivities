/*
 * File: heatTransfer.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

// NOTE: This file is not in use and is only being kept temporarily

var KW_CMK = 0.00043; // kW/cm-K
var ENERGY_IN_KJS = 0.001; // TODO: Clarify this

/**
 * Calculates the temperature of the first joint after the base joint.
 */
function first() {
  return TEMP_POT - (ENERGY_IN_KJS*currentArea*currentLength/KW_CMK);
}

/**
 *  Calculates the temperature of a joint given the previous joint's temperature,
 * the distance between the previous joint and the current joint and the new
 * joint's cross-sectional area.
 *
 */
function calculateJointTemp(distFromPrev, currentArea, prevTemp) {
  return prevTemp - (ENERGY_IN_KJS*distFromPrev*currentArea/KW_CMK);
  //return prev - (ENERGY_IN_KJS*(currentLength-prevLength)*currentArea/KW_CMK);
}

function findTempAtJoint(){
  return;
}
