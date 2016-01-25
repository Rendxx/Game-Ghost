window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};

/**
 * Main entry of Game.Ghost 
 */
(function (GAME) {
    /**
     * Game Entity
     */
    var Entity = function (container, playerNumber) {
        // data
        this.domElement = container;
        this.playerNumber = playerNumber;
        this.env = null;

        // callback
        this.onRender = null;
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {number} playerNumber - player number
     */
    GAME.Create = function (container, playerNumber) {
        var entity = new Entity(container, playerNumber);
        entity.env = GAME.SetupEnv(entity);
    };
})(window.Rendxx.Game.Ghost);