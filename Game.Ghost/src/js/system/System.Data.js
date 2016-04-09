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
            type: {
                survivor: 'survivor',
                ghost: 'ghost'
            },
            files: {
                survivor: {
                    green: 'player_survivor_green.data.json',
                    blue: 'player_survivor_blue.data.json',
                    red: 'player_survivor_red.data.json',
                    yellow: 'player_survivor_yellow.data.json',
                    purple: 'player_survivor_purple.data.json',
                    orange: 'player_survivor_orange.data.json',
                    basic: 'player_survivor_basic.data.json',
                    bobo: 'player_survivor_bobo.data.json',
                    highcircle: 'player_survivor_highcircle.data.json',
                    girl1: 'player_survivor_girl1.data.json',
                    girl2: 'player_survivor_girl2.data.json',
                    mohicans: 'player_survivor_mohicans.data.json',
                    capboy: 'player_survivor_capboy.data.json'
                },
                ghost: {
                    white: 'player_ghost_white.data.json'
                }
            },
            path: '/Model/Player/',
            para: {
                survivor: {
                    init: {
                        hp: 1,
                        light: 1,
                        battery: 100,
                        endurance: 10
                    },
                    enduranceCost: 1,
                    enduranceRecover: 2,
                    batteryCost: 0
                },
                ghost: {
                    init: {
                        hp: 100,
                        light: 0,
                        battery: 100,
                        endurance: 0
                    },
                    enduranceCost: 150,
                    enduranceRecover: 3,
                    batteryCost: 0
                }
            }
        },
        item: {
            categoryName: {
                wall: 'wall',
                ground: 'ground',
                furniture: 'furniture',
                body: 'body',
                stuff: 'stuff',
                door: 'door'
            },
            categoryOrder: [
                'stuff',
                'body',
                'furniture',
                'door',
                'wall',
                'ground'
            ],
            files: {
                wall: {
                    'White Wall': 'wall_white.data.json'
                },
                ground: {
                    'Wood': 'ground_wood.data.json',
                    'Ceramic': 'ground_ceramic.data.json'
                },
                furniture: {
                    'Table (Wood) 1': 'table_wood_1_1.data.json',
                    'Table (Wood) 2': 'table_wood_2_1.data.json',
                    'Table (Wood) 3': 'table_wood_3_1.data.json',
                    'Table (Plastic) 4': 'table_plastic_3_2.data.json',
                    'Shelf (Wood)': 'shelf_wood_2_1.data.json',
                    'Cabinet (Wood) 1': 'cabinet_wood_1_1.data.json',
                    'Cabinet (Wood) 2': 'cabinet_wood_2_1.data.json',
                    'Cabinet (Wood) 3': 'cabinet_wood_2_1_b.data.json',
                    'Chair (Wood) 1': 'chair_wood_1_1.data.json',

                    'Bed (Simple) 1': 'bed_simple_3_2.data.json',
                    'Bench (Wood) 1': 'bench_wood_2_1.data.json',
                    'Chair (Simple) 1': 'chair_simple_1_1.data.json',
                    'Curtain (White) 1': 'curtain_white_2_1.data.json',
                    'Sofa (Simple) 1': 'sofa_simple_1_1.data.json',
                    'Toilet 1': 'toilet_1_1.data.json',
                    'Toilet 2': 'toilet_b_1_1.data.json',
                },
                stuff: {
                    'Vase 1': 'vase_1.data.json',
                    'Box 1': 'box_1.data.json',
                    'Books 1': 'books_1.data.json',
                    'Key 1': 'key_1.data.json',
                },
                door: {
                    'Door (Wood) 1': 'door_wood_1.data.json',
                },
                body: {
                    'Body 1': 'body_1.data.json',
                }
            },
            path: {
                wall: '/Model/Environment/',
                ground: '/Model/Environment/',
                furniture: '/Model/Furniture/',
                body: '/Model/Body/',
                stuff: '/Model/Stuff/',
                door: '/Model/Door/'
            },
            positionType: {
                survivor: 'start_1',
                ghost: 'start_2',
                end: 'end_1'
            }
        },
        map: {
            files: {
                test: 'MapDataTest.json',
                test2: 'MapDataTest2.json',
                debug: 'MapData4debug_1.json',
                dogcan2: 'DogCan2.json'
            },
            path: '/GameData/Map/',
            para: {
                soundRange: 6,
                scanRange: 2
            }
        },
        keyNumber: 3
    };

    SYSTEM.Data = Data;
})(window.Rendxx.Game.Ghost.System);