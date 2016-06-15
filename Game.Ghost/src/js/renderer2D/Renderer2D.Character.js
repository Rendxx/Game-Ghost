window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Character Renderer
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = RENDERER.Data.grid.size;
    var _Data = {
        teamColor: [
            0xFF6600,
            0x0099CC,
            0xff0000
        ],
        html: {
            character: '<div class="_character"></div>',
            shadow: '<div class="_shadow"></div>',
            layer: '<div class="_layer _layer_char"></div>',
            scene: {
                character: '<div class="_scene_character"></div>'
            }
        }
    };
    var Character = function (entity, id, modelData, characterPara, isMain) {
        // data ----------------------------------------------
        var that = this,
            root = entity.root,
            _para = characterPara,
            _data = modelData[_para.role][_para.modelId];

        var _win = false,
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
        this.element = null;
        this.shadow = null;
        this.highlight = null;
        this.materials = null;
        this.actions = null;
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
            cache_lightR = null,
            teleportingFlag = false,
            torchData = Data.character.parameter[_para.role].light.torch,
            topLightData = Data.character.parameter[_para.role].light.top,
            noTorchData = Data.character.parameter[_para.role].light.noTorch;

        // callback -------------------------------------------------------
        this.onLoaded = null;

        // public method --------------------------------------------------
        // update data from system
        this.update = function (data_in, isVisible_in) {
            if (lightType !== data_in.light) {
                lightType = data_in.light;
            }

            gameData = data_in;
            that.isVisible = isVisible_in;
        };

        this.showMessage = function (msg) {
            this.message = msg;
        };

        // render model
        this.render = function (delta) {
            if (gameData === null) return;
            if (this.isVisible === false) {
                this.element.css({ opacity: 0 });
                this.shadow.css({ opacity: 0 });
                return;
            } else {
                this.element.css({ opacity: 1 });
                this.shadow.css({ opacity: 1 });
            }
            var action = gameData.action;
            var x = (gameData.x) * GridSize;
            var y = (gameData.y ) * GridSize;
            var r_body = gameData.currentRotation.body;
            var r_head = gameData.currentRotation.headBody;
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

            // dead
            if (isDead) {
                if (currentAction !== action) {
                    this.element.css({
                        'background-image': 'url("' + root + Data.character.path + _data.path + action + '.gif")'
                    });
                }
                return;
            } else if (isWin) {
                if (currentAction !== action) {
                    this.element.css({
                        'background-image': 'url("' + root + Data.character.path + _data.path + action + '.gif")'
                    });
                }
                return;
            }
            // move

            if (currentAction !== action) {
                this.element.css({
                    'background-image': 'url("' + root + Data.character.path + _data.path + action + '.gif")'
                });
                currentAction = action;
            }

            // rotate
            var r1 = r_body / 180 * Math.PI;
            var r2 = -r_head / 180 * Math.PI;
            var r3 = r1 - r2;

            // transform
            if (isMain) {
                this.element.css({
                    'transform': 'rotate(' + -r_body + 'deg) scale(1.25, 1.25) '
                });
            } else {
                this.element.css({
                    'transform': 'translate(' + x + 'px,' + y + 'px) rotate(' + -r_body + 'deg) scale(1.25, 1.25) '
                });
                this.shadow.css({
                    'transform': 'translate(' + x + 'px,' + y + 'px) '
                });
            }

            this.rotation = {
                body: r2,
                head: r3
            };
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
        this.load = function () {
            if (isMain) {
                var layer = entity.env.scene['character'] = $(_Data.html.scene['character']).appendTo($(entity.domElement));;
                that.element = $(_Data.html.character).css({
                    'width': GridSize + 'px',
                    'height': GridSize + 'px',
                    'margin-top': -GridSize / 2 + 'px',
                    'margin-left': -GridSize / 2 + 'px',
                    'background-image': 'url("' + root + Data.character.path + _data.path + 'idle.gif")'
                }).appendTo(layer);
                that.shadow = $(_Data.html.shadow).css({
                    'width': 2 + 'px',
                    'height': 2 + 'px',
                    'margin-top': -1 + 'px',
                    'margin-left': -1 + 'px'
                }).appendTo(layer);
            } else {
                var layer = entity.env.layers.character;
                if (layer == null) {
                    entity.env.layers.character = layer = $(_Data.html.layer).appendTo(entity.env.scene['map']);
                }
                that.element = $(_Data.html.character).css({
                    'width': GridSize + 'px',
                    'height': GridSize + 'px',
                    'margin-top': -GridSize / 2 + 'px',
                    'margin-left': -GridSize / 2 + 'px',
                    'background-image': 'url("' + root + Data.character.path + _data.path + 'idle.gif")'
                }).appendTo(layer);
                that.shadow = $(_Data.html.shadow).css({
                    'width': 2 + 'px',
                    'height': 2 + 'px',
                    'margin-top': -1 + 'px',
                    'margin-left': -1 + 'px'
                }).appendTo(layer);
            }

            that.setuped = true;
            if (that.onLoaded !== null) that.onLoaded();
        };
        
        // sprite ---------------------------------------------------------
        var setupSprite = function () {
            spriteTex = {
            };
            //var textureLoader = new THREE.TextureLoader();
            //spriteTex['highlight'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'playerHighlight.png');
            spriteTex['highlight'] = _loadImg(root + Data.files.path[Data.categoryName.sprite] + 'playerHighlight.png');
        };
        var _loadImg = function (name) {
            var img = new Image();
            img.src = name;
            return img;
        };

        // setup ----------------------------------------------------------
        var _init = function () {
            setupSprite();
        };

        _init();
    };

    /**
     * Render character
     * @param {game entity} entity - Game entity
     */
    RENDERER.Character = Character;
})(window.Rendxx.Game.Ghost.Renderer2D);