window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Core entry of Game.Ghost system
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    /**
     * Game Entity
     */
    var Core = function () {
        // data ---------------------------------------------------
        var that = this,
            isStarted = false,
            playerReady = {},
            gameData = {},          // store all data in the game, use to render
            intervalFunc = null,
            flag_started = false,
            flag_setuped = false,
            check_count = 0;        // count left to send full data  

        // component ----------------------------------------------
        this.map = null;
        this.sound = null;
        this.noise = null;
        this.effort = null;
        this.quickTimeEvent = null;
        this.message = null;
        this.userInput = null;
        this.interAction = null;
        this.characterManager = null;

        // message -----------------------------------------------
        this.send = null;

        this.receive = function (msg) {
        };

        this.action = function (clientId, dat) {
            if (!isStarted) return;
            this.userInput.action(clientId, dat);
        };

        // callback -----------------------------------------------
        this.onUpdated = null;       // callback for render
        this.onSetuped = null;
        this.clientSetup = null;    // (target, clientData)
        this.clientUpdate = null;   // (target, clientData)
        this.onEnd = null;          // (isWin)

        // public method ------------------------------------------
        // reset game with given data
        this.reset = function (setupData_in, gameData_in) {
            if (setupData_in === undefined || setupData_in === null) return;
            gameData.map = [{}, {}];                // [ all data , modified data ]
            gameData.characters = [[], []];         // [ basic data , assist data ]
            gameData.qte = {};
            gameData.map[0] = gameData_in[0];
            gameData.characters[0] = gameData_in[1];
            initComponent(setupData_in.model, setupData_in.map, setupData_in.player);
            this.characterManager.reset(setupData_in.player, (gameData_in !== null && gameData_in !== undefined) ? gameData_in[1] : null);
            this.map.reset(setupData_in.mapSetup);
            this.interAction.reset();
            this.userInput.reset(this.characterManager.characters, this.characterManager.index2Id);
            flag_setuped = true;
            if (flag_started && !isStarted) this.start();
        };

        // setup game
        this.setup = function (modelData, mapData, playerData) {
            gameData.map = [{}, {}];                // [ all data , modified data ]
            gameData.characters = [[], []];         // [ basic data , assist data ]
            gameData.qte = {};
            initComponent(modelData, mapData, playerData);
            this.map.setup();
            this.interAction.reset();
            this.characterManager.setup(this.map.position.survivor, this.map.position.ghost);
            this.map.setElecticNeed(this.characterManager.survivorNumber + 1);
            this.userInput.reset(this.characterManager.characters, this.characterManager.index2Id);
            var setupData = {
                'model': modelData,
                'map': mapData,
                'mapSetup': this.map.setupData,
                'player': this.characterManager.setupData
            };

            flag_setuped = true;
            playerReady = {};
            for (var i in playerData) {
                playerReady[this.characterManager.characters[this.characterManager.id2Index[i]].id] = false;
                this.clientSetup([i], {
                    role: playerData[i].role,
                    modelId: playerData[i].modelId,
                    portrait: this.characterManager.characters[this.characterManager.id2Index[i]].modelData.portrait,
                    color: this.characterManager.characters[this.characterManager.id2Index[i]].color,
                    game: setupData
                });
            }
            this.onSetuped(setupData);
            if (flag_started && !isStarted) this.start();
        };

        // game ------------------------------------------------
        // start game
        this.start = function () {
            flag_started = true;
            if (flag_setuped === false) return;
            isStarted = true;
            if (intervalFunc !== null) clearInterval(intervalFunc);
        };

        // end game
        this.end = function () {
            isStarted = false;
            if (intervalFunc !== null) clearInterval(intervalFunc);

            gameData['end'] = this.characterManager.getEndInfo();
        };

        // renew game
        this.renew = function () {
            // to do
            isStarted = false;
            if (intervalFunc !== null) clearInterval(intervalFunc);

            intervalFunc = null;
        };

        // pause game
        this.pause = function () { };

        // continue game
        this.continue = function () { };

        this.userReady = function (id) {
            if (!flag_started || !isStarted) return;
            _start(id);
        };

        // private method -----------------------------------------
        // start playing game
        var _start = function (id) {
            if (intervalFunc != null) return;
            playerReady[id] = true;
            for (var i in playerReady) {
                if (!playerReady[i]) return;
            }
            intervalFunc = setInterval(function () { nextInterval(); }, 40);
        };

        // handler update data
        var _update = function () {
            if (--check_count < 0) {
                check_count = 200;
                // full data
                var idList = [];
                for (var i = 0, len = that.characterManager.characters.length; i < len; i++) {
                    var id = that.characterManager.index2Id[i];
                    if (that.characterManager.characters[i].role !== Data.character.type.ghost) {
                        idList.push(id);
                        continue;
                    };
                    var assist = [];
                    assist[i] = gameData.characters[1][i];
                    that.clientUpdate([id], [
                        gameData.map[0],
                        gameData.characters[0],
                        assist,
                        gameData.message,
                        gameData.noise,
                        gameData.effort,
                        gameData.qte
                    ]);
                }
                if (idList.length>0) that.clientUpdate([idList], 1);

                if (that.onUpdated) that.onUpdated(
                    [   // to RENDERER
                        gameData.map[0],
                        gameData.characters[0],
                        gameData.characters[1],
                        gameData.message,
                        gameData.sound,
                        gameData.noise,
                        gameData.effort,
                        gameData.qte,
                        gameData.end
                    ],
                    [   // to SERVER
                        gameData.map[0],
                        gameData.characters[0]
                    ]);
            } else {
                var idList = [];
                for (var i = 0, len = that.characterManager.characters.length; i < len; i++) {
                    var id = that.characterManager.index2Id[i];
                    if (that.characterManager.characters[i].role !== Data.character.type.ghost) {
                        idList.push(id);
                        continue;
                    };
                    var assist = [];
                    assist[i] = gameData.characters[1][i];
                    that.clientUpdate([id], [
                        gameData.map[1],
                        gameData.characters[0],
                        assist,
                        gameData.message,
                        gameData.noise,
                        gameData.effort,
                        gameData.qte
                    ]);
                }
                if (idList.length > 0) that.clientUpdate([idList], 1);

                if (that.onUpdated) that.onUpdated(
                    [   // to RENDERER
                        gameData.map[1],
                        gameData.characters[0],
                        gameData.characters[1],
                        gameData.message,
                        gameData.sound,
                        gameData.noise,
                        gameData.effort,
                        gameData.qte,
                        gameData.end
                    ],
                    [   // to SERVER
                        gameData.map[0],
                        gameData.characters[0]
                    ]);
            }
            gameData.map.updateData = {};
        };

        // send end message
        var _updateEnd = function () {
            for (var i = 0, len = that.characterManager.characters.length; i < len; i++) {
                var id = that.characterManager.index2Id[i];
                var assist = [];
                assist[i] = gameData.characters[1][i];
                that.clientUpdate([id], [
                    gameData.map[0],
                    gameData.characters[0],
                    assist,
                    gameData.message,
                    gameData.noise,
                    gameData.effort,
                    gameData.end,
                    i
                ]);
            }

            if (that.onUpdated) that.onUpdated(
                [
                    gameData.map[0],
                    gameData.characters[0],
                    gameData.characters[1],
                    gameData.message,
                    gameData.sound,
                    gameData.noise,
                    gameData.effort,
                    gameData.qte,
                    gameData.end
                ],
                [   // to SERVER
                    gameData.map[0],
                    gameData.characters[0]
                ]);
            gameData.map.updateData = {};
        };

        //var _test = 100;
        // called every time frame
        var nextInterval = function () {
            try {
                // ---------------------------------------
                //if (_test <= 0) {
                //    //that.noise.once(SYSTEM.Noise.Data.Name.Key, 10, 10);
                //    that.noise.once(Math.floor(Math.random() * 4), 10 + Math.floor(Math.random() * 20), 10 + Math.floor(Math.random() * 20));
                //    _test=30;
                //} else
                //_test--;

                // ---------------------------------------
                that.interAction.update();
                that.characterManager.update();
                that.quickTimeEvent.update();
                gameData.message = that.message.getNewMsg();
                gameData.sound = that.sound.getSoundDat();
                gameData.noise = that.noise.getNoiseDat();
                gameData.effort = that.effort.getEffortDat();
                if (that.characterManager.checkEnd()) {
                    that.end();
                    _updateEnd();
                    if (that.onEnd) that.onEnd(gameData['end']);
                } else {
                    _update();
                }
            } catch (e) {
                //console.log(e);
            }
        };

        // init component
        var initComponent = function (modelData, mapData, playerData) {
            that.map = new SYSTEM.Map(that, modelData, mapData, gameData.map);
            that.characterManager = new SYSTEM.CharacterManager(that, modelData, playerData, gameData.characters);
            that.interAction = new SYSTEM.InterAction(that);
            that.message = new SYSTEM.Message();
            that.sound = new SYSTEM.Sound();
            that.noise = new SYSTEM.Noise(that);
            that.effort = new SYSTEM.Effort(that);
            that.quickTimeEvent = new SYSTEM.QuickTimeEvent(that, gameData.qte);
            that.userInput = new SYSTEM.UserInput(that);
        };
    };

    SYSTEM.Core = Core;
})(window.Rendxx.Game.Ghost.System);