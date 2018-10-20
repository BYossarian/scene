
'use strict';

function clamp(value, lower, upper) {

    if (value < lower) {
        value = lower;
    }

    if (value > upper) {
        value = upper;
    }

    return value;

}

// converts an rgb object from 0 - 255 values to 0 - 1 values:
function rgb255Torgb1(color) {

    return {
        r: clamp((color.r || 0) / 255, 0, 1),
        g: clamp((color.g || 0) / 255, 0, 1),
        b: clamp((color.b || 0) / 255, 0, 1)
    };

}

module.exports = {
    clamp: clamp,
    rgb255Torgb1: rgb255Torgb1
};
