window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Camera for each player 
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = Data.grid.size;
    var _Data = {
        fogRange: 34,
        enduranceBarWidth: 100,
        enduranceBarHeight: 2,
        furnitureOperation: {
            Open: 0,
            Key: 1,
            Close: 2
        },
        doorStatus: {
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3
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
                Block: 5
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
                    body: {}
                },
                highlight: {
                    furniture: {},
                    door: {},
                    body: {}
                }
            },
            msg = null,

            // cache
            interactionIcon = {},
            highLightIcon = null,
            doorIcon = {};

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
                that.camera.position.y = 20 * GridSize;
            that.camera.position.x = 0;
            that.camera.position.z = 0;
            that.camera.lookAt(new THREE.Vector3(0, 0, 0));
            that.camera.rotation.z = 0;
            that.camera.rotationAutoUpdate = false;

            that.sceneOrtho = new THREE.Scene();
            that.sceneEffort = new THREE.Scene();
            that.cameraOrtho = new THREE.OrthographicCamera(-that.width / 2, that.width / 2, that.height / 2, -that.height / 2, 1, 10);
            that.cameraOrtho.position.z = 10;

            createFrame();
            createEnduranceBar();
        };

        this.resize = function (x, y, w, h) {
            this.width = w;
            this.height = h;
            this.x = x;
            this.y = y;

            // edge 
            resizeEdge();

            // name
            sprites["name"].position.set(84 - that.width / 2, -32 + that.height / 2, 6);

            // name deco
            sprites["nameDeco"].position.set(60 - that.width / 2, -30 + that.height / 2, 5);

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
            if (sprites["enduranceBar"]) sprites["enduranceBar"].position.set(-that.width / 2, -50 + that.height / 2, 6);

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

            // update camera
            that.camera.position.x = x;
            that.camera.position.z = y + 1;

            //if (that.character.mesh !== null) {
            //    //that.camera.lookAt(that.character.mesh.position);
            //}

            if (that.character.isDead) {
                showDeadScreen();
            } else if (that.character.isWin) {
                showEscapeScreen();
            } else {
                // update edge
                updateEdge();
                // update sprite
                updateEnduranceBar();
                // update effort
                updateInteractionIcon();
                updateMessage();
                updateDoor();
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

            // name
            sprites["name"] = makeTextSprite(that.character.name, { fontsize: 32, color: { r: 255, g: 255, b: 255, a: 1.0 }, align: "left", width: 160, height: 40, fontface: "Poor Richard, Calibri, Arial" });
            that.sceneOrtho.add(sprites["name"]);

            // name deco
            sprites["nameDeco"] = new THREE.Sprite(new THREE.SpriteMaterial({ color: that.character.color, map: tex["nameDeco"] }));
            sprites["nameDeco"].scale.set(120, 30, 1.0);
            sprites["nameDeco"].material.transparent = true;
            sprites["nameDeco"].material.opacity = 0.8;
            that.sceneOrtho.add(sprites["nameDeco"]);

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

            that.resize(that.x, that.y, that.width, that.height);
        };

        // Endurance ------------------------------------------------
        var createEnduranceBar = function () {
            // endurance
            var mat = new THREE.SpriteMaterial({
                color: 0xcccccc,
                transparent: true
            });
            mat.opacity = 0.8;
            var spr = new THREE.Sprite(mat);
            spr.position.set(-that.width / 2, -50 + that.height / 2, 6);
            spr.scale.set(_Data.enduranceBarWidth * 2, _Data.enduranceBarHeight, 1.0);
            that.sceneOrtho.add(spr);

            sprites["enduranceBar"] = spr;

            // base
            var mat = new THREE.SpriteMaterial({
                color: 0x000000,
                transparent: true
            });
            mat.opacity = 0.6;
            var spr = new THREE.Sprite(mat);
            spr.position.set(-that.width / 2, -50 + that.height / 2, 1);
            spr.scale.set(2 + _Data.enduranceBarWidth * 2, 2 + _Data.enduranceBarHeight, 1.0);
            that.sceneOrtho.add(spr);

            sprites["enduranceBarBase"] = spr;
        };

        var updateEnduranceBar = function () {
            if (!sprites.hasOwnProperty('enduranceBar')) return;
            var val = that.character.endurance;
            var w = (val / that.character.maxEndurance);
            sprites["enduranceBar"].scale.x = w * _Data.enduranceBarWidth * 2;

            if (val >= that.character.maxEndurance) {
                sprites["enduranceBar"].material.color.b = 0.8;
                sprites["enduranceBar"].material.color.g = 0.8;
            } else {
                sprites["enduranceBar"].material.color.b = 0.8 * w;
                sprites["enduranceBar"].material.color.g = 0.8 * w;
            }
        };

        // Interaction icon ------------------------------------------
        var updateInteractionIcon = function () {
            if (that.character.visibleObject === null) return;
            var highLightObj = null;

            var visibleObject = {
                furniture: {},      // {id : op}
                door: {},
                body: {}
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
            sprites["fog"].material.color.g = sprites["fog"].material.color.b = 1 - 0.5 * d;
            sprites["fog"].position.set(x, 3 * GridSize - 0.1, y);
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
            sprites["edges"].material.opacity = d;
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

            //// texture loader -------------------------------------------------------------------------------------------
            //var textureLoader = new THREE.TextureLoader();
            //tex['fog'] = textureLoader.load(path + 'fog.png');
            //tex['nameDeco'] = textureLoader.load(path + 'name-deco-white.png');
            //tex['deadScreen'] = textureLoader.load(path + 'DeadScreen.png');
            //tex['escapeScreen'] = textureLoader.load(path + 'EscapeScreen.png');
            //tex['interaction'] = {
            //    'normal': {
            //        'furniture': {
            //        },
            //        'door': {
            //        },
            //        'body': {
            //        }
            //    },
            //    'highlight': {
            //        'furniture': {
            //        },
            //        'door': {
            //        },
            //        'body': {
            //        }
            //    }
            //};

            //tex['interaction']['normal']['furniture'][_Data.operation.furniture.Open] = textureLoader.load(path + 'interaction.open.png');
            //tex['interaction']['normal']['furniture'][_Data.operation.furniture.Close] = textureLoader.load(path + 'interaction.close.png');
            //tex['interaction']['normal']['furniture'][_Data.operation.furniture.Key] = textureLoader.load(path + 'interaction.key.png');
            //tex['interaction']['normal']['furniture'][_Data.operation.furniture.Search] = textureLoader.load(path + 'interaction.search.png');
            //tex['interaction']['normal']['body'][_Data.operation.body.Search] = textureLoader.load(path + 'interaction.search.png');
            //tex['interaction']['normal']['door'][_Data.operation.door.Open] = textureLoader.load(path + 'interaction.door.open.png');
            //tex['interaction']['normal']['door'][_Data.operation.door.Close] = textureLoader.load(path + 'interaction.door.close.png');
            //tex['interaction']['normal']['door'][_Data.operation.door.Locked] = textureLoader.load(path + 'interaction.lock.png');
            //tex['interaction']['normal']['door'][_Data.operation.door.Unlock] = textureLoader.load(path + 'interaction.unlock.png');
            ////tex['interaction']['normal']['door'][_Data.operation.door.Block] = textureLoader.load(path + 'interaction.block.png');

            //tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Open] = textureLoader.load(path + 'interaction.open-2.png');
            //tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Close] = textureLoader.load(path + 'interaction.close-2.png');
            //tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Key] = textureLoader.load(path + 'interaction.key-2.png');
            //tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Search] = textureLoader.load(path + 'interaction.search-2.png');
            //tex['interaction']['highlight']['body'][_Data.operation.body.Search] = textureLoader.load(path + 'interaction.search-2.png');
            //tex['interaction']['highlight']['door'][_Data.operation.door.Open] = textureLoader.load(path + 'interaction.door.open-2.png');
            //tex['interaction']['highlight']['door'][_Data.operation.door.Close] = textureLoader.load(path + 'interaction.door.close-2.png');
            //tex['interaction']['highlight']['door'][_Data.operation.door.Locked] = textureLoader.load(path + 'interaction.lock-2.png');
            //tex['interaction']['highlight']['door'][_Data.operation.door.Unlock] = textureLoader.load(path + 'interaction.unlock-2.png');
            //tex['interaction']['highlight']['door'][_Data.operation.door.Block] = textureLoader.load(path + 'interaction.door.block-2.png');

            ////tex['enduranceBarBase'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'EnduranceBar.png');


            // DDS Loader -------------------------------------------------------------------------------------------
            var ddsLoader = new THREE.DDSLoader();
            tex['fog'] = ddsLoader.load(path + 'fog.dds');
            tex['fog'].anisotropy = 4;
            tex['nameDeco'] = ddsLoader.load(path + 'name-deco-white.dds');
            tex['nameDeco'].anisotropy = 4;
            tex['deadScreen'] = ddsLoader.load(path + 'DeadScreen.dds');
            tex['deadScreen'].anisotropy = 4;
            tex['escapeScreen'] = ddsLoader.load(path + 'EscapeScreen.dds');
            tex['escapeScreen'].anisotropy = 4;

            tex['interaction'] = {
                'normal': {
                    'furniture': {
                    },
                    'door': {
                    },
                    'body': {
                    }
                },
                'highlight': {
                    'furniture': {
                    },
                    'door': {
                    },
                    'body': {
                    }
                }
            };

            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Open] = ddsLoader.load(path + 'interaction.open.dds');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Open].anisotropy = 4;
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Close] = ddsLoader.load(path + 'interaction.close.dds');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Close].anisotropy = 4;
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Key] = ddsLoader.load(path + 'interaction.key.dds');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Key].anisotropy = 4;
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Search] = ddsLoader.load(path + 'interaction.search.dds');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Search].anisotropy = 4;
            tex['interaction']['normal']['body'][_Data.operation.body.Search] = ddsLoader.load(path + 'interaction.search.dds');
            tex['interaction']['normal']['body'][_Data.operation.body.Search].anisotropy = 4;
            tex['interaction']['normal']['door'][_Data.operation.door.Open] = ddsLoader.load(path + 'interaction.door.open.dds');
            tex['interaction']['normal']['door'][_Data.operation.door.Open].anisotropy = 4;
            tex['interaction']['normal']['door'][_Data.operation.door.Close] = ddsLoader.load(path + 'interaction.door.close.dds');
            tex['interaction']['normal']['door'][_Data.operation.door.Close].anisotropy = 4;
            tex['interaction']['normal']['door'][_Data.operation.door.Locked] = ddsLoader.load(path + 'interaction.lock.dds');
            tex['interaction']['normal']['door'][_Data.operation.door.Locked].anisotropy = 4;
            tex['interaction']['normal']['door'][_Data.operation.door.Unlock] = ddsLoader.load(path + 'interaction.unlock.dds');
            tex['interaction']['normal']['door'][_Data.operation.door.Unlock].anisotropy = 4;
            //tex['interaction']['normal']['door'][_Data.operation.door.Block] = ddsLoader.load(path + 'interaction.block.dds');

            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Open] = ddsLoader.load(path + 'interaction.open-2.dds');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Open].anisotropy = 4;
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Close] = ddsLoader.load(path + 'interaction.close-2.dds');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Close].anisotropy = 4;
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Key] = ddsLoader.load(path + 'interaction.key-2.dds');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Key].anisotropy = 4;
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Search] = ddsLoader.load(path + 'interaction.search-2.dds');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Search].anisotropy = 4;
            tex['interaction']['highlight']['body'][_Data.operation.body.Search] = ddsLoader.load(path + 'interaction.search-2.dds');
            tex['interaction']['highlight']['body'][_Data.operation.body.Search].anisotropy = 4;
            tex['interaction']['highlight']['door'][_Data.operation.door.Open] = ddsLoader.load(path + 'interaction.door.open-2.dds');
            tex['interaction']['highlight']['door'][_Data.operation.door.Open].anisotropy = 4;
            tex['interaction']['highlight']['door'][_Data.operation.door.Close] = ddsLoader.load(path + 'interaction.door.close-2.dds');
            tex['interaction']['highlight']['door'][_Data.operation.door.Close].anisotropy = 4;
            tex['interaction']['highlight']['door'][_Data.operation.door.Locked] = ddsLoader.load(path + 'interaction.lock-2.dds');
            tex['interaction']['highlight']['door'][_Data.operation.door.Locked].anisotropy = 4;
            tex['interaction']['highlight']['door'][_Data.operation.door.Unlock] = ddsLoader.load(path + 'interaction.unlock-2.dds');
            tex['interaction']['highlight']['door'][_Data.operation.door.Unlock].anisotropy = 4;
            tex['interaction']['highlight']['door'][_Data.operation.door.Block] = ddsLoader.load(path + 'interaction.door.block-2.dds');
            tex['interaction']['highlight']['door'][_Data.operation.door.Block].anisotropy = 4;

            //tex['enduranceBarBase'] = ddsLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'EnduranceBar.dds');
        };

        var _init = function () {
            _setupTex();
        };

        _init();
    };

    RENDERER.Camera = Camera;
})(window.Rendxx.Game.Ghost.Renderer2D);