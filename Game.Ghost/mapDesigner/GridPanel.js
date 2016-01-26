window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var GridPanel = function (container) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            grids: null,
            hover: null
        };
        var that = this;

        // callback
        this.onClick = null;
        this.onMouseEnter = null;

        // method
        this.reset = function (hgt, wid) {
            _html.container.empty().css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            _html.grids = [];
            pos_s = null;

            for (var i = 0; i < hgt; i++) {
                _html.grids[i] = [];
                for (var j = 0; j < wid; j++) {
                    _html.grids[i][j] = $(Data.html.grid).css({
                        top: Data.grid.size * i,
                        left: Data.grid.size * j
                    }).appendTo(_html.container);
                    _html.grids[i][j].click({ i: i, j: j }, function (e) {
                        if (that.onClick) that.onClick(i, j);
                    });
                    _html.grids[i][j].on('mouseenter', { i: i, j: j }, function (e) {
                        if (that.onMouseEnter) that.onMouseEnter(i, j);
                    });
                }
            }
        };
    };

    MapDesigner.GridPanel = GridPanel;
})(window.Rendxx.MapDesigner);