
'use strict';

// Vector operations
const Vector = require('../vector.js');
const _subtract = Vector.subtract;
const _normalise = Vector.normalise;

function PointLight(position, intensity, color) {

    this._position = position || { x: 0, y: 0, z: 0 };
    this._intensity = intensity || 1.0;
    this._color = color || { r: 255, g: 255, b: 255 };

}

// this will return the direction towards the light from point:
PointLight.prototype.getDirection = function(point) {

    return _normalise(_subtract(this._position, point));

};

PointLight.prototype.getIntensity = function(point) {

    return this._intensity;

};

PointLight.prototype.getColor = function() {

    return this._color;
    
};

module.exports = PointLight;
