
'use strict';

const CONSTANTS = require('./constants.js');
const EPSILON = CONSTANTS.EPSILON;

const DEFAULT_RECURSION_DEPTH = 2;
const DEFAULT_RESOLUTION = {
    WIDTH: 1280,
    HEIGHT: 720
};

// Vector operations
const Vector = require('./vector.js');
const _dotProduct = Vector.dotProduct;
const _crossProduct = Vector.crossProduct;
const _subtract = Vector.subtract;
const _add = Vector.add;
const _scale = Vector.scale;
const _normalise = Vector.normalise;

const helpers = require('./helpers.js');
const _clamp = helpers.clamp;
const _rgb255Torgb1 = helpers.rgb255Torgb1;

function _shade(scene, ray, intersection, recursionDepth) {

    const point = _add(_scale(intersection.t, ray.direction), ray.origin);
    const surfaceNormal = intersection.surface.getNormal(point, ray, intersection);
    const normalisedRay = _normalise(ray.direction);
    const diffuseColor = intersection.surface.getDiffuseColor();
    const numLights = scene.lights.length;
    const numSurfaces = scene.surfaces.length;
    // NB: this is currently assuming the light of ambient light is pure white:
    const rayColor = {
        r: scene.ambientLight * diffuseColor.r,
        g: scene.ambientLight * diffuseColor.g,
        b: scene.ambientLight * diffuseColor.b
    };

    // loop through lights, and accumulate the effect of each on the surface point:
    for (let i = 0; i < numLights; i++) {

        const light = scene.lights[i];
        // light direction is the (unnormalised) vector going from the point to 
        // the light:
        let lightDirection = light.getDirection(point);

        // check for shadow
        let inShadow = false;

        for (let j = 0; j < numSurfaces; j++) {

            // can't cause a shadow on self so:
            if (scene.surfaces[j] === intersection.surface) {
                continue;
            }

            // check for any intersections between point on surface and light source
            // (since lightDirection is the vector that stretches between those two
            // points, we're looking for intersections between t=0 and t=1, however
            // use t=EPSILON and t=(1 - EPSILON) to avoid any floating point madness)
            // NB: in the case of a directional light, the light doesn't have a defined 
            // position so need to check all the way to Infinity:
            inShadow = !!scene.surfaces[j].findRayIntersection({
                origin: point,
                direction: lightDirection
            }, EPSILON, light._directional ? Infinity : 1 - EPSILON);

            if (inShadow) {
                break;
            }

        }

        if (inShadow) {
            continue;
        }

        const lightColor = light.getColor();

        // need normalised lightDirection for shading calcs:
        lightDirection = _normalise(lightDirection);

        // Lambertian shading (diffuse shading)
        const diffuseLightCoefficient = Math.max(0, _dotProduct(surfaceNormal, lightDirection));

        // Blinn-Phong shading (specular highlights)
        const halfwayVector = _normalise(_subtract(lightDirection, normalisedRay));
        const specularLightCoefficient = Math.pow(Math.max(0, _dotProduct(surfaceNormal, halfwayVector) * 0.999), intersection.surface.getSpecularExponent());

        const totalCoefficient = light.getIntensity(point) * (diffuseLightCoefficient + specularLightCoefficient)

        rayColor.r += totalCoefficient * lightColor.r * diffuseColor.r;
        rayColor.g += totalCoefficient * lightColor.g * diffuseColor.g;
        rayColor.b += totalCoefficient * lightColor.b * diffuseColor.b;

    }

    // handle reflections:
    const reflectiveness = intersection.surface.getReflectiveness();

    if (reflectiveness) {

        const reflectionRay = {
            origin: point,
            direction: _subtract(ray.direction, _scale(2 * _dotProduct(ray.direction, surfaceNormal), surfaceNormal))
        };
        const reflectionColor = _traceRay(scene, reflectionRay, EPSILON, Infinity, recursionDepth - 1);

        if (reflectionColor) {
            rayColor.r = reflectiveness * reflectionColor.r + (1 - reflectiveness) * rayColor.r;
            rayColor.g = reflectiveness * reflectionColor.g + (1 - reflectiveness) * rayColor.g;
            rayColor.b = reflectiveness * reflectionColor.b + (1 - reflectiveness) * rayColor.b;
        }

    }

    return rayColor;

};

function _traceRay(scene, ray, tMin, tMax, recursionDepth) {

    if (recursionDepth <= 0) {
        return null;
    }

    const numSurfaces = scene.surfaces.length;
    let nearest = null;

    // find nearest surface that intersects the ray
    for (let i = 0; i < numSurfaces; i++) {

        const intersection = scene.surfaces[i].findRayIntersection(ray, tMin, tMax);

        if (intersection && (!nearest || intersection.t < nearest.t)) {
            nearest = intersection;
        }

    }

    return (nearest ? _shade(scene, ray, nearest, recursionDepth) : null);

};

function render(surfaces, lights, renderTarget, options) {

    options = options || {};

    const targetWidth = options.targetWidth || DEFAULT_RESOLUTION.WIDTH;
    const targetHeight = options.targetHeight || DEFAULT_RESOLUTION.HEIGHT;

    if (renderTarget.length !== (targetWidth * targetHeight * 4)) {
        throw new Error(`renderTarget has size ${renderTarget.length} which doesn't match requested resolution of ${targetWidth} x ${targetHeight}`);
    }
    
    const cameraPosition = options.cameraPosition || { x: 0, y: 0, z: 0 };
    // camera's coordinate system:
    const cameraFront = options.viewDir ? _normalise(options.viewDir) : { x: 0, y: 0, z: -1 };
    const cameraUp = options.cameraUp ? _normalise(options.cameraUp) : { x: 0, y: 1, z: 0 };
    const cameraRight = _normalise(_crossProduct(cameraFront, cameraUp));
        
    let renderTargetIndex = 0;

    const xOffset = 0.5 - targetWidth / 2;
    const yOffset = targetHeight / 2 - 0.5;
    const z = targetHeight / Math.tan((options.verticalFOV || Math.PI / 4) / 2);
    const worldFront = _scale(z, cameraFront);

    const scene = {
            lights: lights,
            surfaces: surfaces,
            ambientLight: typeof options.ambientLight === 'number' ? options.ambientLight : 0.1,
            background: _rgb255Torgb1(options.background || { r: 0, g: 0, b: 0 })
        };

    // loop through pixels, and trace ray for each:
    // NB: renderTarget is laid out starting from the top-left, going 
    // left-to-right, top-to-bottom:
    for (let j = 0; j < targetHeight; j++) {
        for (let i = 0; i < targetWidth; i++) {

            let color = null;

            if (options.ssaa) {

                // grid based supersample antialiasing

                const numSamples = options.ssaa === 16 ? 16 : 4;
                const loopLimit = Math.round(Math.log2(numSamples)) - 1;

                color = { r: 0, g: 0, b: 0 };

                for (let k = -loopLimit; k <= loopLimit; k += 2) {
                    for (let m = -loopLimit; m <= loopLimit; m += 2) {

                        const rayDirection = _add(worldFront, 
                                            _add(_scale(yOffset - j + k / numSamples, cameraUp), 
                                                _scale(i + xOffset + m / numSamples, cameraRight)));

                        const viewRay = {
                                origin: cameraPosition,
                                direction: rayDirection
                            };

                        const sampleColor = _traceRay(scene, viewRay, 0, Infinity, DEFAULT_RECURSION_DEPTH) || scene.background;

                        color.r += sampleColor.r / numSamples;
                        color.g += sampleColor.g / numSamples;
                        color.b += sampleColor.b / numSamples;

                    }
                }

            } else {

                const rayDirection = _add(worldFront, 
                                    _add(_scale(yOffset - j, cameraUp), 
                                        _scale(i + xOffset, cameraRight)));

                const viewRay = {
                        origin: cameraPosition,
                        direction: rayDirection
                    };

                color = _traceRay(scene, viewRay, 0, Infinity, DEFAULT_RECURSION_DEPTH) || scene.background;

            }

            renderTarget[renderTargetIndex] = _clamp(Math.floor(color.r * 255), 0, 255);
            renderTarget[renderTargetIndex + 1] = _clamp(Math.floor(color.g * 255), 0, 255);
            renderTarget[renderTargetIndex + 2] = _clamp(Math.floor(color.b * 255), 0, 255);
            renderTarget[renderTargetIndex + 3] = 255;

            renderTargetIndex += 4;

        }
    }

};

// convenience method for rendering straight to canvas:
function renderToCanvas(surfaces, lights, canvas, options) {

    options = options || {};

    const targetWidth = options.targetWidth || DEFAULT_RESOLUTION.WIDTH;
    const targetHeight = options.targetHeight || DEFAULT_RESOLUTION.HEIGHT;

    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(targetWidth, targetHeight);

    Scene.render(surfaces, lights, image.data, options);

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.putImageData(image, 0, 0);

}

module.exports = {
    render: render,
    renderToCanvas: renderToCanvas,
    // surfaces:
    Sphere: require('./surfaces/sphere.js'),
    Plane: require('./surfaces/plane.js'),
    Mesh: require('./surfaces/mesh.js'),
    // lights:
    PointLight: require('./lights/point-light.js'),
    DirectionalLight: require('./lights/directional-light.js'),
    SpotLight: require('./lights/spot-light.js')
};
