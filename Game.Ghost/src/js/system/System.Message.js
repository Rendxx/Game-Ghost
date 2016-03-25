window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Message manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var Message = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            count = 0;
            _msg = {};
        
        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.send = function (characterId, content) {
            _msg[characterId] = content;
            count++;
        };

        this.getNewMsg = function () {
            if (count == 0) return {};
            var msg = _msg;
            _msg = {};
            count = 0;
            return msg;
        };

        // setup -----------------------------------------------
        var _init = function () {
        };
        _init();
    };

    SYSTEM.Message = Message
})(window.Rendxx.Game.Ghost.System);