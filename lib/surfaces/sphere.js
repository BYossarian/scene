
'use strict';

// Vector operations
const Vector = require('../vector.js');
const _dotProduct = Vector.dotProduct;
const _subtract = Vector.subtract;
const _scale = Vector.scale;

const Surface = require('./surface.js');

function Sphere(centre, r, material) {

    Surface.call(this, material);

    this._centre = centre;
    this._r = r;

}

Sphere.prototype = Object.create(Surface.prototype);

Sphere.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    const c = this._centre;
    const o = ray.origin;
    const d = ray.direction;
    const oMinusC = _subtract(o, c);
    const dDotD = _dotProduct(d, d);
    const discriminant = Math.pow(_dotProduct(d, oMinusC), 2) - (dDotD * (_dotProduct(oMinusC, oMinusC) - Math.pow(this._r, 2)));

    if (discriminant < 0) {
        return null;
    }

    const discriminant_sqrt = Math.sqrt(discriminant);
    const b = _dotProduct(d, oMinusC);

    const t1 = (- discriminant_sqrt - b)/dDotD;

    // t1 < t2 here:

    if (t1 > lowerT && t1 < upperT) {
        return {
            surface: this,
            t: t1
        };
    }

    const t2 = (discriminant_sqrt - b)/dDotD;

    if (t2 > lowerT && t2 < upperT) {
        return {
            surface: this,
            t: t2
        };
    }

    return null;

};

Sphere.prototype.getNormal = function(point, ray) {

    return _scale(1 / this._r, _subtract(point, this._centre));

};

module.exports = Sphere;
