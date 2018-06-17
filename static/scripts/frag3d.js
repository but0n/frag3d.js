function frag3d(id) {
    this.initWebgl(id);
}

webglMixin(frag3d);
meshMixin(frag3d);


let fr = new frag3d('renderer');
let mesh = fr.GenSphere(1.0, 60);


fr.gl.clearColor(0.4,0.4,0.4, 1.0);
fr.gl.blendFunc(fr.gl.SRC_ALPHA, fr.gl.ADD);
fr.gl.clear(fr.gl.COLOR_BUFFER_BIT | fr.gl.DEPTH_COLOR_BIT);


let shader = fr.useShaderByID('Shader-vs', 'Shader-fs');

let t = 1;

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
shader.u_time = 1;

shader.a_Position = [mesh.vertices, 3, fr.gl.FLOAT];
shader.a_Normal = [mesh.normals, 3, fr.gl.FLOAT];


fr.bindBuffer(mesh.map, fr.gl.STATIC_DRAW);
fr.gl.drawElements(fr.gl.TRIANGLES, mesh.map.length, fr.gl.UNSIGNED_SHORT, 0);

// fr.ss_render();
