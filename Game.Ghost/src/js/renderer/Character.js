﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Character Renderer
 */
(function (RENDERER) {
    var Data = RENDERER.Data.character;
    var Character = function (entity, id, modelData, characterPara) {
        // data ----------------------------------------------
        var that = this,
            scene = entity.env.scene,
            _para = characterPara,
            _data = modelData[_para.role][_para.modelId];

        var r_head_1 = null,
            r_head_2 = null,
            currentAction = null;

        this.id = id;
        this.name = _para.name;
        this.role = _para.role;
        this.modelId = _para.modelId;

        this.topLight = null;
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
            light_angle = 0,
            gameData = null;

        // callback -------------------------------------------------------
        this.onSetuped = null;

        // public method --------------------------------------------------
        // update data from system
        this.update = function (data_in) {
            gameData = data_in;
            console.log(this.id + "---------------------");
            console.log(gameData);
        };

        // render model
        this.render = function (delta) {
            if (gameData == null) return;
            var action = gameData.action;
            var x = gameData.x;
            var y = gameData.y;
            var r_body = gameData.currentRotation.body;
            var r_head = gameData.currentRotation.headBody;
            var isDie = gameData.hp == 0;
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
            this.topLight.position.z = this.mesh.position.z + light_radius * Math.cos(r_light);
            this.topLight.position.x = this.mesh.position.x + light_radius * Math.sin(r_light);
            this.torchDirectionObj.position.z = this.mesh.position.z + torchDirectionObj_radius * Math.cos(r_torchD);
            this.torchDirectionObj.position.x = this.mesh.position.x + torchDirectionObj_radius * Math.sin(r_torchD);
            this.torch.position.z = this.mesh.position.z + torch_radius * Math.cos(r_torch);
            this.torch.position.x = this.mesh.position.x + torch_radius * Math.sin(r_torch);
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
            var loader = new THREE.JSONLoader();
            loader.load(Data.path+_data.model, function (geometry, materials) {
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
                for (var i in _data.action.list) {
                    var action = new THREE.AnimationAction(geometry.animations[i]);
                    action.weight = 0;
                    mixer.addAction(action);
                    actions[_data.action.list[i]] = action;
                }

                currentAction = _data.action.list[_data.action.init];
                actions[currentAction].weight = 1;

                that.mesh = mesh;
                that.actions = actions;
                that.mixer = mixer;
                that.materials = materials;
                scene.add(that.mesh);

                // setup cache 
                r_head_1 = mesh.skeleton.bones[3];
                r_head_2 = mesh.skeleton.bones[4];

                // setup light
                if (_data.light.top.torch != null) {
                    that.torchDirectionObj = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshPhongMaterial({ color: 0x333333 }));
                    that.torchDirectionObj.rotation.x = Math.PI;
                    that.torchDirectionObj.position.x = that.mesh.position.x + _data.light.torch.x;
                    that.torchDirectionObj.position.y = that.mesh.position.y + _data.light.torch.y;
                    that.torchDirectionObj.position.z = that.mesh.position.z + _data.light.torch.z + 1;

                    that.torch = new THREE.SpotLight()
                    that.torch.position.x = that.mesh.position.x + _data.light.torch.x;
                    that.torch.position.y = that.mesh.position.y + _data.light.torch.y;
                    that.torch.position.z = that.mesh.position.z + _data.light.torch.z;
                    that.torch.intensity = _data.light.torch.intensity;
                    that.torch.distance = _data.light.torch.distance;
                    that.torch.angle = _data.light.torch.angle;
                    that.torch.exponent = _data.light.torch.exponent;
                    that.torch.shadow.camera.near = _data.light.torch.shadowCameraNear;
                    that.torch.shadow.camera.far = _data.light.torch.shadowCameraFar;
                    that.torch.shadow.camera.fov = _data.light.torch.shadowCameraFov;
                    that.torch.shadowBias = _data.light.torch.shadowBias;
                    that.torch.shadowDarkness = _data.light.torch.shadowDarkness;
                    that.torch.castShadow = true;
                    that.torch.target = that.torchDirectionObj;
                    that.torch.color.setHex(_data.light.torch.color);
                    scene.add(that.torchDirectionObj);
                    scene.add(that.torch);
                }

                if (_data.light.top.top != null) {
                    that.topLight = new THREE.SpotLight()
                    that.topLight.position.x = that.mesh.position.x + _data.light.top.x;
                    that.topLight.position.y = that.mesh.position.y + _data.light.top.y;
                    that.topLight.position.z = that.mesh.position.z + _data.light.top.z;
                    that.topLight.intensity = _data.light.top.intensity;
                    that.topLight.distance = _data.light.top.distance;
                    that.topLight.angle = _data.light.top.angle;
                    that.topLight.exponent = _data.light.top.exponent;
                    that.topLight.target = that.mesh;
                    that.topLight.color.setHex(_data.light.top.color);
                    scene.add(that.topLight);
                }
                setupLightCache(_data.light);

                // setup if scene is set
                that.setuped = true;
                if (that.onSetuped != null) that.onSetuped();
            });
        };

        // setup light cache with
        var setupLightCache = function (light) {
            torchDirectionObj_radius = Math.sqrt((light.torch.z + 1) * (light.torch.z + 1) + light.torch.x * light.torch.x);
            torchDirectionObj_angle = Math.atan2(light.torch.x, (light.torch.z + 1));
            torch_radius = Math.sqrt(light.torch.z * light.torch.z + light.torch.x * light.torch.x);
            torch_angle = Math.atan2(light.torch.x, light.torch.z);
            light_radius = Math.sqrt(light.top.z * light.top.z + light.top.x * light.top.x);
            light_angle = Math.atan2(light.top.x, light.top.z);
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