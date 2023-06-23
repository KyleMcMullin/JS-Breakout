MyGame.render.ParticleSystem = function(system, graphics) {
    
    function render() {
        Object.getOwnPropertyNames(system.particles).forEach(function(value) {
            let particle = system.particles[value];
            graphics.drawCircle({
                center: {x: particle.center.x, y: particle.center.y},
                radius: particle.radius,
                fillColor: particle.fillColor,
                outlineColor: particle.outlineColor
            });
        });
    }

    return {
        render: render
    };
}