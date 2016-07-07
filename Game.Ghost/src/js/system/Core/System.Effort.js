window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Effort manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
        ObjType: 'effort',
        Name: {
            'Blood': 0,
            'Electric': 1
        }
    };
    var Effort = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            _effort = [];

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.once = function (effortName, x, y) {
            _effort.push([effortName, x, y]);
        };

        this.getEffortDat = function () {
            var s = _effort;
            _effort = [];
            return s;
        };

        // setup -----------------------------------------------
        var _init = function () {
            _sounds_once = [];
        };
        _init();
    };

    SYSTEM.Effort = Effort;
    SYSTEM.Effort.Data = _Data;
})(window.Rendxx.Game.Ghost.System);