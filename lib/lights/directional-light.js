
'use strict';

// Vector operations
const Vector = require('../vector.js');
const _scale = Vector.scale;
const _normalise = Vector.normalise;

// direction parameter should be the direction in which the light is travelling:
function DirectionalLight(direction, intensity, color) {

    // although we're accepting the direction in which the light is travelling (because that 
    // seems more intuitive), we usually want/need the direction towards the light, so need to 
    // scale by -1:
    this._direction = direction ? _normalise(_scale(-1, direction)) : { x: 0, y: 0, z: -1 };
    this._intensity = typeof intensity === 'number' ? intensity : 1.0;
    this._color = color || { r: 255, g: 255, b: 255 };
    this._directional = true;

}

// this will return the direction towards the light from point:
DirectionalLight.prototype.getDirection = function(point) {

    return this._direction;

};

DirectionalLight.prototype.getIntensity = function(point) {

    return this._intensity;

};

DirectionalLight.prototype.getColor = function() {

    return this._color;
    
};

module.exports = DirectionalLight;
