
var CONSTANTS = require('../constants.js');
var EPSILON = CONSTANTS.EPSILON;

// Vector operations
var Vector = require('../vector.js');
var _dotProduct = Vector.dotProduct;
var _subtract = Vector.subtract;
var _scale = Vector.scale;
var _normalise = Vector.normalise;

function Plane(normal, point, material) {

    material = material || {};

    var color = material.color || { r: 100, g: 100, b: 100 };

    this._normal = _normalise(normal);
    this._point = point;
    
    this._specularExp = material.specularExp || 500;
    this._reflectiveness = material.reflectiveness || 0;

    // allow color to be a function
    if (typeof color === 'function') {
        this.getColor = color;
    } else {
        this._color = color;
    }

}

Plane.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    var denominator = _dotProduct(ray.direction, this._normal),
        t = 0;

    if (denominator < EPSILON && denominator > -EPSILON) {
        // ray and plane are parallel
        return null;
    }

    t = _dotProduct(_subtract(this._point, ray.origin), this._normal) / denominator;

    if (t > lowerT && t < upperT) {
        return {
            surface: this,
            t: t
        };
    }

    return null;

};

Plane.prototype.getNormal = function(point, ray) {

    // need to check which side of the plane the ray is coming 
    // from so we can return either normal or -normal
    if (_dotProduct(this._normal, ray.direction) > 0) {
        return _scale(-1, this._normal);
    }

    return this._normal;

};

Plane.prototype.getColor = function(point, ray) {

    return this._color;

};

module.exports = Plane;