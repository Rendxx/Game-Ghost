window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * InterAction manager, use to send/receive command between players
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var ActionType = SYSTEM.Data.userInput.actionType;
    var UserInput = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            characterFunc = {};

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.action = function (clientId, dat) {
            if (dat) {
                for (var i = 0; i < dat.length; i++) {
                    if (characterFunc[clientId].hasOwnProperty(dat[i][0])) characterFunc[clientId][dat[i][0]](dat[i]);
                }
            }
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
                } else if (c instanceof SYSTEM.Character.Ghost.Butcher) {
                    // ghost.specter
                    _setupGhostButcher(func, c);
                } 
            }
        };

        // private method ------------------------------------------------
        var _setupSurvivor = function (func, c) {
            var rushTag = false;
            var movingTag = false;
            var longInteractionTag = false;
            func[ActionType.move] = function (dat) {
                movingTag = true;
                c.move(dat[1], 0, rushTag, false, true);
            };
            func[ActionType.stop] = function (dat) {
                movingTag = false;
                c.move(0, 0, false, true, true);
            };
            func[ActionType.tap_move] = function (dat) {
                movingTag = false;
                c.move(0, 0, false, true, true);
            };
            func[ActionType.tap_1] = function (dat) {
                rushTag = false;
                c.interaction();
            };
            func[ActionType.press_1] = function (dat) {
                rushTag = true;
                if (!movingTag) {
                    longInteractionTag = true;
                    c.longInteraction();
                }
                else {
                    longInteractionTag = false;
                }
            };
            func[ActionType.release_1] = function (dat) {
                rushTag = false;
                if (longInteractionTag) c.cancelLongInteraction();
            };
            func[ActionType.tap_load] = function (dat) { entity.userReady(c.id); };
        };

        var _setupGhostMary = function (func, c) {
            func[ActionType.move] = function (dat) { c.move(dat[1], 0, false, false, true); };
            func[ActionType.stop] = function (dat) { c.move(0, 0, false, true, true); };
            func[ActionType.tap_move] = function (dat) { c.crazy();  c.move(0, 0, false, true, true); };
            func[ActionType.tap_1] = function (dat) { c.interaction(); };
            func[ActionType.press_1] = function (dat) { c.teleportStart(); };
            func[ActionType.release_1] = function (dat) { c.teleportEnd(); };
            func[ActionType.tap_load] = function (dat) {entity.userReady(c.id);};
        };

        var _setupGhostSpecter = function (func, c) {
            func[ActionType.move] = function (dat) { c.move(dat[1], 0, false, false, true); };
            func[ActionType.stop] = function (dat) { c.move(0, 0, false, true, true); };
            func[ActionType.tap_1] = function (dat) { c.kill(); };
            func[ActionType.press_1] = function (dat) { c.startToggle(); };
            func[ActionType.release_1] = function (dat) { c.endToggle(); };
            func[ActionType.tap_load] = function (dat) { entity.userReady(c.id); };
        };

        var _setupGhostButcher = function (func, c) {
            func[ActionType.move] = function (dat) { c.move(dat[1], 0, false, false, true); };
            func[ActionType.stop] = function (dat) { c.move(0, 0, false, true, true); };
            func[ActionType.tap_1] = function (dat) { c.kill(); };
            func[ActionType.tap_load] = function (dat) { entity.userReady(c.id); };
        };

        var _init = function () {
        };
        _init();
    };

    SYSTEM.UserInput = UserInput
})(window.Rendxx.Game.Ghost.System);