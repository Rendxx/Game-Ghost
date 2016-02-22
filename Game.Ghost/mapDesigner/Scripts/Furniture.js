window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var FurnitureInstance = function (instance) {
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

            var m_str = "rotate(" + r * 90 + "deg)";
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

            this.ele.removeClass('furniture-' + that.id);
            this.id = data.id;
            this.ele.addClass('furniture-' + that.id);
            this.ele.width(this.w * Data.grid.size).height(this.h * Data.grid.size);
            this.rotate(0);
        };

        var _init = function (instance) {
            that.ele = $(Data.html.furniture);
            if (instance != null) {
                that.id = instance.id;
                that.rotation = instance.rotation;
                that.x = instance.x;
                that.y = instance.y;
                that.h = instance.h;
                that.w = instance.w;
                that.ele.width(that.w * Data.grid.size).height(that.h * Data.grid.size)
                        .addClass('furniture-' + that.id);
                that.rotate(instance.rotation);
            }
        };
        _init(instance);
    };

    var WallInstance = function () {
        this.x = -1;
        this.y = -1
        this.len = -1;
        this.rotation = -1;
        this.ele = null;

        this.top = -1;
        this.left = -1;

        this.createEle = function () {
            var m_str = "rotate(" + this.rotation * 90 + "deg)";
            this.ele = $(Data.html.wall).css({
                width: this.len * Data.grid.size,
                top: this.y * Data.grid.size,
                left: this.x * Data.grid.size,
                "-ms-transform": m_str,
                "-webkit-transform": m_str,
                "transform": m_str
            });

            switch (this.rotation) {
                case 0:
                    this.top = this.y;
                    this.left = this.x;
                    break;
                case 1:
                    this.top = this.y;
                    this.left = this.x;
                    break;
                case 2:
                    this.top = this.y;
                    this.left = this.x - this.len;
                    break;
                case 3:
                    this.top = this.y - this.len;
                    this.left = this.x;
                    break;
            }
            return this.ele;
        };
    };

    var Furniture = function (container, wallPanel, sensorPanel) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            wallPanel: wallPanel,
            sensorPanel: sensorPanel,
            selector: null
        };
        var that = this,
            furnitureMap = null,
            furnitureList = null,
            wallList = null,
            tmpFurniture = null,
            isWallLock = false,
            mouseX = 0,
            mouseY = 0,
            count = 0;

        // method
        this.getList = function () {
            return furnitureList;
        };

        this.getWall = function () {
            return wallList;
        };

        this.reset = function (hgt, wid, furniture_in) {
            if (furnitureList != null) {
                for (var i = 0, l = furnitureList.length; i < l; i++) {
                    removeFurniture(i);
                }
            }

            _html.container.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            _html.wallPanel.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });

            furnitureMap = [];
            furnitureList = [];
            count = 0;
            for (var i = 0; i < hgt; i++) {
                furnitureMap[i] = [];
                for (var j = 0; j < wid; j++) {
                    furnitureMap[i][j] = 0;
                }
            }

            for (var i = 0; i < furniture_in.length; i++) {
                if (furniture_in[i] == null) continue;
                addFurniture(furniture_in[i]);
            }
            createWall();
            return;
        };

        this.resize = function (hgt, wid) {
            _html.container.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            _html.wallPanel.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });

            if (furnitureMap == null) {
                furnitureMap = [];
                furnitureList = [];
                for (var i = 0; i < hgt; i++) {
                    furnitureMap[i] = [];
                    for (var j = 0; j < wid; j++) {
                        furnitureMap[i][j] = 0;
                    }
                }
            } else {
                for (var i = 0, l = furnitureList.length; i < l; i++) {
                    if (furnitureList[i] != null && (furnitureList[i].bottom >= hgt || furnitureList[i].right >= wid)) removeFurniture(i);
                }
                var furnitureMap_old = furnitureMap;
                var w_old = furnitureMap_old.length;
                var h_old = furnitureMap_old[0].length;
                furnitureMap = [];
                for (var i = 0; i < hgt; i++) {
                    furnitureMap[i] = [];
                    for (var j = 0; j < wid; j++) {
                        furnitureMap[i][j] = (i < w_old && j < h_old) ? furnitureMap_old[i][j] : 0;
                    }
                }
            }
            createWall();
        };

        this.showFigure = function (x, y) {
            mouseX = x;
            mouseY = y;
            if (tmpFurniture.id <= 0) return;
            if (!isWallLock) {
                tmpFurniture.move(x, y);
            } else {
                tmpFurniture.extend(x, y);
            }
            check();
        };

        this.setFurniture = function (x, y) {
            if (tmpFurniture.id <= 0) return;
            if (tmpFurniture.ele.hasClass('warning')) return;
            if (tmpFurniture.id == 1 && !isWallLock) {
                isWallLock = true;
            } else {
                addFurniture(tmpFurniture);
                tmpFurniture.recover();
                tmpFurniture.move(x, y);
                isWallLock = false;
                if (tmpFurniture.id == 1) createWall();
            }
        };

        this.changeType = function (furnitureData) {
            isWallLock = false;
            if (furnitureData.id == 0)
                tmpFurniture.ele.hide();
            else {
                tmpFurniture.reset(furnitureData);
                tmpFurniture.ele.show();
            }
        };

        // private method
        var check = function () {
            var illegal = false;
            for (var i = tmpFurniture.top; i <= tmpFurniture.bottom; i++) {
                for (var j = tmpFurniture.left; j <= tmpFurniture.right; j++) {
                    if (i < 0 || j < 0 || i >= furnitureMap.length || j >= furnitureMap[0].length || furnitureMap[i][j] != 0) {
                        illegal = true;
                        break;
                    }
                }
            }
            if (illegal) tmpFurniture.ele.addClass('warning');
            else tmpFurniture.ele.removeClass('warning');
        };

        var addFurniture = function (furniture_in) {
            count++;
            var s = new FurnitureInstance(furniture_in);
            s.ele.appendTo(container).css({
                top: s.y * Data.grid.size,
                left: s.x * Data.grid.size
            });
            furnitureList[count] = s;

            for (var i = s.top; i <= s.bottom; i++) {
                for (var j = s.left; j <= s.right; j++) {
                    furnitureMap[i][j] = count;
                }
            }
        };

        var removeFurniture = function (id) {
            if (id == 0 || furnitureList[id] == null) return;
            furnitureList[id].ele.remove();
            for (var t = furnitureList[id].top, b = furnitureList[id].bottom; t <= b; t++) {
                for (var l = furnitureList[id].left, r = furnitureList[id].right; l <= r; l++) {
                    furnitureMap[t][l] = 0;
                }
            }
            furnitureList[id] = null;
        };

        var createWall = function () {
            if (furnitureMap == null) return;
            var hgt = furnitureMap.length;
            var wid = furnitureMap[0].length;
            var wall = null;

            var findWall = function (x, y, r, l) {
                if (wall == null) {
                    wall = new WallInstance();
                    wall.x = x;
                    wall.y = y;
                    wall.len = l||1;
                    wall.rotation = r;
                } else {
                    wall.len++;
                }
            };

            var noWall = function () {
                if (wall != null) {
                    wall.createEle().appendTo(wallPanel);
                    wallList.push(wall);
                    wall = null;
                }
            };

            wallPanel.empty();
            wallList = [];

            //findWall(wid, 0, 1, hgt);
            //noWall();
            //findWall(wid, hgt, 2, wid);
            //noWall();
            //findWall(0, hgt, 3, hgt);
            //noWall();

            var i, j;
            // top
            for (var i = 1; i < hgt; i++) {
                for (var j = 0; j < wid; j++) {
                    if ((furnitureMap[i][j] != 0 && furnitureList[furnitureMap[i][j]].id == 1) && (furnitureMap[i - 1][j] == 0 || furnitureList[furnitureMap[i - 1][j]].id != 1)) {
                        findWall(j, i, 0);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }
            for (var j = 0; j < wid; j++) {
                if ((furnitureMap[i - 1][j] == 0 || furnitureList[furnitureMap[i - 1][j]].id != 1)) {
                    findWall(j, i, 0);
                } else {
                    noWall();
                }
            }
            noWall();

            // bottom
            for (var i = hgt - 2; i >=0; i--) {
                for (var j = wid - 1; j >= 0; j--) {
                    if ((furnitureMap[i][j] != 0 && furnitureList[furnitureMap[i][j]].id == 1) && (furnitureMap[i + 1][j] == 0 || furnitureList[furnitureMap[i + 1][j]].id != 1)) {
                        findWall(j + 1, i + 1, 2);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }
            for (var j = wid - 1; j >= 0; j--) {
                if ((furnitureMap[i + 1][j] == 0 || furnitureList[furnitureMap[i + 1][j]].id != 1)) {
                    findWall(j + 1, i + 1, 2);
                } else {
                    noWall();
                }
            }
            noWall();

            // left
            for (var j = wid-2; j >=0; j--) {
                for (var i = 0; i < hgt; i++) {
                    if ((furnitureMap[i][j] != 0 && furnitureList[furnitureMap[i][j]].id == 1) && (furnitureMap[i][j + 1] == 0 || furnitureList[furnitureMap[i][j + 1]].id != 1)) {
                        findWall(j + 1, i, 1);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }
            for (var i = 0; i < hgt; i++) {
                if ((furnitureMap[i][j + 1] == 0 || furnitureList[furnitureMap[i][j + 1]].id != 1)) {
                    findWall(j + 1, i, 1);
                } else {
                    noWall();
                }
            }
            noWall();

            // right
            for (var j = 1; j < wid; j++) {
                for (var i = hgt - 1; i >= 0; i--) {
                    if ((furnitureMap[i][j] != 0 && furnitureList[furnitureMap[i][j]].id == 1) && (furnitureMap[i][j - 1] == 0 || furnitureList[furnitureMap[i][j - 1]].id != 1)) {
                        findWall(j, i + 1, 3);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }

            for (var i = hgt - 1; i >= 0; i--) {
                if ((furnitureMap[i][j - 1] == 0 || furnitureList[furnitureMap[i][j - 1]].id != 1)) {
                    findWall(j, i + 1, 3);
                } else {
                    noWall();
                }
            }
            noWall();
        };

        var _init = function () {
            tmpFurniture = new FurnitureInstance();
            tmpFurniture.ele.addClass('_tmp').appendTo(container);

            sensorPanel.hover(function () { tmpFurniture.ele.show(); }, function () { tmpFurniture.ele.hide(); })

            $(document).on('keypress', function (e) {
                switch (String.fromCharCode(e.which).toLowerCase()) {
                    case Data.hotKey.rotate:
                        if (tmpFurniture.id <= 1) return;
                        tmpFurniture.rotate((tmpFurniture.rotation + 1) % 4);
                        check();
                        return false;
                    case Data.hotKey.del:
                        var id = furnitureMap[mouseY][mouseX];
                        if (id == 0) return;
                        var typeId = furnitureList[id].id;
                        removeFurniture(id);
                        if (typeId == 1) createWall();
                        check();
                        return false;
                }
            });
        };
        _init();
    };

    MapDesigner.Furniture = Furniture;
})(window.Rendxx.MapDesigner);