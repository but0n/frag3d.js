$('#renderer').attr('width', window.innerWidth*2);
$('#renderer').attr('height', window.innerHeight*2);
$('#renderer').width(window.innerWidth);
$('#renderer').height(window.innerHeight);

let gl = document.getElementById('renderer').getContext('webgl');

gl.getExtension("OES_standard_derivatives"); // TBN required

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
        (console.log(GL_ctx.getShaderInfoLog(shader)));
}

function attributeBuffer(pointer, data, n, type) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(pointer, n, type, false, 0, 0);
    gl.enableVertexAttribArray(pointer);
}


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
    }
}

function loadCubeTexture(path, channel) {
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
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubetex);

            }
        }
    }
}

function ss_render(gl) { // Screen space render
    gl.clearColor(0.4,0.4,0.4, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ADD);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);

    let shader = gl.createProgram();
    gl.attachShader(shader, getShader('gpgpu-vs', gl));
    gl.attachShader(shader, getShader('gpgpu-fs', gl));
    gl.linkProgram(shader);
    gl.useProgram(shader);
    shader.data = gl.getUniformLocation(shader, "data");
    shader.a_Position = gl.getAttribLocation(shader, 'a_Position');
    shader.a_texCoord = gl.getAttribLocation(shader, 'a_texCoord');

    attributeBuffer(shader.a_Position, new Float32Array([  // Vertex Postion
        -1, 1, 0.0,
        1, 1, 0.0,
        1, -1, 0.0,
        -1, -1, 0.0
    ]), 3, gl.FLOAT);
    attributeBuffer(shader.a_texCoord, new Float32Array([  // TexCoord
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ]), 2, gl.FLOAT);
    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]), gl.STATIC_DRAW);
    let sampler = [];
    for(let i = 0; i < 65536; i++) {
        sampler.push(255*Math.random(), 255*Math.random(), 255*Math.random());
    }
    texture(gl, 0, 0, gl.RGB, 256, 256, 0, gl.UNSIGNED_BYTE, new Uint8Array(sampler));
    gl.uniform1i(shader.data, 0);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function renderMesh(gl, vert, normal, map) {
    gl.clearColor(0.4,0.4,0.4, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ADD);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);


    let shader = gl.createProgram();
    gl.attachShader(shader, getShader('Shader-vs', gl));
    gl.attachShader(shader, getShader('Shader-fs', gl));
    gl.linkProgram(shader);
    gl.useProgram(shader);
    // Attributes
    shader.a_Position   = gl.getAttribLocation(shader, 'a_Position');
    shader.a_Color      = gl.getAttribLocation(shader, 'a_Color');
    shader.a_Normal     = gl.getAttribLocation(shader, 'a_Normal');
    shader.a_texCoord   = gl.getAttribLocation(shader, 'a_texCoord');
    // Uniform
    shader.u_M = gl.getUniformLocation(shader, "u_M");
    shader.u_V = gl.getUniformLocation(shader, "u_V");
    shader.u_P = gl.getUniformLocation(shader, "u_P");
    shader.u_normalMatrix = gl.getUniformLocation(shader, "u_normalMatrix");


    // MVP
    let deepth = 5;
    let model = new Matrix4();
    let view = new Matrix4();
    let proje = new Matrix4();
    view.setLookAt(0, 0, deepth, 0, 0, 0, 0, 1, 0);
    proje.setPerspective(30, $('#renderer').width()/$('#renderer').height(), 1, 100);

    let nm = new Matrix4();
    shader.u_normalMatrix = gl.getUniformLocation(shader, "u_normalMatrix");
    nm.setInverseOf(model);
    nm.transpose();

    gl.uniformMatrix4fv(shader.u_M, false, model.elements);
    gl.uniformMatrix4fv(shader.u_V, false, view.elements);
    gl.uniformMatrix4fv(shader.u_P, false, proje.elements);
    gl.uniformMatrix4fv(shader.u_normalMatrix, false, nm.elements);

    attributeBuffer(shader.a_Position, vert, 3, gl.FLOAT);
    attributeBuffer(shader.a_Normal, normal, 3, gl.FLOAT);

    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, map, gl.STATIC_DRAW);

    gl.drawElements(gl.TRIANGLES, map.length, gl.UNSIGNED_SHORT, 0);
}


function texture(gl, channel, level, format, width, height, border, type, data) {
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
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, level, format, width, height, border, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

let mesh = GenerateSphere(1.0, 40);
ss_render(gl);
renderMesh(gl, mesh.vertices, mesh.normals, mesh.map);
setInterval(()=>{renderMesh(gl, mesh.vertices, mesh.normals, mesh.map);}, 100);