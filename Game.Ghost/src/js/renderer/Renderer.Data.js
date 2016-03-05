﻿window.Rendxx = window.Rendxx || {};
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
        },
        categoryName: {
            wall: 'wall',
            ground: 'ground',
            furniture: 'furniture',
            stuff: 'stuff',
            door: 'door'
        },
        files: {
            path: {
                wall: '/Model/Environment/',
                ground: '/Model/Environment/',
                furniture: '/Model/Furniture/',
                stuff: '/Model/Stuff/',
                door: '/Model/Door/'
            }
        },
        character: {
            parameter: {
                survivor: {
                    action: {
                        0: 'back',
                        1: 'init',
                        2: 'idle',
                        3: 'idle2',
                        4: 'run',
                        5: 'turn',
                        6: 'walk'
                    },
                    initAction: 'idle',
                    light: {
                        x: 0,
                        y: 7,
                        z: 1,
                        intensity: 1,
                        distance: 20,
                        angle: 1,
                        exponent: 10,
                        color: 0xffffff
                    },
                    torch: {
                        x: -1.4,
                        y: 2.4,
                        z: 0.8,
                        color: 0xffffff,
                        intensity: 1,
                        distance: 50,
                        angle: 1,
                        exponent: 8,
                        shadowCameraNear: 1,
                        shadowCameraFar: 50,
                        shadowCameraFov: 50,
                        shadowCameraVisible: false,
                        shadowMapWidth: 2056,
                        shadowMapHeight: 2056,
                        shadowBias: 0.00,
                        shadowDarkness: 1.0
                    }
                },
                ghost: {

                }
            },
            files: {
                survivor: {
                    'green': '/green/player-2.json',
                },
                ghost: {

                }
            },
            path: '/Model/Player/'
        }
    };

    RENDERER.Data = Data;
})(window.Rendxx.Game.Ghost.Renderer);