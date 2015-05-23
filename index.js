
function _dotProduct(v1, v2) {

    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);

}

function _subtract(v1, v2) {

    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };

}

function _scale(scalar, v) {

    return {
        x: scalar * v.x,
        y: scalar * v.y,
        z: scalar * v.z
    };

}

function _normalise(v) {

    var length = Math.sqrt(_dotProduct(v, v));

    return _scale(1 / length, v);

}

function _shade(viewRay, intersection) {

    var LIGHT = _normalise({ x: 1, y: 1, z: 0.5 });

    var point = _scale(intersection.t, viewRay.direction),
        normal = intersection.surface.getNormal(point),
        scale = (_dotProduct(LIGHT, normal) + 0.5)/1.5,
        color = intersection.surface.getColor(point);

    return {
        r: color.r * scale,
        b: color.b * scale,
        g: color.g * scale
    };

}

function _square(x) {

    return Math.pow(x, 2);

}

function Scene(options) {

    options = options || {};
    options.imagePlane = options.imagePlane || {};

    this._focalLength = options.focalLength || 250;
    this._imagePlane = {
        left: options.imagePlane.left || -64,
        right: options.imagePlane.right || 64,
        top: options.imagePlane.top || 36,
        bottom: options.imagePlane.bottom || -36,
        width: options.imagePlane.width || 1280,
        height: options.imagePlane.height || 720
    };

    this._lights = [];
    this._surfaces = [];

}

Scene.prototype.addLight = function(light) {};

Scene.prototype.addSurface = function(surface) {

    this._surfaces.push(surface);

};

Scene.prototype.render = function(canvas) {

    var lastX = this._imagePlane.right,
        lastY = this._imagePlane.bottom,
        pixelWidth = (lastX - this._imagePlane.left) / this._imagePlane.width,
        pixelHeight = (this._imagePlane.top - lastY) / this._imagePlane.height,
        x = this._imagePlane.left + (pixelWidth / 2),
        y = this._imagePlane.top - (pixelHeight / 2),
        startX = this._imagePlane.left + (pixelWidth / 2),
        viewRay = {
            origin: { x: 0, y: 0, z: 0 },
            direction: { x: x, y: y, z: -this._focalLength }
        },
        numSurfaces = this._surfaces.length,
        i = 0,
        intersection = null,
        nearest = null,
        ctx = canvas.getContext('2d'),
        image = ctx.createImageData(this._imagePlane.width, this._imagePlane.height),
        imageIndex = -4,
        shade = null;

    var test = 0;

    for ( ; y > lastY; y -= pixelHeight) {

        for (x = startX ; x < lastX; x += pixelWidth) {

            viewRay.direction.x = x;
            viewRay.direction.y = y;

            nearest = null;
            imageIndex += 4;

            for (i = 0; i < numSurfaces; i++) {

                intersection = this._surfaces[i].findRayIntersection(viewRay, 0, Infinity);

                if (intersection && (!nearest || intersection.t < nearest.t)) {
                    nearest = intersection;
                }

            }

            if (nearest) {

                shade = _shade(viewRay, nearest);

                image.data[imageIndex] = shade.r;
                image.data[imageIndex + 1] = shade.g;
                image.data[imageIndex + 2] = shade.b;
                image.data[imageIndex + 3] = 255;

            }

        }
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.putImageData(image, 0, 0);

};

function Sphere(centre, r) {

    this.centre = centre;
    this.r = r;

}

Sphere.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    var c = this.centre,
        o = ray.origin,
        d = ray.direction,
        oMinusC = _subtract(o, c),
        dDotD = _dotProduct(d, d),
        discriminant = _square(_dotProduct(d, oMinusC)) - (dDotD * (_dotProduct(oMinusC, oMinusC) - _square(this.r))),
        t1 = 0,
        t2 = 0,
        b = 0,
        t = 0;

    if (discriminant < 0) {
        return null;
    }

    // technically not the discriminant here, but just to reprepose the variable:
    discriminant = Math.sqrt(discriminant);
    b = _dotProduct(d, oMinusC);

    t1 = (-discriminant - b)/dDotD;
    t2 = (discriminant - b)/dDotD;

    // t1 < t2 here:

    if (t1 > lowerT && t1 < upperT) {
        return {
            surface: this,
            t: t1
        };
    }

    if (t2 > lowerT && t2 < upperT) {
        return {
            surface: this,
            t: t1
        };
    }

    return null;

};

Sphere.prototype.getNormal = function(point) {

    return _scale(1 / this.r, _subtract(point, this.centre));

};

Sphere.prototype.getColor = function(point) {

    return this._color;

};

window.Scene = {
    Scene: Scene,
    Sphere: Sphere
};