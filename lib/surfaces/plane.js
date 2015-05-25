
var CONSTANTS = require('../constants.js');
var EPSILON = CONSTANTS.EPSILON;

// Vector operations
var Vector = require('../vector.js');
var _dotProduct = Vector.dotProduct;
var _subtract = Vector.subtract;
var _scale = Vector.scale;
var _normalise = Vector.normalise;

var Surface = require('./surface.js');

function Plane(normal, point, material) {

    Surface.call(this, material);

    this._normal = _normalise(normal);
    this._point = point;

}

Plane.prototype = Object.create(Surface.prototype);

Plane.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    var denominator = _dotProduct(ray.direction, this._normal),
        t = 0;

    if (denominator === 0) {
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

module.exports = Plane;