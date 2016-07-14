window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};
window.Rendxx.Game.Ghost.System.Data = window.Rendxx.Game.Ghost.System.Data || {};

/**
 * Map Data
 */
(function (DATA) {
    DATA.status = {
        client: {
            unready: 0,
            ready: 1,
            playing:2
        }
    };
})(window.Rendxx.Game.Ghost.System.Data);