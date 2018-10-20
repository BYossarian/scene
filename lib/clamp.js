
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

module.exports = clamp;
