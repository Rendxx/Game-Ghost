window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = {
        grid: {
            width: 50,      // width og grid matrix
            height: 50,     // height og grid matrix
            size: 10        // size of grid
        },
        html: {
            grid: '<div class="grid"></div>',
            stuffSelector: '<div class="stuffSelector"></div>',
        },
        stuffType: [
            { name: '<b>Wall</b><br/>[?*?]', id: 1 },
            { name: '<b>Door</b><br/>[1*1]', id: 2, w: 1, h: 1 },

            { name: '<b>Table</b><br/>[1*1]', id: 3, w: 1, h: 1 },
            { name: '<b>Table</b><br/>[2*1]', id: 4, w: 2, h: 1 },
            { name: '<b>Table</b><br/>[3*1]', id: 5, w: 3, h: 1 },
            { name: '<b>Table</b><br/>[3*2]', id: 6, w: 3, h: 2 },

            { name: '<b>Cabinet High</b><br/>[2*1]', id: 7, w: 2, h: 1 },
            { name: '<b>Cabinet Low</b><br/>[1*1]', id: 8, w: 1, h: 1 },
            { name: '<b>Cabinet Low</b><br/>[2*1]', id: 9, w: 2, h: 1 },

            { name: '<b>Chair</b><br/>[1*1]', id: 10, w: 1, h: 1 }
        ]
    };

    MapDesigner.Data = Data;
})(window.Rendxx.MapDesigner);