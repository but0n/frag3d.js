function meshMixin(frag3d) {
    // const meshData =
    frag3d.prototype.GenSphere = function(radius, sagment) {
        let r = (c) => Math.PI*c/180.0
        let cos = (c) => Math.cos(r(c));
        let sin = (c) => Math.sin(r(c));

        let del = 360/sagment;
        let vet = [];   // Vertex
        let index = []; // Index
        let nor = [];   // Normal
        let col = [];   // Color
        let uv = [];   // UV coord
        let n, a, b, c, d;
        let vbo = [];

        let group = [];
        const size = 1024 - 1;
        // for (let i = 0; i < index.length / 3; i++) {
        //     let u = 1 / size * (i % size);
        //     let v = 1 / size * (i / size);
        //     group.push(u, v);
        //     group.push(u, v);
        //     group.push(u, v);
        // }
        let idx = 0;
        for(let w = 0; w < 360; w+=del) {
            for(let t = 0; t < 180-del; t+=del) {
                a = [radius * sin(t) * cos(w), radius * cos(t), radius * sin(t) * sin(w)];
                b = [radius * sin(t+del) * cos(w), radius * cos(t+del), radius * sin(t+del) * sin(w)];
                c = [radius * sin(t+del) * cos(w+del), radius * cos(t+del), radius * sin(t+del) * sin(w+del)];
                let n1 = substractVectors(a, [0, 0, 0]);
                let n2 = substractVectors(b, [0, 0, 0]);
                let n3 = substractVectors(c, [0, 0, 0]);

                let u = 1 / size * (idx % size);
                let v = 1 / size * (idx / size);
                vbo.push(
                    ...a, ...n1, u, v,
                    ...b, ...n2, u, v,
                    ...c, ...n3, u, v
                );
                idx++;

                //  UV
                // uv.push(-w/360, t/180);             // a
                // uv.push(-w/360, (t+del)/180);       // b
                // uv.push(-(w+del)/360, (t+del)/180); // c
                if((t!=0) && t!=(180)) { // top or bottom spot
                    d = [radius * sin(t) * cos(w + del), radius * cos(t), radius * sin(t) * sin(w + del)];
                    let n1 = substractVectors(a, [0, 0, 0]);
                    let n2 = substractVectors(c, [0, 0, 0]);
                    let n3 = substractVectors(d, [0, 0, 0]);
                    let u = 1 / size * (idx % size);
                    let v = 1 / size * (idx / size);
                    // vbo.push(u, v);
                    // vbo.push(u, v);
                    // vbo.push(u, v);
                    vbo.push(
                        ...a, ...n1, u, v,
                        ...c, ...n2, u, v,
                        ...d, ...n3, u, v
                    );
                    idx++;

                    //  UV
                    // uv.push(-w/360, t/180);             // a
                    // uv.push(-(w+del)/360, (t+del)/180); // c
                    // uv.push(-(w+del)/360, t/180);       // d

                }


            }
        }

        return {
            vbo: new Float32Array(vbo),
            amount: idx*3,
        };
    }
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