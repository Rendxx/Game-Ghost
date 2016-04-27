window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Character manager, setup characters
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
    };
    var CharacterManager = function (entity) {
        // data ----------------------------------------------------------
        var that = this;

        this.characters = null;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.setup = function (players) {

        };

        this.reset = function () { };

        // private method ------------------------------------------------

        var _init = function () {
        };
        _init();
    };

    SYSTEM.CharacterManager = CharacterManager
})(window.Rendxx.Game.Ghost.System);