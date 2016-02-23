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
            categoryBtn: '<div class="_btn"></div>'
        },
        furnitureType: [
            { name: '<b>None</b>', id: 0 },

            { name: '[?*?] <b>Wall</b>', id: 1, w: 1, h: 1 },
            { name: '[1*1] <b>Door</b>', id: 2, w: 1, h: 1 },

            { name: '[1*1] <b>Table</b>', id: 3, w: 1, h: 1 },
            { name: '[2*1] <b>Table</b>', id: 4, w: 2, h: 1 },
            { name: '[3*1] <b>Table</b>', id: 5, w: 3, h: 1 },
            { name: '[3*2] <b>Table</b>', id: 6, w: 3, h: 2 },

            { name: '[1*1] <b>Cabinet Low</b>', id: 7, w: 1, h: 1 },
            { name: '[2*1] <b>Cabinet Low</b>', id: 8, w: 2, h: 1 },
            { name: '[2*1] <b>Cabinet High</b>', id: 9, w: 2, h: 1 },

            { name: '[1*1] <b>Chair</b>', id: 10, w: 1, h: 1 },
            { name: '[2*1] <b>Shelf</b>', id: 11, w: 2, h: 1 }
        ],
        categoryCss: {
            wall: '_wall',
            ground: '_ground',
            furniture: '_furniture',
            stuff: '_stuff'
        },
        categoryName: {
            wall: 'wall',
            ground: 'ground',
            furniture: 'furniture',
            stuff: 'stuff'
        },
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
                'Chair (Normal) 1': 'chair_normal_1_1.data.json',
            },
            stuff: {
            }
        },
        path: {
            wall: '/Model/Environment/',
            ground: '/Model/Environment/',
            furniture: '/Model/Furniture/'
        }
    };

    MapDesigner.Data = Data;
})(window.Rendxx.MapDesigner);