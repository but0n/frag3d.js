function frag3d(id) {
    this.initWebgl(id);
}

webglMixin(frag3d);
meshMixin(frag3d);


let frag = new frag3d('renderer');
frag.ss_render();
