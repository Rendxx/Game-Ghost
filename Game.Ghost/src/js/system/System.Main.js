window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Main entry of Game.Ghost system
 */
(function (GAME) {
    var SYSTEM = GAME.System;
    var RENDERER = GAME.Renderer;
    var Data = SYSTEM.Data;
    /**
     * Game Entity
     */
    var Main = function () {
        // data ---------------------------------------------------
        var that = this,
            characterIdxMap = null,
            isStarted = false,
            gameData = {},      // store all data in the game, use to render
            players = null,
            intervalFunc = null,
            flag_started = false,
            flag_setuped = false;

        this.characterRoleMap =
            {
                survivor: [],
                ghost: []

            };
        // component ----------------------------------------------
        this.renderer = null;
        this.map = null;
        this.message = null;
        this.interAction = null;
        this.userInput = null;
        this.characters = [];

        // message -----------------------------------------------
        this.send = null;

        this.receive = function (msg) {
        };

        this.action = function (clientId, dat) {
            if (!characterIdxMap.hasOwnProperty(clientId)) return;
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
            if (setupData_in == null) return;
            gameData = gameData_in;
            initComponent(setupData_in.model, setupData_in.map, setupData_in.player);
            characterIdxMap = setupData_in.characterIdxMap;
            this.characterRoleMap = setupData_in.characterRoleMap;
            this.map.reset(setupData_in.mapSetup);
            for (var i = 0; i < that.characters.length; i++) {
                that.characters[i].reset(gameData_in != null ? gameData_in.characters[i] : null);
            }
            this.interAction.reset();
        };

        // setup game
        this.setup = function (modelData, mapData, playerData) {
            gameData.map = {};
            gameData.characters = [];
            initComponent(modelData, mapData, playerData);
            this.map.setup();
            this.interAction.reset();
            var setupData = {
                'model': modelData,
                'map': mapData,
                'player': players,
                'mapSetup': this.map.setupData,
                'characterIdxMap': characterIdxMap,
                'characterRoleMap': this.characterRoleMap
            };
            this.onSetuped(setupData);
            flag_setuped = true;
            if (flag_started && !isStarted) this.start();
        };

        // game ------------------------------------------------
        // start game
        this.start = function () {
            flag_started = true;
            if (flag_setuped == false) return;
            isStarted = true;
            if (intervalFunc != null) clearInterval(intervalFunc);
            intervalFunc = setInterval(function () { nextInterval(); }, 25);
        };

        // end game
        this.end = function (isWin) {
            isStarted = false;
            if (intervalFunc != null) clearInterval(intervalFunc);
            gameData['end'] = isWin ? "Suvivor Escaped!!!" : "All KILL!!!"
            if (this.onEnd) this.onEnd(isWin);
        };

        // renew game
        this.renew = function () {
            // to do
            isStarted = false;
            if (intervalFunc != null) clearInterval(intervalFunc);
        };

        // pause game
        this.pause = function () { };

        // continue game
        this.continue = function () { };

        // private method -----------------------------------------
        // called every time frame
        var nextInterval = function () {
            if (gameData == null) return;
            for (var i = 0; i < that.characters.length; i++) {
                that.characters[i].nextInterval();
            }
            gameData.message = that.message.getNewMsg();

            // end check ----------------------------------
            var win = 0, isEnd = true;
            for (var i = 0; i < that.characters.length; i++) {
                if (that.characters[i].role == Data.character.type.survivor) {
                    if (that.characters[i].hp > 0 && !that.characters[i].win) {
                        isEnd = false;
                        break;
                    }
                    if (that.characters[i].win) win++;
                }
            }
            if (isEnd) that.end(win > 0);
            // ----------------------------------------------

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
            that.userInput = new SYSTEM.UserInput(that);

            var index = 0;
            players = [];
            for (var i in playerData) {
                if (playerData[i].role == Data.character.type.survivor) {
                    that.characters[index] = new SYSTEM.Character.Survivor(index, playerData[i], modelData.characters, that);
                    that.characterRoleMap.survivor.push(index);
                } else if (playerData[i].role == Data.character.type.ghost) {
                    that.characters[index] = new SYSTEM.Character.Ghost(index, playerData[i], modelData.characters, that);
                    that.characterRoleMap.ghost.push(index);
                }
                that.characters[index].onChange = function (idx, data) {
                    gameData.characters[idx] = data;
                };
                players[index] = playerData[i];
                characterIdxMap[i] = index++;
            }
        };
    };

    /**
     * Create a game in domElement
     */
    SYSTEM.Create = function () {
        var main = new Main();
        return main;
    };
})(window.Rendxx.Game.Ghost);