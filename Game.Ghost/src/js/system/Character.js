window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Character manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var Character = function (id, characterData) {
        // data ----------------------------------------------------------
        var that = this;

        this.name = null;
        this.role = null;
        this.x = -1;
        this.y = -1;
        this.package = {};
        this.endurance = 0;
        this.light = 0;
        this.battery = 0;
        this.hp = 0;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------

        // private method ------------------------------------------------

        var _init = function () {
        };
        _init();
    };

    SYSTEM.Character = Character
})(window.Rendxx.Game.Ghost.System);