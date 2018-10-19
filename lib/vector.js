
'use strict';

function dotProduct(v1, v2) {

    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);

}

function crossProduct(v1, v2) {

    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    };

}

function subtract(v1, v2) {

    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };

}

function add(v1, v2) {

    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };

}

function scale(scalar, v) {

    return {
        x: scalar * v.x,
        y: scalar * v.y,
        z: scalar * v.z
    };

}

function normalise(v) {

    const length = Math.sqrt(dotProduct(v, v));

    if (length === 0) {
        return {
            x: v.x,
            y: v.y,
            z: v.z
        };
    }

    return scale(1 / length, v);

}

module.exports = {
    dotProduct: dotProduct,
    crossProduct: crossProduct,
    subtract: subtract,
    add: add,
    scale: scale,
    normalise: normalise
};
