window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Character Renderer
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = RENDERER.Data.grid.size;
    var Character = function (entity, id, modelData, characterPara) {
        // data ----------------------------------------------
        var that = this,
            scene = entity.env.scene,
            root = entity.root,
            _para = characterPara,
            _data = modelData[_para.role][_para.modelId];

        var r_head_1 = null,
            r_head_2 = null,
            _win = false,
            currentAction = null;

        this.id = id;
        this.name = _para.name;
        this.role = _para.role;
        this.modelId = _para.modelId;
        this.color = _data.color;
        this.maxEndurance = _data.para.endurance;
        this.accessObject = null;
        this.visibleObject = null;
        this.endurance = 0;
        this.x = 0;
        this.y = 0;
        this.rotation = {
            body: 0,
            head: 0
        };

        this.topLight = null;
        this.torch = null;
        this.torchDirectionObj = null;
        this.mesh = null;
        this.materials = null;
        this.actions = null;
        this.mixer = null;
        this.setuped = false;
        this.message = null;
        this.isVisible = false;
        this.danger = 0;

        // cache ----------------------------------------------------------
        var torchDirectionObj_radius = 0,
            torchDirectionObj_angle = 0,
            torch_radius = 0,
            torch_angle = 0,
            light_radiusadius = 0,
            light_angle = 0,
            gameData = null,
            lightType = 1,
            sprite = {},
            spriteTex = {},
            tween = {
                show: {},
                hide: {}
            },
            torchData = Data.character.parameter[_para.role].light.torch,
            topLightData = Data.character.parameter[_para.role].light.top,
            noTorchData = Data.character.parameter[_para.role].light.noTorch;

        // callback -------------------------------------------------------
        this.onLoaded = null;

        // public method --------------------------------------------------
        // update data from system
        this.update = function (data_in, isVisible_in) {
            if (lightType != data_in.light) {
                changeTorch(data_in.light);
                lightType = data_in.light;
            }
            if (data_in.message != null) that.message = data_in.message;

            gameData = data_in;
            that.isVisible = isVisible_in;
        };

        this.showMessage = function (msg) {
            this.message = msg;
        };

        // render model
        this.render = function (delta) {
            if (gameData == null) return;
            if (this.isVisible == false) {
                this.mesh.visible = false;
                return;
            } else {
                this.mesh.visible = true;
            }
            var action = gameData.action;
            var x = (gameData.x - entity.map.width / 2) * GridSize;
            var y = (gameData.y - entity.map.height / 2) * GridSize;
            var r_body = gameData.currentRotation.body;
            var r_head = gameData.currentRotation.headBody;
            var isDead = gameData.hp == 0;
            //console.log(x+"  "+y+"  "+r_body+"  "+r_head);
            if (!this.setuped) return;

            this.x = x;
            this.y = y;
            this.danger = gameData.danger;
            this.endurance = gameData.endurance;
            this.accessObject = gameData.accessObject;
            this.visibleObject = gameData.visibleObject;
            this.isDead = isDead;

            // dead
            if (isDead) {
                if (currentAction != action) {
                    //this.mixer.crossFade(this.actions[currentAction], this.actions[action], .3);
                    //this.actions[currentAction].setEffectiveWeight(0);
                    tween.show[action].start();
                    tween.hide[currentAction].start();
                    currentAction = action;
                    //this.actions[currentAction].setEffectiveWeight(1);
                    //this.actions[currentAction].play();
                }
                if (this.mixer) this.mixer.update(delta);
                return;
            }
            // move
            this.mesh.position.x = x;
            this.mesh.position.z = y;

            if (currentAction != action) {
                //this.mixer.crossFade(this.actions[currentAction], this.actions[action], .3);
                //this.actions[currentAction].setEffectiveWeight(0);
                //this.actions[action].crossFadeFrom(this.actions[currentAction], 0.3).play();
                //this.actions[currentAction].setEffectiveWeight(1);
                //this.actions[currentAction].play();
                //this.actions[action].play();
                //(new TWEEN.Tween(this.actions[action]).to({ weight: 1 }, 200)).start();
                //(new TWEEN.Tween(this.actions[currentAction]).to({ weight: 0 }, 200)).start();

                tween.show[action].start();
                tween.hide[currentAction].start();
                currentAction = action;
            }
            if (this.mixer) this.mixer.update(delta);

            // rotate

            var r1 = r_body / 180 * Math.PI;
            var r2 = -r_head / 180 * Math.PI;
            var r3 = r1 - r2;
            r_head_1.rotation.z = r2 / 3 * 2;
            r_head_2.rotation.z = r2 / 3;
            this.mesh.rotation.y = r1;

            this.rotation = {
                body: r2,
                head: r3
            };

            var r_light = r1 + light_angle;
            var r_torchD = r3 + torchDirectionObj_angle;
            var r_torch = r3 + torch_angle;

            //console.log(r_body, r_head, r_light, r_torchD, r_torch, torch_angle);
            if (this.topLight != null) {
                this.topLight.position.z = this.mesh.position.z + light_radius * Math.cos(r_light);
                this.topLight.position.x = this.mesh.position.x + light_radius * Math.sin(r_light);
            }
            if (this.torch != null) {
                this.torchDirectionObj.position.z = this.mesh.position.z + torchDirectionObj_radius * Math.cos(r_torchD);
                this.torchDirectionObj.position.x = this.mesh.position.x + torchDirectionObj_radius * Math.sin(r_torchD);
                this.torch.position.z = this.mesh.position.z + torch_radius * Math.cos(r_torch);
                this.torch.position.x = this.mesh.position.x + torch_radius * Math.sin(r_torch);
            }
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
            loader.load(root + Data.character.path + _data.model, function (geometry, materials) {
                var mesh = null,
                    actions = {},
                    mixer = null;
                for (var i = 0; i < materials.length; i++) {
                    materials[i].skinning = true;
                }
                mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = false;
                mesh.receiveShadow = true;
                //mesh.scale.set(1.5, 1.5, 1.5);

                mixer = new THREE.AnimationMixer(mesh);
                for (var i in _data.action.list) {

                    var action = mixer.clipAction(geometry.animations[i]);
                    //action.weight = 0;
                    //mixer.addAction(action);

                    tween.show[_data.action.list[i]] = new TWEEN.Tween(action).to({ weight: 1 }, 200);
                    tween.hide[_data.action.list[i]] = new TWEEN.Tween(action).to({ weight: 0 }, 200);
                    action.setEffectiveWeight(0);
                    action.play();
                    actions[_data.action.list[i]] = action;
                }

                currentAction = _data.action.list[_data.action.init];
                //actions[currentAction].weight = 1;
                actions[currentAction].setEffectiveWeight(1);

                that.mesh = mesh;
                that.actions = actions;
                that.mixer = mixer;
                that.materials = materials;
                scene.add(that.mesh);

                // setup cache 
                r_head_1 = mesh.skeleton.bones[3];
                r_head_2 = mesh.skeleton.bones[4];

                // setup light
                if ((_para.role == Data.character.type.survivor && !entity.isGhost) || (_para.role == Data.character.type.ghost && entity.isGhost)) {
                    if (torchData != null) {
                        that.torchDirectionObj = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshPhongMaterial({ color: 0x333333 }));
                        that.torchDirectionObj.rotation.x = Math.PI;
                        that.torchDirectionObj.position.x = that.mesh.position.x + torchData.x * GridSize;
                        that.torchDirectionObj.position.y = that.mesh.position.y + torchData.y * GridSize - 0.4;
                        that.torchDirectionObj.position.z = that.mesh.position.z + torchData.z * GridSize + 1;

                        that.torch = new THREE.SpotLight()
                        that.torch.position.x = that.mesh.position.x + torchData.x * GridSize;
                        that.torch.position.y = that.mesh.position.y + torchData.y * GridSize;
                        that.torch.position.z = that.mesh.position.z + torchData.z * GridSize;
                        that.torch.intensity = torchData.intensity;
                        that.torch.distance = torchData.distance * GridSize;
                        that.torch.angle = torchData.angle;
                        that.torch.penumbra = torchData.exponent;
                        that.torch.shadow.camera.near = torchData.shadowCameraNear * GridSize;
                        that.torch.shadow.camera.far = torchData.shadowCameraFar * GridSize;
                        that.torch.shadow.camera.fov = torchData.shadowCameraFov;
                        that.torch.shadow.bias = torchData.shadowBias;
                        //that.torch.shadow.mapSize.set(2048, 2048);
                        that.torch.castShadow = true;
                        that.torch.target = that.torchDirectionObj;
                        that.torch.color.setHex(torchData.color);
                        scene.add(that.torchDirectionObj);
                        scene.add(that.torch);
                    }

                    if (topLightData != null) {
                        that.topLight = new THREE.SpotLight()
                        that.topLight.position.x = that.mesh.position.x + topLightData.x * GridSize;
                        that.topLight.position.y = that.mesh.position.y + topLightData.y * GridSize;
                        that.topLight.position.z = that.mesh.position.z + topLightData.z * GridSize;
                        that.topLight.intensity = topLightData.intensity;
                        that.topLight.distance = topLightData.distance * GridSize;
                        that.topLight.angle = topLightData.angle;
                        that.topLight.penumbra = topLightData.exponent;
                        that.topLight.target = that.mesh;
                        that.topLight.color.setHex(topLightData.color);
                        that.topLight.castShadow = false;
                        scene.add(that.topLight);
                    }
                    setupLightCache();
                }

                // setup if scene is set
                that.setuped = true;
                if (that.onLoaded != null) that.onLoaded();
            });
        };

        var changeTorch = function (type) {
            if (that.torch == null) return;
            if (type == 1) {
                that.torch.intensity = torchData.intensity;
                that.torch.distance = torchData.distance * GridSize;
                that.torch.color.setHex(torchData.color);
            } else {
                that.torch.intensity = noTorchData.intensity;
                that.torch.distance = noTorchData.distance * GridSize;
                that.torch.color.setHex(noTorchData.color);
            }
        };

        // setup light cache with
        var setupLightCache = function () {
            if (torchData != null) {
                torchDirectionObj_radius = Math.sqrt((torchData.z + 1) * (torchData.z + 1) + torchData.x * torchData.x);
                torchDirectionObj_angle = Math.atan2(torchData.x, (torchData.z + 1));
                torch_radius = Math.sqrt(torchData.z * torchData.z + torchData.x * torchData.x);
                torch_angle = Math.atan2(torchData.x, torchData.z);
            }
            if (topLightData != null) {
                light_radius = Math.sqrt(topLightData.z * topLightData.z + topLightData.x * topLightData.x);
                light_angle = Math.atan2(topLightData.x, topLightData.z);
            }
        };

        // sprite ---------------------------------------------------------
        var createSprite = function (x, y) {
            if (newKeyId === null) return;
            var id = newKeyId;
            var key_mat = new THREE.SpriteMaterial({
                map: spriteTex['key']
            });
            var key_spr = new THREE.Sprite(key_mat);
            key_spr.position.set(x, 4 * GridSize, y);
            key_spr.scale.set(3, 3, 1.0); // imageWidth, imageHeight
            scene.add(key_spr);
            sprite[id] = key_spr;

            key_mat.opacity = 0;
            var last = 0;
            var tween1 = new TWEEN.Tween({ t: 0 }).to({ t: 10 }, 100)
                        .onStart(function () {
                            last = 0;
                        }).onUpdate(function () {
                            key_mat.opacity = this.t * 10;
                            key_spr.position.z -= (this.t - last) / 20 * GridSize;
                            last = this.t;
                        });
            var tween2 = new TWEEN.Tween({ t: 100 }).to({ t: 0 }, 600).easing(TWEEN.Easing.Quadratic.In)
                        .onStart(function () {
                            last = 100;
                        }).onUpdate(function () {
                            key_mat.opacity = this.t;
                            key_spr.position.z += (this.t - last) / 600 * GridSize;
                            last = this.t;
                        }).onStop(function () {
                            scene.remove(key_spr);
                            delete sprite[id];
                        }).onComplete(function () {
                            scene.remove(key_spr);
                            delete sprite[id];
                        });
            tween1.chain(tween2);
            tween1.start();
            newKeyId = null;
        };

        var setupSprite = function () {
            spriteTex = {
            };
            var textureLoader = new THREE.TextureLoader();
            spriteTex['key'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_key.png');
        };

        // setup ----------------------------------------------------------
        var _init = function () {
            load();
            setupSprite();
        };

        _init();
    };

    /**
     * Render character
     * @param {game entity} entity - Game entity
     */
    RENDERER.Character = Character;
})(window.Rendxx.Game.Ghost.Renderer);