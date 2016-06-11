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
            sceneOrtho: '<div class="_scene_ortho"></div>',
            sceneEffort: '<div class="_scene_effort"></div>',
            name: '<div class="_name"></div>',
            fog: '<div class="_fog"></div>',
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
    var Camera = function (entity, scene_in) {
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
        this.sceneOrtho = null;
        this.sceneEffort = null;
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
            this.sceneOrtho = $(_Data.html.sceneOrtho).appendTo($(entity.domElement));
            this.sceneEffort = $(_Data.html.sceneEffort).appendTo($(entity.domElement));

            createFrame();
            createEdges();
            createEnduranceBar();
        };

        this.resize = function (w, h) {
            this.width = w;
            this.height = h;

            var t = Math.max(w,h);
            sprites["fog"].css({
                'width': t + 'px',
                'height': t + 'px',
                'margin-top': (h - t) / 2 + 'px',
                'margin-left': (w - t) / 2 + 'px',
            });
            this.scene.css({
                'margin-top': h / 2 + 'px',
                'margin-left': w / 2 + 'px'
            });
            this.sceneEffort.css({
                'margin-top': h / 2 + 'px',
                'margin-left': w / 2 + 'px'
            });
        };

        this.render = function () {
            var x = that.character.x;
            var y = that.character.y;

            this.scene.css({
                'transform': 'translate(' + -x  + 'px,' + -y  + 'px)'
            });
            this.sceneEffort.css({
                'transform': 'translate(' + -x  + 'px,' + -y  + 'px)'
            });
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
        };

        // private method -------------------------------------------------

        // Frame ----------------------------------------------------
        var createFrame = function () {
            sprites = {};

            // name
            sprites["name"] = $(_Data.html.name).appendTo(that.sceneOrtho).text(that.character.name);

            // fog
            sprites["fog"] = $(_Data.html.fog).css({
                'background-image': 'url("' + tex['fog'].src + '")',
            }).appendTo(that.sceneOrtho);
            that.resize(that.width, that.height);

            // message
            sprites["message"] = $(_Data.html.message).appendTo(that.sceneOrtho);

        };

        // Endurance ------------------------------------------------
        var createEnduranceBar = function () {
            // endurance
            sprites["enduranceBarWrap"] = $(_Data.html.enduranceBarWrap).appendTo(that.scene);
            sprites["enduranceBar"] = $(_Data.html.enduranceBar).appendTo(sprites["enduranceBarWrap"]);
        };

        var updateEnduranceBar = function () {
            if (!sprites.hasOwnProperty('enduranceBar')) return;
            var w = Math.floor((that.character.endurance / that.character.maxEndurance) * 100);

            sprites["enduranceBar"].css({
                'transform': 'scaleX(' + w + '%)'
            });
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
                opacity:0
            }).appendTo(that.sceneEffort);

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
            sprites["message"].text(content).css({
                'opacity':1
            });
            msgHideFunc = setTimeout(function () {
                sprites["message"].css({
                    'opacity': 0
                });
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
                if (!doorMarkers.hasOwnProperty(i)) doorMarkers[i] = [null,null];
                if (doorMarkers[i][idx] === null) doorMarkers[i][idx]=(d[i] ? createDoorLock(i) : createDoorUnlock(i));
                doorIcon[i][idx] = doorMarkers[i][idx];
                showDoorIcon(i);
            }
        };

        var createDoorLock = function (idx) {
            var pos = entity.map.doorPos[idx];
            var marker = $(_Data.html.marker).appendTo(that.sceneEffort).css({
                'background-image': 'url("'+tex['interaction-lock'].src +'")',
                left: pos[0],
                top: pos[1]
            });

            return spr;
        };

        var createDoorUnlock = function (idx) {
            var pos = entity.map.doorPos[idx];
            var marker = $(_Data.html.marker).appendTo(that.sceneEffort).css({
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

        // Edges -----------------------------------------------------
        var createEdges = function () {
            sprites["edges"] = $(_Data.html.edges).appendTo(that.sceneOrtho);
        };

        var updateEdge = function () {
            sprites["edges"].css({
                'opacity': that.character.danger
            });
        };

        // Helper ----------------------------------------------------

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

            // png Loader -------------------------------------------------------------------------------------------
            tex['fog'] = _loadImg(path + 'fog2.png');
            tex['nameDeco'] = _loadImg(path + 'name-deco-white.png');
            tex['deadScreen'] = _loadImg(path + 'DeadScreen.png');
            tex['escapeScreen'] = _loadImg(path + 'EscapeScreen.png');

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

            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Open] = _loadImg(path + 'interaction.open.png');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Close] = _loadImg(path + 'interaction.close.png');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Key] = _loadImg(path + 'interaction.key.png');
            tex['interaction']['normal']['furniture'][_Data.operation.furniture.Search] = _loadImg(path + 'interaction.search.png');
            tex['interaction']['normal']['body'][_Data.operation.body.Search] = _loadImg(path + 'interaction.search.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Open] = _loadImg(path + 'interaction.door.open.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Close] = _loadImg(path + 'interaction.door.close.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Locked] = _loadImg(path + 'interaction.lock.png');
            tex['interaction']['normal']['door'][_Data.operation.door.Unlock] = _loadImg(path + 'interaction.unlock.png');
            //tex['interaction']['normal']['door'][_Data.operation.door.Block] = _loadImg(path + 'interaction.block.png');

            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Open] = _loadImg(path + 'interaction.open-2.png');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Close] = _loadImg(path + 'interaction.close-2.png');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Key] = _loadImg(path + 'interaction.key-2.png');
            tex['interaction']['highlight']['furniture'][_Data.operation.furniture.Search] = _loadImg(path + 'interaction.search-2.png');
            tex['interaction']['highlight']['body'][_Data.operation.body.Search] = _loadImg(path + 'interaction.search-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Open] = _loadImg(path + 'interaction.door.open-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Close] = _loadImg(path + 'interaction.door.close-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Locked] = _loadImg(path + 'interaction.lock-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Unlock] = _loadImg(path + 'interaction.unlock-2.png');
            tex['interaction']['highlight']['door'][_Data.operation.door.Block] = _loadImg(path + 'interaction.door.block-2.png');

            //tex['enduranceBarBase'] = _loadImg(root + Data.files.path[Data.categoryName.sprite] + 'EnduranceBar.png');
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