
'use strict';

// Base 'class' for Surfaces 
// inheriting classes must also expose methods:
// findRayIntersection: (ray, lowerT, upperT) -> { surface: this, t: <number> }
// getNormal: (point, ray) -> vector (object with an x, y, and z)

function Surface(material) {

    material = material || {};
    
    this._specularExp = material.specularExp || 500;
    this._reflectiveness = material.reflectiveness || 0;
    this._color = material.color || { r: 100, g: 100, b: 100 };

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
