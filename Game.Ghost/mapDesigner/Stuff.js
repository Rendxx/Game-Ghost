window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var StuffInstance = function (instance) {
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

        var _init = function (instance) {
            that.ele = $(Data.html.stuff);
            if (instance != null) {
                that.id = instance.id;
                that.rotation = instance.rotation;
                that.x = instance.x;
                that.y = instance.y;
                that.h = instance.h;
                that.w = instance.w;
                that.ele.width(that.w * Data.grid.size).height(that.h * Data.grid.size);
                that.rotate(instance.rotation);
            } 
        };
        _init(instance);
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
            isWallLock = false,
            mouseX = 0,
            mouseY = 0,
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
            mouseX = x;
            mouseY = y;
            if (tmpStuff.id <= 0) return;
            if (!isWallLock) {
                tmpStuff.move(x, y);
                tmpStuff.ele.css({
                    top: y * Data.grid.size,
                    left: x * Data.grid.size
                });
            } else {

            }
            check();
        };

        this.setStuff = function (x, y) {
            if (tmpStuff.id <= 0) return;
            if (tmpStuff.id == 1 && !isWallLock) {

            } else {
                addStuff(x, y);
            }
        };

        this.changeType = function (stuffData) {
            isWallLock = false;
            if (stuffData.id == 0)
                tmpStuff.ele.hide();
            else {
                tmpStuff.reset(stuffData);
                tmpStuff.ele.show();
            }
        };

        var check = function () {
            var illegal = false;
            for (var i = tmpStuff.top; i <= tmpStuff.bottom; i++) {
                for (var j = tmpStuff.left; j <= tmpStuff.right; j++) {
                    if (i >= stuffMap.length || j >= stuffMap[0].length || stuffMap[i][j] != 0) {
                        illegal = true;
                        break;
                    }
                }
            }
            if (illegal) tmpStuff.ele.addClass('warning');
            else tmpStuff.ele.removeClass('warning');
        };

        var addStuff = function (x, y) {
            if (tmpStuff.ele.hasClass('warning')) return;
            count++;
            var s = new StuffInstance(tmpStuff);
            s.ele.appendTo(container).css({
                top: s.y * Data.grid.size,
                left: s.x * Data.grid.size
            });
            stuffList[count] = s;

            for (var i = s.top; i <= s.bottom; i++) {
                for (var j = s.left; j <= s.right; j++) {
                    stuffMap[i][j] = count;
                }
            }
        };

        var removeStuff = function (id) {
            if (id == 0 || stuffList[id] == null) return;
            stuffList[id].ele.remove();
            for (var t = stuffList[id].top, b = stuffList[id].bottom; t <= b; t++) {
                for (var l = stuffList[id].left, r = stuffList[id].right; l <= r; l++) {
                    stuffMap[t][l] = 0;
                }
            }
            stuffList[id] = null;
        };

        var _init = function () {
            tmpStuff = new StuffInstance();
            tmpStuff.ele.addClass('_tmp').appendTo(container);

            $(document).on('keypress', function (e) {
                switch (String.fromCharCode(e.which).toLowerCase()) {
                    case Data.hotKey.rotate:
                        if (tmpStuff.id < 1) return;
                        tmpStuff.rotate((tmpStuff.rotation + 1) % 4);
                        check();
                        return false;
                    case Data.hotKey.del:
                        var id = stuffMap[mouseY][mouseX];
                        if (id == 0) return;
                        removeStuff(id);
                        check();
                        return false;
                }
            })
        };
        _init();
    };

    MapDesigner.Stuff = Stuff;
})(window.Rendxx.MapDesigner);