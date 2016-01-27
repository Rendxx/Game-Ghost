window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var StuffInstance = function () {
        var that = this;

        this.id = -1;
        this.top = -1;
        this.bottom = -1;
        this.left = -1;
        this.right = -1;

        this.rotation = -1;
        this.x = -1;
        this.y = -1;
        this.h = -1;
        this.w = -1;
        this.ele = null;

        this.rotate = function (r) {
            this.rotation = r;
            calculatePos();
            
            var m_str ="rotate(" + r*90 + "deg)";
            this.ele.css({
                "-ms-transform": m_str,
                "-webkit-transform": m_str,
                "transform": m_str
            });
        };

        this.move = function (x, y) {
            this.x = x;
            this.y = y;
            calculatePos();
        };

        var calculatePos = function () {
            switch (that.rotation) {
                case 0:
                    that.top = that.y;
                    that.bottom = that.y + that.h - 1;
                    that.left = that.x;
                    that.right = that.x + that.w - 1;
                    break;
                case 1:
                    that.top = that.y;
                    that.bottom = that.y + that.w - 1;
                    that.left = that.x - that.h + 1;
                    that.right = that.x;
                    break;
                case 2:
                    that.top = that.y - that.h + 1;
                    that.bottom = that.y;
                    that.left = that.x - that.w + 1;
                    that.right = that.x;
                    break;
                case 3:
                    that.top = that.y - that.w + 1;
                    that.bottom = that.y;
                    that.left = that.x;
                    that.right = that.x + that.h - 1;
                    break;
                default:
                    break;
            }
        };

        this.reset = function (data) {
            this.rotation = 0;
            this.x = 0;
            this.y = 0;
            this.h = data.h;
            this.w = data.w;
            this.id = data.id;
            this.ele.width(this.w * Data.grid.size).height(this.h * Data.grid.size);
            this.rotate(0);
        };

        var _init = function () {
            that.ele = $(Data.html.stuff);
        };
        _init();
    };


    var Stuff = function (container) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            selector: null
        };
        var that = this,
            stuffMap = null,
            stuffList = null,
            tmpStuff = null,
            count = 0;

        // public data
        this.current = 1;

        // method
        this.resize = function (hgt, wid) {
            _html.container.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            
            if (stuffMap == null) {
                stuffMap = [];
                stuffList = [];
                for (var i = 0; i < hgt; i++) {
                    stuffMap[i] = [];
                    for (var j = 0; j < wid; j++) {
                        stuffMap[i][j] = 0;
                    }
                }
                return;
            } else {
                for (var i = 0, l = stuffList.length; i < l; i++) {
                    if (stuffList[i] != null && (stuffList[i].bottom >= hgt || stuffList[i].right >= wid)) removeStuff(i);
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

        this.showFigure = function (x, y) {
            if (tmpStuff.id > 1) {
                tmpStuff.move(x, y);
                tmpStuff.ele.css({
                    top: y * Data.grid.size,
                    left: x * Data.grid.size
                });
            }
        };

        this.changeType = function (stuffData) {
            tmpStuff.reset(stuffData);
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

        var _init = function () {
            tmpStuff = new StuffInstance();
            tmpStuff.ele.addClass('_tmp').appendTo(container);
            //container.on('mouseenter',function(e){
            //    tmpStuff.show();
            //});
            //container.on('mouseleave',function(e){
            //    tmpStuff.hide();
            //});

            $(document).on('keypress', function (e) {
                if (String.fromCharCode(e.which).toLowerCase() == Data.hotKey.rotate) {
                    tmpStuff.rotate((tmpStuff.rotation+1)%4);
                    return false;
                }
            })
        };
        _init();
    };

    MapDesigner.Stuff = Stuff;
})(window.Rendxx.MapDesigner);