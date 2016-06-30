window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Noise manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
        Name: {
            'Key': 0,
            'Door': 1,
            'Touch': 2,
            'Operation': 3
        }
    };
    var Noise = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            _sounds_once = [],
            id = 0;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.once = function (soundName, x, y) {
            _sounds_once.push([id,soundName, x, y]);
            id = (id + 1) % 100;
        };

        this.getNoiseDat = function () {
            var s = _sounds_once;
            _sounds_once = [];
            return s;
        };

        // setup -----------------------------------------------
        var _init = function () {
            _sounds_once = [];
        };
        _init();
    };

    SYSTEM.Noise = Noise;
    SYSTEM.Noise.Data = _Data;
})(window.Rendxx.Game.Ghost.System);