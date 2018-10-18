
'use strict';

const Scene = require('scene');

const scene = new Scene.Scene({ background: { r: 16, g: 16, b: 16 } });

const wheelRadius = 300,
    colourWheel = [
        { r: 255, g: 0, b: 0 },
        { r: 255, g: 125, b: 0 },
        { r: 255, g: 255, b: 0 },
        { r: 125, g: 255, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 255, b: 125 },
        { r: 0, g: 255, b: 255 },
        { r: 0, g: 125, b: 255 },
        { r: 0, g: 0, b: 255 },
        { r: 125, g: 0, b: 255 },
        { r: 255, g: 0, b: 255 },
        { r: 255, g: 0, b: 125 }
    ];

colourWheel.forEach(function(colour, i) {

    const angle = i * Math.PI/6;

    scene.addSurface(new Scene.Sphere(
        { x: wheelRadius * Math.sin(angle), y: wheelRadius * Math.cos(angle), z: -2800 }, 
        75, 
        {
            color: colour, specularExp: 1000
        }));

});

scene.addSurface(new Scene.Sphere({ x: 0, y: 0, z: -3000 }, 200, {
    color: { r: 255, g: 255, b: 255 }, reflectiveness: 0.4
}));

scene.addLight({ x: 450, y: 175, z: -2600 }, 0.8);
scene.render(document.querySelector('canvas'));
