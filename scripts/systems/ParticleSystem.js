MyGame.systems.ParticleSystem = function(spec) {
    let nextName = 1;
    let particles = {};

    generateNewParticles();
        //------------------------------------------------------------------
    //
    // This creates one new particle
    //
    //------------------------------------------------------------------
    function create() {
        let size = Random.nextGaussian(spec.size.mean, spec.size.stdev);
        let direction = Random.nextCircleVector();
        let x = Random.nextRange(spec.center.x - (spec.width / 2), spec.center.x + (spec.width / 2));
        let y = Random.nextRange((spec.center.y - (spec.height / 2)), (spec.center.y + (spec.height / 2)));
        direction.y = 1;
        let p = {
                center: { x: x, y: y },
                radius: size,  // Making square particles
                direction: direction,
                speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
                rotation: 0,
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),    // How long the particle should live, in seconds
                alive: 0,    // How long the particle has been alive, in seconds
                fillColor: spec.fillColor,
                outlineColor: spec.outlineColor                
            };

        return p;
    }

    //------------------------------------------------------------------
    //
    // Update the state of all particles.  This includes removing any that have exceeded their lifetime.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        let removeMe = [];

        //
        // We work with time in seconds, elapsedTime comes in as milliseconds
        elapsedTime = elapsedTime / 1000;
        
        Object.getOwnPropertyNames(particles).forEach(function(value, index, array) {
            let particle = particles[value];
            //
            // Update how long it has been alive
            particle.alive += elapsedTime;

            //
            // Update its center
            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

            //
            // Rotate proportional to its speed
            particle.rotation += particle.speed / 500;

            //
            // If the lifetime has expired, identify it for removal
            if (particle.alive > particle.lifetime) {
                removeMe.push(value);
            }
        });

        //
        // Remove all of the expired particles
        for (let particle = 0; particle < removeMe.length; particle++) {
            delete particles[removeMe[particle]];
        }
        removeMe.length = 0;
    }

    function generateNewParticles() {
        for (let particle = 0; particle < (Random.nextRange(150, 300)); particle++) {
            //
            // Assign a unique name to each particle
            particles[nextName++] = create();
        }
    }

    return {
        update: update,
        get particles() { return particles; },
        generateNewParticles: generateNewParticles
    };
}