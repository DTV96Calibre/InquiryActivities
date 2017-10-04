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


b2ParticleSystem.prototype.initializeForceFieldArray = function initializeForceFieldArray(){
	this.forceFields = [];
}

b2ParticleSystem.prototype.createForceField = function createForceField(x1, x2, y1, y2, fx, fy){
	forceField = new ForceField(x1, x2, y1, y2, fx, fy);
	this.forceFields.push(forceField);
}

b2ParticleSystem.prototype.applyForceFields = function appleForceFields(){
	vbuffer = this.GetVelocityBuffer();
	pbuffer = this.GetPositionBuffer();
	for (i = 0; i < this.forceFields.length; i++){
		for (pIndex = 0; pIndex < pbuffer.length; pIndex+=2){
			ff=this.forceFields[i];
			// For each particle, check if it's within the field
			if (ff.x1<=pbuffer[pIndex] && ff.x2>=pbuffer[pIndex]){
				if (ff.y1<=pbuffer[pIndex+1] && ff.y2>=pbuffer[pIndex+1]){
					// Apply force to particle
					vbuffer[pIndex]+=ff.fx;
					vbuffer[pIndex+1]+=ff.fy;
				}
			}
		}
	}
}
