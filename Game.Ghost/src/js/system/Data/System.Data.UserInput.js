window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};
window.Rendxx.Game.Ghost.System.Data = window.Rendxx.Game.Ghost.System.Data || {};

/**
 * Map Data
 */
(function (DATA) {
    DATA.userInput = {
        actionType: {
            'move': 'm',
            'stop': 's',
            'tap_move': 'tm',

            'tap_1': 't1',
            'press_1': 'p1',
            'release_1': 'r1',

            'tap_2': 't2',
            'press_2': 'p2',
            'release_2': 'r2',
        }
    };
})(window.Rendxx.Game.Ghost.System.Data);