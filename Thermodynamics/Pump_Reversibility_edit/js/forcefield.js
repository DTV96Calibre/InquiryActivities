/**
 * forcefield.js
 * A library for creating and manipulating forcefields for liquidfun.js
 */

class ForceField {
	constructor(x1,x2,y1,y2,fx,fy){
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.fx = fx;
		this.fy = fy;
	}
}


function b2ParticleSystem.initializeForceFieldArray(){
	this.forceFields = [];

function b2ParticleSystem.createForceField(x1, x2, y1, y2, fx, fy){
	forceField = new ForceField(x1, x2, y1, y2, fx, fy);
	this.forceFields.push(forceField);
}

function b2ParticleSystems.processForceFields(){
	for (i = 0; i < this.forceFields.length; i++){
		
	}
}
