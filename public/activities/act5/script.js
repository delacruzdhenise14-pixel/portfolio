const vsSource = `#version 300 es
    in vec3 aPosition;
    in vec3 aNormal;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    out vec3 vNormal;
    
    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        vNormal = mat3(uModelViewMatrix) * aNormal;
        }
        `;

        const fsSource = `#version 300 es
    precision mediump float;

    in vec3 vNormal;    
    out vec4 fragColor;

    void main(void) {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vec3(0.5, 0.7, 1.0));
        float intensity = max(dot(normal, lightDir), 0.0) * 0.6 + 0.4;

        vec3 color = vec3(0.1, 0.55, 0.95);
        fragColor = vec4(color * intensity, 1.0);
    }
    `;

    const Mat4 = {
        identity: () => new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]),

        perspective: (fovy, aspect, near, far) => {
            const f = 1.0 / Math.tan(fovy / 2);
            const nf = 1.0 / (near - far);
            return new Float32Array([
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ]);
        },

        multiply: (a, b) => {
            const out = new Float32Array(16);
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    let sum = 0;
                    for (let i = 0; i < 4; i++) {
                        sum += a[row * 4 + i] * b[i * 4 + col];
                    }
                    out[row * 4 + col] = sum;
                }
            }
            return out;
        },

        rotateX: (m, angle) => {
            const c = Math.cos(angle), s = Math.sin(angle);
            const out = new Float32Array([1,0,0,0,  0,c,-s,0,  0,s,c,0,  0,0,0,1]);
            return Mat4.multiply(out,m);
        },

        rotateY: (m, angle) => {
            const c = Math.cos(angle), s = Math.sin(angle);
            const out = new Float32Array([c,0,s,0,  0,1,0,0,  -s,0,c,0,  0,0,0,1]);
            return Mat4.multiply(out,m);
        },

        translate: (m, x, y, z) => {
            const t = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);
            return Mat4.multiply(m,t);
        }
    };

function createExtrudedPolygon(){

    const points2D = [
        -0.3, 0.8,       
        0.0, 0.5,   
        0.4, 0.7,     
        0.4, 0.3,     
        0.7, 0.2,     
        0.5, 0.1,      
        0.8, 0.0,    
        0.5, -0.2,   
        0.6, -0.5,   
        0.3, -0.4,    
        0.3, -0.8,      
        -0.1, -0.5,   
        -0.5, -0.7,   
        -0.5, -0.3,   
        -0.8, -0.2,  
        -0.6, -0.1,      
        -0.9, 0.0,    
        -0.5, 0.2,    
        -0.6, 0.4,    
        -0.2, 0.4    
    ];

    const capTriangles = [
        0, 1, 19,
        1, 2, 3,
        3, 4, 5,
        5, 6, 7,
        7, 8, 9,
        9, 10, 11,
        11, 12, 13,
        13, 14, 15,
        15, 16, 17,
        17, 18, 19,
        1, 3, 19,
        3, 17, 19,
        3, 5, 17,
        5, 15, 17,
        5, 7, 15,
        7, 13, 15,
        7, 9, 13,
        9, 11, 13,
    ];

    const numPoints = points2D.length / 2;
    const zDepth = 0.20;

    const vertices = [];
    const normals = [];
    const indices = [];

    const addVertex = (x, y, z, nx, ny, nz) => {
        vertices.push(x, y, z);
        normals.push(nx, ny, nz);
    };

    for (let i = 0; i < numPoints; i++) {
        addVertex(points2D[i * 2], points2D[i * 2 + 1], -zDepth, 0, 0, -1);
    }
    for (let i = 0; i < capTriangles.length; i += 3) {
        indices.push(capTriangles[i], capTriangles[i + 1], capTriangles[i + 2]);
    }

    const backOffset = numPoints;
    for (let i = 0; i < numPoints; i++) {
        addVertex(points2D[i * 2], points2D[i * 2 + 1], zDepth, 0, 0, 1);
    }
    for (let i = 0; i < capTriangles.length; i += 3) {
        indices.push(backOffset + capTriangles[i], backOffset + capTriangles[i + 2], backOffset + capTriangles[i + 1]);
    }

    let wallIdx = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
        const next = (i + 1) % numPoints;

        const x0 = points2D[i * 2], y0 = points2D[i * 2 + 1];
        const x1 = points2D[next * 2], y1 = points2D[next * 2 + 1];

        const dx = x1 - x0;
        const dy = y1 - y0;
        const length = Math.sqrt(dx, dy);
        const nx = -dy / length;
        const ny = dx / length;

        addVertex(x0, y0, zDepth, nx, ny, 0);
        addVertex(x1, y1, zDepth, nx, ny, 0);
        addVertex(x0, y0, -zDepth, nx, ny, 0);
        addVertex(x1, y1, -zDepth, nx, ny, 0);

        indices.push(wallIdx, wallIdx + 2, wallIdx + 1);
        indices.push(wallIdx + 1, wallIdx + 2, wallIdx + 3);

        wallIdx += 4;
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
     };
}

function main() {
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL 2.0 is not available in your browser.");
        return;
    }

    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program failed to link:", gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    const positionLoc = gl.getAttribLocation(program, "aPosition");
    const normalLoc = gl.getAttribLocation(program, "aNormal");
    const modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    const projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

 const mesh = createExtrudedPolygon();

 const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    let rotation = 0;

    function render(time) {
        rotation = time * 0.001;

        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const aspect = canvas.width / canvas.height;
        const projectionMatrix = Mat4.perspective(Math.PI / 4, aspect, 0.1, 100);

        let mvMatrix = Mat4.identity();
        mvMatrix = Mat4.translate(mvMatrix, 0, 0, -2.5);
        mvMatrix = Mat4.rotateY(mvMatrix, rotation);
        mvMatrix = Mat4.rotateX(mvMatrix, rotation * 0.4);

        gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, mvMatrix);

        gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

window.onload = main;