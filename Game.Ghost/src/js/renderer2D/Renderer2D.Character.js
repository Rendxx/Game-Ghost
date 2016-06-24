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
            imgWrap: '<div class="_img_wrap"></div>',
            img: '<img src="" class="_img" />',
            shadow: '<div class="_shadow"></div>',
            layer: '<div class="_layer _layer_char"></div>',
            scene: {
                character: '<div class="_scene_character"></div>'
            }
        }
    };
    var Character = function (entity, id, modelData, characterPara) {
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
        this.action2D = _data.action2D;
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
            cache_lightR = null,
            cache_protect = null,
            teleportingFlag = false,
            actionList = {},
            currentAction = null,
            torchData = Data.character.parameter[_para.role].light.torch,
            topLightData = Data.character.parameter[_para.role].light.top,
            noTorchData = Data.character.parameter[_para.role].light.noTorch,

            html_imgWrap = null,
            html_img = null;

        // callback -------------------------------------------------------
        this.onLoaded = null;

        // public method --------------------------------------------------
        // update data from system
        this.update = function (data_in, assist_in, isVisible_in) {
            assist_in = assist_in || [];
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
            that.isVisible = isVisible_in;
        };

        this.showMessage = function (msg) {
            this.message = msg;
        };

        // render model
        this.render = function (delta) {
            if (gameData === null) return;
            if (this.isVisible === false) {
                this.element.visible=false;
                return;
            } else {
                this.element.true = false;
            }

            var action = gameData.action;
            var x = (gameData.x) * GridSize;
            var y = (gameData.y) * GridSize;
            var r_body = gameData.currentRotation[1];
            var r_head = gameData.currentRotation[2];
            var isDead = gameData.hp === 0;
            var isWin = gameData.win;

            this.endurance = gameData.endurance;
            this.accessObject = gameData.accessObject;
            this.longInteractionObj = gameData.longInteractionObj;
            this.visibleObject = gameData.visibleObject;
            this.danger = gameData.danger;


            //console.log(x+"  "+y+"  "+r_body+"  "+r_head);
            if (!this.setuped) return;

            this.x = x;
            this.y = y;
            this.isDead = isDead;
            this.isWin = isWin;

            if (gameData.protect != undefined && gameData.protect !== cache_protect) {
                cache_protect = gameData.protect;
                if (gameData.protect > 0) {
                    this.element.alpha = 0.5;
                } else {
                    this.element.alpha = 1;
                }
            }

            // dead
            if (isDead) {
                if (currentAction !== action) {
                    this.element.position.x = x;
                    this.element.position.y = y;
                    this.element.position.rotation = -r_body/180*Math.PI;
                    changeAction(action);
                }
                return;
            } else if (isWin) {
                if (currentAction !== action) {
                    changeAction(action);
                }
                return;
            }
            // move

            if (currentAction !== action) {
                changeAction(action);
                currentAction = action;
            }

            // rotate
            var r1 = r_body / 180 * Math.PI;
            var r2 = -r_head / 180 * Math.PI;
            var r3 = r1 - r2;

            // transform
            this.element.css({
                'transform': 'translate(' + x + 'px,' + y + 'px) rotate(' + -r_body + 'deg) scale(1.25, 1.25) translateZ(0)'
            });
            this.shadow.css({
                'transform': 'translate(' + x + 'px,' + y + 'px) translateZ(0)'
            });

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
            that.element = new PIXI.Container();
            that.element.pivot.set(0.5 * GridSize, 0.5 * GridSize);
            entity.env.scene['character'].addChild(that.element);
            var _loadCount = 0;

            var _onLoad = function () {
                if (--_loadCount > 0) return;
                that.setuped = true;
                if (that.onLoaded !== null) that.onLoaded();
            };

            for (var i = 0; i < that.action2D.length; i++) {
                var actionName = that.action2D[i];
                _loadCount++;
                PIXI.loader
                    .add(actionName, root + Data.character.path + _data.path +actionName+ '.json')
                    .load(function (loader, resources) {
                        var frames = [];

                        var i = 0;
                        while (true) {
                            var val = i < 10 ? '0' + i : i;
                            if (!resources[actionName].data.frames.hasOwnProperty(actionName + '00' + val)) break;
                            frames.push(PIXI.Texture.fromFrame(actionName+'00' + val));
                        }

                        var item = new PIXI.extras.MovieClip(frames);
                        item.animationSpeed = 1;
                        that.element.addChild(item);
                        item.loop = true;
                        item.visible = false;
                        actionList[actionName] = item;
                        _onLoad();
                    });
            }
        };

        // sprite ---------------------------------------------------------
        var changeAction = function (action) {
            if (currentAction !== null) {
                actionList[currentAction].stop();
                actionList[currentAction].visible = false;
            }
            currentAction = action;
            actionList[currentAction].gotoAndPlay(0);
            actionList[currentAction].visible = true;
        };

        // setup ----------------------------------------------------------
        var _init = function () {
        };

        _init();
    };

    /**
     * Render character
     * @param {game entity} entity - Game entity
     */
    RENDERER.Character = Character;
})(window.Rendxx.Game.Ghost.Renderer2D);