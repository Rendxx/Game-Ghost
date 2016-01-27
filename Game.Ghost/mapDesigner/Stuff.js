window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var StuffInstance = function (instance) {
        var that = this,
            _h = -1,
            _w = -1,
            _x = -1,
            _y = -1;

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
            _x = this.x = x;
            _y = this.y = y;
            calculatePos();
        };

        // extend for wall
        this.extend = function (x, y) {
            this.h = y - _y;
            this.w = x - _x;
            if (this.h < 0) {
                this.y = y;
                this.h *= -1;
            } else {
                this.y = _y;
            }
            if (this.w < 0) {
                this.x = x;
                this.w *= -1;
            } else {
                this.x = _x;
            }
            this.h++;
            this.w++;
            calculatePos();
            //console.log('           ');
            //console.log('x: ' + this.x);
            //console.log('y: ' + this.y);
            //console.log('w: ' + this.w);
            //console.log('h: ' + this.h);
        };

        // recover from extend
        this.recover = function () {
            this.h = _h;
            this.w = _w;
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
            that.ele.css({
                width: that.w * Data.grid.size,
                height: that.h * Data.grid.size,
                top: that.y * Data.grid.size,
                left: that.x * Data.grid.size
            });
        };

        this.reset = function (data) {
            this.rotation = 0;
            this.x = 0;
            this.y = 0;
            this.h = data.h;
            this.w = data.w;
            _h = this.h;
            _w = this.w;

            this.ele.removeClass('stuff-' + that.id);
            this.id = data.id;
            this.ele.addClass('stuff-' + that.id);
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
                that.ele.width(that.w * Data.grid.size).height(that.h * Data.grid.size)
                        .addClass('stuff-' + that.id);
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
            } else {
                tmpStuff.extend(x, y);
            }
            check();
        };

        this.setStuff = function (x, y) {
            if (tmpStuff.id <= 0) return;
            if (tmpStuff.ele.hasClass('warning')) return;
            if (tmpStuff.id == 1 && !isWallLock) {
                isWallLock = true;
            } else {
                addStuff(x, y);
                tmpStuff.recover();
                tmpStuff.move(x, y);
                isWallLock = false;
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
                    if (i<0 || j< 0 || i >= stuffMap.length || j >= stuffMap[0].length || stuffMap[i][j] != 0) {
                        illegal = true;
                        break;
                    }
                }
            }
            if (illegal) tmpStuff.ele.addClass('warning');
            else tmpStuff.ele.removeClass('warning');
        };

        var addStuff = function (x, y) {
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
                        if (tmpStuff.id <= 1) return;
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