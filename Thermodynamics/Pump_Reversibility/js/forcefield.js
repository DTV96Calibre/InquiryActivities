/**
 * forcefield.js
 * A library for creating and manipulating forcefields for liquidfun.js
 */

/**
 * A force field object to be used with the LiquidFun methods.
 */
class ForceField {
	constructor(x1,x2,y1,y2,fx,fy) {
		//TODO: Should use bool flag to indicate enabled
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.fx = fx;
		this.fy = fy;
		this.fm = 1; // Force multiplier (scales both fx and fy, not in direction of force vector)
		this.lastfm = 1;
	}
	disable(){
		if (this.fm != 0){
			this.lastfm = this.fm;
		}
		this.fm = 0;
	}
	enable(){
		this.fm = this.lastfm;
	}
}

/**
 * Sets this particle system's force fields to an empty array.
 * @return none
 */
b2ParticleSystem.prototype.initializeForceFieldArray = function initializeForceFieldArray() {
	this.forceFields = [];
}

/**
 * Creates a new ForceField object and appends it to this particle system's list
 * of active force fields.
 * @return none
 */
b2ParticleSystem.prototype.createForceField = function createForceField(x1, x2, y1, y2, fx, fy) {
	forceField = new ForceField(x1, x2, y1, y2, fx, fy);
	this.forceFields.push(forceField);
}

/**
 * Applies all active force fields to each particle within range as appropriate.
 * @return none
 * TODO: Should modify to check for enabled flag.
 */
b2ParticleSystem.prototype.applyForceFields = function applyForceFields() {
	vbuffer = this.GetVelocityBuffer();
	pbuffer = this.GetPositionBuffer();
	// Iterate through force fields
	for (i = 0; i < this.forceFields.length; i++) {
		// Iterate through particles
		for (pIndex = 0; pIndex < pbuffer.length; pIndex += 2) {
			forceField = this.forceFields[i];
			particleX = pbuffer[pIndex];
			particleY = pbuffer[pIndex + 1];

			// For each particle, check if it's within the field
			if (forceField.x1 <= particleX && forceField.x2 >= particleX &&
			    forceField.y1 <= particleY && forceField.y2 >= particleY) {
				// Apply force to particle
				vbuffer[pIndex] += forceField.fx*forceField.fm; //TODO Can be optimized
				vbuffer[pIndex + 1] += forceField.fy*forceField.fm;
			}
		}
	}
}

/**
 * Returns true if the given threshold of particles in this particle system is
 * above the given y-position.
 * @param {float} acceptedPct: The minimum percent of particles that must be high enough
 * @param {int} y: The maximum range (in pixels) the particle's vertical pos must not exceed
 * @param
 */
b2ParticleSystem.prototype.checkPumpFinished = function checkPumpFinished(acceptedPct, y) {
	pbuffer = this.GetPositionBuffer(); // Sequence of x, y values for each particle
	numValidParticles = 0; // Record # of particles above accepted y value
	// Iterate through particles
	for (pIndex = 0; pIndex < pbuffer.length; pIndex += 2) {
		particleY = pbuffer[pIndex + 1];
		if (particleY <= y) {
			numValidParticles++;
		}
	}

	pct = numValidParticles / (pbuffer.length / 2);
	return pct >= acceptedPct;
}

b2ParticleSystem.prototype.startForceFields = function startForceFields(ps) {
    console.log(this);
    setInterval(this.applyForceFields.bind(this),16);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
