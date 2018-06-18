function ctrMixin(frag3d) {
    frag3d.prototype.bindMousemove = function(mod, modunif, normal, normalunif, refresh) {

        this.ctr = {x: 0, y: 0};
        this.ctr_initial = false; // Initial flag
        [vx, vy] = [0,0];


        $('#'+this.id).mousemove((e) => {
            if(this.ctr_initial) {
                const delX = e.clientX - this.ctr.x;
                const delY = e.clientY - this.ctr.y;

                if(Math.abs(vx) < Math.abs(delX))
                    vx += -delX * 0.001;
                if (Math.abs(vy) < Math.abs(delY))
                    vy += delY * 0.001;
            } else {
                this.ctr_initial = true;
            }
            this.ctr.x = e.clientX;
            this.ctr.y = e.clientY;
            // console.table([vx, vy]);
        });
        setInterval(() => {
            const threshold = 0.001;
            const damping = 0.996;
            if (Math.abs(vy) < threshold && Math.abs(vx) < threshold)
                return;
                vx *= damping;
                vy *= damping;
            this.rotateScene(mod, normal);
            refresh();
        }, 1);
    }



    frag3d.prototype.rotateScene = function(mod, normal) {
        mod.rotate(vy, 1, 0, 0);
        mod.rotate(vx, 0, 1, 0);
        normal.setInverseOf(model);
        normal.transpose();
    }
}