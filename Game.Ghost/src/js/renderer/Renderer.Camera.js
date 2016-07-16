window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Camera for each player 
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = Data.grid.size;
    var _Data = {
        fogRange: 34,
        furnitureOperation: {
            Open: 0,
            Key: 1,
            Close: 2
        },
        dangerSpeed: 0.002,
        doorStatus: {
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3,
            Destroyed: 4,
            NoPower: 5
        },
        operation: {
            furniture: {
                Open: 1,
                Close: 2,
                Key: 3,
                Search: 4
            },
            door: {
                Open: 1,
                Close: 2,
                Locked: 3,
                Unlock: 4,
                Block: 5,
                Destroy: 6,
                Check: 7
            },
            generator: {
                Fix: 1
            },
            body: {
                Search: 1
            }
        }
    };
    /**
     * Setup camera in three.js
     * @param {game entity} entity - Game entity
     */
    var Camera = function (entity, scene_in, renderer_in) {
        // data ----------------------------------------------
        var that = this,
            tex = {},
            root = entity.root,
            sprites = {},
            spritesInteraction = {
                normal: {
                    furniture: {},
                    door: {},
                    body: {},
                    generator: {}
                },
                highlight: {
                    furniture: {},
                    door: {},
                    body: {},
                    generator: {}
                }
            },
            msg = null,

            // cache
            qte = null,
            interactionIcon = {},
            highLightIcon = null,
            hp_cache = 0,
            doorIcon = {};

        var textureLoader = new THREE.TextureLoader();

        this.scene = scene_in;
        this.renderer = renderer_in
        this.camera = null;
        this.cameraOrtho = null;
        this.sceneOrtho = null;
        this.sceneEffort = null;
        this.character = -1;
        this.width = -1;
        this.height = -1;
        this.x = -1;
        this.y = -1;
        this.color = null;

        // public method -------------------------------------------------
        this.setup = function (character, x, y, w, h) {
            // data
            this.character = character;
            this.width = w;
            this.height = h;
            this.x = x;
            this.y = y;
            this.color = hexToRgb(character.color);

            //camera
            that.camera = new THREE.PerspectiveCamera(45, that.width / that.height, .1, 40 * GridSize);
            if (that.character.role === Data.character.type.ghost)
                that.camera.position.y = 30 * GridSize;
            else
                that.camera.position.y = 22 * GridSize;
            that.camera.position.x = 0;
            that.camera.position.z = 0;
            that.camera.lookAt(new THREE.Vector3(0, 0, 0));
            that.camera.rotation.z = 0;
            that.camera.rotationAutoUpdate = false;

            that.sceneOrtho = new THREE.Scene();
            that.sceneEffort = new THREE.Scene();
            that.cameraOrtho = new THREE.OrthographicCamera(-that.width / 2, that.width / 2, that.height / 2, -that.height / 2, 1, 20);
            that.cameraOrtho.position.z = 10;

            createFrame();
            createPlayerInfo();
            setupQTE();
        };

        this.resize = function (x, y, w, h) {
            this.width = w;
            this.height = h;
            this.x = x;
            this.y = y;

            // edge 
            //resizeEdge();

            //danger
            resizeDanger();

            // border
            sprites["top"].position.set(0, that.height / 2, 8);
            sprites["top"].scale.set(that.width, 2, 1.0);

            sprites["right"].position.set(that.width / 2, 0, 8);
            sprites["right"].scale.set(2, that.height, 1.0);

            sprites["bottom"].position.set(0, -that.height / 2, 8);
            sprites["bottom"].scale.set(that.width, 2, 1.0);

            sprites["left"].position.set(-that.width / 2, 0, 8);
            sprites["left"].scale.set(1, that.height, 1.0);

            // endurance
            if (sprites["enduranceBar"]) {
                sprites["enduranceBar"].position.set(-that.width / 2, -50 + that.height / 2, 6);
            }

            // camera
            that.camera.aspect = that.width / that.height;
            that.camera.updateProjectionMatrix();
            that.cameraOrtho.left = -that.width / 2;
            that.cameraOrtho.right = that.width / 2;
            that.cameraOrtho.top = that.height / 2;
            that.cameraOrtho.bottom = -that.height / 2;
            that.cameraOrtho.updateProjectionMatrix();
        };

        this.render = function () {
            var x = that.character.x;
            var y = that.character.y;

            // update visible
            for (var i = 0, l = entity.characters.length; i < l; i++) {
                entity.characters[i].updateVisible(that.character.visibleCharacter[i], that.character === entity.characters[i]);
            }

            // update camera
            that.camera.position.x = x;
            that.camera.position.z = y + 1;

            //if (that.character.mesh !== null) {
            //    //that.camera.lookAt(that.character.mesh.position);
            //}

            if (that.character.isDead) {
                showDeadScreen();
                updateDanger();
            } else if (that.character.isWin) {
                //showEscapeScreen();
            } else {
                // update edge
                //updateEdge();
                updateDanger();
                // update sprite
                updatePlayerInfo();
                // update effort
                updateInteractionIcon();
                updateMessage();
                updateDoor();
                updateNoise();
                updateQTE();
            }

            // fog
            updateFog(x, y);

            // render
            that.renderer.setViewport(that.x, that.y, that.width, that.height);
            that.renderer.render(that.scene, that.camera);
            that.renderer.render(that.sceneEffort, that.camera);
            that.renderer.render(that.sceneOrtho, that.cameraOrtho);
        };

        // private method -------------------------------------------------

        // Frame ----------------------------------------------------
        var createFrame = function () {
            sprites = {};

            // fog
            sprites["fog"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["fog"] }));
            if (that.character.role === Data.character.type.ghost)
                sprites["fog"].scale.set((_Data.fogRange+7) * GridSize, (_Data.fogRange+7) * GridSize, 1.0);
            else
                sprites["fog"].scale.set(_Data.fogRange * GridSize, _Data.fogRange * GridSize, 1.0);
            sprites["fog"].material.transparent = true;
            sprites["fog"].material.opacity = 0.95;
            that.sceneEffort.add(sprites["fog"]);

            // border
            var border_mat = new THREE.SpriteMaterial({ color: 0x222222 });
            sprites["top"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["top"]);

            sprites["right"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["right"]);

            sprites["bottom"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["bottom"]);

            sprites["left"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["left"]);

            // danger
            createDanger();

            that.resize(that.x, that.y, that.width, that.height);
        };

        // Endurance ------------------------------------------------
        var createPlayerInfo = function () {
            sprites["player"] = {};
            sprites["player"]['wrap'] = new THREE.Object3D();
            sprites["player"]['wrap'].position.set(-that.width / 2 + 10, that.height / 2 - 45, 3.0);

            // name
            sprites["player"]["name"] = makeTextSprite(that.character.name, { fontsize: 32, color: { r: 255, g: 255, b: 255, a: 1.0 }, align: "left", width: 160, height: 40, fontface: "Poor Richard, Calibri, Arial" });
            sprites["player"]["name"].position.set(206, -2, 3.0);
            sprites["player"]['wrap'].add(sprites["player"]["name"]);

            // bg
            sprites["player"]["bg"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["player"]["bg"] }));
            sprites["player"]["bg"].scale.set(300, 120, 1.0);
            sprites["player"]["bg"].position.set(150, 60, 1.0);
            sprites["player"]["bg"].material.transparent = true;
            sprites["player"]['wrap'].add(sprites["player"]["bg"]);

            sprites["player"]["bg"].position.set(84 - that.width / 2, -32 + that.height / 2, 6);

            // portrait
            tex["player"]['portriat'] = textureLoader.load(root + Data.character.path + that.character.portrait);
            sprites["player"]["portriat"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["player"]["portriat"] }));
            sprites["player"]["portriat"].scale.set(100, 100, 1.0);
            sprites["player"]["portriat"].position.set(70, 20, 3.0);
            sprites["player"]["portriat"].material.transparent = true;
            sprites["player"]['wrap'].add(sprites["player"]["portriat"]);

            // hp
            sprites["player"]["hp"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["player"]["hp"][that.character.hp] }));
            sprites["player"]["hp"].scale.set(100, 100, 1.0);
            sprites["player"]["hp"].position.set(70, 20, 2.0);
            sprites["player"]["hp"].material.transparent = true;
            sprites["player"]['wrap'].add(sprites["player"]["hp"]);

            // endurance
            sprites["player"]["endurance"] = {};
            sprites["player"]["endurance"]['wrap'] = new THREE.Object3D();
            sprites["player"]["endurance"]["wrap"].position.set(105, 10, 0.0);
            that.sceneOrtho.add(sprites["player"]['wrap']);

            sprites["player"]["endurance"]["bg"] = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x111111 }));
            sprites["player"]["endurance"]["bg"].scale.set(120, 8, 1.0);
            sprites["player"]["endurance"]["bg"].position.set(80, 9, 1.0);
            sprites["player"]["endurance"]['wrap'].add(sprites["player"]["endurance"]["bg"]);

            sprites["player"]["endurance"]["val"] = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x333333 }));
            sprites["player"]["endurance"]["val"].scale.set(120, 8, 1.0);
            sprites["player"]["endurance"]["val"].position.set(80, 9, 2.0);
            sprites["player"]["endurance"]['wrap'].add(sprites["player"]["endurance"]["val"]);

            sprites["player"]["endurance"]["mark"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["player"]["endurance"] }));
            sprites["player"]["endurance"]["mark"].scale.set(128, 18, 1.0);
            sprites["player"]["endurance"]["mark"].position.set(80, 9, 3.0);
            sprites["player"]["endurance"]['wrap'].add(sprites["player"]["endurance"]["mark"]);

            sprites["player"]['wrap'].add(sprites["player"]["endurance"]["wrap"]);

        };

        var updatePlayerInfo = function () {
            if (!sprites.hasOwnProperty('player')) return;
            var val = that.character.endurance;
            var w = (val / that.character.maxEndurance);
            sprites["player"]["endurance"]["val"].scale.x = w * 120;
            sprites["player"]["endurance"]["val"].position.x = w * 60+20;

            if (val >= that.character.maxEndurance) {
                sprites["player"]["endurance"]["val"].material.color.r
                 = sprites["player"]["endurance"]["val"].material.color.b
                 = sprites["player"]["endurance"]["val"].material.color.g = 1;
            } else {
                sprites["player"]["endurance"]["val"].material.color.r
                 = sprites["player"]["endurance"]["val"].material.color.b
                 = sprites["player"]["endurance"]["val"].material.color.g = 0.4 + 0.4 * w;
            }

            var hp = that.character.hp;
            if (hp_cache !== hp) {
                hp_cache = hp;
                sprites["player"]["hp"].material.map = tex["player"]["hp"][hp_cache];
                sprites["player"]["hp"].material.needsUpdate = true;
            }            
        };

        // Noise -----------------------------------------------------
        var updateNoise = function () {
            var newNoiseDat = entity.noise.getNoiseDat();
            if (newNoiseDat !== null) {
                for (var i = 0; i < newNoiseDat.length; i++) {
                    createNoise(newNoiseDat[i]);
                }
            }
        };

        var createNoise = function (noiseDat) {
            var _tex = tex['noise'][noiseDat[1]];
            if (_tex === undefined || _tex === null) return null;

            var mat = new THREE.SpriteMaterial({
                map: _tex,
                transparent: true,
                depthTest: false
            });
            mat.opacity = 1;

            var spr = new THREE.Sprite(mat);
            
            spr.position.set((noiseDat[2]-entity.map.width / 2) * GridSize, GridSize + 1, (noiseDat[3]-entity.map.height / 2) * GridSize);
            spr.scale.set(GridSize * 3, GridSize * 3, 1.0);

            var start_opacity = 0;
            that.sceneEffort.add(spr);

            var tween_show = new TWEEN.Tween({ t: 100 }).to({ t: 0 }, 2000)
                        .onStart(function () {
                            that.sceneEffort.add(spr);
                        }).onUpdate(function () {
                            mat.opacity = this.t * 0.01;
                        }).onComplete(function () {
                            that.sceneEffort.remove(spr);
                        });
            tween_show.start();
        };

        // Interaction icon ------------------------------------------
        var updateInteractionIcon = function () {
            if (that.character.visibleObject === null) return;
            var highLightObj = null;

            var visibleObject = {
                furniture: {},      // {id : op}
                door: {},
                body: {},
                generator: {}
            };
            for (var i = 0; i < that.character.visibleObject.length; i++) {
                visibleObject[that.character.visibleObject[i].type][that.character.visibleObject[i].id] = that.character.visibleObject[i].op[0];
            }

            if (that.character.longInteractionObj !== null) {
                highLightObj = {};
                highLightObj['type'] = that.character.longInteractionObj.type;
                highLightObj['id'] = that.character.longInteractionObj.id;
                highLightObj['op'] = that.character.longInteractionObj.op[1];
                if (visibleObject[highLightObj['type']].hasOwnProperty(highLightObj['id'])) delete (visibleObject[highLightObj['type']])[(highLightObj['id'])];
            } else if (that.character.accessObject !== null) {
                highLightObj = {};
                highLightObj['type'] = that.character.accessObject.type;
                highLightObj['id'] = that.character.accessObject.id;
                highLightObj['op'] = that.character.accessObject.op[0];
                if (visibleObject[highLightObj['type']].hasOwnProperty(highLightObj['id'])) delete (visibleObject[highLightObj['type']])[(highLightObj['id'])];
            }

            // normal
            for (var t in interactionIcon) {
                for (var id in interactionIcon[t]) {
                    if (!visibleObject[t].hasOwnProperty(id) || visibleObject[t][id] !== interactionIcon[t][id]) {
                        hideInteraction_normal(t, id, interactionIcon[t][id]);
                    }
                }
            }

            for (var t in visibleObject) {
                for (var id in visibleObject[t]) {
                    if (!interactionIcon.hasOwnProperty(t) || visibleObject[t][id] !== interactionIcon[t][id]) {
                        showInteraction_normal(t, id, visibleObject[t][id]);
                    }
                }
            }
            interactionIcon = visibleObject;

            // highlight
            if (highLightIcon !== null) {
                if (highLightObj === null || highLightIcon.type !== highLightObj.type || highLightIcon.id !== highLightObj.id || highLightIcon.op !== highLightObj.op) {
                    hideInteraction_highlight(highLightIcon.type, highLightIcon.id, highLightIcon.op);
                }
            }
            if (highLightObj !== null) {
                if (highLightIcon === null || highLightIcon.type !== highLightObj.type || highLightIcon.id !== highLightObj.id || highLightIcon.op !== highLightObj.op) {
                    showInteraction_highlight(highLightObj.type, highLightObj.id, highLightObj.op);
                }
            }
            highLightIcon = highLightObj;
        };

        // interation highlight
        var hideInteraction_highlight = function (objType, objId, objOp) {
            if (spritesInteraction.highlight[objType][objId] === undefined || spritesInteraction.highlight[objType][objId] === null
                || spritesInteraction.highlight[objType][objId][objOp] === undefined || spritesInteraction.highlight[objType][objId][objOp] === null) return;
            var sprPkg = spritesInteraction.highlight[objType][objId][objOp];

            if (sprPkg.tween !== undefined && sprPkg.tween !== null) sprPkg.tween.stop();
            var start_opacity = 0,
                spr = sprPkg.icon,
                mat = spr.material;
            var tween_hide = new TWEEN.Tween({ t: 10 }).to({ t: 0 }, 100)
                        .onUpdate(function () {
                            mat.opacity = this.t * 0.08;
                        }).onComplete(function () {
                            that.sceneEffort.remove(spr);
                        });
            sprPkg.tween = tween_hide;
            tween_hide.start();
        };

        var showInteraction_highlight = function (objType, objId, objOp) {
            if (!spritesInteraction.highlight[objType].hasOwnProperty(objId)) spritesInteraction.highlight[objType][objId] = {};
            if (!spritesInteraction.highlight[objType][objId].hasOwnProperty(objOp) || spritesInteraction.highlight[objType][objId][objOp] === null)
                spritesInteraction.highlight[objType][objId][objOp] = createInteractionIcon(objType, objId, objOp, true);
            var sprPkg = spritesInteraction.highlight[objType][objId][objOp];
            if (sprPkg === null) return;

            if (sprPkg.tween !== undefined && sprPkg.tween !== null) sprPkg.tween.stop();
            var start_opacity = 0,
                start_z = entity.map.objectPos[objType][objId][1] - GridSize / 4,
                scale_y = GridSize * 2,
                spr = sprPkg.icon,
                mat = spr.material;

            var tween_show = new TWEEN.Tween({ t: 0 }).to({ t: 10 }, 100)
                        .onStart(function () {
                            that.sceneEffort.add(spr);
                        }).onUpdate(function () {
                            mat.opacity = this.t * 0.08;
                        });
            sprPkg.tween = tween_show;
            tween_show.start();
        };

        // interation normal
        var hideInteraction_normal = function (objType, objId, objOp) {
            if (spritesInteraction.normal[objType][objId] === undefined || spritesInteraction.normal[objType][objId] === null
                || spritesInteraction.normal[objType][objId][objOp] === undefined || spritesInteraction.normal[objType][objId][objOp] === null) return;
            var sprPkg = spritesInteraction.normal[objType][objId][objOp];

            if (sprPkg.tween !== undefined && sprPkg.tween !== null) sprPkg.tween.stop();
            var start_opacity = 0,
                scale_y = GridSize * 2,
                spr = sprPkg.icon,
                mat = spr.material;
            var tween_hide = new TWEEN.Tween({ t: 10 }).to({ t: 0 }, 400)
                        .onUpdate(function () {
                            mat.opacity = this.t * 0.04;
                        }).onComplete(function () {
                            that.sceneEffort.remove(spr);
                        });
            tween_hide.start();
            sprPkg.tween = tween_hide;
        };

        var showInteraction_normal = function (objType, objId, objOp) {
            if (!spritesInteraction.normal[objType].hasOwnProperty(objId)) spritesInteraction.normal[objType][objId] = {};
            if (!spritesInteraction.normal[objType][objId].hasOwnProperty(objOp) || spritesInteraction.normal[objType][objId][objOp] === null)
                spritesInteraction.normal[objType][objId][objOp] = createInteractionIcon(objType, objId, objOp, false);
            var sprPkg = spritesInteraction.normal[objType][objId][objOp];
            if (sprPkg === null) return;

            if (sprPkg.tween !== undefined && sprPkg.tween !== null) sprPkg.tween.stop();
            var start_opacity = 0,
                start_z = entity.map.objectPos[objType][objId][1] - GridSize / 4,
                scale_y = GridSize * 2,
                spr = sprPkg.icon,
                mat = spr.material;

            var tween_show = new TWEEN.Tween({ t: 0 }).to({ t: 10 }, 150)
                        .onStart(function () {
                            that.sceneEffort.add(spr);
                        }).onUpdate(function () {
                            mat.opacity = this.t * 0.04;
                            spr.scale.y = scale_y / 2 + scale_y * this.t / 20;
                            spr.position.z = start_z - this.t * GridSize / 20;
                        });
            tween_show.start();
            sprPkg.tween = tween_show;
        };

        var createInteractionIcon = function (objType, objId, objOp, isHighlight) {
            var tex1 = isHighlight ? tex['interaction']['highlight'][objType][objOp] : tex['interaction']['normal'][objType][objOp];
            if (tex1 === undefined || tex1 === null) return null;

            var mat = new THREE.SpriteMaterial({
                map: tex1,
                transparent: true,
                depthTest: false
            });
            mat.opacity = 0;

            var spr = new THREE.Sprite(mat);
            var pos = entity.map.objectPos[objType][objId];

            spr.position.set(pos[0], GridSize, pos[1] - 3 * GridSize / 4);
            spr.scale.set(GridSize * 2, GridSize * 2, 1.0);
            if (isHighlight) spr.position.y += 0.1;

            return {
                icon: spr,
                tween: null
            };
        };

        // Message ---------------------------------------------------
        var updateMessage = function () {
            if (that.character.message === undefined || that.character.message === null) return;
            showMessage(that.character.message);
            that.character.message = null;
        };

        var showMessage = function (content) {
            var spr = makeTextSprite(content, { fontsize: 42, color: { r: 255, g: 255, b: 255, a: 1.0 }, align: "center", fontface: "Poor Richard, Calibri, Arial" });
            that.sceneOrtho.add(spr);
            spr.position.set(0, that.height / 4, 1);

            if (msg !== null) {
                msg.tween.stop();
                that.sceneOrtho.remove(msg.spr);
            }
            var tween = new TWEEN.Tween(spr.material).to({ opacity: 0 }, 500)
                        .onComplete(function () {
                            that.sceneOrtho.remove(spr);
                        });
            tween.delay(3000);
            tween.start();
            msg = {
                tween: tween,
                spr: spr
            }
        };

        // Door ------------------------------------------------------
        var updateDoor = function () {
            var d = that.character.lockDoor;
            var i
            for (var i in doorIcon) {
                if (!d.hasOwnProperty(i) || !entity.map.isDoorLock(i)) {
                    removeDoorIcon(i);
                    delete doorIcon[i];
                    continue;
                }
                var idx = d[i] ? 0 : 1;
                if (!doorIcon[i].hasOwnProperty(idx)) {
                    removeDoorIcon(i, 1 - idx);
                    delete doorIcon[i][1 - idx];
                }
            }

            for (var i in d) {
                if (!entity.map.isDoorLock(i)) continue;
                if (!doorIcon.hasOwnProperty(i)) doorIcon[i] = {};
                var idx = d[i] ? 0 : 1;
                if (!doorIcon[i].hasOwnProperty(idx)) {
                    doorIcon[i][idx] = (d[i] ? createDoorLock(i) : createDoorUnlock(i));
                }
            }
        };

        var createDoorLock = function (idx) {
            var tex1 = tex['interaction-lock'];

            var mat = new THREE.SpriteMaterial({
                map: tex1,
                transparent: true,
                depthTest: false
            });
            mat.opacity = 0.5;

            var spr = new THREE.Sprite(mat);
            var pos = entity.map.doorPos[idx];

            spr.position.set(pos[0], GridSize, pos[1]);
            spr.scale.set(GridSize * 2, GridSize * 2, 1.0);
            that.sceneEffort.add(spr);

            return spr;
        };

        var createDoorUnlock = function (idx) {
            var tex1 = tex['interaction-unlock'];

            var mat = new THREE.SpriteMaterial({
                map: tex1,
                transparent: true,
                depthTest: false
            });
            mat.opacity = 0.5;

            var spr = new THREE.Sprite(mat);
            var pos = entity.map.doorPos[idx];

            spr.position.set(pos[0], GridSize, pos[1]);
            spr.scale.set(GridSize * 2, GridSize * 2, 1.0);
            that.sceneEffort.add(spr);

            return spr;
        };

        var removeDoorIcon = function (idx) {
            if (doorIcon[idx][0] !== undefined || doorIcon[idx][0] !== null)
                that.sceneEffort.remove(doorIcon[idx][0]);
            if (doorIcon[idx][1] !== undefined || doorIcon[idx][1] !== null)
                that.sceneEffort.remove(doorIcon[idx][1]);
        };

        // Fog -------------------------------------------------------
        var updateFog = function (x, y) {
            var d = that.character.danger;
            //sprites["fog"].material.color.g = sprites["fog"].material.color.b = 1 - 0.5 * d;
            sprites["fog"].position.set(x, 3 * GridSize - 0.1, y);
        };

        // Danger -----------------------------------------------------
        var createDanger = function (layer) {
            sprites["danger"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["danger"] }));
            sprites["danger"].material.transparent = true;
            sprites["danger"].material.opacity = 0;
            sprites["danger"].position.set(0, 0, 1);
            that.sceneOrtho.add(sprites["danger"]);
        };
        var _dangerCache = 0;
        var resizeDanger = function () {
            if (sprites["danger"] == null) return;
            sprites["danger"].scale.set(that.width, that.height, 1.0);
        };
        var updateDanger = function () {
            if (_dangerCache === that.character.danger) return;
            var d = that.character.danger;

            if (Math.abs(_dangerCache - d) <= _Data.dangerSpeed) {
                _dangerCache = d;
            }
            else if (_dangerCache < d) {
                _dangerCache += _Data.dangerSpeed;
            } else if (_dangerCache > d) {
                _dangerCache -= _Data.dangerSpeed;
            }
            sprites["danger"].material.opacity = _dangerCache;
        };

        // Edges -----------------------------------------------------
        var resizeEdge = function () {
            if (sprites['edges'] !== undefined && sprites['edges'] !== null) that.sceneOrtho.remove(sprites["edges"]);
            sprites['edges'] = createEdges();
            sprites["edges"].position.set(0, 0, 7);
            that.sceneOrtho.add(sprites["edges"]);
        };

        var updateEdge = function () {
            var d = that.character.danger;
            var d2 = sprites["edges"].material.opacity;
            if (Math.abs(d2 - d) <= _Data.dangerSpeed) {
                d2 = d;
            }
            else if (d2 < d) {
                d2 += _Data.dangerSpeed;
            } else if (d2 > d) {
                d2 -= _Data.dangerSpeed;
            }
            sprites["edges"].material.opacity = d2;
        };

        // QTE -------------------------------------------------------
        var setupQTE = function(){
            sprites["qte"] = {};
        };

        var updateQTE = function () {
            var q = entity.quickTimeEvent.list[that.character.id];
            if (qte !== null && (q == null || q.name !== qte.name)) {
                hideQTE();
            }

            if (q == null) {
                return;
            }
            else if (qte === null) {
                showQTE(q);
            } else {
                increaseQTE(q);
            }
        };

        var showQTE = function (qte_data) {
            if (!sprites["qte"] .hasOwnProperty(qte_data.name)){
                var s = {};
                s['container'] = new THREE.Group();
                s['container'].position.set(0,0,5);

                var spr = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: tex['qte']['circle'][qte_data.name],
                    transparent: true
                }));
                spr.scale.set(128, 128, 1);
                spr.position.set(0,0,1);
                s['container'].add(spr);
                s['circle'] = spr;

                var spr = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: tex['qte']['pointer'][qte_data.name],
                    transparent: true
                }));
                spr.scale.set(128, 128, 1);
                spr.position.set(0, 0, 2);
                s['container'].add(spr);
                s['pointer'] = spr;

                var spr = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: tex['qte']['tip'][qte_data.name],
                    transparent: true
                }));
                spr.scale.set(128, 128, 1);
                spr.position.set(0,0,3);
                s['container'].add(spr);
                s['tip'] = spr;


                sprites["qte"][qte_data.name] = s;
            }

            var t = sprites["qte"][qte_data.name];
            t['container'].position.y = -that.height / 6;
            t['circle'].material.rotation = -(qte_data.start/qte_data.duration)*Math.PI*2;
            t['pointer'].material.rotation = 0;
            that.sceneOrtho.add(t['container']);
            
            qte = {
                name: qte_data.name,
                spr: t
            };
        };

        var increaseQTE = function (qte_data) {
            qte.spr['pointer'].material.rotation = -(qte_data.current / qte_data.duration) * Math.PI * 2;
        };

        var hideQTE = function () {
            that.sceneOrtho.remove(qte.spr['container']);
            qte = null;
        };

        // Helper ----------------------------------------------------
        var _helper_canvas = document.createElement('canvas');
        var _helper_canvas_ctx = _helper_canvas.getContext('2d');
        var makeTextSprite = function (message, parameters) {
            _helper_canvas_ctx.clearRect(0, 0, _helper_canvas.width, _helper_canvas.height);
            if (parameters === undefined) parameters = {};

            var fontface = parameters.hasOwnProperty("fontface") ?
                parameters["fontface"] : "Arial";

            var fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters["fontsize"] : 18;

            var color = parameters.hasOwnProperty("color") ?
                parameters["color"] : { r: 255, g: 255, b: 255, a: 1.0 };

            var align = parameters.hasOwnProperty("align") ?
                parameters["align"] : "center";

            // set font parameter
            _helper_canvas_ctx.font = fontsize + "px " + fontface;

            // measure text
            var metrics = _helper_canvas_ctx.measureText(message);
            var width = parameters.hasOwnProperty("width") ?
                parameters["width"] * 2 : Math.ceil(metrics.width);
            var height = parameters.hasOwnProperty("height") ?
                parameters["height"] * 2 : fontsize;

            _helper_canvas.width = width;
            _helper_canvas.height = height;

            // text 
            _helper_canvas_ctx.textBaseline = "bottom";
            _helper_canvas_ctx.font = fontsize + "px " + fontface;
            _helper_canvas_ctx.shadowColor = "black";
            _helper_canvas_ctx.shadowBlur = 5;
            _helper_canvas_ctx.fillStyle = "rgba(" + color.r + "," + color.g + ","
                                          + color.b + "," + color.a + ")";
            _helper_canvas_ctx.fillText(message, 0, (_helper_canvas.height + fontsize) / 2);

            // canvas contents will be used for a texture
            var texture = new THREE.Texture(_helper_canvas);
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(width / 2, height / 2, 1.0);
            return sprite;
        }

        var createEdges = function () {
            var w = that.width;
            var h = that.height;
            var _helper_canvas2 = document.createElement('canvas');
            var _helper_canvas_ctx2 = _helper_canvas2.getContext('2d');
            _helper_canvas2.width = w;
            _helper_canvas2.height = h;
            //
            _helper_canvas_ctx2.fillStyle = "rgba(255,40,40,0.03)";
            _helper_canvas_ctx2.fillRect(0, 0, w, h);
            //
            _helper_canvas_ctx2.strokeStyle = 'red';
            _helper_canvas_ctx2.lineWidth = 4;
            //
            _helper_canvas_ctx2.shadowColor = 'red';
            _helper_canvas_ctx2.shadowBlur = Math.min(w,h)/3;
            //
            _helper_canvas_ctx2.beginPath();
            _helper_canvas_ctx2.rect(0, 0, w, h);
            _helper_canvas_ctx2.clip();
            _helper_canvas_ctx2.stroke();

            var texture = new THREE.Texture(_helper_canvas2);
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            spriteMaterial.transparent = true;
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(w, h, 1.0);
            return sprite;
        };

        var hexToRgb = function (hex) {
            var result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        // dead -----------------------------------------------------
        var showDeadScreen = function () {
            if (sprites["deadScreen"] !== undefined && sprites["deadScreen"] !== null) return;
            sprites["deadScreen"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["deadScreen"] }));
            sprites["deadScreen"].scale.set(512, 512, 1.0);
            sprites["deadScreen"].material.transparent = true;
            sprites["deadScreen"].material.opacity = 0;
            sprites["deadScreen"].position.set(0, 0, 9);
            that.sceneOrtho.add(sprites["deadScreen"]);
            var mat = sprites["deadScreen"].material;
            new TWEEN.Tween({ t: 0 }).to({ t: 20 }, 500)
                .onUpdate(function () {
                    mat.opacity = this.t * 0.04;
                })
                .start();
        };

        var showEscapeScreen = function () {
            if (sprites["escapeScreen"] !== undefined && sprites["escapeScreen"] !== null) return;
            sprites["escapeScreen"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["escapeScreen"] }));
            sprites["escapeScreen"].scale.set(512, 512, 1.0);
            sprites["escapeScreen"].material.transparent = true;
            sprites["escapeScreen"].material.opacity = 0;
            sprites["escapeScreen"].position.set(0, 0, 9);
            that.sceneOrtho.add(sprites["escapeScreen"]);
            var mat = sprites["escapeScreen"].material;
            new TWEEN.Tween({ t: 0 }).to({ t: 20 }, 500)
                .onUpdate(function () {
                    mat.opacity = this.t * 0.04;
                })
                .start();
        };

        // setup -----------------------------------------------------
        var _setupTex = function () {
            tex = {};
            var path = root + Data.files.path[Data.categoryName.sprite];

            // texture loader -------------------------------------------------------------------------------------------
            tex['fog'] = textureLoader.load(path + 'fog.png');
            tex['deadScreen'] = textureLoader.load(path + 'DeadScreen.png');
            tex['escapeScreen'] = textureLoader.load(path + 'EscapeScreen.png');
            tex['danger'] = textureLoader.load(path + 'danger.png');
            tex['interaction'] = {
                'normal': {
                    'furniture': {
                    },
                    'door': {
                    },
                    'body': {
                    },
                    'generator': {
                    }
                },
                'highlight': {
                    'furniture': {
                    },
                    'door': {
                    },
                    'body': {
                    },
                    'generator': {
                    }
                }
            };
            tex['noise'] = {};
            tex['qte'] = {
                'circle': {},
                'pointer': {},
                'tip': {}
            };

            tex['player'] = {};

            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Open] = textureLoader.load(path + 'interaction.open.png');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Close] = textureLoader.load(path + 'interaction.close.png');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Key] = textureLoader.load(path + 'interaction.key.png');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Search] = textureLoader.load(path + 'interaction.search.png');
            tex['interaction']['normal']['body'][_Data.operation.body.Search] = textureLoader.load(path + 'interaction.search.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Open] = textureLoader.load(path + 'interaction.door.open.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Close] = textureLoader.load(path + 'interaction.door.close.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Destroy] = textureLoader.load(path + 'interaction.destroy.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Locked] = textureLoader.load(path + 'interaction.lock.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Unlock] = textureLoader.load(path + 'interaction.unlock.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Check] = textureLoader.load(path + 'interaction.search.png');
            tex['interaction']['normal']['generator'][_Data.operation.generator.Fix] = textureLoader.load(path + 'interaction.fix.png');
            //tex['interaction']['normal']['door'][_Data.operation.door.Block] = textureLoader.load(path + 'interaction.block.png');

            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Open] = textureLoader.load(path + 'interaction.open-2.png');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Close] = textureLoader.load(path + 'interaction.close-2.png');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Key] = textureLoader.load(path + 'interaction.key-2.png');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Search] = textureLoader.load(path + 'interaction.search-2.png');
            tex['interaction']['highlight']['body'][_Data.operation.body.Search] = textureLoader.load(path + 'interaction.search-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Open] = textureLoader.load(path + 'interaction.door.open-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Close] = textureLoader.load(path + 'interaction.door.close-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Destroy] = textureLoader.load(path + 'interaction.destroy-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Locked] = textureLoader.load(path + 'interaction.lock-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Unlock] = textureLoader.load(path + 'interaction.unlock-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Check] = textureLoader.load(path + 'interaction.search-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Block] = textureLoader.load(path + 'interaction.door.block-2.png');
            tex['interaction']['highlight']['generator'][_Data.operation.generator.Fix] = textureLoader.load(path + 'interaction.fix-2.png');

            tex['noise'][RENDERER.Noise.Data.Name.Key] = textureLoader.load(path + 'noise.bg.png');
            tex['noise'][RENDERER.Noise.Data.Name.Door] = textureLoader.load(path + 'noise.door.png');
            tex['noise'][RENDERER.Noise.Data.Name.Touch] = textureLoader.load(path + 'noise.touch.png');
            tex['noise'][RENDERER.Noise.Data.Name.Operation] = textureLoader.load(path + 'noise.operation.png');
            //tex['enduranceBarBase'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'EnduranceBar.png');

            tex['qte']['circle'][RENDERER.QuickTimeEvent.Data.Name.Generator] = textureLoader.load(path + 'QTE.generator.circle.png');
            tex['qte']['pointer'][RENDERER.QuickTimeEvent.Data.Name.Generator] = textureLoader.load(path + 'QTE.generator.pointer.png');
            tex['qte']['tip'][RENDERER.QuickTimeEvent.Data.Name.Generator] = textureLoader.load(path + 'QTE.generator.tip.png');

            tex['player']['bg'] = textureLoader.load(path + 'player.bg.png');
            tex['player']['endurance'] = textureLoader.load(path + 'player.endurance.png');
            tex['player']['hp'] = [];
            tex['player']['hp'][0] = textureLoader.load(path + 'player.hp.0.png');
            tex['player']['hp'][1] = textureLoader.load(path + 'player.hp.1.png');
            tex['player']['hp'][2] = textureLoader.load(path + 'player.hp.2.png');

        };

        var _init = function () {
            _setupTex();
        };

        _init();
    };

    RENDERER.Camera = Camera;
})(window.Rendxx.Game.Ghost.Renderer);