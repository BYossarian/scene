
'use strict';

const CONSTANTS = require('./constants.js');
const EPSILON = CONSTANTS.EPSILON;
const TRACE_DEPTH = 2;

// Surfaces
const Sphere = require('./surfaces/sphere.js');
const Plane = require('./surfaces/plane.js');

// Vector operations
const Vector = require('./vector.js');
const _dotProduct = Vector.dotProduct;
const _subtract = Vector.subtract;
const _add = Vector.add;
const _scale = Vector.scale;
const _normalise = Vector.normalise;



function Scene(options) {

    options = options || {};
    options.imagePlane = options.imagePlane || {};

    this._focalLength = options.focalLength || 250;
    this._imagePlane = {
        left: options.imagePlane.left || -64,
        right: options.imagePlane.right || 64,
        top: options.imagePlane.top || 36,
        bottom: options.imagePlane.bottom || -36,
        width: options.imagePlane.width || 1280,
        height: options.imagePlane.height || 720
    };

    this._background = options.background || { r: 31, g: 31, b: 31 };

    this._ambientLight = options.ambientLight || 0.15;

    this._lights = [];
    this._surfaces = [];

}

Scene.prototype._shade = function(ray, intersection, depth) {

    const point = _add(_scale(intersection.t, ray.direction), ray.origin);
    const surfaceNormal = intersection.surface.getNormal(point, ray);
    const normalisedRay = _normalise(ray.direction);
    const color = intersection.surface.getColor(point);    // color of surface at that point
    const numLights = this._lights.length;
    const numSurfaces = this._surfaces.length;
    const reflectiveness = intersection.surface._reflectiveness;
    let totalIntensity = this._ambientLight;

    for (let i = 0; i < numLights; i++) {

        const light = this._lights[i];
        // light direction is vector pointing towards the light
        let lightDirection = _subtract(light.position, point);

        // check for shadow
        let inShadow = false;

        for (let j = 0; j < numSurfaces; j++) {

            // can't cause a shadow on self so:
            if (this._surfaces[j] === intersection.surface) {
                continue;
            }

            // check for any intersections between point on surface and light source
            // (since lightDirection is the vector that stretches between those two
            // points, we're looking for intersections between t=0 and t=1, however
            // use t=EPSILON and t=(1 - EPSILON) to avoid any floating point madness)
            inShadow = !!this._surfaces[j].findRayIntersection({
                origin: point,
                direction: lightDirection
            }, EPSILON, 1 - EPSILON);

            if (inShadow) {
                break;
            }

        }

        if (inShadow) {
            continue;
        }

        // the light direction vector needs normalising for the 
        // following calculations
        lightDirection = _normalise(lightDirection);

        const halfwayVector = _normalise(_subtract(lightDirection, normalisedRay));

        // Lambertian shading (diffuse shading)
        const diffuseLight = Math.max(0, _dotProduct(surfaceNormal, lightDirection));

        // Blinn-Phong shading (specular highlights)
        const specularHighlights = Math.pow(Math.max(0, _dotProduct(surfaceNormal, halfwayVector) * 0.999), intersection.surface._specularExp);

        totalIntensity += light.intensity * (diffuseLight + specularHighlights);

    }

    const rayColor = {
        r: color.r * totalIntensity,
        b: color.b * totalIntensity,
        g: color.g * totalIntensity
    };

    // reflections
    if (reflectiveness) {

        const reflectionRay = {
            origin: point,
            direction: _subtract(ray.direction, _scale(2 * _dotProduct(ray.direction, surfaceNormal), surfaceNormal))
        };
        const reflectionColor = this._traceRay(reflectionRay, EPSILON, Infinity, depth - 1);

        if (reflectionColor) {
            rayColor.r = reflectiveness * reflectionColor.r + (1 - reflectiveness) * rayColor.r;
            rayColor.b = reflectiveness * reflectionColor.b + (1 - reflectiveness) * rayColor.b;
            rayColor.g = reflectiveness * reflectionColor.g + (1 - reflectiveness) * rayColor.g;
        }

    }

    return rayColor;

};

Scene.prototype._traceRay = function(ray, tMin, tMax, depth) {

    if (!depth) {
        return null;
    }

    const numSurfaces = this._surfaces.length;
    let nearest = null;

    // find nearest surface that intersects the ray
    for (let i = 0; i < numSurfaces; i++) {

        const intersection = this._surfaces[i].findRayIntersection(ray, tMin, tMax);

        if (intersection && (!nearest || intersection.t < nearest.t)) {
            nearest = intersection;
        }

    }

    return (nearest ? this._shade(ray, nearest, depth) : null);

};

Scene.prototype.render = function(canvas) {

    const lastX = this._imagePlane.right;
    const lastY = this._imagePlane.bottom;
    const pixelWidth = (lastX - this._imagePlane.left) / this._imagePlane.width;
    const pixelHeight = (this._imagePlane.top - lastY) / this._imagePlane.height;
    const startX = this._imagePlane.left + (pixelWidth / 2);
    const startY = this._imagePlane.top - (pixelHeight / 2);
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(this._imagePlane.width, this._imagePlane.height);
    let imageIndex = 0;

    // loop through viewing rays, and trace each
    for (let y = startY; y > lastY; y -= pixelHeight) {
        for (let x = startX; x < lastX; x += pixelWidth) {

            const viewRay = {
                    origin: { x: 0, y: 0, z: 0 },
                    direction: { x: x, y: y, z: -this._focalLength }
                };

            viewRay.direction.x = x;
            viewRay.direction.y = y;
            
            const color = this._traceRay(viewRay, 0, Infinity, TRACE_DEPTH) || this._background;

            image.data[imageIndex] = color.r;
            image.data[imageIndex + 1] = color.g;
            image.data[imageIndex + 2] = color.b;
            image.data[imageIndex + 3] = color.a || 255;

            imageIndex += 4;

        }
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.putImageData(image, 0, 0);

};

Scene.prototype.addLight = function(position, intensity) {

    this._lights.push({
        position: position,
        intensity: intensity || 1
    });

};

Scene.prototype.addSurface = function(surface) {

    this._surfaces.push(surface);

};

module.exports = {
    Scene: Scene,
    Sphere: Sphere,
    Plane: Plane
};
