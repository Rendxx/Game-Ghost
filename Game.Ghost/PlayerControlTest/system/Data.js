﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Data field
 */
(function (SYSTEM) {
    var Data = {
        character: {
            role:{
                survivor: 'survivor',
                ghost: 'ghost'
            },
            rotateSpeed: {
                head: 45,
                body: 30
            },
            moveSpeed: {
                walk: 5,
                run: 8,
                back: -2
            },
            action: {
                walk: 'walk',
                idle: 'idle',
                run: 'run',
                back: 'back',
                rotate: 'rotate'
            }
        }
    };

    SYSTEM.Data = Data;
})(window.Rendxx.Game.Ghost.System);