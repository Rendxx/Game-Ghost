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
                    body: {}
                },
                highlight: {
                    furniture: {},
                    door: {},
                    body: {}
                }
            },
            msg = null,
            offset_x = 0,
            offset_y = 0,


            // cache
            ratio = 1,
            _loader = false;
            interactionIcon = {},
            highLightIcon = null,
            doorIcon = {};

        this.layer = {};
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
            
            createMessage(scene['hud']);
            createDanger(scene['hud']);
            createEnduranceBar(scene['hud']);
            that.resize(that.width, that.height);
        };

        this.resize = function (w, h) {
            this.width = w;
            this.height = h;

            offset_x = this.width / 2;
            offset_y = this.height / 2;

            _setupScale();
            resizeMessage();
            resizeDanger();
            resizeEnduranceBar();
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
                //updateInteractionIcon();
                updateMessage();
                //updateDoor();
            }
        };

        // private method -------------------------------------------------

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
            sprites["enduranceBar"] = {
                wrap: new PIXI.Container(),
                bg: new PIXI.Graphics(),
                val: new PIXI.Graphics()
            };
            layer.addChild(sprites["enduranceBar"].wrap);
            sprites["enduranceBar"].wrap.addChild(sprites["enduranceBar"].bg);
            sprites["enduranceBar"].wrap.addChild(sprites["enduranceBar"].val);

            resizeEnduranceBar();
        };

        var resizeEnduranceBar = function () {
            if (sprites["enduranceBar"] == null) return;
            sprites["enduranceBar"].wrap.position.set(that.width / 4+1, that.height / 8);
            var graphics = sprites["enduranceBar"].bg;
            graphics.clear();
            graphics.lineStyle(2, 0x000000, 1);
            graphics.beginFill(0x333333, 1);
            graphics.drawRect(-1, 0, that.width / 2, 10);

            graphics = sprites["enduranceBar"].val;
            graphics.clear();
            graphics.lineStyle(0);
            graphics.beginFill(0xffffff, 1);
            graphics.drawRect(0, 1, that.width / 2-2, 8);
        };

        var updateEnduranceBar = function () {
            //if (!sprites.hasOwnProperty('enduranceBar')) return;
            //var w = (that.character.endurance / that.character.maxEndurance);

            //sprites["enduranceBar"].css({
            //    'transform': 'scaleX(' + w + ') translateZ(0)'
            //});
            var w = Math.max((that.character.endurance / that.character.maxEndurance),0);
            sprites["enduranceBar"].val.scale.x = w;
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
            sprPkg.css({ opacity: 0 });
        };

        var showInteraction_highlight = function (objType, objId, objOp) {
            if (!spritesInteraction.highlight[objType].hasOwnProperty(objId)) spritesInteraction.highlight[objType][objId] = {};
            if (!spritesInteraction.highlight[objType][objId].hasOwnProperty(objOp) || spritesInteraction.highlight[objType][objId][objOp] === null)
                spritesInteraction.highlight[objType][objId][objOp] = createInteractionIcon(objType, objId, objOp, true);
            var sprPkg = spritesInteraction.highlight[objType][objId][objOp];
            if (sprPkg === null) return;
            sprPkg.css({ opacity: 1 });
        };

        // interation normal
        var hideInteraction_normal = function (objType, objId, objOp) {
            if (spritesInteraction.normal[objType][objId] === undefined || spritesInteraction.normal[objType][objId] === null
                || spritesInteraction.normal[objType][objId][objOp] === undefined || spritesInteraction.normal[objType][objId][objOp] === null) return;
            var sprPkg = spritesInteraction.normal[objType][objId][objOp];

            sprPkg.css({ opacity: 0 });
        };

        var showInteraction_normal = function (objType, objId, objOp) {
            if (!spritesInteraction.normal[objType].hasOwnProperty(objId)) spritesInteraction.normal[objType][objId] = {};
            if (!spritesInteraction.normal[objType][objId].hasOwnProperty(objOp) || spritesInteraction.normal[objType][objId][objOp] === null)
                spritesInteraction.normal[objType][objId][objOp] = createInteractionIcon(objType, objId, objOp, false);
            var sprPkg = spritesInteraction.normal[objType][objId][objOp];

            if (sprPkg === null) return;
            sprPkg.css({ opacity: 1 });
        };

        var createInteractionIcon = function (objType, objId, objOp, isHighlight) {
            var tex1 = isHighlight ? tex['interaction']['highlight'][objType][objOp] : tex['interaction']['normal'][objType][objOp];
            if (tex1 === undefined || tex1 === null) return null;

            var pos = entity.map.objectPos[objType][objId];
            var marker = $(_Data.html.marker).css({
                'background-image': 'url("' + tex1.src + '")',
                left: pos[0],
                top: pos[1],
                opacity: 0
            }).appendTo(that.scene['effort']);

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
            var marker = $(_Data.html.marker).appendTo(that.scene['effort']).css({
                'background-image': 'url("' + tex['interaction-lock'].src + '")',
                left: pos[0],
                top: pos[1]
            });

            return spr;
        };

        var createDoorUnlock = function (idx) {
            var pos = entity.map.doorPos[idx];
            var marker = $(_Data.html.marker).appendTo(that.scene['effort']).css({
                'background-image': 'url("' + tex['interaction-unlock'].src + '")',
                left: pos[0],
                top: pos[1]
            });

            return spr;
        };

        var removeDoorIcon = function (idx) {
            if (doorIcon[idx][0] !== undefined || doorIcon[idx][0] !== null)
                doorIcon[idx][0].css('opacity', 0);
            if (doorIcon[idx][1] !== undefined || doorIcon[idx][1] !== null)
                doorIcon[idx][1].css('opacity', 0);
        };

        var showDoorIcon = function (idx) {
            if (doorIcon[idx][0] !== undefined || doorIcon[idx][0] !== null)
                doorIcon[idx][0].css('opacity', 1);
            if (doorIcon[idx][1] !== undefined || doorIcon[idx][1] !== null)
                doorIcon[idx][1].css('opacity', 1);
        };

        // Fog -------------------------------------------------------

        // Danger -----------------------------------------------------
        var createDanger = function (layer) {
            var graphics = new PIXI.Graphics();

            // set a fill and line style
            graphics.lineStyle(0);
            graphics.beginFill(0x993333, 1);
            graphics.drawRect(0, 0, that.width, that.height);
            sprites["danger"] = graphics;
            sprites["danger"].alpha = 0;
            layer.addChild(graphics);
        };
        var _dangerCache = 0;
        var resizeDanger = function () {
            sprites["danger"].width = that.width;
            sprites["danger"].height = that.height;
        };
        var updateDanger = function () {
            if (_dangerCache === that.character.danger) return;
            _dangerCache = Math.max(that.character.danger, entity.map.danger);
            sprites["danger"].alpha = _dangerCache*0.6;
        };


        // setup -----------------------------------------------------
        var _setupScale = function () {
            var min = Math.max(that.width, that.height);
            ratio = min / (Data.visibleSize * GridSize);
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

            PIXI.loader
            .add(path + 'interaction.open.png')
            .add(path + 'interaction.close.png')
            .add(path + 'interaction.key.png')
            .add(path + 'interaction.search.png')
            .add(path + 'interaction.door.open.png')
            .add(path + 'interaction.door.close.png')
            .add(path + 'interaction.lock.png')
            .add(path + 'interaction.unlock.png')
            .add(path + 'interaction.open-2.png')
            .add(path + 'interaction.close-2.png')
            .add(path + 'interaction.key-2.png')
            .add(path + 'interaction.search-2.png')
            .add(path + 'interaction.door.open-2.png')
            .add(path + 'interaction.door.close-2.png')
            .add(path + 'interaction.lock-2.png')
            .add(path + 'interaction.unlock-2.png')
            .add(path + 'interaction.door.block-2.png')
            .load(function (loader, resources) {
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Open] = PIXI.Texture.fromImage(path + 'interaction.open.png');
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Close] = PIXI.Texture.fromImage(path + 'interaction.close.png');
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Key] = PIXI.Texture.fromImage(path + 'interaction.key.png');
                tex['interaction']['normal']['furniture'][_Data.operation.furniture.Search] = PIXI.Texture.fromImage(path + 'interaction.search.png');
                tex['interaction']['normal']['body'][_Data.operation.body.Search] = PIXI.Texture.fromImage(path + 'interaction.search.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Open] = PIXI.Texture.fromImage(path + 'interaction.door.open.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Close] = PIXI.Texture.fromImage(path + 'interaction.door.close.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Locked] = PIXI.Texture.fromImage(path + 'interaction.lock.png');
                tex['interaction']['normal']['door'][_Data.operation.door.Unlock] = PIXI.Texture.fromImage(path + 'interaction.unlock.png');

                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Open] = PIXI.Texture.fromImage(path + 'interaction.open-2.png');
                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Close] = PIXI.Texture.fromImage(path + 'interaction.close-2.png');
                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Key] = PIXI.Texture.fromImage(path + 'interaction.key-2.png');
                tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Search] = PIXI.Texture.fromImage(path + 'interaction.search-2.png');
                tex['interaction']['highlight']['body'][_Data.operation.body.Search] = PIXI.Texture.fromImage(path + 'interaction.search-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Open] = PIXI.Texture.fromImage(path + 'interaction.door.open-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Close] = PIXI.Texture.fromImage(path + 'interaction.door.close-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Locked] = PIXI.Texture.fromImage(path + 'interaction.lock-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Unlock] = PIXI.Texture.fromImage(path + 'interaction.unlock-2.png');
                tex['interaction']['highlight']['door'][_Data.operation.door.Block] = PIXI.Texture.fromImage(path + 'interaction.door.block-2.png');
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