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

        // callback
        this.onRender = null;
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {number} playerNumber - player number
     * @param {object} map - data used to create a map
     */
    RENDERER.Create = function (container, playerNumber, map) {
        var entity = new Entity(container, playerNumber);
        entity.env = new RENDERER.SetupEnv(entity);
        entity.map = new RENDERER.Map(entity, map);
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer);