window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Sound
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var Sound = function (entity) {
        if (entity == null) throw new Error('Container not specified.');

        // data ----------------------------------------------
        var that = this,
            viewPlayerIdxList = null,
            playerNum = null;
        
        // public method -------------------------------------------------
        this.playerSetup = function (viewPlayer_in) {
            viewPlayerIdxList = viewPlayer_in;
            playerNum = viewPlayer_in.length;
        };

        this.update = function (soundDat) {
            if (soundDat == null) return;
        };

        // private method -------------------------------------------------

        // helper ------------------------
        var _init = function () {
        };

        _init();
    };

    RENDERER.Sound = Sound;
})(window.Rendxx.Game.Ghost.Renderer);