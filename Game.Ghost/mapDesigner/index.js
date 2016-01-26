$(function () {
    // data
    var _gridSize = 10;
    var _keyCode_0 = 48;
    var _html = {
        grid: '<div class="grid"></div>',
        typeItem: '<div class="typeItem"></div>'
    };
    var typeData = [
        { name: 'Wall', id: 1 },
        { name: 'Door', id: 2 },
        { name: 'Table 1*1', id: 3 },
        { name: 'Table 1*2', id: 4 },
        { name: 'Table 1*3', id: 5 },
        { name: 'Table 2*3', id: 6 },
        { name: 'Cabinet High 1*2', id: 7 },
        { name: 'Cabinet Low 1*1', id: 8 },
        { name: 'Cabinet Low 1*2', id: 9 },
        { name: 'Chair', id: 10 }
    ];

    // dat gui
    var para = new function(){
        this.width = 50;
        this.height = 50;
        this.change = function () {
            createGrid();
        };
    };
    var datGUI;

    // html
    var container = $('.container'),
        typeList = $('.typeList'),
        grids = null,
        types = null;

    var pos1 = null,     // 1st click point position
        gridType = 0;

    // dat-gui
    datGUI = new dat.GUI();
    datGUI.add(para, 'width', 10, 100).name('Width');
    datGUI.add(para, 'height', 10, 100).name('Height');
    datGUI.add(para, 'change').name('Change');

    // create types
    var createTypes = function () {
        for (var i = 0, l = typeData.length; i < l; i++) {
            types[i] = $(_html.typeItem).appendTo(typeList);
        }
    };

    // create grid
    var createGrid = function () {
        var wid = para.width;
        var hgt = para.height;

        container.empty().css({
            width: _gridSize * wid,
            height: _gridSize * hgt
        });
        grids = [];
        pos1 = null;

        for (var i = 0; i < wid; i++) {
            grids[i] = [];
            for (var j = 0; j < hgt; j++) {
                grids[i][j] = $(_html.grid).css({
                    top: _gridSize * i,
                    left: _gridSize * j
                }).appendTo(container);
                grids[i][j].click({i:i,j:j},function (e) {
                    if (pos1 == null) {
                        pos1 = [e.data.i, e.data.j];
                        gridType = 0;
                    } else {

                    }
                });
            }
        }
    };

    var setType = function (t) {
        gridType = t;
    };

   
    $(document).on('keydown', function (e) {
        if (pos1 == null) return false;
        setType(e.which - _keyCode_0);
    });

    createGrid();
});