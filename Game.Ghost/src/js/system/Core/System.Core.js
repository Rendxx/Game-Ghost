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
            characterIdxMap = null,         // id: index
            isStarted = false,
            gameData = {},      // store all data in the game, use to render
            intervalFunc = null,
            flag_started = false,
            flag_setuped = false;

        this.characterRoleMap =
            {
                survivor: [],
                ghost: []

            };
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
            if (!isStarted || characterIdxMap === null || !characterIdxMap.hasOwnProperty(clientId)) return;
            this.userInput.action(characterIdxMap[clientId], dat);
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
            characterIdxMap = setupData_in.characterIdxMap;
            this.map.reset(setupData_in.mapSetup);
            this.interAction.reset();
            this.characterManager.reset((gameData_in !== null && gameData_in !== undefined) ? gameData_in.characters[i] : null);
            this.userInput.reset(this.characterManager.characters);
            flag_setuped = true;
            if (flag_started && !isStarted) this.start();
        };

        // setup game
        this.setup = function (modelData, mapData, playerData) {
            gameData.map = {};
            gameData.characters = [];
            initComponent(modelData, mapData, playerData);
            this.map.setup();
            this.interAction.reset();
            this.characterManager.setup();
            this.userInput.reset(this.characterManager.characters);
            var setupData = {
                'model': modelData,
                'map': mapData,
                'mapSetup': this.map.setupData,
                'characterIdxMap': characterIdxMap
            };
            for (var i in playerData) {
                this.clientSetup([i], { role: playerData[i].role, color: this.characterManager.characters[characterIdxMap[i]].color });
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
            intervalFunc = setInterval(function () { nextInterval(); }, 25);
        };

        // end game
        this.end = function () {
            isStarted = false;
            if (intervalFunc !== null) clearInterval(intervalFunc);

            var survivorWin = false;
            var winTeam = -1;
            var win = 0, isEnd = true, survivorEnd = {};
            for (var i = 0; i < that.characters.length; i++) {
                if (that.characters[i].role === Data.character.type.survivor) {
                    if (that.characters[i].win) {
                        survivorWin = true;
                        winTeam = that.characters[i].team;
                    }

                    survivorEnd[that.characters[i].id] = {
                        name: that.characters[i].name,
                        isWin: that.characters[i].win
                    };
                }
            }

            gameData['end'] = {
                survivorWin: survivorWin,
                survivorEnd: survivorEnd,
                team: winTeam
            };
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
            that.interAction.update();
            that.characterManager.update();
            gameData.message = that.message.getNewMsg();
            gameData.sound = that.sound.getSoundDat();
            if (that.characterManager.checkEnd()) { that.end(); }
            if (that.onUpdated) that.onUpdated(gameData);
        };

        // init component
        var initComponent = function (modelData, mapData, playerData) {
            characterIdxMap = {};
            that.characterRoleMap =
            {
                survivor: [],
                ghost: []
            };

            that.map = new SYSTEM.Map(that, modelData, mapData, gameData.map);
            that.interAction = new SYSTEM.InterAction(that);
            that.message = new SYSTEM.Message();
            that.sound = new SYSTEM.Sound();
            that.userInput = new SYSTEM.UserInput(that);
            that.characterManager = new SYSTEM.CharacterManager(that, playerData, gameData.characters);
        };
    };

    SYSTEM.Core = Core;
})(window.Rendxx.Game.Ghost.System);