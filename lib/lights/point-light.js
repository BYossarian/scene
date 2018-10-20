
'use strict';

const helpers = require('../helpers.js');

// Vector operations
const Vector = require('../vector.js');
const _subtract = Vector.subtract;
const _normalise = Vector.normalise;
const _length = Vector.length;

function PointLight(position, intensity, color, attenuation) {

    this._position = position || { x: 0, y: 0, z: 0 };
    this._intensity = typeof intensity === 'number' ? intensity : 1.0;
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
PointLight.prototype.getDirection = function(point) {

    return _subtract(this._position, point);

};

PointLight.prototype.getIntensity = function(point) {

    if (!this._attenuation) {
        return this._intensity;
    }

    const distance = _length(_subtract(this._position, point));
    const attenuation = this._attenuation;

    return this._intensity / (attenuation.constant + attenuation.linear * distance + attenuation.quadratic * distance * distance);

};

PointLight.prototype.getColor = function() {

    return this._color;
    
};

module.exports = PointLight;
