window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = {
        hotKey: {
            rotate: { key: 'q', commend: 'Hotkey to rotate' },
            del: { key: 'd', commend: 'Hotkey to delete' }
        },
        grid: {
            width: 50,      // width og grid matrix
            height: 50,     // height og grid matrix
            size: 16        // size of grid
        },
        html: {
            grid: '<div class="grid"></div>',
            itemSelector: '<div class="itemSelector"></div>',
            itemSelectorCategory: '<div class="itemSelectorCategory"></div>',
            furniture: '<div class="furniture"></div>',
            wall: '<div class="wall"></div>',
            hotKey: '<div class="_item"></div>',
            fileBtn: '<div class="_btn"></div>',
            categoryBtn: '<div class="_btn"></div>',
            doorSelector: '<div class="doorSelector"><div class="_edit"></div><div class="_name"></div></div>'
        },
        categoryCss: {
            wall: '_wall',
            ground: '_ground',
            furniture: '_furniture',
            stuff: '_stuff',
            door: '_door',
            position: '_position'
        },
        categoryName: {
            wall: 'wall',
            ground: 'ground',
            furniture: 'furniture',
            stuff: 'stuff',
            door: 'door',
            position: 'position'
        },
        categoryOrder: [
            'position',
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
                'Table (Plastic) 4': 'table_plastic_3_2.data.json',
                'Shelf (Wood)': 'shelf_wood_2_1.data.json',
                'Cabinet (Wood) 1': 'cabinet_wood_1_1.data.json',
                'Cabinet (Wood) 2': 'cabinet_wood_2_1.data.json',
                'Cabinet (Wood) 3': 'cabinet_wood_2_1_b.data.json',
                'Chair (Wood) 1': 'chair_wood_1_1.data.json',
            },
            stuff: {
                'Vase ': 'vase_1.data.json',
                'Box 1': 'box_1.data.json',
                'Books 1': 'books_1.data.json',
                'Key 1': 'key_1.data.json',
            },
            door: {
                'Door (Wood) 1': 'door_wood_1.data.json',
            },
            position: {
                'Start (Survivor)': 'start_1.data.json',
                'Start (Ghost)': 'start_2.data.json',
                'End': 'end_1.data.json',
            }
        },
        path: {
            wall: '/Model/Environment/',
            ground: '/Model/Environment/',
            furniture: '/Model/Furniture/',
            stuff: '/Model/Stuff/',
            door: '/Model/Door/',
            position: '/Model/Position/'
        },
        defaultItem: {
            wall: 'White Wall'
        }
    };

    MapDesigner.Data = Data;
})(window.Rendxx.MapDesigner);