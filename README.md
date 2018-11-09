# scene
A Javascript ray tracer.

![Doh, a deer!](https://raw.githubusercontent.com/BYossarian/scene/master/demos/mesh-example/deer.png)

### TODO
- optimise (especially meshes)
- geometric transformations for surfaces
- improved shading model

## Usage

See `/demos` for examples.

In the following `Vector` means an object of the form `{ x: <number>, y: <number>, z: <number> }`; and `Colour` means an object of the form `{ r: <number>, g: <number>, b: <number> }` where `r`, `g`, and `b` are between `0` and `255` inclusive.

#### Rendering:

##### `Scene.render(surfaces, lights, buffer, options);`

`surfaces` - an array of surfaces (see surfaces section below)

`lights` - an array of lights (see lights section below)

`buffer` - an array-like object that the image/pixel data will be written into in RGBA8 format (e.g. `Buffer` or `Uint8Array`)

`options` - object holds the render options:

```
{
    cameraPosition: <Vector>,  // the position of the camera (default: { x: 0, y: 0, z: 0 })
    viewDir: <Vector>,  // the direction the camera is pointing (default: { x: 0, y: 0, z: -1 })
    cameraUp: <Vector>,  // the upward orientation of the camera (default: { x: 0, y: 1, z: 0 })
    verticalFOV: <number>,  // the vertical field of view in radians (default: Math.PI / 4)
    background: <Colour>,  // the default colour for rays that don't intersect with any surfaces 
                           // (default: black)
    ambientLight: <number>,  // the intensity of the ambient (white) light (default: 0.1)
    targetWidth: <number>,  // width (in pixels) of the output image that will be drawn to buffer
    targetHeight: <number>,  // height (in pixels) of the output image that will be drawn to buffer
    ssaa: <number>  // super-sample anti-aliasing - should be either 4 or 16, representing the 
                    // number of samples per pixel. Don't include (or set to a fasley value) to 
                    // turn off SSAA. Warning: Using SSAA will greatly increase render time.
}
```

##### `Scene.renderToCanvas(surfaces, lights, canvas, options);`

Same as `render` except it accepts a canvas and draws directly to that.

#### Surfaces:

There are 3 types of surfaces provided out-of-the-box: `Scene.Sphere`, `Scene.Plane`, and `Scene.Mesh`. Take a look in `/lib/surfaces` and `/demos` to see their usage.

#### Lights:

There are 3 types of lights provided out-of-the-box: `Scene.PointLight`, `Scene.DirectionalLight`, and `Scene.SpotLight`. Take a look in `/lib/lights` and `/demos` to see their usage.
