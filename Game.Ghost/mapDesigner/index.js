$(function () {
    // data
    var _gridSize = 10;
    var _html = {
        grid:'<div class="grid"></div>'
    };
    var para = new function(){
        this.width = 50;
        this.height = 50;
        this.change = function () {
            createGrid();
        };
    };
    var datGUI;
    var container = $('.container');
    var grids = null;

    var clicked = null,
        gridType = 0;

    // dat-gui
    datGUI = new dat.GUI();
    datGUI.add(para, 'width', 10, 100).name('Width');
    datGUI.add(para, 'height', 10, 100).name('Height');
    datGUI.add(para, 'change').name('Change');

    // create grid

    var createGrid = function () {
        var wid = para.width;
        var hgt = para.height;

        container.empty().css({
            width: _gridSize * wid,
            height: _gridSize * hgt
        });
        grids = [];

        for (var i = 0; i < wid; i++) {
            grids[i] = [];
            for (var j = 0; j < hgt; j++) {
                grids[i][j] = $(_html.grid).css({
                    top: _gridSize * i,
                    left: _gridSize * j
                }).appendTo(container);
                grids[i][j].click(function () {

                });
            }
        }
    };

    createGrid();
});