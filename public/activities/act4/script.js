const vsSource = `
    attribute vec3 position;
    uniform mat4 uRotation;
    void main() {
        gl_Position = uRotation * vec4(position, 1.0);
    }
`

const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
        gl_FragColor = uColor;
    }
`

function createRotationMatrix(angleX, angleY) {
    const radX = angleX * Math.PI / 180;
    const radY = angleY * Math.PI / 180;

    const cosX = Math.cos(radX), sinX = Math.sin(radX);
    const cosY = Math.cos(radY), sinY = Math.sin(radY);

    return [
        cosY, 0, -sinY, 0,
        sinX * sinY, cosX, sinX * cosY, 0,
        cosX * sinY, -sinX, cosX * cosY, 0,
        0, 0, 0, 1 
    ]
}

function initWebGL(canvasId, vertices, indices, wireIndices, surfaceColor, borderColor) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    canvas.width = 250; canvas.height = 250;
    gl.viewport(0, 0, 250, 250);
    gl.enable(gl.DEPTH_TEST);

    const vs = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vs, vsSource); gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fs, fsSource); gl.compileShader(fs);
    const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    gl.useProgram(program);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const iBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const wBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireIndices), gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, 'position');
    const uRotation = gl.getUniformLocation(program, 'uRotation');
    const uColor = gl.getUniformLocation(program, 'uColor');

    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);

    let angleX = 30; angleY = 45;
    let isDragging = false;
    let lastMouseX = 0, lastMouseY = 0;

    canvas.addEventListener('mousedown', (e) => { isDragging = true; lastMouseX = e.clientX; lastMouseY = e.clientY; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        angleY += deltaX * 0.5;
        angleX += deltaY * 0.5;
        lastMouseX = e.clientX; lastMouseY = e.clientY;
        requestAnimationFrame(render);
    });

    function render() {
        gl.clearColor(0.08, 0.08, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const matrix = createRotationMatrix(angleX, angleY);
        gl.uniformMatrix4fv(uRotation, false, matrix);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
        gl.uniform4fv(uColor, surfaceColor);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(-1.0, -1.0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wBuf);
        gl.uniform4fv(uColor, borderColor);
        gl.drawElements(gl.LINES, wireIndices.length, gl.UNSIGNED_SHORT, 0);
        gl.disable(gl.POLYGON_OFFSET_FILL);
    }

    render();
}

const cubeVertices = [
    -0.4, -0.4, 0.4,  0.4, -0.4, 0.4,  0.4, 0.4, 0.4,  -0.4, 0.4, 0.4,
    -0.4, -0.4, -0.4,  0.4, -0.4, -0.4,  0.4, 0.4, -0.4,  -0.4, 0.4, -0.4
];

const cubeIndices = [
    0, 1, 2,  0, 2, 3, 4, 5, 6,  4, 6, 7, 0, 3, 7, 0, 7, 4,
    1, 2, 6,  1, 6, 5, 0, 1, 5,  0, 5, 4, 3, 2, 6,  3, 6, 7
];

const cubeWires = [
    0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6,6,7,7,4,0,4,1,5,2,6,3,7
];

const prismVertices = [
    -0.4, -0.4, 0.4,  0.4, -0.4, 0.4,  0.0, 0.4, 0.4,
    -0.4, -0.4, -0.4,  0.4, -0.4, -0.4,  0.0, 0.4, -0.4
];

const prismIndices = [
    0, 1, 2,  3, 4, 5, 0, 1, 4, 0, 4, 3,
    1, 2, 5,  1, 5, 4, 2, 0, 3, 2, 3, 5
];

const prismWires = [
    0, 1, 1, 2, 2, 0, 3, 4, 4, 5, 5, 3, 0, 3, 1, 4, 2, 5
];

const sphereVertices = [];
const sphereIndices = [];
const sphereWires = [];
const bands = 15;
const radius = 0.45;

for (let lat = 0; lat <= bands; lat++) {
    const theta = lat * Math.PI / bands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= bands; lon++) {
        const phi = lon * 2 * Math.PI / bands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        let x = cosPhi * sinTheta;
        let y = cosTheta;
        let z = sinPhi * sinTheta;

        sphereVertices.push(radius * x, radius * y, radius * z);
    }
}

for (let lat = 0; lat < bands; lat++) {
    for (let lon = 0; lon < bands; lon++) {
        const first = (lat * (bands + 1)) + lon;
        const second = first + bands + 1;

        sphereIndices.push(first, second, first + 1);
        sphereIndices.push(second, second + 1, first + 1);
        
        sphereWires.push(first, first + 1);
        sphereWires.push(first, second);
    }
}

initWebGL('cubeCanvas', cubeVertices, cubeIndices, cubeWires, [0.2, 0.6, 0.8, 1.0], [1.0, 1.0, 1.0, 1.0]);
initWebGL('prismCanvas', prismVertices, prismIndices, prismWires, [0.8, 0.4, 0.2, 1.0], [1.0, 1.0, 1.0, 1.0]);
initWebGL('sphereCanvas', sphereVertices, sphereIndices, sphereWires, [0.4, 0.8, 0.2, 1.0], [1.0, 1.0, 1.0, 1.0]);