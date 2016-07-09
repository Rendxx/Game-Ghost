window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};
window.Rendxx.Game.Ghost.System.Data = window.Rendxx.Game.Ghost.System.Data || {};

/**
 * Noise Data
 */
(function (DATA) {
    DATA.noise = {
        door: {
            probability: 0.06
        },
        furniture: {
            probability: 0.02
        },
        key: {
            probability: 0.2
        },
        generator: {
            probability: 0.0005
        }
    };
})(window.Rendxx.Game.Ghost.System.Data);