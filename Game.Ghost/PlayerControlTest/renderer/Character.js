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

        // cache ----------------------------------------------------------
        var torchDirectionObj_radius = 0,
            torchDirectionObj_angle = 0,
            torch_radius = 0,
            torch_angle = 0,
            light_radiusadius = 0,
            light_angle = 0;

        // callback -------------------------------------------------------
        this.onSetuped = null;

        // public method --------------------------------------------------
        this.setup = function (scene_in) {
            scene = scene_in;
            if (this.mesh != null) {
                setupScene();
            }
        };

        this.render = function (action, x, y, r_body, r_head, isDie, delta) {
            //console.log(x+"  "+y+"  "+r_body+"  "+r_head);
            if (!this.setuped) return;

            // dead
            if (isDie) {
                console.log(that.actions[action]);
                if (currentAction != action) {
                    this.mixer.crossFade(this.actions[currentAction], this.actions[action], .3);
                    currentAction = action;
                }
                if (this.mixer) this.mixer.update(delta);
                return;
            }
            // move
            this.mesh.position.x = x;
            this.mesh.position.z = y;

            if (currentAction != action) {
                this.mixer.crossFade(this.actions[currentAction], this.actions[action], .3);
                currentAction = action;
            }
            if (this.mixer) this.mixer.update(delta);

            // rotate

            var r1 = r_body / 180 * Math.PI;
            var r2 = -r_head / 180 * Math.PI;
            var r3 = r1-r2;
            r_head_1.rotation.z = r2/3 * 2;
            r_head_2.rotation.z = r2/3;
            this.mesh.rotation.y = r1;

            var r_light = r1 + light_angle;
            var r_torchD = r3 + torchDirectionObj_angle;
            var r_torch = r3 + torch_angle;

            //console.log(r_body, r_head, r_light, r_torchD, r_torch, torch_angle);
            this.light.position.z = this.mesh.position.z + light_radius * Math.cos(r_light);
            this.light.position.x = this.mesh.position.x + light_radius * Math.sin(r_light);
            this.torchDirectionObj.position.z = this.mesh.position.z + torchDirectionObj_radius * Math.cos(r_torchD);
            this.torchDirectionObj.position.x = this.mesh.position.x + torchDirectionObj_radius * Math.sin(r_torchD);
            this.torch.position.z = this.mesh.position.z + torch_radius * Math.cos(r_torch);
            this.torch.position.x = this.mesh.position.x + torch_radius * Math.sin(r_torch);
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
                    //if (para.notloop[i] == true)
                    //    action.loop = 1;
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
                that.torchDirectionObj.rotation.x = Math.PI;
                that.torchDirectionObj.position.x = that.mesh.position.x + para.torch.x;
                that.torchDirectionObj.position.y = that.mesh.position.y + para.torch.y;
                that.torchDirectionObj.position.z = that.mesh.position.z + para.torch.z + 1;

                that.torch = new THREE.SpotLight()
                that.torch.position.x = that.mesh.position.x + para.torch.x;
                that.torch.position.y = that.mesh.position.y + para.torch.y;
                that.torch.position.z = that.mesh.position.z + para.torch.z;
                that.torch.intensity = para.torch.intensity;
                that.torch.distance = para.torch.distance;
                that.torch.angle = para.torch.angle;
                that.torch.exponent = para.torch.exponent;
                that.torch.shadow.camera.near = para.torch.shadowCameraNear;
                that.torch.shadow.camera.far = para.torch.shadowCameraFar;
                that.torch.shadow.camera.fov = para.torch.shadowCameraFov;
                that.torch.shadow.bias = para.torch.shadowBias;
                that.torch.castShadow = true;
                that.torch.target = that.torchDirectionObj;
                that.torch.color.setHex(para.torch.color);

                that.light = new THREE.SpotLight()
                that.light.position.x = that.mesh.position.x + para.light.x;
                that.light.position.y = that.mesh.position.y + para.light.y;
                that.light.position.z = that.mesh.position.z + para.light.z;
                that.light.intensity = para.light.intensity;
                that.light.distance = para.light.distance;
                that.light.angle = para.light.angle;
                that.light.exponent = para.light.exponent;
                that.light.target = that.mesh;
                that.light.color.setHex(para.light.color);

                setupCache(para);
                // setup if scene is set
                if (scene != null) {
                    setupScene();
                }
            });
        };

        // setup cache with env data
        var setupCache = function (data) {
            torchDirectionObj_radius = Math.sqrt((data.torch.z + 1) * (data.torch.z + 1) + data.torch.x * data.torch.x);
            torchDirectionObj_angle = Math.atan2(data.torch.x, (data.torch.z + 1));
            torch_radius = Math.sqrt(data.torch.z * data.torch.z + data.torch.x * data.torch.x);
            torch_angle = Math.atan2(data.torch.x, data.torch.z);
            light_radius = Math.sqrt(data.light.z * data.light.z + data.light.x * data.light.x);
            light_angle = Math.atan2(data.light.x, data.light.z);
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