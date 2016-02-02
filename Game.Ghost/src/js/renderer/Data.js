window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Data field
 */
(function (RENDERER) {
    var Data = {
        grid: {
            size: 4        // size of grid
        },
        light: {
            ambient: {
                ambColor: 0x333333
            },
            spot: {
                lightX : 28,
                lightY : 5,
                lightZ : -10,
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

    RENDERER.Data = Data;
})(window.Rendxx.Game.Ghost.Renderer);