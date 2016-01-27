window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var GridPanel = function (sensorPanel, gridPanel) {
        // data -----------------------------------------------------
        var _html = {
            sensorPanel: sensorPanel,
            gridPanel: gridPanel,
            canvas: null,
            grids: null,
            hover: null
        };
        var that = this;

        // callback
        this.onClick = null;
        this.onMouseEnter = null;

        // method
        this.reset = function (hgt, wid) {
            // sensor
            _html.sensorPanel.empty().css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            _html.grids = [];
            pos_s = null;

            for (var i = 0; i < hgt; i++) {
                _html.grids[i] = [];
                for (var j = 0; j < wid; j++) {
                    _html.grids[i][j] = $(Data.html.grid).css({
                        width: Data.grid.size,
                        height: Data.grid.size,
                        top: Data.grid.size * i,
                        left: Data.grid.size * j
                    }).appendTo(_html.sensorPanel);
                    _html.grids[i][j].click({ i: i, j: j }, function (e) {
                        if (that.onClick) that.onClick(e.data.j, e.data.i);
                    });
                    _html.grids[i][j].on('mouseenter', { i: i, j: j }, function (e) {
                        if (that.onMouseEnter) that.onMouseEnter(e.data.j, e.data.i);
                    });
                }
            }

            // grid
            _html.gridPanel.empty().css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            var w = Data.grid.size * wid;
            var h = Data.grid.size * hgt;
            _html.canvas = $("<canvas/>")
                .attr('width', Data.grid.size * wid)
                .attr('height', Data.grid.size * hgt)
                .width(Data.grid.size * wid)
                .height(Data.grid.size * hgt)
                .appendTo(_html.gridPanel);

            var ctx = _html.canvas[0].getContext("2d");
            for (var i = 1; i < hgt; i++) {
                ctx.moveTo(0, Data.grid.size * i + 0.5);
                ctx.lineTo(w, Data.grid.size * i + 0.5);
            }


            for (var j = 1; j < wid; j++) {
                ctx.moveTo(Data.grid.size * j + 0.5, 0);
                ctx.lineTo(Data.grid.size * j + 0.5, h);
            }

            ctx.strokeStyle = "#cccccc";
            //ctx.setLineDash([5, 2]);
            ctx.stroke();
        };
    };

    MapDesigner.GridPanel = GridPanel;
})(window.Rendxx.MapDesigner);