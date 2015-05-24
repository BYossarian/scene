
var EPSILON = 0.0001;
var TRACE_DEPTH = 2;

// VECTOR OPERATIONS

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

function _square(x) {

    return Math.pow(x, 2);

}



function _shade(ray, intersection, depth) {

    var point = _add(_scale(intersection.t, ray.direction), ray.origin),
        surfaceNormal = intersection.surface.getNormal(point, ray),
        normalisedRay = _normalise(ray.direction),
        color = intersection.surface.getColor(point),    // color of surface at that point
        l = this._lights.length,
        totalIntensity = this._ambientLight,
        light = null,
        diffuseLight = 0,
        specularHighlights = 0,
        halfwayVector = null,
        numSurfaces = this._surfaces.length,
        inShadow = false,
        reflectionRay = null,
        reflectionColor = null,
        i = 0,
        j = 0,
        lightDirection = null,
        reflectiveness = intersection.surface._reflectiveness,
        rayColor = null;

    for (i = 0; i < l; i++) {

        light = this._lights[i];
        // light direction is normalied vector pointing towards the light
        lightDirection = _normalise(_subtract(light.position, point));

        // check for shadow
        inShadow = false;

        for (j = 0; j < numSurfaces; j++) {

            // can't cause a shadow on self so:
            if (this._surfaces[j] === intersection.surface) {
                continue;
            }

            // REVIEW: could be a little more efficient, as we don't actually 
            // need t - we only need to know if an intersection took place
            inShadow = !!this._surfaces[j].findRayIntersection({
                origin: point,
                direction: lightDirection
            }, EPSILON, Infinity);

            if (inShadow) {
                break;
            }

        }

        if (inShadow) {
            continue;
        }

        halfwayVector = _normalise(_subtract(lightDirection, normalisedRay));

        diffuseLight = Math.max(0, _dotProduct(surfaceNormal, lightDirection));
        specularHighlights = Math.pow(Math.max(0, _dotProduct(surfaceNormal, halfwayVector) * 0.999), intersection.surface._specularExp);

        totalIntensity += light.intensity * (diffuseLight + specularHighlights);

    }

    rayColor = {
        r: color.r * totalIntensity,
        b: color.b * totalIntensity,
        g: color.g * totalIntensity
    };

    // reflections
    if (reflectiveness) {

        reflectionRay = {
            origin: point,
            direction: _subtract(ray.direction, _scale(2 * _dotProduct(ray.direction, surfaceNormal), surfaceNormal))
        };
        reflectionColor = _traceRay.call(this, reflectionRay, EPSILON, Infinity, depth - 1);

        if (reflectionColor) {
            rayColor.r = reflectiveness * reflectionColor.r + (1 - reflectiveness) * rayColor.r;
            rayColor.b = reflectiveness * reflectionColor.b + (1 - reflectiveness) * rayColor.b;
            rayColor.g = reflectiveness * reflectionColor.g + (1 - reflectiveness) * rayColor.g;
        }

    }

    return rayColor;

}

function _traceRay(ray, tMin, tMax, depth) {

    if (!depth) {
        return null;
    }

    var nearest = null,
        intersection = null,
        numSurfaces = this._surfaces.length,
        color = null;

    // find nearest surface that intersects the ray
    for (var i = 0; i < numSurfaces; i++) {

        intersection = this._surfaces[i].findRayIntersection(ray, tMin, tMax);

        if (intersection && (!nearest || intersection.t < nearest.t)) {
            nearest = intersection;
        }

    }

    if (nearest) {

        color = _shade.call(this, ray, nearest, depth);

    } else {

        color = null;

    }

    return color;

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

Scene.prototype.addLight = function(position, intensity) {

    this._lights.push({
        position: position,
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
        startX = this._imagePlane.left + (pixelWidth / 2),
        x = startX,
        y = this._imagePlane.top - (pixelHeight / 2),
        viewRay = {
            origin: { x: 0, y: 0, z: 0 },
            direction: { x: x, y: y, z: -this._focalLength }
        },
        ctx = canvas.getContext('2d'),
        image = ctx.createImageData(this._imagePlane.width, this._imagePlane.height),
        imageIndex = 0,
        color = null;

    for ( ; y > lastY; y -= pixelHeight) {
        for (x = startX; x < lastX; x += pixelWidth) {

            viewRay.direction.x = x;
            viewRay.direction.y = y;
            
            color = _traceRay.call(this, viewRay, 0, Infinity, TRACE_DEPTH) || this._background;

            image.data[imageIndex] = color.r;
            image.data[imageIndex + 1] = color.g;
            image.data[imageIndex + 2] = color.b;
            image.data[imageIndex + 3] = color.a || 255;

            imageIndex += 4;

        }
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.putImageData(image, 0, 0);

};

function Sphere(centre, r, material) {

    material = material || {};

    this._centre = centre;
    this._r = r;

    this._color = material.color || { r: 100, g: 100, b: 100 };
    this._specularExp = material.specularExp || 500;
    this._reflectiveness = material.reflectiveness || 0.1;

}

Sphere.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    var c = this._centre,
        o = ray.origin,
        d = ray.direction,
        oMinusC = _subtract(o, c),
        dDotD = _dotProduct(d, d),
        discriminant = _square(_dotProduct(d, oMinusC)) - (dDotD * (_dotProduct(oMinusC, oMinusC) - _square(this._r))),
        t1 = 0,
        t2 = 0,
        b = 0;

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

Sphere.prototype.getNormal = function(point, ray) {

    return _scale(1 / this._r, _subtract(point, this._centre));

};

Sphere.prototype.getColor = function(point, ray) {

    return this._color;

};

function Plane(normal, point, material) {

    material = material || {};

    this._normal = _normalise(normal);
    this._point = point;
    
    this._color = material.color || { r: 100, g: 100, b: 100 };
    this._specularExp = material.specularExp || 500;
    this._reflectiveness = material.reflectiveness || 0.1;

}

Plane.prototype.findRayIntersection = function(ray, lowerT, upperT) {

    var denominator = _dotProduct(ray.direction, this._normal),
        t = 0;

    if (denominator < EPSILON && denominator > -EPSILON) {
        // ray and plane are parallel
        return null;
    }

    t = _dotProduct(_subtract(this._point, ray.origin), this._normal) / denominator;

    if (t > lowerT && t < upperT) {
        return {
            surface: this,
            t: t
        };
    }

    return null;

};

Plane.prototype.getNormal = function(point, ray) {

    // need to check which side of the plane the ray is coming 
    // from so we can return either normal or -normal
    if (_dotProduct(this._normal, ray.direction) > 0) {
        return _scale(-1, this._normal);
    }

    return this._normal;

};

Plane.prototype.getColor = function(point, ray) {

    return this._color;

};

window.Scene = {
    Scene: Scene,
    Sphere: Sphere,
    Plane: Plane
};