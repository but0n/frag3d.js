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
                vet.push(a[0], a[1], a[2]);
                vet.push(c[0], c[1], c[2]);
                vet.push(d[0], d[1], d[2]);

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