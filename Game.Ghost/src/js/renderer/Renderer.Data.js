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
                ambColor: 0x050505
            }
        },
        categoryName: {
            wall: 'wall',
            ground: 'ground',
            furniture: 'furniture',
            stuff: 'stuff',
            door: 'door',
            sprite: 'sprite'
        },
        files: {
            path: {
                wall: '/Model/Environment/',
                ground: '/Model/Environment/',
                furniture: '/Model/Furniture/',
                stuff: '/Model/Stuff/',
                door: '/Model/Door/',
                sprite: '/Model/Sprite/'
            }
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
                    },
                    noTorch: {
                        color: 0xE9F0F3,
                        intensity: 0.5,
                        distance: 5
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
                    },
                    noTorch: {
                        color: 0xE9F0F3,
                        intensity: 0.5,
                        distance: 5
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
})(window.Rendxx.Game.Ghost.Renderer);