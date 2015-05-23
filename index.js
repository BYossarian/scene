
var EPILSON = 0.0001;

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

function _add(v1, v2) {

    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
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

// TODO: have level of specularReflection determined by surface material
// REVIEW: specular reflection color - currently white (255 for red, green and blue)
function _shade(viewRay, intersection) {

    var point = _scale(intersection.t, viewRay.direction),
        surfaceNormal = intersection.surface.getNormal(point),
        normalisedView = _normalise(viewRay.direction),
        color = intersection.surface.getColor(point),
        l = this._lights.length,
        red = color.r * this._ambientLight,
        green = color.g * this._ambientLight,
        blue = color.b * this._ambientLight,
        light = null,
        diffuseLight = 0,
        specularReflection = 0,
        halfwayVector = null,
        numSurfaces = this._surfaces.length,
        inShadow = false;

    for (var i = 0; i < l; i++) {

        light = this._lights[i];

        // check for shadow
        inShadow = false;

        for (var j = 0; j < numSurfaces; j++) {

            // can't cause a shadow on self so:
            if (this._surfaces[j] === intersection.surface) {
                continue;
            }

            // REVIEW: could be a little more efficient, as we don't actually 
            // need t - we only need to know if an intersection took place
            inShadow = !!this._surfaces[j].findRayIntersection({
                origin: point,
                direction: light.direction
            }, EPILSON, Infinity);

            if (inShadow) {
                break;
            }

        }

        if (inShadow) {
            continue;
        }

        halfwayVector = _normalise(_subtract(light.direction, normalisedView));

        diffuseLight = light.intensity * Math.max(0, _dotProduct(surfaceNormal, light.direction));
        specularReflection = light.intensity * 255 * Math.pow(Math.max(0, _dotProduct(surfaceNormal, halfwayVector) * 0.99), 150);

        red += color.r * diffuseLight + specularReflection;
        blue += color.b * diffuseLight + specularReflection;
        green += color.g * diffuseLight + specularReflection;

    }

    return {
        r: red,
        b: blue,
        g: green
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

    this._background = options.background || { r: 31, g: 31, b: 31 };

    this._ambientLight = options.ambientLight || 0.15;

    this._lights = [];
    this._surfaces = [];

}

Scene.prototype.addLight = function(direction, intensity) {

    this._lights.push({
        direction: _normalise(direction),
        intensity: intensity || 1
    });

};

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
        color = null;

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

                color = _shade.call(this, viewRay, nearest);

            } else {

                color = this._background;

            }

            image.data[imageIndex] = color.r;
            image.data[imageIndex + 1] = color.g;
            image.data[imageIndex + 2] = color.b;
            image.data[imageIndex + 3] = 255;

        }
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.putImageData(image, 0, 0);

};

function Sphere(centre, r) {

    // TODO: have colour be set by constructor

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