window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Main entry of Game.Ghost 
 */
(function (RENDERER) {
    /**
     * Game Entity
     */
    var Entity = function (container, playerNumber) {
        // data
        this.domElement = container;
        this.playerNumber = playerNumber;
        this.env = null;
        this.map = null;
        this.test = null;

        var _mapData = null,
            _modelData = null;

        // public method --------------------------------
        this.load = function (modelData, mapData) {
            _mapData = mapData;
            _modelData = modelData;
            this.map.loadModelData(_modelData);
            this.map.reset(_mapData);
        };

        // api -------------------------------------------
        this.show = function () {
            this.domElement.fadeIn()
        };

        this.hide = function () {
            this.domElement.fadeOut()
        };

        this.updateClient = function (clientData) {
        };

        this.updateGame = function (gameData) {
        };


        // callback
        this.onRender = null;
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {number} playerNumber - player number
     * @param {object} map - data used to create a map
     */
    RENDERER.Create = function (container, playerNumber) {
        var entity = new Entity(container, playerNumber);
        entity.env = new RENDERER.SetupEnv(entity);
        entity.map = new RENDERER.Map(entity);
        entity.test = new RENDERER.Test(entity);
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer);