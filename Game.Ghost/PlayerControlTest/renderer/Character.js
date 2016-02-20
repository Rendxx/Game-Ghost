window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Character Renderer
 */
(function (RENDERER) {
    var Data = RENDERER.Data.character;
    var Character = function (id, name, role) {
        // data ----------------------------------------------
        var that = this,
            id = id,
            name = name,
            role = role,
            scene = null;

        var r_head_1 = null,
            r_head_2 = null,
            currentAction = null;

        this.light = null;
        this.torch = null;
        this.torchDirectionObj = null;
        this.mesh = null;
        this.materials = null;
        this.actions = null;
        this.mixer = null;
        this.setuped = false;

        // callback -------------------------------------------------------
        this.onSetuped = null;

        // public method --------------------------------------------------
        this.setup = function (scene_in) {
            scene = scene_in;
            if (this.mesh != null) {
                setupScene();
            }
        };

        this.render = function (action, x, y, r_body, r_head, delta) {
            //console.log(x+"  "+y+"  "+r_body+"  "+r_head);
            if (!this.setuped) return;

            // move
            this.mesh.position.x = x;
            this.mesh.position.z = y;

            if (currentAction != action) {
                this.mixer.crossFade(this.actions[currentAction], this.actions[action], .3);
                currentAction = action;
            }
            if (this.mixer) this.mixer.update(delta);

            // rotate
            var r = -r_head / 180 * Math.PI / 3;
            r_head_1.rotation.z = r * 2;
            r_head_2.rotation.z = r;
            this.mesh.rotation.y = r_body / 180 * Math.PI;
        };

        var setupScene = function () {
            scene.add(that.mesh);
            scene.add(that.torchDirectionObj);
            scene.add(that.torch);
            scene.add(that.light);
            that.setuped = true;
            if (that.onSetuped != null) that.onSetuped();
        };

        /*
         * direction[0]: move direction
         * direction[1]: head direction
         * 
         * 0: not move
         * 
         * 6 5 4
         * 7 0 3
         * 8 1 2
         */
        // private method -------------------------------------------------
        var load = function () {
            var para = Data[role];
            var loader = new THREE.JSONLoader();
            loader.load(para.file, function (geometry, materials) {
                var mesh = null,
                    actions = {},
                    mixer = null;
                for (var i = 0; i < materials.length; i++) {
                    materials[i].skinning = true;
                }
                mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                mixer = new THREE.AnimationMixer(mesh);
                for (var i in para.action) {
                    var action = new THREE.AnimationAction(geometry.animations[i]);
                    action.weight = 0;
                    mixer.addAction(action);
                    actions[para.action[i]] = action;
                }

                currentAction = para.initAction;
                actions[currentAction].weight = 1;

                that.mesh = mesh;
                that.actions = actions;
                that.mixer = mixer;
                that.materials = materials;

                // setup cache 
                r_head_1 = mesh.skeleton.bones[3];
                r_head_2 = mesh.skeleton.bones[4];

                // setup light
                that.torchDirectionObj = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshPhongMaterial({ color: 0x333333 }));
                that.torchDirectionObj.position.x = para.torch.pos[0];
                that.torchDirectionObj.position.y = para.torch.pos[1];
                that.torchDirectionObj.position.z = para.torch.pos[2] + 0.1;

                that.torch = new THREE.SpotLight()
                that.torch.position.x = para.torch.pos[0];
                that.torch.position.y = para.torch.pos[1];
                that.torch.position.z = para.torch.pos[2];
                that.torch.color.setHex(para.torch.color);
                that.torch.target = that.torchDirectionObj;

                that.light = new THREE.PointLight()
                that.light.position.x = para.light.pos[0];
                that.light.position.y = para.light.pos[1];
                that.light.position.z = para.light.pos[2];
                that.light.color.setHex(para.light.color);
                // setup if scene is set
                if (scene != null) {
                    setupScene();
                }
            });
        };

        var _init = function () {
            load();
        };

        _init();
    };

    /**
     * Render character
     * @param {game entity} entity - Game entity
     */
    RENDERER.Character = Character;
})(window.Rendxx.Game.Ghost.Renderer);