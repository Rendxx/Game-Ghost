window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Data field
 */
(function (RENDERER) {
    var Data = {
        character: {
            survivor: {
                file: '/Model/player-2.json',
                action: {
                    0: 'back',
                    1: 'init',
                    2: 'idle',
                    3: 'idle2',
                    4: 'run',
                    5: 'turn',
                    6: 'walk'
                },
                initAction: 'idle'
            }
        }
    };

    RENDERER.Data = Data;
})(window.Rendxx.Game.Ghost.Renderer);