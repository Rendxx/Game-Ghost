window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};
window.Rendxx.Game.Ghost.System.Data = window.Rendxx.Game.Ghost.System.Data || {};

/**
 * Map Item Data
 */
(function (DATA) {
    DATA.item = {
        categoryName: {
            wall: 'wall',
            ground: 'ground',
            furniture: 'furniture',
            body: 'body',
            stuff: 'stuff',
            door: 'door',
            generator: 'generator'
        },
        categoryOrder: [
            'stuff',
            'body',
            'generator',
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
                'Door (Wood) 2': 'door_wood_2.data.json',
                'Door (Wood) 3': 'door_wood_3.data.json',
            },
            generator: {
                'Generator 1': 'generator_1.data.json',
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
            door: '/Model/Door/',
            generator: '/Model/Generator/'
        },
        positionType: {
            survivor: 'start_1',
            ghost: 'start_2',
            end: 'end_1'
        }
    };
})(window.Rendxx.Game.Ghost.System.Data);