window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};

/**
 * Data field
 */
(function (GAME) {
    var Data = {
        grid: {
            size: 16        // size of grid
        },
        light: {
            ambient: {
                ambColor: 0x000000
            },
            spot: {
                lightX : 20,
                lightY : 5,
                lightZ : 40,
                intensity : 1,
                distance : 80,
                angle : 1.570,
                exponent : 0,
                shadowCameraNear : 10,
                shadowCameraFar : 80,
                shadowCameraFov : 50,
                shadowCameraVisible : false,
                shadowMapWidth : 2056,
                shadowMapHeight : 2056,
                shadowBias : 0.00,
                shadowDarkness : 1
            }
        }
    };

    GAME.Data = Data;
})(window.Rendxx.Game.Ghost);