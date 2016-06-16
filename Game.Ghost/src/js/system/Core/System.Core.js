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
            gameData = {},      // store all data in the game, use to render
            updateData = {},    // data updated in the time interval
            intervalFunc = null,
            flag_started = false,
            flag_setuped = false;

        // component ----------------------------------------------
        this.map = null;
        this.sound = null;
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
            gameData = gameData_in;
            initComponent(setupData_in.model, setupData_in.map, setupData_in.player);
            this.characterManager.reset(setupData_in.player, (gameData_in !== null && gameData_in !== undefined) ? gameData_in.characters : null);
            this.map.reset(setupData_in.mapSetup);
            this.interAction.reset();
            this.userInput.reset(this.characterManager.characters, this.characterManager.index2Id);
            flag_setuped = true;
            if (flag_started && !isStarted) this.start();
        };

        // setup game
        this.setup = function (modelData, mapData, playerData) {
            gameData.map = {};
            gameData.characters = [];
            updateData = [
                {},     // map
                [],     // character
                null,
                null
            ];
            initComponent(modelData, mapData, playerData);
            this.map.setup();
            this.interAction.reset();
            this.characterManager.setup(this.map.position.survivor, this.map.position.ghost);
            this.userInput.reset(this.characterManager.characters, this.characterManager.index2Id);
            var setupData = {
                'model': modelData,
                'map': mapData,
                'mapSetup': this.map.setupData,
                'player': this.characterManager.setupData
            };
            for (var i in playerData) {
                var c = 
                this.clientSetup([i], {
                    role: playerData[i].role,
                    portrait: this.characterManager.characters[this.characterManager.id2Index[i]].modelData.portrait,
                    color: this.characterManager.characters[this.characterManager.id2Index[i]].color
                });
            }

            flag_setuped = true;
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
            intervalFunc = setInterval(function () { nextInterval(); }, 40);
        };

        // end game
        this.end = function () {
            isStarted = false;
            if (intervalFunc !== null) clearInterval(intervalFunc);

            gameData['end'] = this.characterManager.getEndInfo();
            if (this.onEnd) this.onEnd(gameData['end']);
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

        // private method -----------------------------------------
        // called every time frame
        var nextInterval = function () {
            try {
                updateData = [
                    {},     // map
                    []      // character
                ];
                that.interAction.update();
                that.characterManager.update();
                gameData.message = that.message.getNewMsg();
                gameData.sound = that.sound.getSoundDat();
                updateData[2] = gameData.message;
                if (that.characterManager.checkEnd()) { that.end(); }
                if (that.onUpdated) that.onUpdated(gameData);
            } catch (e) {
                console.log(e);
            }
        };

        // init component
        var initComponent = function (modelData, mapData, playerData) {
            that.map = new SYSTEM.Map(that, modelData, mapData, gameData.map, updateData[0]);
            that.characterManager = new SYSTEM.CharacterManager(that, modelData, playerData, gameData.characters, updateData[1]);
            that.interAction = new SYSTEM.InterAction(that);
            that.message = new SYSTEM.Message();
            that.sound = new SYSTEM.Sound();
            that.userInput = new SYSTEM.UserInput(that);
        };
    };

    SYSTEM.Core = Core;
})(window.Rendxx.Game.Ghost.System);