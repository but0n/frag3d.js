function frag3d(id) {
    this.initWebgl(id);
}

webglMixin(frag3d);
meshMixin(frag3d);


let fr = new frag3d('renderer');
fr.ss_render();