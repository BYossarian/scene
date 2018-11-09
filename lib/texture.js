
'use strict';

const helpers = require('./helpers.js');
const _clamp = helpers.clamp;
const _rgb255Torgb1 = helpers.rgb255Torgb1;

function Texture(image, width, height) {

    if (image.length !== (width * height * 4)) {
        throw new Error(`Texture data has size ${image.length} which doesn't match the given dimensions of ${width} x ${height}`);
    }

    this._image = image;
    this._width = width;
    this._height = height;

}

Texture.prototype.sample = function(u, v) {

    // convert continuous (u, v) coords into pixels coords:
    const integerU = _clamp(Math.floor(u * this._width), 0, this._width - 1);
    const integerV = _clamp(Math.floor(v * this._height), 0, this._height - 1);

    const imageIndex = (integerV * this._width + integerU) * 4;

    return _rgb255Torgb1({
        r: this._image[imageIndex],
        g: this._image[imageIndex + 1],
        b: this._image[imageIndex + 2],
        a: this._image[imageIndex + 3]
    });

};

module.exports = Texture;
