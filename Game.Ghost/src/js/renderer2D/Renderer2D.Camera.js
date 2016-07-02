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
        },
        noise:{
            step: 0.005,
            offset: 64,
            closeRange: 5,
            rangeRatio: 0.03
        },
        html: {
            sceneCharacter: '<div class="_scene_character"></div>',
            scene: {
                ortho: '<div class="_scene_ortho"></div>',
                effort: '<div class="_scene_effort"></div>'
            },
            enduranceBarWrap: '<div class="_enduranceBarWrap"></div>',
            enduranceBar: '<div class="_enduranceBar"></div>',
            edges: '<div class="_edges"></div>',
            message: '<div class="_message"></div>',
            marker: '<div class="_marker"></div>'
        }
    };
    /**
     * Setup camera in three.js
     * @param {game entity} entity - Game entity
     */
    var Camera = function (entity) {
        // data ----------------------------------------------
        var that = this,
            tex = {},
            root = entity.root,
            scene = entity.env.scene,
            wrap = entity.env.wrap,
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
            fogEdge = [],
            msg = null,
            offset_x = 0,
            offset_y = 0,
            mask = null,

            // cache
            visibleSize = Data.visibleSize,
            ratio = 1,
            _enduranceBarOffset = 0,
            _isLoaded = false,
            _loader = false,
            interactionIcon = {},
            highLightIcon = null,
            noiseList = [],
            doorIcon = {};

        this.character = -1;
        this.width = -1;
        this.height = -1;
        this.color = null;

        // public method -------------------------------------------------
        this.setup = function (character, w, h) {
            // data
            this.character = character;
            this.width = w;
            this.height = h;
            sprites = {};
            if (that.character.role === Data.character.type.ghost)
                visibleSize = 30;
            else
                visibleSize = 22;
            
            createMessage(scene['hud']);
            createEnduranceBar(scene['hud']);
            createFog(scene['hud']);
            createDanger(scene['hud']);
            setupNoise(scene['hud']);
            that.resize(that.width, that.height);
        };

        this.resize = function (w, h) {
            this.width = w;
            this.height = h;

            _setupScale();

            offset_x = this.width / 2 + GridSize * ratio / 2;
            offset_y = this.height / 2 + GridSize * ratio / 2;
            resizeEdge();
            resizeMessage();
            resizeDanger();
            resizeEnduranceBar();
            resizeNoise();
        };

        this.render = function () {
            var x = that.character.x * ratio;
            var y = that.character.y * ratio;

            wrap['game'].position.x = -x + offset_x;
            wrap['game'].position.y = -y + offset_y;
            //this.scene['effort'].css({
            //    'transform': 'translate(' + -x  + 'px,' + -y  + 'px)'
            //});
            if (that.character.isDead) {
                //showDeadScreen();
            } else if (that.character.isWin) {
                //showEscapeScreen();
            } else {
                // update edge
                updateDanger();
                // update sprite
                updateEnduranceBar();
                // update effort
                updateInteractionIcon();
                updateMessage();
                updateDoor();
                updateVision(that.character.x, that.character.y, that.character.rotation.body + Math.PI / 2, Math.PI / 2);
                updateNoise(entity.noise.getNoiseDat());
            }
        };

        // private method -------------------------------------------------
        // viewport ------------------------------------------------
        var createVision = function () {
            //sprites['visionEdge'] = new PIXI.Graphics();
            mask = new PIXI.Graphics();
            entity.map.shadowMap.mask = mask;
            entity.env.layers['shadowMap'].addChild(mask);
            entity.env.layers['shadowMap'].addChild(entity.map.shadowMap);
            //entity.env.layers['shadowMap'].addChild(sprites['visionEdge']);
        };

        var resizeVision = function () {
        };

        var updateVision = function (x, y, rotation, fov) {
            if (mask === null) {
                if (entity.map.shadowMap == null) {
                    return;
                }
                createVision();
            }
            RENDERER.RayCasting(x / GridSize, y / GridSize, rotation, fov, visibleSize * 3 / 2, entity.map.blockMap, 60, drawShadowMap);
        };

        var drawShadowMap = function (block) {
            var x = that.character.x;
            var y = that.character.y;
            var rotation = that.character.rotation.body + Math.PI / 2;
            var fov = Math.PI / 2;
            var visibleLen = visibleSize * GridSize * 3 / 2;

            // vision edge
            //var edges = sprites['visionEdge'];
            //edges.clear();

            //edges.lineStyle(6, 0x000000,1);
            //edges.beginFill(0x000000, 0);
            ////edges.moveTo(x + GridSize * Math.cos(rotation - fov / 2), y + GridSize * Math.sin(rotation - fov / 2));
            ////edges.lineTo(x + visibleLen * Math.cos(rotation - fov / 2), y + visibleLen * Math.sin(rotation - fov / 2));
            //////edges.arc(x, y, GridSize , rotation - fov / 2, rotation + fov / 2, true);
            //////edges.arc(x, y, visibleLen, rotation + fov / 2, rotation - fov / 2);
            ////edges.moveTo(x + GridSize * Math.cos(rotation + fov / 2), y + GridSize * Math.sin(rotation + fov / 2));
            ////edges.lineTo(x + visibleLen * Math.cos(rotation + fov / 2), y + visibleLen * Math.sin(rotation + fov / 2));
            //edges.moveTo(x + visibleLen * Math.cos(rotation - fov / 2), y + visibleLen * Math.sin(rotation - fov / 2));
            //edges.lineTo(x,y);
            //edges.lineTo(x + visibleLen * Math.cos(rotation + fov / 2), y + visibleLen * Math.sin(rotation + fov / 2));
            //edges.endFill();

            mask.clear();
            mask.moveTo(x, y);
            mask.lineStyle(0);
            mask.beginFill(0x000000, 1);
            mask.arc(x, y, GridSize*1, rotation - fov / 2, rotation + fov / 2,true);
            mask.arc(x, y, visibleLen, rotation + fov / 2, rotation - fov / 2);
            mask.lineTo(x, y);
            mask.endFill();

            for (var k in block) {
                var _itemPos = entity.map.blockItemSet[k];

                /*
                 *        (1)     (4)
                 *   [0,1] |       | [2,1] 
                 *   ----- +-------+ -----
                 *         | BLOCK | 
                 *   ----- +-------+ -----
                 *   [0,3] |       | [2,3] 
                 *        (2)     (3)
                 * 
                 * 
                 *          |      
                 *     -1   |    0
                 *          |
                 *  --------+--------->  [X]
                 *          |        
                 *     2    |    1
                 *          |
                 *          v  [Y]
                 *         
                 */
                var r = Math.ceil(Math.atan2(y - _itemPos[5], x - _itemPos[4]) * 2 / Math.PI),
                    p1 = null,
                    p2 = null,
                    drawList = [];

                switch (r) {
                    case -1:
                        p1 = [_itemPos[0], _itemPos[3]]; // (2)
                        p2 = [_itemPos[2], _itemPos[1]]; // (4)

                        if (x >= _itemPos[0]) {
                            drawList.push(_itemPos[0]); // (1)
                            drawList.push(_itemPos[1]);
                            p1 = [_itemPos[0], _itemPos[1]];
                        }

                        drawList.push(_itemPos[0]); // (2)                 
                        drawList.push(_itemPos[3]);

                        drawList.push(_itemPos[2]); // (3)
                        drawList.push(_itemPos[3]);

                        drawList.push(_itemPos[2]); // (4)
                        drawList.push(_itemPos[1]);

                        if (y >= _itemPos[1]) {
                            drawList.push(_itemPos[0]); // (1)
                            drawList.push(_itemPos[1]);
                            p2 = [_itemPos[0], _itemPos[1]];
                        }
                        break;
                    case 0:
                        p1 = [_itemPos[0], _itemPos[1]]; // (1)
                        p2 = [_itemPos[2], _itemPos[3]]; // (3)

                        if (y >= _itemPos[1]) {
                            drawList.push(_itemPos[2]); // (4)
                            drawList.push(_itemPos[1]);
                            p1 = [_itemPos[2], _itemPos[1]];
                        }

                        drawList.push(_itemPos[0]); // (1)
                        drawList.push(_itemPos[1]);

                        drawList.push(_itemPos[0]); // (2)
                        drawList.push(_itemPos[3]);

                        drawList.push(_itemPos[2]); // (3)
                        drawList.push(_itemPos[3]);

                        if (x <= _itemPos[2]) {
                            drawList.push(_itemPos[2]); // (4)
                            drawList.push(_itemPos[1]);
                            p2 = [_itemPos[2], _itemPos[1]];
                        }
                        break;
                    case 1:
                        p1 = [_itemPos[2], _itemPos[1]]; // (4)
                        p2 = [_itemPos[0], _itemPos[3]]; // (2)

                        if (x <= _itemPos[2]) {
                            drawList.push(_itemPos[2]); // (3)
                            drawList.push(_itemPos[3]);
                            p1 = [_itemPos[2], _itemPos[3]];
                        }
                        drawList.push(_itemPos[2]); // (4)
                        drawList.push(_itemPos[1]);

                        drawList.push(_itemPos[0]); // (1)
                        drawList.push(_itemPos[1]);

                        drawList.push(_itemPos[0]); // (2)
                        drawList.push(_itemPos[3]);

                        if (y <= _itemPos[3]) {
                            drawList.push(_itemPos[2]); // (3)
                            drawList.push(_itemPos[3]);
                            p2 = [_itemPos[2], _itemPos[3]];
                        }
                        break;
                    case 2:
                        p1 = [_itemPos[2], _itemPos[3]]; // (3)
                        p2 = [_itemPos[0], _itemPos[1]]; // (1)

                        if (y <= _itemPos[3]) {
                            drawList.push(_itemPos[0]); // (2)
                            drawList.push(_itemPos[3]);
                            p1 = [_itemPos[0], _itemPos[3]];
                        }

                        drawList.push(_itemPos[2]); // (3)
                        drawList.push(_itemPos[3]);

                        drawList.push(_itemPos[2]); // (4)
                        drawList.push(_itemPos[1]);

                        drawList.push(_itemPos[0]); // (1)
                        drawList.push(_itemPos[1]);

                        if (x >= _itemPos[0]) {
                            drawList.push(_itemPos[0]); // (2)
                            drawList.push(_itemPos[3]);
                            p2 = [_itemPos[0], _itemPos[3]];
                        }
                        break;
                }

                var r1 = Math.atan2(p1[1] - y, p1[0] - x),
                    r2 = Math.atan2(p2[1] - y, p2[0] - x);

                drawList.push(x + visibleLen * Math.cos(r2));
                drawList.push(y + visibleLen * Math.sin(r2));
                drawList.push(x + visibleLen * Math.cos(r1));
                drawList.push(y + visibleLen * Math.sin(r1));

                mask.moveTo(x + visibleLen * Math.cos(r2), y + visibleLen * Math.sin(r2));
                mask.lineStyle(0);
                mask.beginFill(0xffffff, 1);
                mask.arc(x, y, visibleLen, r2, r1);
                mask.endFill();

                mask.moveTo(drawList[0], drawList[1]);
                mask.lineStyle(0);
                mask.beginFill(0xffffff, 1);
                mask.drawPolygon(drawList);
                mask.endFill();
            }
        };

        // Frame ----------------------------------------------------
        var createMessage = function (layer) {
            sprites["message"] = new PIXI.Text('', {
                font: 'bold 30px Poor Richard',
                fill: '#fff',
                align: 'center',
                stroke: '#000',
                strokeThickness: 2
            });

            sprites["message"].position.x = that.width/2;
            sprites["message"].position.y = that.height / 4;
            sprites["message"].anchor.x = 0.5;

            layer.addChild(sprites["message"]);
        };

        var resizeMessage = function () {
            sprites["message"].position.x = that.width / 2;
            sprites["message"].position.y = that.height / 4;
        };

        // Endurance ------------------------------------------------
        var createEnduranceBar = function (layer) {
            // endurance
            var path = root + Data.files.path[Data.categoryName.sprite];
            PIXI.loader
                .add(path + 'energy_l.png')
                .add(path + 'energy_line.png')
                .add(path + 'energy_line_bg.png')
                .load(function (loader, resources) {
                    sprites["enduranceBar"] = {
                        wrap: new PIXI.Container(),
                        bg: null,
                        left: null,
                        bar: null,
                        mask: null
                    };
                    layer.addChild(sprites["enduranceBar"].wrap);

                    var offset = 0,
                        wid = 0,
                        hgt = 32;
                    // bg
                    var tex1 = PIXI.Texture.fromImage(path + 'energy_line_bg.png');
                    sprites["enduranceBar"].bg = new PIXI.Sprite(tex1);
                    sprites["enduranceBar"].wrap.addChild(sprites["enduranceBar"].bg);
                    sprites["enduranceBar"].bg.position.y = (hgt - tex1.height) / 2;
                    wid = tex1.width;
                    //left
                    var tex2 = PIXI.Texture.fromImage(path + 'energy_l.png');
                    sprites["enduranceBar"].left = new PIXI.Sprite(tex2);
                    sprites["enduranceBar"].wrap.addChild(sprites["enduranceBar"].left);
                    sprites["enduranceBar"].left.position.y = (hgt - tex2.height) / 2;
                    offset = tex2.width;
                    //mask
                    sprites["enduranceBar"].mask = new PIXI.Graphics();
                    sprites["enduranceBar"].mask.beginFill(0xffffff, 1);
                    sprites["enduranceBar"].mask.drawRect(0, 0, wid - offset, hgt);
                    sprites["enduranceBar"].mask.endFill();
                    sprites["enduranceBar"].wrap.addChild(sprites["enduranceBar"].mask);
                    //bar
                    var tex3 = PIXI.Texture.fromImage(path + 'energy_line.png');
                    sprites["enduranceBar"].bar = new PIXI.Sprite(tex3);
                    sprites["enduranceBar"].bar.mask = sprites["enduranceBar"].mask;
                    sprites["enduranceBar"].wrap.addChild(sprites["enduranceBar"].bar);
                    sprites["enduranceBar"].bar.position.y = (hgt - tex3.height) / 2;

                    sprites["enduranceBar"].bg.position.x = -offset;
                    sprites["enduranceBar"].left.position.x = -offset;
                    sprites["enduranceBar"].bar.position.x = -offset;
                    _enduranceBarOffset = (offset - wid) / 2;
                    resizeEnduranceBar();
                });
        };

        var resizeEnduranceBar = function () {
            if (sprites["enduranceBar"] == null) return;
            sprites["enduranceBar"].wrap.position.set(that.width / 2 + _enduranceBarOffset, 32);
        };

        var updateEnduranceBar = function () {
            if (sprites["enduranceBar"] == null) return;
            var w = Math.max((that.character.endurance / that.character.maxEndurance),0);
            sprites["enduranceBar"].mask.scale.x = w;
        };

        // Noise -----------------------------------------------------
        var setupNoise = function (layer) {
            noiseList = [{}, {}];
            sprites["noise"] = {
                wrap: null,
                list:null
            };
            sprites["noise"].wrap = new PIXI.Container();
            layer.addChild(sprites["noise"].wrap);
            resizeNoise();
        };

        var resizeNoise = function () {
            sprites["noise"].wrap.position.set(that.width / 2, that.height / 2);
        };

        var updateNoise = function (newNoiseDat) {
            if (!_isLoaded) return;
            if (newNoiseDat!==null){
                for (var i = 0; i < newNoiseDat.length; i++) {
                    createNoise(newNoiseDat[i]);
                }
            }

            for (var i in noiseList[0]) {
                stepNoise(i);
            }
            for (var i in noiseList[1]) {
                stepNoiseClose(i);
            }
        };

        var createNoise = function (noiseDat) {
            var d = Math.sqrt(Math.pow(noiseDat[2] - that.character.gridX, 2) + Math.pow(noiseDat[3] - that.character.gridY, 2));
            var noise;
            if (d < _Data.noise.closeRange) {
                noise = {
                    x: noiseDat[2],
                    y: noiseDat[3],
                    step: 1,
                    wrap: new PIXI.Container(),
                    icon: new PIXI.Sprite(tex['noise'][noiseDat[1]])
                };

                noise.icon.anchor.set(0.5, 0.5);

                noiseList[1][noiseDat[0]] = noise;
                noise.icon.position.set(0, 0);
                noise.icon.scale.set(2, 2);
                noise.wrap.addChild(noise.icon);
                noise.wrap.position.set(noise.x * GridSize, noise.y * GridSize);
                scene['effort'].addChild(noise.wrap);
            } else {
                noise = {
                    x: noiseDat[2],
                    y: noiseDat[3],
                    step: Math.max(0.4, Math.min(1, (1.2 - d) * _Data.noise.rangeRatio)),
                    wrap: new PIXI.Container(),
                    bg: new PIXI.Sprite(tex['noise']['bg']),
                    icon: new PIXI.Sprite(tex['noise'][noiseDat[1]])
                };

                noise.icon.anchor.set(0.5, 0.5);
                noise.bg.anchor.set(0.5, 0.5);

                noiseList[0][noiseDat[0]] = noise;

                noise.bg.position.set(0, 0);
                noise.icon.position.set(0, 0);
                noise.wrap.addChild(noise.bg);
                noise.wrap.addChild(noise.icon);
                sprites["noise"].wrap.addChild(noise.wrap);
            }
        };
        
        var destroyNoise = function (idx) {
            var noise = noiseList[0][idx];
            var l = noiseList[0];
            sprites["noise"].wrap.removeChild(noise.wrap);
            noise.icon.destroy(false);
            noise.bg.destroy(false);
            noise.wrap.destroy(false);
            delete l[idx];
        };

        var destroyNoiseClose = function (idx) {
            var noise = noiseList[1][idx];
            var l = noiseList[1];
            scene['effort'].removeChild(noise.wrap);
            noise.icon.destroy(false);
            noise.wrap.destroy(false);
            delete l[idx];
        };

        var stepNoise = function (idx) {
            var noise = noiseList[0][idx];
            noise.step-=_Data.noise.step;
            if (noise.step <= 0) {
                destroyNoise(idx);
                return;
            }

            var _r = Math.atan2(noise.y - that.character.gridY, noise.x - that.character.gridX)+Math.PI/2,
                _x = _Data.noise.offset * Math.sin(_r),
                _y = -_Data.noise.offset * Math.cos(_r);
            noise.wrap.alpha = noise.step;
            noise.bg.rotation = _r;

            noise.wrap.position.set(_x, _y);
        };

        var stepNoiseClose = function (idx) {
            var noise = noiseList[1][idx];
            noise.step -= _Data.noise.step;
            if (noise.step <= 0) {
                destroyNoiseClose(idx);
                return;
            }
            noise.wrap.alpha = noise.step;
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
            sprPkg.alpha = 0;
        };

        var showInteraction_highlight = function (objType, objId, objOp) {
            if (!spritesInteraction.highlight[objType].hasOwnProperty(objId)) spritesInteraction.highlight[objType][objId] = {};
            if (!spritesInteraction.highlight[objType][objId].hasOwnProperty(objOp) || spritesInteraction.highlight[objType][objId][objOp] === null)
                spritesInteraction.highlight[objType][objId][objOp] = createInteractionIcon(objType, objId, objOp, true);
            var sprPkg = spritesInteraction.highlight[objType][objId][objOp];
            if (sprPkg === null) return;
            sprPkg.alpha = 1;
        };

        // interation normal
        var hideInteraction_normal = function (objType, objId, objOp) {
            if (spritesInteraction.normal[objType][objId] === undefined || spritesInteraction.normal[objType][objId] === null
                || spritesInteraction.normal[objType][objId][objOp] === undefined || spritesInteraction.normal[objType][objId][objOp] === null) return;
            var sprPkg = spritesInteraction.normal[objType][objId][objOp];

            sprPkg.alpha = 0;
        };

        var showInteraction_normal = function (objType, objId, objOp) {
            if (!spritesInteraction.normal[objType].hasOwnProperty(objId)) spritesInteraction.normal[objType][objId] = {};
            if (!spritesInteraction.normal[objType][objId].hasOwnProperty(objOp) || spritesInteraction.normal[objType][objId][objOp] === null)
                spritesInteraction.normal[objType][objId][objOp] = createInteractionIcon(objType, objId, objOp, false);
            var sprPkg = spritesInteraction.normal[objType][objId][objOp];

            if (sprPkg === null) return;
            sprPkg.alpha = 1;
        };

        var createInteractionIcon = function (objType, objId, objOp, isHighlight) {
            var tex1 = isHighlight ? tex['interaction']['highlight'][objType][objOp] : tex['interaction']['normal'][objType][objOp];
            if (tex1 === undefined || tex1 === null) return null;

            var pos = entity.map.objectPos[objType][objId];
            var marker = new PIXI.Sprite(tex1);
            marker.anchor.set(0.5, 0.5);
            marker.position.x = pos[0] + GridSize / 2;
            marker.position.y = pos[1] - GridSize / 4;
            marker.scale.set(2, 2);
            marker.alpha = 0;
            scene['effort'].addChild(marker);

            return marker;
        };

        // Message ---------------------------------------------------
        var updateMessage = function () {
            if (that.character.message === undefined || that.character.message === null) return;
            showMessage(that.character.message);
            that.character.message = null;
        };

        var msgHideFunc = null;
        var showMessage = function (content) {
            if (msgHideFunc !== null) clearTimeout(msgHideFunc);
            sprites["message"].text = content;
            sprites["message"].alpha = 1;
            msgHideFunc = setTimeout(function () {
                sprites["message"].alpha = 0;
            }, 3000);
        };

        // Door ------------------------------------------------------
        var doorMarkers = {};
        var updateDoor = function () {
            var d = that.character.lockDoor;
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
                if (!doorMarkers.hasOwnProperty(i)) doorMarkers[i] = [null, null];
                if (doorMarkers[i][idx] === null) doorMarkers[i][idx] = (d[i] ? createDoorLock(i) : createDoorUnlock(i));
                doorIcon[i][idx] = doorMarkers[i][idx];
                showDoorIcon(i);
            }
        };

        var createDoorLock = function (idx) {
            var pos = entity.map.doorPos[idx];
            var marker = new PIXI.Sprite(tex['interaction-lock']);
            marker.anchor.set(0, 0);
            marker.position.x = pos[0];
            marker.position.y = pos[1];
            scene['effort'].addChild(marker);

            return marker;
        };

        var createDoorUnlock = function (idx) {
            var pos = entity.map.doorPos[idx];
            var marker = new PIXI.Sprite(tex['interaction-unlock']);
            marker.anchor.set(0, 0);
            marker.position.x = pos[0];
            marker.position.y = pos[1];
            scene['effort'].addChild(marker);

            return marker;
        };

        var removeDoorIcon = function (idx) {
            if (doorIcon[idx][0] !== undefined || doorIcon[idx][0] !== null)
                doorIcon[idx][0].alpha = 0;
            if (doorIcon[idx][1] !== undefined || doorIcon[idx][1] !== null)
                doorIcon[idx][1].alpha = 0;
        };

        var showDoorIcon = function (idx) {
            if (doorIcon[idx][0] !== undefined || doorIcon[idx][0] !== null)
                doorIcon[idx][0].alpha = 1;
            if (doorIcon[idx][1] !== undefined || doorIcon[idx][1] !== null)
                doorIcon[idx][1].alpha = 1;
        };

        // Fog -------------------------------------------------------
        var createFog = function (layer) {
            fogEdge = [];
            var path = root + Data.files.path[Data.categoryName.sprite];

            PIXI.loader.add(path + 'fogEdge.png')
            .load(function (loader, resources) {
                var tex = PIXI.Texture.fromImage(path + 'fogEdge.png');
                var item = null;

                // left
                item = new PIXI.Sprite(tex);
                item.anchor.set(0, 0);
                item.position.x = 0;
                item.position.y = 0;
                item.width = GridSize ;
                item.height = that.height;
                layer.addChild(item);
                fogEdge[0] = item;

                // top
                item = new PIXI.Sprite(tex);
                item.anchor.set(0, 0);
                item.rotation = 0.5 * Math.PI;
                item.position.x = that.width;
                item.position.y = 0;
                item.width = GridSize;
                item.height = that.width;
                layer.addChild(item);
                fogEdge[1] = item;

                // right
                item = new PIXI.Sprite(tex);
                item.anchor.set(0, 0);
                item.rotation = Math.PI;
                item.position.x = that.width;
                item.position.y = that.height;
                item.width = GridSize;
                item.height = that.height;
                layer.addChild(item);
                fogEdge[2] = item;

                // bottom
                item = new PIXI.Sprite(tex);
                item.anchor.set(0, 0);
                item.rotation = -0.5 * Math.PI;
                item.position.x = 0;
                item.position.y = that.height;
                item.width = GridSize;
                item.height = that.width;
                layer.addChild(item);
                fogEdge[3] = item;
            });
        };

        var resizeEdge = function () {

            if (fogEdge[0] == null) return;
            // left
            fogEdge[0].height = that.height;

            // top
            fogEdge[1].position.x = that.width;
            fogEdge[1].height = that.width;

            // right
            fogEdge[2].position.x = that.width;
            fogEdge[2].position.y = that.height;
            fogEdge[2].height = that.height;

            // bottom
            fogEdge[3].position.y = that.height;
            fogEdge[3].height = that.width;
        };

        // Danger -----------------------------------------------------
        var createDanger = function (layer) {
            var path = root + Data.files.path[Data.categoryName.sprite];

            PIXI.loader.add(path + 'danger.png')
            .load(function (loader, resources) {
                var tex = PIXI.Texture.fromImage(path + 'danger.png');
                sprites["danger"] = new PIXI.Sprite(tex);
                sprites["danger"].alpha = 0;
                layer.addChild(sprites["danger"]);
                resizeDanger();
            });
        };
        var _dangerCache = 0;
        var resizeDanger = function () {
            if (sprites["danger"] == null) return;
            //sprites["danger"].scale.set();
            sprites["danger"].width = that.width;
            sprites["danger"].height = that.height;
        };
        var updateDanger = function () {
            if (_dangerCache === that.character.danger) return;
            var d = Math.max(that.character.danger, entity.map.danger);

            if (Math.abs(_dangerCache - d) <= _Data.dangerSpeed) {
                _dangerCache = d;
            }
            else if (_dangerCache < d) {
                _dangerCache += _Data.dangerSpeed;
            } else if (_dangerCache > d) {
                _dangerCache -= _Data.dangerSpeed;
            }
            sprites["danger"].alpha = _dangerCache;
        };


        // setup -----------------------------------------------------
        var _setupScale = function () {
            var min = Math.max(that.width, that.height);
            ratio = min / (visibleSize * GridSize);
            wrap['game'].scale.x = ratio;
            wrap['game'].scale.y = ratio;
        };

        var _setupTex = function () {
            tex = {};
            var path = root + Data.files.path[Data.categoryName.sprite];

            // png Loader -------------------------------------------------------------------------------------------
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
            tex['noise'] = {

            };

            PIXI.loader
            .add(path + 'interaction.open.png')
            .add(path + 'interaction.close.png')
            .add(path + 'interaction.key.png')
            .add(path + 'interaction.search.png')
            .add(path + 'interaction.door.open.png')
            .add(path + 'interaction.door.close.png')
            .add(path + 'interaction.destroy.png')
            .add(path + 'interaction.lock.png')
            .add(path + 'interaction.unlock.png')
            .add(path + 'interaction.fix.png')
            .add(path + 'interaction.open-2.png')
            .add(path + 'interaction.close-2.png')
            .add(path + 'interaction.key-2.png')
            .add(path + 'interaction.search-2.png')
            .add(path + 'interaction.door.open-2.png')
            .add(path + 'interaction.door.close-2.png')
            .add(path + 'interaction.destroy-2.png')
            .add(path + 'interaction.lock-2.png')
            .add(path + 'interaction.unlock-2.png')
            .add(path + 'interaction.door.block-2.png')
            .add(path + 'interaction.fix-2.png')

            .add(path + 'noise.bg.png')
            .add(path + 'noise.key.png')
            .add(path + 'noise.door.png')
            .add(path + 'noise.touch.png')
            .add(path + 'noise.operation.png')

            .load(function (loader, resources) {
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Open] = PIXI.Texture.fromImage(path + 'interaction.open.png');
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Close] = PIXI.Texture.fromImage(path + 'interaction.close.png');
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Key] = PIXI.Texture.fromImage(path + 'interaction.key.png');
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Search] = PIXI.Texture.fromImage(path + 'interaction.search.png');
                tex['interaction']['normal']['body'][_Data.operation.body.Search] = PIXI.Texture.fromImage(path + 'interaction.search.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Open] = PIXI.Texture.fromImage(path + 'interaction.door.open.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Close] = PIXI.Texture.fromImage(path + 'interaction.door.close.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Destroy] = PIXI.Texture.fromImage(path + 'interaction.destroy.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Locked] = PIXI.Texture.fromImage(path + 'interaction.lock.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Unlock] = PIXI.Texture.fromImage(path + 'interaction.unlock.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Check] = PIXI.Texture.fromImage(path + 'interaction.search.png');
                tex['interaction']['normal']['generator'][_Data.operation.generator.Fix] = PIXI.Texture.fromImage(path + 'interaction.fix.png');

                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Open] = PIXI.Texture.fromImage(path + 'interaction.open-2.png');
                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Close] = PIXI.Texture.fromImage(path + 'interaction.close-2.png');
                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Key] = PIXI.Texture.fromImage(path + 'interaction.key-2.png');
                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Search] = PIXI.Texture.fromImage(path + 'interaction.search-2.png');
                tex['interaction']['highlight']['body'][_Data.operation.body.Search] = PIXI.Texture.fromImage(path + 'interaction.search-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Open] = PIXI.Texture.fromImage(path + 'interaction.door.open-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Close] = PIXI.Texture.fromImage(path + 'interaction.door.close-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Destroy] = PIXI.Texture.fromImage(path + 'interaction.destroy-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Locked] = PIXI.Texture.fromImage(path + 'interaction.lock-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Unlock] = PIXI.Texture.fromImage(path + 'interaction.unlock-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Check] = PIXI.Texture.fromImage(path + 'interaction.search-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Block] = PIXI.Texture.fromImage(path + 'interaction.door.block-2.png');
                tex['interaction']['highlight']['generator'][_Data.operation.generator.Fix] = PIXI.Texture.fromImage(path + 'interaction.fix-2.png');

                tex['noise']['bg'] = PIXI.Texture.fromImage(path + 'noise.bg.png');
                tex['noise'][RENDERER.Noise.Data.Name.Key] = PIXI.Texture.fromImage(path + 'noise.key.png');
                tex['noise'][RENDERER.Noise.Data.Name.Door] = PIXI.Texture.fromImage(path + 'noise.door.png');
                tex['noise'][RENDERER.Noise.Data.Name.Touch] = PIXI.Texture.fromImage(path + 'noise.touch.png');
                tex['noise'][RENDERER.Noise.Data.Name.Operation] = PIXI.Texture.fromImage(path + 'noise.operation.png');
                _isLoaded = true;
            });
        };

        var _loadImg = function (name) {
            var img = new Image();
            img.src = name;
            return img;
        };

        var _init = function () {
            _setupTex();
        };

        _init();
    };

    RENDERER.Camera = Camera;
})(window.Rendxx.Game.Ghost.Renderer2D);