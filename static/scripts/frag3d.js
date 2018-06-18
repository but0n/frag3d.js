function frag3d(id) {
    this.initWebgl(id);
}

webglMixin(frag3d);
meshMixin(frag3d);
ctrMixin(frag3d);

$('#renderer').attr('width', window.innerWidth*window.devicePixelRatio);
$('#renderer').attr('height', window.innerHeight*window.devicePixelRatio);
$('#renderer').width(window.innerWidth);
$('#renderer').height(window.innerHeight);
$('.title').height(window.innerHeight);

$(window).resize(() => {
    $('#renderer').attr('width', window.innerWidth*window.devicePixelRatio);
    $('#renderer').attr('height', window.innerHeight*window.devicePixelRatio);
    $('#renderer').width(window.innerWidth);
    $('#renderer').height(window.innerHeight);
});


let fr = new frag3d('renderer');
let mesh = fr.GenSphere(1.0, 50);


fr.gl.clearColor(0,0,0,0);
fr.gl.blendFunc(fr.gl.SRC_ALPHA, fr.gl.ADD);
fr.gl.clear(fr.gl.COLOR_BUFFER_BIT | fr.gl.DEPTH_COLOR_BIT);


let shader = fr.useShaderByID('Shader-vs', 'Shader-fs');

let t = 0;

// MVP
let deepth = 5;
let model = new Matrix4();
model.setRotate(t, 1, 0, 0);
let view = new Matrix4();
let proje = new Matrix4();
view.setLookAt(0, 0, deepth, 0, 0, 0, 0, 1, 0);
proje.setPerspective(30, $('#renderer').width()/$('#renderer').height(), 1, 100);

let nm = new Matrix4();
nm.setInverseOf(model);
nm.transpose();

shader.u_M = model.elements;
shader.u_V = view.elements;
shader.u_P = proje.elements;
shader.u_normalMatrix = nm.elements;
shader.u_time = 0;

shader.a_Position = [mesh.vertices, 3, fr.gl.FLOAT];
shader.a_Normal = [mesh.normals, 3, fr.gl.FLOAT];
shader.a_UV = [mesh.texCoords, 2, fr.gl.FLOAT];

let sampler = [];
let size = 1024;
for(let i = 0; i < size**2; i++) {
    sampler.push(255*Math.random(), 255*Math.random(), 255*Math.random(), 255*Math.random());
}
fr.genTexture(0, 0, fr.gl.RGBA, size, size, 0, fr.gl.UNSIGNED_BYTE, new Uint8Array(sampler));
shader.u_noise = 0;

fr.bindBuffer(mesh.map, fr.gl.STATIC_DRAW);
fr.gl.drawElements(fr.gl.TRIANGLES, mesh.map.length, fr.gl.UNSIGNED_SHORT, 0);
let a = 0;


fr.bindMousemove('.content', model, shader.u_M, nm, shader.u_normalMatrix, () => {
    shader.u_M = model.elements;
    fr.gl.drawElements(fr.gl.TRIANGLES, mesh.map.length, fr.gl.UNSIGNED_SHORT, 0);
});



let lastScroll = 0;
let vScroll = 0;
$(window).scroll(() => {
    const delta = $(window).scrollTop() - lastScroll;

    if(Math.abs(vScroll) < Math.abs(delta))
        vScroll += delta * 0.5;
    lastScroll = $(window).scrollTop();
});


setInterval(() => {
    const threshold = 0.0001;
    const damping = 0.999;
    if (Math.abs(vScroll) < threshold)
        return;
    vScroll *= damping;
    shader.u_time = lastScroll - vScroll;
    fr.gl.drawElements(fr.gl.TRIANGLES, mesh.map.length, fr.gl.UNSIGNED_SHORT, 0);
}, 1);