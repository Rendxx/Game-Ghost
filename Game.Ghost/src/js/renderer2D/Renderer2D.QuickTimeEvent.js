window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        Name: {
            'Generator': 0,
        }
    };
    var QuickTimeEvent = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            gameData = [];

        this.list = {};

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.update = function (data_in) {
            gameData = data_in;
            this.list = {};
            if (gameData == null) return;

            for (var i in gameData) {
                var g = gameData[i];
                this.list[i] = {
                    name: g[0],
                    current: g[1],
                    duration: g[2],
                    start: g[3],
                    end: g[4]
                };
            }
        };

        // private method  -----------------------------------------------


        // setup ---------------------------------------------------------
        var _init = function () {
            that.list = {};
        };
        _init();
    };

    RENDERER.QuickTimeEvent = QuickTimeEvent;
    RENDERER.QuickTimeEvent.Data = _Data;
})(window.Rendxx.Game.Ghost.Renderer2D);