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
            files: {
                survivor: {
                    green: 'player_survivor_green.data.json'
                },
                ghost: {

                }
            },
            path: '/Model/Player/'
        },
        item: {
            categoryName: {
                wall: 'wall',
                ground: 'ground',
                furniture: 'furniture',
                stuff: 'stuff',
                door: 'door'
            },
            categoryOrder: [
                'stuff',
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
                    'Table (Wood) 4': 'table_wood_3_2.data.json',
                    'Shelf (Wood)': 'shelf_wood_2_1.data.json',
                    'Cabinet (Wood) 1': 'cabinet_wood_1_1.data.json',
                    'Cabinet (Wood) 2': 'cabinet_wood_2_1.data.json',
                    'Cabinet (Wood) 3': 'cabinet_wood_2_1_b.data.json',
                    'Chair (Wood) 1': 'chair_wood_1_1.data.json',
                },
                stuff: {
                    'Vase 1': 'vase_1.data.json',
                    'Box 1': 'box_1.data.json',
                    'Books 1': 'books_1.data.json',
                    'Key 1': 'key_1.data.json',
                },
                door: {
                    'Door (Wood) 1': 'door_wood_1.data.json',
                }
            },
            path: {
                wall: '/Model/Environment/',
                ground: '/Model/Environment/',
                furniture: '/Model/Furniture/',
                stuff: '/Model/Stuff/',
                door: '/Model/Door/'
            }
        },
        map: {
            files:{
                test: 'MapDataTest.json'
            },
            path: '/GameData/Map/'
        },
        keyNumber: 3
    };

    SYSTEM.Data = Data;
})(window.Rendxx.Game.Ghost.System);