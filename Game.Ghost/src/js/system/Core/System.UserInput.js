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
            'move': 'm',
            'tap_move': 'tm',

            'tap_1': 't1',
            'press_1': 'p1',
            'release_1': 'r1',

            'tap_2': 't2',
            'press_2': 'p2',
            'release_2': 'r2',
        }
    };
    var UserInput = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            characterFunc = {};

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.action = function (clientId, dat) {
            if (characterFunc[clientId].hasOwnProperty(dat['actionType'])) characterFunc[clientId][dat['actionType']](dat);
        };

        // bind character function to user input
        this.reset = function (characters, index2Id) {
            characterFunc = {};
            for (var i = 0; i < characters.length; i++) {
                var c = characters[i];
                var func = {};
                characterFunc[index2Id[i]] = func;
                if (c instanceof SYSTEM.Character.Survivor.Normal) {
                    // survivor
                    _setupSurvivor(func, c);
                } else if (c instanceof SYSTEM.Character.Ghost.Mary) {
                    // ghost.mary
                    _setupGhostMary(func, c);
                } else if (c instanceof SYSTEM.Character.Ghost.Specter) {
                    // ghost.specter
                    _setupGhostSpecter(func, c);
                }
            }
        };

        // private method ------------------------------------------------
        var _setupSurvivor = function (func, c) {
            func[_Data.actionType.move] = function (dat) { c.move(dat['direction'], dat['directionHead'], dat['rush'], dat['stay'], dat['headFollow']); };
            func[_Data.actionType.tap_move] = function (dat) { c.interaction(); };
            func[_Data.actionType.press_1] = function (dat) { c.longInteraction(); };
            func[_Data.actionType.release_1] = function (dat) { c.cancelLongInteraction(); };
        };

        var _setupGhostMary = function (func, c) {
            func[_Data.actionType.move] = function (dat) { c.move(dat['direction'], dat['directionHead'], dat['rush'], dat['stay'], dat['headFollow']); };
            func[_Data.actionType.tap_move] = function (dat) { c.interaction(); };
            func[_Data.actionType.press_1] = function (dat) { c.longInteraction(); };
            func[_Data.actionType.release_1] = function (dat) { c.cancelLongInteraction(); };
            func[_Data.actionType.tap_1] = function (dat) { c.crazy(); };
            func[_Data.actionType.tap_2] = function (dat) { c.teleport(); };
        };

        var _setupGhostSpecter = function (func, c) {
            func[_Data.actionType.move] = function (dat) { c.move(dat['direction'], dat['directionHead'], dat['rush'], dat['stay'], dat['headFollow']); };
            func[_Data.actionType.release_1] = function (dat) { c.cancelLongInteraction(); };
            func[_Data.actionType.tap_1] = function (dat) { c.observe(); };
        };

        var _init = function () {
        };
        _init();
    };

    SYSTEM.UserInput = UserInput
})(window.Rendxx.Game.Ghost.System);