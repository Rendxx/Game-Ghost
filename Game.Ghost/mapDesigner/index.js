$(function () {
    // global data ---------------------------------------------------------------------------------------------------
    var _html = {
        grid: '<div class="grid"></div>',
        typeItem: '<div class="typeItem"></div>',
        hover: '<div class="box-hover"></div>',
        stuff: '<div class="box-stuff"></div>'
    };
    var typeData = [
        { name: '<b>Wall</b><br/>[?*?]', id: 1 },
        { name: '<b>Door</b><br/>[1*1]', id: 2, w: 1, h: 1 },

        { name: '<b>Table</b><br/>[1*1]', id: 3, w: 1, h: 1},
        { name: '<b>Table</b><br/>[2*1]', id: 4, w: 2, h: 1 },
        { name: '<b>Table</b><br/>[3*1]', id: 5, w: 3, h: 1 },
        { name: '<b>Table</b><br/>[3*2]', id: 6, w: 3, h: 2 },

        { name: '<b>Cabinet High</b><br/>[2*1]', id: 7, w: 2, h: 1 },
        { name: '<b>Cabinet Low</b><br/>[1*1]', id: 8, w: 1, h: 1 },
        { name: '<b>Cabinet Low</b><br/>[2*1]', id: 9, w: 2, h: 1 },

        { name: '<b>Chair</b><br/>[1*1]', id: 10, w: 1, h: 1 },
    ];

    // html
    // cache
    var gridType = 0;

    // dat-gui -------------------------------------------------------------------------------------------------------
    var gridPara = new function () {
        this.width = 50;
        this.height = 50;
        this.change = function () {
            createGrid();
        };
    };

    var datGUI;
    datGUI = new dat.GUI();
    datGUI.add(gridPara, 'width', 10, 100).name('Width');
    datGUI.add(gridPara, 'height', 10, 100).name('Height');
    datGUI.add(gridPara, 'change').name('Change');

    // types ---------------------------------------------------------------------------------------------------------
    var html_typeList = $('.typeList'),
        html_types = null;

    var createTypes = function () {
        html_types = {};
        for (var i = typeData.length - 1; i >= 0; i--) {
            html_types[typeData[i].id] = $(_html.typeItem).prependTo(html_typeList).html(typeData[i].name)
                .click({ id: typeData[i].id }, function (e) {
                    setType(e.data.id)
                });
        }
    };

    var setType = function (id) {
        gridType = id;
        html_types[id].addClass('hover');
        html_types[id].siblings().removeClass('hover');
    };

    createTypes();
    setType(1);

    // grid --------------------------------------------------------------------------------------------------------------
});

// create --------------------------------------------------------------------------------------------------------------
var stuffMap = null;
var stuffList = null;
var initStuff = function (wid, hgt) {
    if (stuffMap == null) {
        stuffMap = [];
        stuffList = [];
        for (var i = 0; i < wid; i++) {
            stuffMap[i] = [];
            for (var j = 0; j < hgt; j++) {
                stuffMap[i][j] = 0;
            }
        }
        return;
    } else {
        if (wid < stuffMap.length) {
            for (var i = tuffMap.length - 1; i >= wid; i--) {
                for (var j = tuffMap[0].length - 1; j >=0; j--) {
                    if (stuffMap[i][j]>0) removeStuff(stuffMap[i][j]);
                }
            }
        }
        if (hgt < stuffMap.length) {
            for (var i = 0; i < wid; i++) {
                for (var j = tuffMap[0].length - 1; j >= hgt; j--) {
                    if (stuffMap[i][j] > 0) removeStuff(stuffMap[i][j]);
                }
            }
        }
        var stuffMap_old = stuffMap;
        var w_old = stuffMap_old.length;
        var h_old = stuffMap_old[0].length;
        stuffMap = [];
        for (var i = 0; i < wid; i++) {
            stuffMap[i] = [];
            for (var j = 0; j < hgt; j++) {
                stuffMap[i][j] = (i < w_old && j < h_old) ? stuffMap_old[i][j] : 0;
            }
        }
    }
};

/**
 * add a stuff
 * @param typeDat - type data 
 * @param y - anchor, should be original top-left: top
 * @param x - anchor, should be original top-left: left
 * @param rotation - 0 to 3, clockwise means 0,90,180,270
 */
var addStuff = function (typeDat, y, x, rotation) {
    rotation = rotation || 0;

    var top, bottom, left, right;
    switch (rotation) {
        case 0:
            top = y;
            bottom = y + typeDat.h -1;
            left = x;
            right = x + typeDat.w - 1;
            break;
        case 1:
            top = y;
            bottom = y + typeDat.w - 1;
            left = x - typeDat.h + 1;
            right = x;
            break;
        case 2:
            top = y - typeDat.h + 1;
            bottom = y;
            left = x - typeDat.w + 1;
            right = x;
            break;
        case 3:
            top = y - typeDat.w + 1;
            bottom = y;
            left = x;
            right = x + typeDat.h - 1;
            break;
        default:
            break;
    }

    var htmlObj = $(_html.stuff).appendTo(html_gridContainer).css({
        width:typeDat.w*_gridSize,
        height:typeDat.h*_gridSize,
        top:
    });

    var stuff = {
        id: typeDat.id,
        html: 
    };
};

var removeStuff = function (id) {
    if (id == 0 || stuffList[id] == null) return;
    stuffList[id].html.remove();
    for (var t = stuffList[id].top, b = stuffList[id].bottom; t <= b; ti++) {
        for (var l = stuffList[id].left, r = stuffList[id].right; l <= r; l++) {
            stuffMap[t][l] = 0;
        }
    }
    stuffList[id] = null;
};