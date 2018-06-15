function frag3d(id) {
    this.initalWebgl(id);
}

webglMixin(frag3d);
meshMixin(frag3d);

let vue = new frag3d('renderer');