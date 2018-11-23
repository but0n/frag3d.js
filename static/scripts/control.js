function ctrMixin(frag3d) {
    frag3d.prototype.taskQueue = [];
    frag3d.prototype.damping = function(key, callback) {
        if(!callback)
            return;
        this[key] = 0;
        let task = () => {
            const threshold = 0.0001;
            const damping = 0.99;
            if (Math.abs(this[key]) > threshold) {
                this[key] *= damping;
                callback();
            }
            window.requestAnimationFrame(task);
        };
        window.requestAnimationFrame(task);
        this.taskQueue.push(task);
    }
    frag3d.prototype.bindMousemove = function(id, mod, modunif, normal, normalunif, refresh) {

        this.ctr = {x: 0, y: 0};
        this.ctr_initial = false; // Initial flag
        this.ctr_initial_m = false; // Initial flag
        [vx, vy] = [0,0];

        try {
            orientationHandler = (e) => {
                if(this.ctr_initial_m) {
                    const delX = e.gamma - this.ctr.x;
                    const delY = e.beta - this.ctr.y;
                    vx -= delX * 0.09;
                    vy -= delY * 0.09;
                } else {
                    this.ctr_initial_m = true;
                }
                this.ctr.x = e.gamma;
                this.ctr.y = e.beta;
            }
            window.addEventListener("deviceorientation", orientationHandler, false);
        }
        catch (e) {
            console.log(e);
        }
        $(id).mousemove((e) => {
            if(this.ctr_initial) {
                const delX = e.originalEvent.movementX;
                const delY = e.originalEvent.movementY;
                vx += -delX * 0.005;
                vy += delY * 0.005;
            } else {
                this.ctr_initial = true;
            }
            // this.ctr.x = e.clientX;
            // this.ctr.y = e.clientY;
            // console.table([vx, vy]);
        });
        let task = () => {
            const threshold = 0.001;
            const damping = 0.98;
            if (Math.abs(vy) > threshold && Math.abs(vx) > threshold) {
                vx *= damping;
                vy *= damping;
                this.rotateScene(mod, normal);
                refresh();
            }
            window.requestAnimationFrame(task);
        };
        window.requestAnimationFrame(task);
    }



    frag3d.prototype.rotateScene = function(mod, normal) {
        mod.rotate(vy, 1, 0, 0);
        mod.rotate(vx, 0, 1, 0);
        normal.setInverseOf(model);
        normal.transpose();
    }

}