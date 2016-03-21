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
            modelData = {},
            mapData = {},
            playerData = null,
            setupData = {},     // data used for setup
            gameData = {},      // store all data in the game, use to render
            intervalFunc = null;

        // component ----------------------------------------------
        this.renderer = null;
        this.map = null;
        this.interAction = null;
        this.characters = [];
        
        // callback -----------------------------------------------
        this.onChange = null;       // callback for render
        this.onSetuped = null;
        this.onLoaded = null;
        this.onStarted = null;
        this.onEnded = null;


        // message -----------------------------------------------
        this.send = null;

        this.receive = function (msg) {
            this.interAction.receive(msg);
        };

        // public method ------------------------------------------
        // reset game with given data
        this.reset = function (setupData_in, gameData_in) {
            setupData = setupData_in;
            gameData = gameData_in;
            this.map.reset(setupData_in, gameData_in);
            for (var i = 0; i < that.characters.length; i++) {
                that.characters[i].reset(gameData_in !=null? gameData_in.characters[i]:null);
            }
        };

        // start game
        this.start = function () {
            if (intervalFunc != null) clearInterval(intervalFunc);
            intervalFunc = setInterval(nextInterval, 25);
            if (this.onStarted) this.onStarted();
        };

        // end game
        this.end = function (isWin) {
            if (intervalFunc != null) clearInterval(intervalFunc);
            if (this.onEnded) this.onEnded(isWin);
        };

        // setup game
        this.setup = function (modelData_in, mapData_in, playerData_in) {
            playerData = playerData_in;
            mapData = mapData_in;
            modelData = modelData_in;

            that.map = new SYSTEM.Map(that, modelData, mapData);
            that.map.onSetuped = function (data) {
                setupData.map = data;
            };
            that.map.onChange = function (data) {
                gameData.map = data;
            };
            that.interAction = new SYSTEM.InterAction(that);

            that.map.loadBasicData(modelData, mapData);
            gameData.characters = [];
            for (var i = 0; i < playerData.length; i++) {
                that.characters[i] = new SYSTEM.Character(i, playerData[i], modelData.characters, that);
                that.characters[i].onChange = function (idx, data) {
                    gameData.characters[idx] = data;
                };
            }
        };
        
        // private method -----------------------------------------
        // called every time frame
        var nextInterval = function () {
            for (var i = 0; i < that.characters.length; i++) {
                that.characters[i].nextInterval();
            }

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

            if (that.onChange) that.onChange(gameData);
        };

        var _init = function () {
        };
        _init();
    };

    /**
     * Create a game in domElement
     */
    SYSTEM.Create = function () {
        var main = new Main();
        return main;
    };
})(window.Rendxx.Game.Ghost);