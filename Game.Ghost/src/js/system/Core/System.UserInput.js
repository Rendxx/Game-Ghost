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
        actionType: {
            'move': '01',
            'lightSwitch': '02',
            'use': '03',
            'teleport': '04',
            'crazy': '05',
            'longUse': '06',
            'cancelLongUse': '07'
        }
    };
    var UserInput = function (entity) {
        // data ----------------------------------------------------------
        var that = this;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        //this.receive = function (para) {
        //    switch (para['actionType']) {
        //        case _Data.actionType.move:
        //            entity.characters[para['characterId']].move(para['direction'], para['directionHead'], para['rush'], para['stay'], para['headFollow']);
        //            break;
        //        case _Data.actionType.lightSwitch:
        //            entity.characters[para['characterId']].switchTorch();
        //            break;
        //        case _Data.actionType.use:
        //            entity.characters[para['characterId']].interaction();
        //            break;
        //        default:
        //            break;
        //    }
        //};

        this.action = function (clientId, dat) {
            switch (dat['actionType']) {
                case _Data.actionType.move:
                    entity.characters[clientId].move(dat['direction'], dat['directionHead'], dat['rush'], dat['stay'], dat['headFollow']);
                    break;
                case _Data.actionType.lightSwitch:
                    if (entity.characters[clientId].role === Data.character.type.survivor) entity.characters[clientId].switchTorch();
                    break;
                case _Data.actionType.use:
                    entity.characters[clientId].interaction();
                    break;
                case _Data.actionType.teleport:
                    if (entity.characters[clientId].role === Data.character.type.ghost) entity.characters[clientId].teleport();
                    break;
                case _Data.actionType.crazy:
                    if (entity.characters[clientId].role === Data.character.type.ghost) entity.characters[clientId].crazy();
                    break;
                case _Data.actionType.longUse:
                    entity.characters[clientId].longInteraction();
                    break;
                case _Data.actionType.cancelLongUse:
                    entity.characters[clientId].cancelLongInteraction();
                    break;
                default:
                    break;
            };
        };

        // private method ------------------------------------------------

        var _init = function () {
        };
        _init();
    };

    SYSTEM.UserInput = UserInput
})(window.Rendxx.Game.Ghost.System);