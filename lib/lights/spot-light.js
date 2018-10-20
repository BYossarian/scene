
'use strict';

// Vector operations
const Vector = require('../vector.js');
const _subtract = Vector.subtract;
const _normalise = Vector.normalise;
const _dotProduct = Vector.dotProduct;
const _scale = Vector.scale;

// coneAngle is the angle between the axis along which the spotlight is pointing (given by direction)
// and the outer edge of the spot light's cone of light:
function SpotLight(position, direction, intensity, coneAngle, color) {

    this._position = position || { x: 0, y: 0, z: 0 };
    this._direction = direction ? _normalise(direction) : { x: 0, y: 0, z: -1 };
    this._intensity = typeof intensity === 'number' ? intensity : 1.0;
    this._cosConeAngle = Math.cos(coneAngle || Math.PI / 12);  // default angle: 15 degrees
    this._color = color || { r: 255, g: 255, b: 255 };

}

// this will return the direction towards the light from point:
SpotLight.prototype.getDirection = function(point) {

    return _subtract(this._position, point);

};

SpotLight.prototype.getIntensity = function(point) {

    const lightToPointVector = _normalise(_scale(-1, this.getDirection(point)));
    const cosAngle = _dotProduct(lightToPointVector, this._direction);

    // check if the point falls within the spot light's cone:
    if (cosAngle <= this._cosConeAngle) {
        return 0;
    }

    return this._intensity;

};

SpotLight.prototype.getColor = function() {

    return this._color;
    
};

module.exports = SpotLight;