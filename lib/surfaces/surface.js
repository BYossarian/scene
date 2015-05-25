
// Base 'class' for Surfaces 
// inheriting classes must also expose methods:
// findRayIntersection: (ray, lowerT, upperT) -> { surface: this, t: <number> }
// getNormal: (point, ray) -> vector (object with an x, y, and z)

function Surface(material) {

    material = material || {};

    var color = material.color || { r: 100, g: 100, b: 100 };
    
    this._specularExp = material.specularExp || 500;
    this._reflectiveness = material.reflectiveness || 0;

    // allow color to be a function
    if (typeof color === 'function') {
        this.getColor = color;
    } else {
        this._color = color;
    }

}

Surface.prototype.getColor = function(point, ray) {

    return this._color;

};

module.exports = Surface;