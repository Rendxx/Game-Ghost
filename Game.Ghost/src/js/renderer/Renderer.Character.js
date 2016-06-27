﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Character Renderer
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = RENDERER.Data.grid.size;
    var _Data = {
        teamColor: [
            0xFF0000,
            0x0099CC,
            0xff0000
        ]
    };
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
        this.team = _para.team;
        this.role = _para.role;
        this.modelId = _para.modelId;
        //this.color = parseInt(_data.color, 16);
        this.color = _Data.teamColor[_para.team];
        this.maxEndurance = _para.setupData.enduranceMax;
        this.longInteractionObj = null;
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
        this.highlight = null;
        this.materials = null;
        this.actions = null;
        this.mixer = null;
        this.setuped = false;
        this.message = null;
        this.isVisible = false;
        this.danger = 0;
        this.isDead = false;
        this.isWin = false;

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
            cache_protect= null,
            cache_lightR = null,
            teleportingFlag = false,
            torchData = Data.character.parameter[_para.role].light.torch,
            topLightData = Data.character.parameter[_para.role].light.top,
            noTorchData = Data.character.parameter[_para.role].light.noTorch;

        // callback -------------------------------------------------------
        this.onLoaded = null;

        // public method --------------------------------------------------
        // update data from system
        this.update = function (data_in, assist_in, isVisible_in) {
            gameData = {
                x: data_in[0],
                y: data_in[1],
                endurance: data_in[2],
                hp: data_in[3],
                currentRotation: data_in[4],
                
                action: data_in[5],
                win: data_in[6],
                actived: data_in[7],
                light: data_in[8],
                battery: data_in[9],
                protect: data_in[19],               // survivor

                visibleCharacter: assist_in[0],
                danger: assist_in[1],
                accessObject: assist_in[2],
                visibleObject: assist_in[3],
                longInteractionObj: assist_in[4],

                soundObject: assist_in[5]
            };

            if (lightType !== gameData.light) {
                changeTorch(gameData.light);
                lightType = gameData.light;
            }

            that.isVisible = isVisible_in;
        };

        this.showMessage = function (msg) {
            this.message = msg;
        };

        // render model
        this.render = function (delta) {
            if (gameData === null || this.mesh === null) return;
            if (this.isVisible === false) {
                this.mesh.visible = false;
                this.highlight.visible = false;
                return;
            } else {
                this.mesh.visible = true;
                this.highlight.visible = true;
            }
            var action = gameData.action;
            var x = (gameData.x - entity.map.width / 2) * GridSize;
            var y = (gameData.y - entity.map.height / 2) * GridSize;
            var r_body = gameData.currentRotation[1];
            var r_head = gameData.currentRotation[2];
            var isDead = gameData.hp === 0;
            var isWin = gameData.win;
            //console.log(x+"  "+y+"  "+r_body+"  "+r_head);
            if (!this.setuped) return;

            this.x = x;
            this.y = y;
            this.danger = gameData.danger;
            this.endurance = gameData.endurance;
            this.accessObject = gameData.accessObject;
            this.longInteractionObj = gameData.longInteractionObj;
            this.visibleObject = gameData.visibleObject;
            this.isDead = isDead;
            this.isWin = isWin;
            
            if (gameData.protect != undefined && gameData.protect !== cache_protect) {
                cache_protect = gameData.protect;
                if (gameData.protect > 0) {
                    for (var i = 0; i < this.materials.length; i++) {
                        this.materials[i].opacity = 0.5;
                    }
                } else {
                    for (var i = 0; i < this.materials.length; i++) {
                        this.materials[i].opacity = 1;
                    }
                }
            }

            //if (gameData.teleporting!=null) {
            //    if (this.topLight !== null) {
            //        if (gameData.teleporting && !teleportingFlag) {
            //            this.topLight.position.y = this.mesh.position.y + (10 + topLightData.y) * GridSize;
            //            this.topLight.distance = (10 + topLightData.distance) * GridSize;
            //            this.topLight.color.r = 3;
            //            this.topLight.visible = true;
            //            teleportingFlag = true;
            //        } else if (!gameData.teleporting && teleportingFlag) {
            //            this.topLight.position.y = this.mesh.position.y + topLightData.y * GridSize;
            //            this.topLight.distance = topLightData.distance * GridSize;
            //            this.topLight.color.r = cache_lightR;
            //            this.topLight.visible = (entity.team[_para.team] === true);
            //            teleportingFlag = false;
            //        }
            //    }
            //}

            // dead
            if (isDead) {
                if (currentAction !== action) {
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
            //else if (isWin) {
            //    if (currentAction !== action) {
            //        that.actions[action].reset();
            //        tween.show[action].start();
            //        tween.hide[currentAction].start();
            //        currentAction = action;
            //    }
            //    if (this.mixer) this.mixer.update(delta);
            //    return;
            //}
            // move
            this.mesh.position.x = x;
            this.mesh.position.z = y;

            if (currentAction !== action) {
                //this.mixer.crossFade(this.actions[currentAction], this.actions[action], .3);
                //this.actions[currentAction].setEffectiveWeight(0);
                //this.actions[action].crossFadeFrom(this.actions[currentAction], 0.3).play();
                //this.actions[currentAction].setEffectiveWeight(1);
                //this.actions[currentAction].play();
                //this.actions[action].play();
                //(new TWEEN.Tween(this.actions[action]).to({ weight: 1 }, 200)).start();
                //(new TWEEN.Tween(this.actions[currentAction]).to({ weight: 0 }, 200)).start();

                that.actions[action].reset();
                tween.show[action].start();
                tween.hide[currentAction].start();
                currentAction = action;
            }
            if (this.mixer) this.mixer.update(delta);

            // rotate

            var r1 = r_body / 180 * Math.PI;
            var r2 = -r_head / 180 * Math.PI;
            var r3 = r1 - r2;
            //r_head_1.rotation.z = r2 / 3 * 2;
            //r_head_2.rotation.z = r2 / 3;
            this.mesh.rotation.y = r1;

            this.rotation = {
                body: r2,
                head: r3
            };

            var r_light = r1 + light_angle;
            var r_torchD = r3 + torchDirectionObj_angle;
            var r_torch = r3 + torch_angle;

            //console.log(r_body, r_head, r_light, r_torchD, r_torch, torch_angle);
            if (this.topLight !== null) {
                this.topLight.position.z = this.mesh.position.z + light_radius * Math.cos(r_light);
                this.topLight.position.x = this.mesh.position.x + light_radius * Math.sin(r_light);
            }
            if (this.torch !== null) {
                this.torchDirectionObj.position.z = this.mesh.position.z + torchDirectionObj_radius * Math.cos(r_torchD);
                this.torchDirectionObj.position.x = this.mesh.position.x + torchDirectionObj_radius * Math.sin(r_torchD);
                this.torch.position.z = this.mesh.position.z + torch_radius * Math.cos(r_torch);
                this.torch.position.x = this.mesh.position.x + torch_radius * Math.sin(r_torch);
            }

            that.highlight.position.x = this.mesh.position.x;
            that.highlight.position.y = 0.1;
            that.highlight.position.z = this.mesh.position.z;
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
                    materials[i].transparent = true;
                    materials[i].opacity = 1;
                    materials[i].skinning = true;
                }
                mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = false;
                mesh.receiveShadow = false;
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
                    if (torchData !== null) {
                        that.torchDirectionObj = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshPhongMaterial({ color: 0x333333 }));
                        that.torchDirectionObj.rotation.x = Math.PI;
                        that.torchDirectionObj.position.x = that.mesh.position.x + torchData.x * GridSize;
                        that.torchDirectionObj.position.y = that.mesh.position.y + torchData.y * GridSize - 0.4;
                        that.torchDirectionObj.position.z = that.mesh.position.z + torchData.z * GridSize + 1;
                        scene.add(that.torchDirectionObj);

                        that.torch = new THREE.SpotLight(parseInt(torchData.color));
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
                        scene.add(that.torch);
                        that.torch.visible = (entity.team[_para.team] === true);
                    }

                    if (topLightData !== null) {
                        that.topLight = new THREE.SpotLight(parseInt(topLightData.color));
                        that.topLight.position.x = that.mesh.position.x + topLightData.x * GridSize;
                        that.topLight.position.y = that.mesh.position.y + topLightData.y * GridSize;
                        that.topLight.position.z = that.mesh.position.z + topLightData.z * GridSize;
                        that.topLight.intensity = topLightData.intensity;
                        that.topLight.distance = topLightData.distance * GridSize;
                        that.topLight.angle = topLightData.angle;
                        that.topLight.penumbra = topLightData.exponent;
                        that.topLight.target = that.mesh;
                        that.topLight.castShadow = false;
                        scene.add(that.topLight);
                        that.topLight.visible = (entity.team[_para.team] === true);
                    }
                    setupLightCache();

                // setup highlight
                var mat = new THREE.SpriteMaterial({
                    color: that.color,
                    map: spriteTex['highlight'],
                    transparent: true
                });
                mat.opacity = 1.4;
                var spr = new THREE.Sprite(mat);
                spr.scale.set(GridSize * 1.2, GridSize * 1.2, 1.0);
                scene.add(spr);
                that.highlight = spr;

                // setup if scene is set
                that.setuped = true;
                if (that.onLoaded !== null) that.onLoaded();
            });
        };

        var changeTorch = function (type) {
            return;
            if (that.torch === null) return;
            if (type === 1) {
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
            if (torchData !== null) {
                torchDirectionObj_radius = Math.sqrt((torchData.z + 1) * (torchData.z + 1) + torchData.x * torchData.x);
                torchDirectionObj_angle = Math.atan2(torchData.x, (torchData.z + 1));
                torch_radius = Math.sqrt(torchData.z * torchData.z + torchData.x * torchData.x);
                torch_angle = Math.atan2(torchData.x, torchData.z);
            }
            if (topLightData !== null) {
                cache_lightR = that.topLight.color.r;
                light_radius = Math.sqrt(topLightData.z * topLightData.z + topLightData.x * topLightData.x);
                light_angle = Math.atan2(topLightData.x, topLightData.z);
            }
        };

        // sprite ---------------------------------------------------------
        var setupSprite = function () {
            spriteTex = {
            };
            var textureLoader = new THREE.TextureLoader();
            spriteTex['highlight'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'playerHighlight.png');

            //var ddsLoader = new THREE.DDSLoader();
            //spriteTex['highlight'] = ddsLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'playerHighlight.dds');
            //spriteTex['highlight'].anisotropy = 4;
        };

        var hexToRgb = function (hex) {
            var result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
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