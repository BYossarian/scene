
'use strict';

const CONSTANTS = require('../constants.js');
const EPSILON = CONSTANTS.EPSILON;

// Vector operations
const Vector = require('../vector.js');
const _dotProduct = Vector.dotProduct;
const _crossProduct = Vector.crossProduct;
const _subtract = Vector.subtract;
const _scale = Vector.scale;
const _normalise = Vector.normalise;

const Surface = require('./surface.js');

// adapted from: https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
// TODO: try https://graphics.stanford.edu/courses/cs348b-98/gg/intersect.html
function _findRayPrimitiveIntersection(ray, primitive) {

    const h = _crossProduct(ray.direction, primitive.edgeAC);
    const a = _dotProduct(primitive.edgeAB, h);
    if (a > -EPSILON && a < EPSILON) {
        // ray and triangle are parallel
        return -1;
    }
    const f = 1 / a;
    const s = _subtract(ray.origin, primitive.vertexA);
    const u = f * (_dotProduct(s, h));
    if (u < 0.0 || u > 1.0) {
        return -1;
    }
    const q = _crossProduct(s, primitive.edgeAB);
    const v = f * _dotProduct(ray.direction, q);
    if (v < 0.0 || u + v > 1.0) {
        return -1;
    }
    const t = f * _dotProduct(primitive.edgeAC, q);
    if (t > EPSILON) {
        // intersection!
        return t;
    }
    
    return -1;

}

// TODO: think it'll probably be quicker to calculate the barycentric coords of 
// the intersection whilst finding the intersection...
function _calcBarycentricCoords(primitive, point) {

    const aToP = _subtract(point, primitive.vertexA);
    const abDotAB = _dotProduct(primitive.edgeAB, primitive.edgeAB);
    const abDotAC = _dotProduct(primitive.edgeAB, primitive.edgeAC);
    const acDotAC = _dotProduct(primitive.edgeAC, primitive.edgeAC);
    const apDotAB = _dotProduct(aToP, primitive.edgeAB);
    const apDotAC = _dotProduct(aToP, primitive.edgeAC);
    const denom = abDotAB * acDotAC - abDotAC * abDotAC;
    const v = (acDotAC * apDotAB - abDotAC * apDotAC) / denom;
    const w = (abDotAB * apDotAC - abDotAC * apDotAB) / denom;

    return {
        u: 1 - v - w,
        v: v,
        w: w
    };

}

// assumes vertices are listed in ccw winding order:
function Mesh(vertices, material) {

    const numVertices = vertices.length;

    if (numVertices % 3 !== 0) {
        throw new Error('Mesh requires there to be a multiple of 3 vertices');
    }

    Surface.call(this, material);

    this._primitives = [];

    for (let i = 0; i < numVertices; i += 3) {
        //console.log(i);
        const edgeAB = _subtract(vertices[i + 1], vertices[i]);
        const edgeAC = _subtract(vertices[i + 2], vertices[i]);
        this._primitives.push({
            vertexA: vertices[i],
            vertexB: vertices[i + 1],
            vertexC: vertices[i + 2],
            edgeAB: edgeAB,
            edgeAC: edgeAC,
            normal: _normalise(_crossProduct(edgeAB, edgeAC))
        });
    }

    if (material && material.texture) {
        this._texture = material.texture;
    } else {
        this._texture = null;
    }

}

Mesh.prototype = Object.create(Surface.prototype);

Mesh.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    let t = upperT;
    let intersectIndex = -1;

    for (let i = 0, l = this._primitives.length; i < l; i++) {
        const primitiveIntersectionT = _findRayPrimitiveIntersection(ray, this._primitives[i]);
        if (primitiveIntersectionT !== -1 && primitiveIntersectionT < t && primitiveIntersectionT >= lowerT) {
            t = primitiveIntersectionT;
            intersectIndex = i;
        }
    }

    if (intersectIndex !== -1) {
        return {
            surface: this,
            t: t,
            primitiveIndex: intersectIndex
        };
    }

    return null;

};

Mesh.prototype.getNormal = function(point, ray, intersection) {

    return this._primitives[intersection.primitiveIndex].normal;

};

Mesh.prototype.getDiffuseColor = function(point, ray, intersection) {

    if (!this._texture) {
        return this._color;
    }

    const primitive = this._primitives[intersection.primitiveIndex];
    const barycentricCoords = _calcBarycentricCoords(primitive, point);

    // calculate texture coordinates:
    const textureU = primitive.vertexA.u * barycentricCoords.u + primitive.vertexB.u * barycentricCoords.v + primitive.vertexC.u * barycentricCoords.w;
    const textureV = primitive.vertexA.v * barycentricCoords.u + primitive.vertexB.v * barycentricCoords.v + primitive.vertexC.v * barycentricCoords.w;

    return this._texture.sample(textureU, textureV);

};

module.exports = Mesh;
