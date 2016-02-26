window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Main entry of Game.Ghost system
 */
(function (GAME) {
    var SYSTEM = GAME.SYSTEM;
    var RENDERER = GAME.RENDERER;
    var Data = SYSTEM.Data;
    /**
     * Game Entity
     */
    var Main = function (container) {
        // data ---------------------------------------------------
        var that = this,
            isLoaded = 0,       // 0: not loaded,  2: fully loaded
            modelData = {};

        // component ----------------------------------------------
        var loader = null;
        this.renderer = null;
        this.map = null;
        this.interAction = null;
        this.characters = [];
        
        // callback -----------------------------------------------
        this.onLoaded = null;
        this.onStarted = null;
        this.onEnded = null;

        // public method ------------------------------------------
        // start game
        this.start = function () {
            if (this.onStarted) this.onStarted();
        };

        // end game
        this.end = function () {
            if (this.onEnded) this.onEnded();
        };

        // setup game
        this.setup = function (players, mapName) {
            if (Data.map.files[mapName] == null) throw new Error('Map can not be found.');
            loader.loadMap(mapName, function (data) {
                that.map.load(data);
                that.renderer.loadMap(data);
                for (var i = 0; i < players.length; i++) {
                    that.characters[i] = new SYSTEM.Character(i, players[i]);
                }
                that.renderer.loadCharacter(players);
                onLoaded();
            },
            function (e) {
                throw new Error('Map Loading Error: ' + e);
            });
        };

        // private method -----------------------------------------
        var onLoaded = function () {
            isLoaded++;
            if (isLoaded == 2) that.onLoaded();
        };

        var _init = function () {
            that.renderer = new RENDERER.Create(container);
            that.map = new SYSTEM.Map(that);
            that.interAction = new SYSTEM.InterAction(that);

            loader = new SYSTEM.FileLoader();
            loader.loadBasic(function (data) {
                modelData = data;
                that.renderer.loadModelData(modelData);
                onLoaded();
            });
        };
        _init();
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {number} playerNumber - player number
     * @param {object} map - data used to create a map
     */
    SYSTEM.Create = function (container) {
        var main = new Main(container);
        return main;
    };
})(window.Rendxx.Game.Ghost);