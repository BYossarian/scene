
// Vector operations
var Vector = require('../vector.js');
var _dotProduct = Vector.dotProduct;
var _subtract = Vector.subtract;
var _scale = Vector.scale;

function Sphere(centre, r, material) {

    material = material || {};

    var color = material.color || { r: 100, g: 100, b: 100 };

    this._centre = centre;
    this._r = r;

    this._specularExp = material.specularExp || 500;
    this._reflectiveness = material.reflectiveness || 0;

    // allow color to be a function
    if (typeof color === 'function') {
        this.getColor = color;
    } else {
        this._color = color;
    }

}

Sphere.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    var c = this._centre,
        o = ray.origin,
        d = ray.direction,
        oMinusC = _subtract(o, c),
        dDotD = _dotProduct(d, d),
        discriminant = Math.pow(_dotProduct(d, oMinusC), 2) - (dDotD * (_dotProduct(oMinusC, oMinusC) - Math.pow(this._r, 2))),
        t1 = 0,
        t2 = 0,
        b = 0;

    if (discriminant < 0) {
        return null;
    }

    // technically not the discriminant here, but just to reprepose the variable:
    discriminant = Math.sqrt(discriminant);
    b = _dotProduct(d, oMinusC);

    t1 = (-discriminant - b)/dDotD;
    t2 = (discriminant - b)/dDotD;

    // t1 < t2 here:

    if (t1 > lowerT && t1 < upperT) {
        return {
            surface: this,
            t: t1
        };
    }

    if (t2 > lowerT && t2 < upperT) {
        return {
            surface: this,
            t: t1
        };
    }

    return null;

};

Sphere.prototype.getNormal = function(point, ray) {

    return _scale(1 / this._r, _subtract(point, this._centre));

};

Sphere.prototype.getColor = function(point, ray) {

    return this._color;

};

module.exports = Sphere;