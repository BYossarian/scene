
'use strict';

const helpers = require('../helpers.js');

// Vector operations
const Vector = require('../vector.js');
const _subtract = Vector.subtract;
const _normalise = Vector.normalise;
const _dotProduct = Vector.dotProduct;
const _scale = Vector.scale;
const _length = Vector.length;

// coneAngle is the angle between the axis along which the spotlight is pointing (given by direction)
// and the outer edge of the spot light's cone of light:
function SpotLight(position, direction, intensity, coneAngle, coneOuterAngle, color, attenuation) {

    this._position = position || { x: 0, y: 0, z: 0 };
    this._direction = direction ? _normalise(direction) : { x: 0, y: 0, z: -1 };
    this._intensity = typeof intensity === 'number' ? intensity : 1.0;
    this._cosConeAngle = Math.cos(coneAngle || Math.PI / 12);  // default angle: 15 degrees
    this._cosOuterConeAngle = Math.cos(coneOuterAngle || Math.PI / 9);  // default angle: 20 degrees
    this._color = helpers.rgb255Torgb1(color || { r: 255, g: 255, b: 255 });
    if (attenuation) {
        this._attenuation = {
            constant: typeof attenuation.constant === 'number' ? attenuation.constant : 1,
            linear: attenuation.linear || 0,
            quadratic: attenuation.quadratic || 0
        };
    } else {
        this._attenuation = null;
    }

}

// this will return the direction towards the light from point:
SpotLight.prototype.getDirection = function(point) {

    return _subtract(this._position, point);

};

SpotLight.prototype.getIntensity = function(point) {

    const lightToPointVector = _normalise(_scale(-1, this.getDirection(point)));
    const cosAngle = _dotProduct(lightToPointVector, this._direction);

    // check if the point falls within the spot light's cone:
    if (cosAngle <= this._cosOuterConeAngle) {
        return 0;
    }

    let intensity = 0;

    if (!this._attenuation) {
        intensity = this._intensity;
    } else {
        const distance = _length(_subtract(this._position, point));
        const attenuation = this._attenuation;

        intensity = this._intensity / (attenuation.constant + attenuation.linear * distance + attenuation.quadratic * distance * distance);
    }

    return intensity * helpers.clamp((cosAngle - this._cosOuterConeAngle) / (this._cosConeAngle - this._cosOuterConeAngle), 0, 1);

};

SpotLight.prototype.getColor = function() {

    return this._color;
    
};

module.exports = SpotLight;
