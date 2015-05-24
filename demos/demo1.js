
var Scene = require('scene');

var scene = new Scene.Scene({ background: { r: 100, g: 100, b: 100 } });

var sphere = new Scene.Sphere({ x: -300, y: 200, z: -2800 }, 80, {
        color: { r: 160, g: 160, b: 160 }, specularExp: 10000
    }),
    sphere2 = new Scene.Sphere({ x: -300, y: 40, z: -2800 }, 80, {
        color: { r: 200, g: 200, b: 200 }, specularExp: 10000
    }),
    sphere3 = new Scene.Sphere({ x: -300, y: -120, z: -2800 }, 80, {
        color: { r: 45, g: 45, b: 45 }, specularExp: 10000
    }),
    mirror = new Scene.Sphere({ x: 400, y: 400, z: -5000 }, 500, {
        color: { r: 200, g: 200, b: 200 }, reflectiveness: 1
    }),
    plane = new Scene.Plane(
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -200, z: 0 },
        { color: { r: 80, g: 80, b: 80},  reflectiveness: 0.1 }
    );

scene.addSurface(sphere);
scene.addSurface(sphere2);
scene.addSurface(sphere3);
scene.addSurface(mirror);
scene.addSurface(plane);

scene.addLight({ x: 800, y: 1600, z: -1000 }, 0.8);
scene.render(document.querySelector('canvas'));
