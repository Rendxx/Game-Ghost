﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Data field
 */
(function (RENDERER) {
    var Data = {
        visibleSize: 26,
        grid: {
            size: 64        // size of grid
        },
        light: {
            ambient: {
                normal: 0x111111,
                danger: 0x663333
            }
        },
        categoryName: {
            wall: 'wall',
            ground: 'ground',
            furniture: 'furniture',
            stuff: 'stuff',
            door: 'door',
            sprite: 'sprite',
            generator: 'generator'
        },
        files: {
            path: {
                wall: '/Model/Environment/',
                ground: '/Model/Environment/',
                furniture: '/Model/Furniture/',
                stuff: '/Model/Stuff/',
                door: '/Model/Door/',
                sprite: '/Model/Sprite/',
                generator: '/Model/Generator/'
            }
        },
        sound: {
            path: '/Sound/'
        },
        character: {
            type: {
                survivor: 'survivor',
                ghost: 'ghost'
            },
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
                        "top": {
                            "x": 0,
                            "y": 2.5,
                            "z": 0.25,
                            "intensity": 1,
                            "distance": 5,
                            "angle": 1,
                            "exponent": 1,
                            "color": "0xffffff"
                        },
                        "torch": {
                            "x": -0.455,
                            "y": 1.4,
                            "z": 0.28,
                            "color": "0xffffff",
                            "intensity": 1,
                            "distance": 12,
                            "angle": 0.8,
                            "exponent": 0.5,
                            "shadowCameraNear": 0.5,
                            "shadowCameraFar": 16,
                            "shadowCameraFov": 100,
                            "shadowCameraVisible": false,
                            "shadowMapWidth": 2056,
                            "shadowMapHeight": 2056,
                            "shadowBias": 0,
                            "shadowDarkness": 1.0
                        },
                        "noTorch": {
                            "color": 0xE9F0F3,
                            "intensity": 0.5,
                            "distance": 5
                        }
                    }
                },
                ghost: {
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
                        "top": {
                            "x": 0,
                            "y": 2.5,
                            "z": 0.25,
                            "intensity": 1,
                            "distance": 5,
                            "angle": 1,
                            "exponent": 1,
                            "color": "0xff0000"
                        },
                        "torch": {
                            "x": -0.455,
                            "y": 1.4,
                            "z": 0.28,
                            "color": "0xff0000",
                            "intensity": 1,
                            "distance": 12,
                            "angle": 0.6,
                            "exponent": 0.5,
                            "shadowCameraNear": 0.5,
                            "shadowCameraFar": 16,
                            "shadowCameraFov": 100,
                            "shadowCameraVisible": false,
                            "shadowMapWidth": 2056,
                            "shadowMapHeight": 2056,
                            "shadowBias": 0,
                            "shadowDarkness": 1.0
                        },
                        //"torch": null,
                        "noTorch": {
                            "color": 0xE9F0F3,
                            "intensity": 0.5,
                            "distance": 5
                        }
                    }
                }
            },
            files: {
                survivor: {
                    'blue': '/blue/player-2.json',
                    'green': '/green/player-2.json',
                    'purple': '/purple/player-2.json',
                    'red': '/red/player-2.json',
                    'yellow': '/yellow/player-2.json',
                    'orange': '/orange/player-2.json'
                },
                ghost: {
                    'white': '/white/player-2.json',
                }
            },
            path: '/Model/Player/'
        }
    };

    RENDERER.Data = Data;
})(window.Rendxx.Game.Ghost.Renderer2D);