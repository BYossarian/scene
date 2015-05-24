
function dotProduct(v1, v2) {

    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);

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

    var length = Math.sqrt(dotProduct(v, v));

    return scale(1 / length, v);

}

module.exports = {
    dotProduct: dotProduct,
    subtract: subtract,
    add: add,
    scale: scale,
    normalise: normalise
};
