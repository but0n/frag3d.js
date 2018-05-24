
$('#renderer').attr('width', window.innerWidth*2);
$('#renderer').attr('height', window.innerHeight*2);
$('#renderer').width(window.innerWidth);
$('#renderer').height(window.innerHeight);

let gl = document.getElementById('renderer').getContext('webgl');

gl.getExtension("OES_standard_derivatives"); // TBN required

$(() => {
    $('#renderer').bind('wheel', function(e){
        var delta = Math.round(e.originalEvent.deltaY);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
        deepth += delta*.1;
        view.setLookAt(0, 0, deepth, 0, 0, 0, 0, 1, 0);
        gl.uniformMatrix4fv(viewLocation, false, view.elements);
        gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render
    });
});

function getShader(e, GL_ctx) {
    let dom = document.getElementById(e);
    let shader;
    if(dom.type === 'x-shader/x-vertex') {
        shader = GL_ctx.createShader(gl.VERTEX_SHADER);
    } else if(dom.type === 'x-shader/x-fragment') {
        shader = GL_ctx.createShader(gl.FRAGMENT_SHADER);
    }
    GL_ctx.shaderSource(shader, dom.text);
    GL_ctx.compileShader(shader);
    if(GL_ctx.getShaderParameter(shader, gl.COMPILE_STATUS) === true)
        return shader;
    else
        (console.log( GL_ctx.getShaderInfoLog(shader)));
}

function attributeBuffer(pointer, data, n, type) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(pointer, n, type, false, 0, 0);
    gl.enableVertexAttribArray(pointer);
}


//     _/_/_/  _/      _/    _/_/_/
//      _/    _/_/  _/_/  _/
//     _/    _/  _/  _/  _/  _/_/
//    _/    _/      _/  _/    _/
// _/_/_/  _/      _/    _/_/_/

// let UV_checker = new Image();
// let UV_checker_T = gl.createTexture();
// UV_checker.src = 'static/texture/normal.png';
// UV_checker.onload = () => {
//     gl.activeTexture(gl.TEXTURE2);
//     gl.bindTexture(gl.TEXTURE_2D, UV_checker_T);
//     // Configure
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, UV_checker);
//     // Sending data
//     updateShader();
// }

// bindTexture('checker.png', 0);
// bindTexture('diffuse.png', 1);
// bindTexture('normal.png', 2);
// bindTexture('AO.png', 3);
// bindTexture('checker.png', 4);
// bindTexture('checker.png', 5);
// bindTexture('checker.png', 6);
// bindTexture('checker.png', 7);

// loadCubeTexture('static/cubemap/');

let cc = 0;
function bindTexture(file, channel) {
    let target  = new Image();
    let tex     = gl.createTexture();
    target.src  = 'static/texture/' + file;
    target.onload = () => {
        gl.activeTexture([
            gl.TEXTURE0,
            gl.TEXTURE1,
            gl.TEXTURE2,
            gl.TEXTURE3,
            gl.TEXTURE4,
            gl.TEXTURE5,
            gl.TEXTURE6,
            gl.TEXTURE7
        ][channel]);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // Configure
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, target);
        // Sending data
        cc++;
        if(cc == 8)
            updateShader();
    }
}

function loadCubeTexture(path) {
    let cubetex = gl.createTexture();
    let counter = 0;
    for(let _=0;_<6;_++) {
        let p = new Image();
        p.src = path + ['negx.jpg','negy.jpg','negz.jpg','posx.jpg','posy.jpg','posz.jpg'][_];
        let glFlag = [
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z
        ];
        p.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubetex);
            gl.texImage2D(glFlag[_], 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, p);

            counter++;

            if(counter==6) { // All set
                console.log('ATTACH CUBE!');

                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.activeTexture(gl.TEXTURE7);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubetex);
                // updateShader();

            }
        }
    }
}


//       ___           ___           ___                         ___           ___
//      /\__\         /\  \         /\  \         _____         /\__\         /\  \
//     /:/ _/_        \:\  \       /::\  \       /::\  \       /:/ _/_       /::\  \
//    /:/ /\  \        \:\  \     /:/\:\  \     /:/\:\  \     /:/ /\__\     /:/\:\__\
//   /:/ /::\  \   ___ /::\  \   /:/ /::\  \   /:/  \:\__\   /:/ /:/ _/_   /:/ /:/  /
//  /:/_/:/\:\__\ /\  /:/\:\__\ /:/_/:/\:\__\ /:/__/ \:|__| /:/_/:/ /\__\ /:/_/:/__/___
//  \:\/:/ /:/  / \:\/:/  \/__/ \:\/:/  \/__/ \:\  \ /:/  / \:\/:/ /:/  / \:\/:::::/  /
//   \::/ /:/  /   \::/__/       \::/__/       \:\  /:/  /   \::/_/:/  /   \::/~~/~~~~
//    \/_/:/  /     \:\  \        \:\  \        \:\/:/  /     \:\/:/  /     \:\~~\
//      /:/  /       \:\__\        \:\__\        \::/  /       \::/  /       \:\__\
//      \/__/         \/__/         \/__/         \/__/         \/__/         \/__/
let shaderProgram = gl.createProgram();

gl.attachShader(shaderProgram, getShader('Shader-vs', gl));
gl.attachShader(shaderProgram, getShader('Shader-fs', gl));

gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);



let updateShader = () => {
    shaderProgram = gl.createProgram(); // Create a new program

    gl.attachShader(shaderProgram, getShader('Shader-vs', gl));
    gl.attachShader(shaderProgram, getShader('Shader-fs', gl));

    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Get location all unifoms
    modelLocation = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
    viewLocation = gl.getUniformLocation(shaderProgram, 'u_ViewMatrix');
    projeLocation = gl.getUniformLocation(shaderProgram, 'u_ProjeMatrix');
    nmLoc = gl.getUniformLocation(shaderProgram, "u_normalMatrix");
    cubeMatrixLoc = gl.getUniformLocation(shaderProgram, "u_CubeMatrix");
    shaderProgram.light = gl.getUniformLocation(shaderProgram, "u_lightDirection");
    shaderProgram.testTexture = [
        gl.getUniformLocation(shaderProgram, "u_tex0"),
        gl.getUniformLocation(shaderProgram, "u_tex1"),
        gl.getUniformLocation(shaderProgram, "u_tex2"),
        gl.getUniformLocation(shaderProgram, "u_tex3"),
        gl.getUniformLocation(shaderProgram, "u_tex4"),
        gl.getUniformLocation(shaderProgram, "u_tex5"),
        gl.getUniformLocation(shaderProgram, "u_tex6"),
        gl.getUniformLocation(shaderProgram, "u_tex7"),
    ];
    // Update uniform data
    gl.uniformMatrix4fv(modelLocation, false, model.elements);
    gl.uniformMatrix4fv(viewLocation, false, view.elements);
    gl.uniformMatrix4fv(projeLocation, false, proje.elements);
    gl.uniformMatrix4fv(cubeMatrixLoc, false, cubeMatrix.elements);
    gl.uniform3fv(shaderProgram.light, ld.elements);
    gl.uniformMatrix4fv(nmLoc, false, nm.elements);
    gl.uniform1i(shaderProgram.testTexture[0], 0);
    gl.uniform1i(shaderProgram.testTexture[1], 1);
    gl.uniform1i(shaderProgram.testTexture[2], 2);
    gl.uniform1i(shaderProgram.testTexture[3], 3);
    gl.uniform1i(shaderProgram.testTexture[4], 4);
    gl.uniform1i(shaderProgram.testTexture[5], 5);
    gl.uniform1i(shaderProgram.testTexture[6], 6);
    gl.uniform1i(shaderProgram.testTexture[7], 7);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
    gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render
}




//  ________  ________        ___
// |\   __  \|\   __  \      |\  \
// \ \  \|\  \ \  \|\ /_     \ \  \
//  \ \  \\\  \ \   __  \  __ \ \  \
//   \ \  \\\  \ \  \|\  \|\  \\_\  \
//    \ \_______\ \_______\ \________\
//     \|_______|\|_______|\|________|

let mod = GenerateSphere(2.0, 50);

let vertices = mod.vertices;
let normals = mod.normals;
let colors = mod.color;
let texCs = mod.texCoords;


shaderProgram.a_Position= gl.getAttribLocation(shaderProgram, "a_Position");
attributeBuffer(shaderProgram.a_Position, vertices, 3, gl.FLOAT);

shaderProgram.a_Normal = gl.getAttribLocation(shaderProgram, "a_Normal");
attributeBuffer(shaderProgram.a_Normal, normals, 3, gl.FLOAT);

shaderProgram.a_texCoord= gl.getAttribLocation(shaderProgram, "a_texCoord");
attributeBuffer(shaderProgram.a_texCoord, texCs, 2, gl.FLOAT);

shaderProgram.a_Color= gl.getAttribLocation(shaderProgram, "a_Color");
attributeBuffer(shaderProgram.a_Color, colors, 3, gl.FLOAT);

shaderProgram.u_Camera = gl.getUniformLocation(shaderProgram, "u_Camera");





//       _/_/_/    _/_/_/  _/_/_/_/  _/      _/    _/_/_/  _/_/_/_/
//    _/        _/        _/        _/_/    _/  _/        _/
//     _/_/    _/        _/_/_/    _/  _/  _/  _/        _/_/_/
//        _/  _/        _/        _/    _/_/  _/        _/
// _/_/_/      _/_/_/  _/_/_/_/  _/      _/    _/_/_/  _/_/_/_/

gl.clearColor(0.4,0.4,0.4, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.blendFunc(gl.SRC_ALPHA, gl.ADD);
gl.enable(gl.BLEND);
// gl.enable(gl.POLYGON_OFFSET_FILL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);



//     _/      _/  _/      _/  _/_/_/
//    _/_/  _/_/  _/      _/  _/    _/
//   _/  _/  _/  _/      _/  _/_/_/
//  _/      _/    _/  _/    _/
// _/      _/      _/      _/
let cubeMatrix = new Matrix4();
let model = new Matrix4();
let view = new Matrix4();
let deepth = 8;
view.setLookAt(0, 0, deepth, 0, 0, 0, 0, 1, 0);
let proje = new Matrix4();
proje.setPerspective(30, $('#renderer').width()/$('#renderer').height(), 1, 100);

let cubeMatrixLoc = gl.getUniformLocation(shaderProgram, "u_CubeMatrix");
let modelLocation = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
let viewLocation = gl.getUniformLocation(shaderProgram, 'u_ViewMatrix');
let projeLocation = gl.getUniformLocation(shaderProgram, 'u_ProjeMatrix');
gl.uniformMatrix4fv(modelLocation, false, model.elements);
gl.uniformMatrix4fv(viewLocation, false, view.elements);
gl.uniformMatrix4fv(projeLocation, false, proje.elements);
gl.uniformMatrix4fv(cubeMatrixLoc, false, cubeMatrix.elements);


// Light
shaderProgram.light = gl.getUniformLocation(shaderProgram, "u_lightDirection");
let ld = new Vector3([-30, 10.0, 30.0]);
ld.normalize();
gl.uniform3fv(shaderProgram.light, ld.elements);

// Normal Matrix
let nm = new Matrix4();
let nmLoc = gl.getUniformLocation(shaderProgram, "u_normalMatrix");
nm.setInverseOf(model);
nm.transpose();
gl.uniformMatrix4fv(nmLoc, false, nm.elements);







gl.useProgram(shaderProgram);


// Initial render
// Vertex remap index
let vmapBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vmapBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mod.map, gl.STATIC_DRAW);
gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render



// Drag
let gView = {};
gView.x = 0;
gView.y = 0;
gView.status = 0;
let last_time = Date.now();
let drag = (e) => {
    if(e.button == 2) {
        ctr.buildShader();
    }

    gView.x = e.clientX;
    gView.y = e.clientY;
    gView.status = 1;
}
let stopDrag = (e) => {
    gView.status = 0;
}

let mousemove = (e) => {
    if(gView.status == 1) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

        let delX = e.clientX - gView.x;
        let delY = e.clientY - gView.y;
        model.rotate(delX, 0, 1, 0);
        model.rotate(delY, 1, 0, 0);

        cubeMatrix.rotate(-delX, 0, 1, 0);
        cubeMatrix.rotate(-delY, 1, 0, 0);


        // Vertex remap index


        gl.uniformMatrix4fv(modelLocation, false, model.elements);
        nm.setInverseOf(model);
        nm.transpose();
        gl.uniformMatrix4fv(nmLoc, false, nm.elements);
        gl.uniformMatrix4fv(cubeMatrixLoc, false, cubeMatrix.elements);
        gl.drawElements(gl.TRIANGLES, mod.map.length, gl.UNSIGNED_SHORT, 0); // Render

        gView.x = e.clientX;
        gView.y = e.clientY;
    }

}



function GenerateSphere(radius, sagment) {
    this.r = (c) => Math.PI*c/180.0
    this.cos = (c) => Math.cos(this.r(c));
    this.sin = (c) => Math.sin(this.r(c));
// Vertex
    let del = 360/sagment;
    let vet = [];
    let index = [];
    let nor = [];
    let col = [];
    let tex = [];
    let n, a, b, c, d;

    for(let w = 0; w < 360; w+=del) {
        for(let t = 0; t < 180-del; t+=del) {
            a = [radius * this.sin(t) * this.cos(w), radius * this.cos(t), radius * this.sin(t) * this.sin(w)];
            b = [radius * this.sin(t+del) * this.cos(w), radius * this.cos(t+del), radius * this.sin(t+del) * this.sin(w)];
            c = [radius * this.sin(t+del) * this.cos(w+del), radius * this.cos(t+del), radius * this.sin(t+del) * this.sin(w+del)];
            a = dot(a, [Math.random()*2.3, Math.random()*2.3, Math.random()*2.3]);
            b = dot(b, [Math.random()*2.3, Math.random()*2.3, Math.random()*2.3]);
            c = dot(c, [Math.random()*2.3, Math.random()*2.3, Math.random()*2.3]);
            vet.push(a[0], a[1], a[2]);
            vet.push(b[0], b[1], b[2]);
            vet.push(c[0], c[1], c[2]);
            col.push(Math.random(),Math.random(),Math.random());
            col.push(Math.random(),Math.random(),Math.random());
            col.push(Math.random(),Math.random(),Math.random());
            let n = substractVectors(a, [0, 0, 0]);
            nor.push(n[0], n[1], n[2]);
            n = substractVectors(b, [0, 0, 0]);
            nor.push(n[0], n[1], n[2]);
            n = substractVectors(c, [0, 0, 0]);
            nor.push(n[0], n[1], n[2]);
            //  UV
            tex.push(-w/360, t/180);             // a
            tex.push(-w/360, (t+del)/180);       // b
            tex.push(-(w+del)/360, (t+del)/180); // c
            if((t!=0) && t!=(180)) { // top or bottom spot
                d = [radius * this.sin(t) * this.cos(w + del), radius * this.cos(t), radius * this.sin(t) * this.sin(w + del)];
                d = dot(d, [Math.random()*2.3, Math.random()*2.3, Math.random()*2.3]);
                vet.push(a[0], a[1], a[2]);
                vet.push(c[0], c[1], c[2]);
                vet.push(d[0], d[1], d[2]);
                col.push(Math.random(),Math.random(),Math.random());
                col.push(Math.random(),Math.random(),Math.random());
                col.push(Math.random(),Math.random(),Math.random());

                let n = substractVectors(a, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);
                n = substractVectors(c, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);
                n = substractVectors(d, [0, 0, 0]);
                nor.push(n[0], n[1], n[2]);

                //  UV
                tex.push(-w/360, t/180);             // a
                tex.push(-(w+del)/360, (t+del)/180); // c
                tex.push(-(w+del)/360, t/180);       // d

            }


        }
    }
    for(let i = 0; i < vet.length/3; i++)
        index.push(i);

    return {
        vertices: new Float32Array(vet),
        map: new Uint16Array(index),
        color: new Float32Array(col),
        texCoords: new Float32Array(tex),
        normals: new Float32Array(nor)
    };
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],  // X = a.y * b.z - a.z * b.y
        a[2] * b[0] - a[0] * b[2],  // Y = a.z * b.x - a.x * b.z
        a[0] * b[1] - a[1] * b[0]   // Z = a.x * b.y - a.y * b.x
    ];
}

function dot(a, b) {
    return [
        a[0] * b[0],
        a[1] * b[1],
        a[2] * b[2]
    ]
}
function substractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
