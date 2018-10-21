
// a very rough and dirty obj file parser for deer.obj
// ref: https://en.wikipedia.org/wiki/Wavefront_.obj_file

const fs = require('fs');

const data = fs.readFileSync('./deer.obj').toString();
const lines = data.split('\n');
const individualVertices = [];
const vertices = [];

lines.forEach((line) => {

    const regEx = /v\s([\-\d\.]+)\s([\-\d\.]+)\s([\-\d\.]+)/;

    const result = regEx.exec(line.trim());

    if (!result) {
        return;
    }

    individualVertices.push({
        x: Number.parseFloat(result[1]),
        y: Number.parseFloat(result[2]),
        z: Number.parseFloat(result[3])
    });

});

lines.forEach((line) => {

    const regEx = /f\s(\d+)[^\s]*\s(\d+)[^\s]*\s(\d+)[^\s]*/;

    const result = regEx.exec(line.trim());

    if (!result) {
        return;
    }

    const vertexAIndex = Number.parseInt(result[1]) - 1;
    const vertexBIndex = Number.parseInt(result[2]) - 1;
    const vertexCIndex = Number.parseInt(result[3]) - 1;

    vertices.push(individualVertices[vertexAIndex]);
    vertices.push(individualVertices[vertexBIndex]);
    vertices.push(individualVertices[vertexCIndex]);

});

console.log(JSON.stringify(vertices, null, 2));
