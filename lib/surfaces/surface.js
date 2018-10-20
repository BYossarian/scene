
'use strict';

const helpers = require('../helpers.js');

// Base 'class' for Surfaces 
// inheriting classes must also expose methods:
// findRayIntersection: (ray, lowerT, upperT) -> { surface: this, t: <number> }
// getNormal: (point, ray) -> vector (object with an x, y, and z)

function Surface(material) {

    material = material || {};
    
    this._specularExp = material.specularExp || 512;
    this._reflectiveness = material.reflectiveness || 0;
    // accept colours as RGB values 0 - 255, but store/use them as 0.0 - 1.0:
    this._color = helpers.rgb255Torgb1(material.color || { r: 255, g: 255, b: 255 });

}

Surface.prototype.getDiffuseColor = function() {

    return this._color;

};

Surface.prototype.getReflectiveness = function() {

    return this._reflectiveness;

};

Surface.prototype.getSpecularExponent = function() {

    return this._specularExp;

};

module.exports = Surface;
