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
            isLoaded = 0,       // 0: not loaded,  2: fully loaded
            modelData = {},
            mapData = {},
            playerData = null,
            gameData = {};      // store all data in the game, use to render

        // component ----------------------------------------------
        var loader = null;
        this.renderer = null;
        this.map = null;
        this.interAction = null;
        this.characters = [];
        
        // callback -----------------------------------------------
        this.onChange = null;       // callback for render
        this.onLoaded = null;
        this.onStarted = null;
        this.onEnded = null;


        // message -----------------------------------------------
        this.send = null;

        this.receive = function (msg) {

        };

        // public method ------------------------------------------
        // reset game with given data
        this.reset = function (gameData) {
            if (isLoaded < 2) return false;
        };

        // start game
        this.start = function () {
            if (isLoaded < 2) return false;

            if (this.onStarted) this.onStarted();
        };

        // end game
        this.end = function () {
            if (this.onEnded) this.onEnded();
        };

        // setup game
        this.setup = function (players, mapName) {
            playerData = players;
            if (Data.map.files[mapName] == null) throw new Error('Map can not be found.');
            loader.loadMap(Data.map.files[mapName], function (data) {
                mapData = data;
                onLoaded();
            },
            function (e) {
                throw new Error('Map Loading Error: ' + e);
            });
        };

        // store game data
        this._storeGameData = function (module, data) {
            gameData[module] = data;
        };

        // private method -----------------------------------------
        var onLoaded = function () {
            isLoaded++;
            if (isLoaded == 2) {
                that.map.load(modelData, mapData);
                for (var i = 0; i < playerData.length; i++) {
                    that.characters[i] = new SYSTEM.Character(i, playerData[i], modelData.characters);
                }
                that.onLoaded(modelData, mapData, playerData);
            }
        };

        var _init = function () {
            that.map = new SYSTEM.Map(that);
            that.interAction = new SYSTEM.InterAction(that);

            loader = new SYSTEM.FileLoader();
            loader.loadBasic(function (data) {
                modelData = data;
                onLoaded();
            });
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