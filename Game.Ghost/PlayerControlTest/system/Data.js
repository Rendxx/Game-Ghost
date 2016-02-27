window.Rendxx = window.Rendxx || {};
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
                head: 20,
                body: 10
            },
            moveSpeed: {
                walk: 4.6,
                run: 8,
                back: -2
            },
            action: {
                walk: 'walk',
                idle: 'idle',
                run: 'run',
                back: 'back',
                rotate: 'rotate',
                die: 'die'
            }
        }
    };

    SYSTEM.Data = Data;
})(window.Rendxx.Game.Ghost.System);