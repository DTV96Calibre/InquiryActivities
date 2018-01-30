# Pump Reversibility

## Developer notes
### LiquidFun
Check out the slideshow [here](https://docs.google.com/presentation/d/1fEAb4-lSyqxlVGNPog3G1LZ7UgtvxfRAwR0dwd19G4g/)
for information about the underlying structure and algorithms within LiquidFun.

#### forcefields.js
This library allows for the creation of forcefields that can be applied to particles bodies.

### Pumping logic
Pumping is done using forcefields along the length of the two primary
pipes. The simulation will examine the particles and determine what
percentage of particles are at a y-value high enough to be considered in
the tank before proceeding with the draining stage.
The draining stage is done by negating the forcefields and removing a
static body that blocks the drain pipe.

The pipes could start filled with water, avoiding the issues
surrounding dry pumping and being unable to move all the particles completely into the tank.
