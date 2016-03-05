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
        },
        actionPara:{
            'move': {
                'characterId': 1,
                'direction':2,
                'directionHead':3,
                'rush':4,
                'stay':5,
                'headFollow':6
            }
        }
    };
    var InterAction = function (entity) {
        // data ----------------------------------------------------------
        var that = this;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.receive = function (msg) {
            var para = msg.split('|');
            switch (para[0]) {
                case _Data.actionType.move:
                    var characterId = Number(para[_Data.actionPara.move.characterId]),
                        direction = Number(para[_Data.actionPara.move.direction]),
                        directionHead = Number(para[_Data.actionPara.move.directionHead]),
                        rush = Number(para[_Data.actionPara.move.rush]) == 1,
                        stay = Number(para[_Data.actionPara.move.stay]) == 1,
                        headFollow = Number(para[_Data.actionPara.move.headFollow]) == 1;
                    entity.characters[characterId].move(direction, directionHead, rush, stay, headFollow);
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