const triangleCanvas = document.getElementById('triangleCanvas');
const squareCanvas = document.getElementById('squareCanvas');
const circleCanvas = document.getElementById('circleCanvas');

const glTriangle = triangleCanvas.getContext('webgl');
const glSquare = squareCanvas.getContext('webgl');
const glCircle = circleCanvas.getContext('webgl');

function resize(gl, canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

const vertexSource = `
attribute vec2 position;    // This is the position of each vertex (corner) of our
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentSource = ` //What color should each pixel be
void main() {
  gl_FragColor = vec4(0.2, 0.8, 1.0, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  return program;
}

function setup(gl, canvas) {
  const program = createProgram(gl);
  gl.useProgram(program);

  resize(gl, canvas);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  return { gl, buffer };
}

function draw(gl, buffer, vertices) {
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
}

const tri = setup(glTriangle, triangleCanvas);
const sqr = setup(glSquare, squareCanvas);
const cir = setup(glCircle, circleCanvas);

function drawTriangle() {
  draw(glTriangle, tri.buffer, [
    0.0, 0.5,
    -0.5, -0.5,
    0.5, -0.5
  ]);
}

function drawSquare() {
  draw(glSquare, sqr.buffer, [
    -0.5, 0.5,
    -0.5, -0.5,
    0.5, 0.5,

    0.5, 0.5,
    -0.5, -0.5,
    0.5, -0.5
  ]);
}

function drawCircle(segments = 60) {
  const r = 0.5; //radius of the circle
  const v = []; //array to hold the vertices of the circle

  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2; //angle for the current segment
    const a2 = ((i + 1) / segments) * Math.PI * 2; //angle for the next segment

    v.push(0, 0);
    v.push(Math.cos(a1) * r, Math.sin(a1) * r);
    v.push(Math.cos(a2) * r, Math.sin(a2) * r);
  }

  draw(glCircle, cir.buffer, v);
}

drawTriangle();
drawSquare();
drawCircle(80);