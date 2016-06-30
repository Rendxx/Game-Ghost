window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
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
            _sounds_once = [];

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.update = function (noiseDat) {
            _sounds_once = noiseDat;
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

    RENDERER.Noise = Noise;
    RENDERER.Noise.Data = _Data;
})(window.Rendxx.Game.Ghost.Renderer2D);