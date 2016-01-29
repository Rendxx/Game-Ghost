window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};

/**
 * Test controller, use dat-gui to adjust game parameter 
 */
(function (GAME) {

    GAME.Test = function (entity) {
        var wall = SetupWall(entity.env.scene);
        var light = SetupLight(entity.env.scene);
        var item = SetupItem(entity.env.scene);

        return {
            light: light,
            wall: wall,
            item: item
        };
    };
})(window.Rendxx.Game.Ghost);