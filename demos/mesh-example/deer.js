
const fs = require('fs');
const PNG = require('pngjs').PNG;
const Scene = require('../lib/scene.js');

// Vector operations
const Vector = require('../lib/vector.js');
const _dotProduct = Vector.dotProduct;
const _crossProduct = Vector.crossProduct;
const _subtract = Vector.subtract;
const _add = Vector.add;
const _scale = Vector.scale;
const _normalise = Vector.normalise;

const deerMesh = require('./deer.json');


const plane = new Scene.Plane(
            { x: 0, y: 1, z: 0 },
            { x: 0, y: -0.02, z: 0 },
            { color: { r: 255, g: 255, b: 255 }, reflectiveness: 0.4 });
const deer = new Scene.Mesh(deerMesh);

const surfaces = [ deer, plane ];

const lights = [
        new Scene.SpotLight({ x: -900, y: 630, z: 653 }, { x: 1.4, y: -0.65, z: -1 }, 
                                0.85, (Math.PI / 9) * 0.95, Math.PI / 9, 
                                { r: 250, g: 22, b: 21 }, { constant: 1, linear: 0.00014, quadratic: 0.0000007 }),
        new Scene.SpotLight({ x: 596, y: 643, z: 703 }, { x: -0.8, y: -0.65, z: -1 }, 
                                0.75, (Math.PI / 9) * 0.95, Math.PI / 9, 
                                { r: 25, g: 245, b: 21 }, { constant: 1, linear: 0.00014, quadratic: 0.0000007 })
    ];

const width = 1920;
const height = 1080;

const options = {
    cameraPosition: { x: -1300, y: 700, z: 1450 },
    viewDir: { x: 0.9, y: -0.4, z: -1 },
    background: { r: 255, g: 255, b: 255 },
    ambientLight: 0.12,
    targetWidth: width,
    targetHeight: height,
    ssaa: 16
};

const png = new PNG({
        colorType: 6,
        inputColorType: 6,
        bitDepth: 8,
        inputHasAlpha: true,
        width: width,
        height: height
    });

console.log('This could easily take a couple of hours to render at these settings...');

Scene.render(surfaces, lights, png.data, options);

png.pack().pipe(fs.createWriteStream('./deer.png'));
