function gltfMixin(frag3d) {

    frag3d.prototype.load = function (url, type = 'json') {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = type;
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            }
            xhr.onerror = function () {
                reject(xhr.statusText);
            }
            xhr.send();
        })
    }

    frag3d.prototype.loadGLTF = function (path = '/static/meshs/Duck/Duck.gltf') {
        // let root;
        return new Promise((resolve, reject) => {
            // Load gltf json
            this.load(path, ).then(gltf => {
                path = path.split('/');
                path.pop();

                gltf._path = path.join('/') + '/';
                // Load images
                this.loadImages(gltf).then(console.log('image done'));
                // Parse materials
                this.parseMaterials(gltf);

                let bufRemain = gltf.buffers.length;
                gltf.rawBuffers = [];
                for(let buf of gltf.buffers) {
                    this.load(gltf._path + buf.uri, 'arraybuffer').then(buffer => {
                        gltf.rawBuffers.push(buffer);
                        if(!--bufRemain) {
                            // Parse bufferViews: create glbuffer instances
                            this.parseBufferViews(gltf);

                            resolve(gltf)
                        }
                    });
                }
            });
        });
    }

    frag3d.prototype.loadImages = function (gltf) {
        let gl = this.gl;
        gltf.rawImages = [];
        return new Promise((resolve, reject) => {
            let remain = gltf.images.length;
            for (let [idx, { uri }] of gltf.images.entries()) {
                // Load images
                let url = gltf._path + uri;
                let img = new Image();
                img.src = url;

                img.onload = () => {
                    gltf.rawImages[idx] = img;
                    // remain--;
                    if (!--remain) { // Create textures
                        // Clean cache
                        gltf.rawTextures = [];
                        for (let [i, { sampler, source }] of gltf.textures.entries()) {
                            let opt = {};
                            if(gltf.samplers) {
                                opt = gltf.samplers[sampler];
                            }

                            gl.activeTexture([
                                gl.TEXTURE0,
                                gl.TEXTURE1,
                                gl.TEXTURE2,
                                gl.TEXTURE3,
                                gl.TEXTURE4,
                                gl.TEXTURE5,
                                gl.TEXTURE6,
                                gl.TEXTURE7
                            ][i]);

                            let tex = gl.createTexture();
                            gl.bindTexture(gl.TEXTURE_2D, tex);
                            if (opt.wrapS)
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, opt.wrapS);
                            if (opt.wrapT)
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, opt.wrapT);
                            if (opt.minFilter)
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opt.minFilter);
                            if (opt.magFilter)
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, opt.magFilter);
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, gltf.rawImages[source]);
                            gltf.rawTextures.push(tex);
                        }
                        resolve();
                    }
                }
            }
        })
    }

    frag3d.prototype.parseMaterials = function(gltf) {
        console.warn('handle materials')
        gltf.rawShaders = [];
        for(let mat of gltf.materials) {
            // TODO: adjust materials
            let shader = this.useShaderByID('gltf-vs', 'gltf-fs');
            console.log(shader);
            gltf.rawShaders.push(shader);
        }
    }

    frag3d.prototype.parseBufferViews = function(gltf) {
        let gl = this.gl;
        console.warn('handle bufferViews');
        gltf.rawBufferViews = [];
        // gltf.rawGLBuffers = [];
        for(let view of gltf.bufferViews) {
            let bufferView = new DataView(gltf.rawBuffers[view.buffer], view.byteOffset, view.byteLenght);

            // NOTE: Create gl buffer instance
            let buf = gl.createBuffer();
            gl.bindBuffer(view.target, buf);
            gl.bufferData(view.target, bufferView, gl.STATIC_DRAW);
            gltf.rawBufferViews.push(buf);

            console.log(bufferView, view, buf);
        }

    }

    frag3d.prototype.parseScene = function (gltf, scene = gltf.scene) {
        this.glClear();

        let curScene = gltf.scenes[scene];
        for (let node of curScene.nodes) {
            this.parseNode(gltf, node);
        }
    }


    frag3d.prototype.parseNode = function (gltf, idx, matrix = []) {
        let curNode = gltf.nodes[idx];
        if (curNode.matrix) {
            matrix.push(curNode.matrix);
        }
        console.log(curNode);
        if (curNode.mesh != null) { // Handle mesh
            // let buffer = gltf.accessors[mesh.primitives.indices];
            this.renderMesh(gltf, curNode.mesh, matrix);
        }

        if (curNode.children) {
            for (let chil of curNode.children) {
                this.parseNode(gltf, chil, matrix);
            }
        }
    }

    frag3d.prototype.useMaterial = function(gltf, material) {
        let gl = this.gl;
        let curShader = gltf.rawShaders[material]; // get current shader
        gl.useProgram(curShader.program);
        curShader.u_M = model.elements;
        curShader.u_V = view.elements;
        curShader.u_P = proje.elements;
        curShader.u_normalMatrix = nm.elements;


        // Set up uniforms
        let mat = gltf.materials[material];
        console.log(mat);
        for(let uniform in mat.pbrMetallicRoughness) {
            const unit = mat.pbrMetallicRoughness[uniform].index;
            gl.activeTexture([
                gl.TEXTURE0,
                gl.TEXTURE1,
                gl.TEXTURE2,
                gl.TEXTURE3,
                gl.TEXTURE4,
                gl.TEXTURE5,
                gl.TEXTURE6,
                gl.TEXTURE7
            ][unit]);

            gl.bindTexture(gl.TEXTURE_2D, gltf.rawTextures[unit]);

            curShader[uniform] = unit;
            console.log(uniform, unit);
        }


        return curShader;
    }

    frag3d.prototype.bindBufferView = function(gltf, idx) {
        let gl = this.gl;
        let view = gltf.bufferViews[idx];
        let bufferView = gltf.rawBufferViews[idx];
        view.target = view.target
            ? view.target
            : gl.ARRAY_BUFFER;
        gl.bindBuffer(view.target, bufferView);
    }

    frag3d.prototype._getSizefromType = function(type) {
        switch(type) {
            case 'VEC1':
                return 1;
            case 'VEC2':
                return 2;
            case 'VEC3':
                return 3;
            case 'VEC4':
                return 4;
            default:
                return -1;
        }
    }

    frag3d.prototype.bindAccessor = function(gltf, attrName, idx, material) {
        let gl = this.gl;
        let acces = gltf.accessors[idx];
        this.bindBufferView(gltf, acces.bufferView);
        let view = gltf.bufferViews[acces.bufferView];
        let bufferView = gltf.rawBufferViews[acces.bufferView];
        let shader = gltf.rawShaders[material];

        // size, type, stride = 0, offset = 0
        let size = this._getSizefromType(acces.type);
        if(size)
            shader[attrName] = [size, acces.componentType, acces.stride, acces.byteOffset];
        else {
            // shader.u_M = model.elements;
            // shader.u_V = view.elements;
            // shader.u_P = proje.elements;
        }
        // this.gl.vertexAttribPointer(attr, chunkSize, type, false, 0, 0);
        // this.gl.enableVertexAttribArray(attr);

        // let buffer = gltf.buffers[acces.buffer];
        console.log(size, acces, view, bufferView, shader, attrName);
    }

    frag3d.prototype.renderMesh = function(gltf, mesh, matrix) {
        // generally each primitives only have one item
        console.warn('render');
        // this.glClear();
        for (let { attributes, indices, material, mode } of gltf.meshes[mesh].primitives) {
            // Use shader
            this.useMaterial(gltf, material);


            // Set up attributes
            for(let name in attributes) {
                console.log(name);
                this.bindAccessor(gltf, name, attributes[name], material);
            }

            // get element indices;
            let ebo = gltf.accessors[indices];
            console.warn('Render EBO: accessor');
            this.bindAccessor(gltf, null, indices, material);
            ebo.byteOffset = ebo.byteOffset == undefined
                ? 0
                : ebo.byteOffset;
            this.gl.drawElements(this.gl.TRIANGLES, ebo.count, ebo.componentType, ebo.byteOffset);


            // this.bindBufferView(gltf, indices);
            console.log(ebo)
            console.log(gltf.bufferViews[ebo.bufferView]);
        }
    }


}