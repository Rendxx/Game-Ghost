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
        ObjType: 'noise',
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
            id = 0,
            ratio = 1;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.once = function (noiseName, x, y) {
            entity.sound.once(SYSTEM.Sound.Data.Type.OverAll, _Data.ObjType, 0, SYSTEM.Sound.Data.Name.Touch);
            _sounds_once.push([id,noiseName, x, y]);
            id = (id + 1) % 100;
        };

        this.getNoiseDat = function () {
            var s = _sounds_once;
            _sounds_once = [];
            return s;
        };

        this.setRatio = function (ratio_in) {
            ratio = ratio_in;
        };

        this.generate = function (probability, noiseName, x, y) {
            if (Math.random() > probability * ratio) return false;
            this.once(noiseName, x, y);
            return true;
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