
const fs = require('fs');
const PNG = require('pngjs').PNG;
const Scene = require('../lib/scene.js');

const topSphere = new Scene.Sphere(
            { x: -300, y: 200, z: -2800 }, 
            80, 
            { color: { r: 160, g: 160, b: 160 }, specularExp: 10000 });
const middleSphere = new Scene.Sphere(
            { x: -300, y: 40, z: -2800 }, 
            80, 
            { color: { r: 200, g: 200, b: 200 }, specularExp: 10000 });
const bottomSphere = new Scene.Sphere(
            { x: -300, y: -120, z: -2800 }, 
            80, 
            { color: { r: 45, g: 45, b: 45 }, specularExp: 10000 });
const mirror = new Scene.Sphere(
            { x: 400, y: 400, z: -5000 }, 
            500, 
            { color: { r: 200, g: 200, b: 200 }, reflectiveness: 1 });
const plane = new Scene.Plane(
            { x: 0, y: 1, z: 0 },
            { x: 0, y: -200, z: 0 },
            { color: { r: 80, g: 80, b: 80},  reflectiveness: 0.1 });

const surfaces = [topSphere, middleSphere, bottomSphere, mirror, plane];

const lights = [new Scene.PointLight({ x: 800, y: 1600, z: -1000 }, 0.8)];

const options = {
    cameraPosition: { x: 0, y: 0, z: -750 },
    background: { r: 100, g: 100, b: 100 },
    ambientLight: 0.15,
    targetWidth: 1920,
    targetHeight: 1080,
    ssaa: 16
};

const png = new PNG({
        colorType: 6,
        inputColorType: 6,
        bitDepth: 8,
        inputHasAlpha: true,
        width: 1920,
        height: 1080
    });

console.log('Rendering scene at 1080p with 16x SSAA (this might take a while) ...');

Scene.render(surfaces, lights, png.data, options);

png.pack().pipe(fs.createWriteStream('./totem.png'));
