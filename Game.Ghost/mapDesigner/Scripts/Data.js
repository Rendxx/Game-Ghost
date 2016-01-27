window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = {
        hotKey: {
            rotate: 'q',
            del: 'd'
        },
        grid: {
            width: 50,      // width og grid matrix
            height: 50,     // height og grid matrix
            size: 16        // size of grid
        },
        html: {
            grid: '<div class="grid"></div>',
            stuffSelector: '<div class="stuffSelector"></div>',
            stuff: '<div class="stuff"></div>',
            hotKey: '<div class="hotKey"></div>',
            fileBtn: '<div class="fileBtn"></div>'
        },
        stuffType: [
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

            { name: '[1*1] <b>Chair</b>', id: 10, w: 1, h: 1 }
        ]
    };

    MapDesigner.Data = Data;
})(window.Rendxx.MapDesigner);