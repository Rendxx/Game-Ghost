window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * InterAction manager, use to send/receive command between players
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
        actionType:{
            'move': '01',
            'lightSwitch': '02',
            'use': '03'
        }
    };
    var InterAction = function (entity) {
        // data ----------------------------------------------------------
        var that = this;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.receive = function (para) {
            switch (para['actionType']) {
                case _Data.actionType.move:
                    entity.characters[para['characterId']].move(para['direction'], para['directionHead'], para['rush'], para['stay'], para['headFollow']);
                    break;
                case _Data.actionType.lightSwitch:

                    break;
                case _Data.actionType.use:

                    break;
                default:
                    break;
            }
        };

        // private method ------------------------------------------------

        var _init = function () {
        };
        _init();
    };

    SYSTEM.InterAction = InterAction
})(window.Rendxx.Game.Ghost.System);