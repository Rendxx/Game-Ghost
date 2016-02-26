﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var ItemInstance = function (instance) {
        var that = this,
            _h = -1,
            _w = -1,
            _x = -1,
            _y = -1;

        this.id = null;
        this.category = null;
        this.icon = null;
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
            if (data == null) {
                this.h = 1;
                this.w = 1;
                _h = this.h;
                _w = this.w;
                this.ele.removeClass('furniture-' + this.category);
                this.icon = null;
                this.ele.css('background-image', 'none');
                this.id = null;
                this.category = null;
            } else {
                if (data.dimension == null) {
                    this.h = 1;
                    this.w = 1;
                } else {
                    this.h = data.dimension[1];
                    this.w = data.dimension[0];
                }
                _h = this.h;
                _w = this.w;

                if (this.category != null) this.ele.removeClass('furniture-' + this.category);
                this.icon = 'url("' + ((data.category != null && Data.path[data.category] != null) ? Data.path[data.category] : 'Images/') + data.icon + '")';
                this.ele.css('background-image', this.icon);
                this.id = data.id;
                this.category = data.category;
                if (this.category != null) this.ele.addClass('furniture-' + this.category);
                this.ele.width(this.w * Data.grid.size).height(this.h * Data.grid.size);
            }
            this.rotate(0);
        };

        var _init = function (instance) {
            that.ele = $(Data.html.furniture);
            if (instance != null) {
                that.id = instance.id;
                that.rotation = instance.rotation;
                that.category = instance.category;
                that.icon = instance.icon;
                that.x = instance.x;
                that.y = instance.y;
                that.h = instance.h;
                that.w = instance.w;
                that.ele.width(that.w * Data.grid.size).height(that.h * Data.grid.size)
                    .css('background-image', that.icon);
                if (that.category != null) that.ele.addClass('furniture-' + that.category);
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

    var DrawManager = function (container, wallPanel, groundPanel, keyPanel, sensorPanel) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            wallPanel: wallPanel,
            groundPanel: groundPanel,
            keyPanel: keyPanel,
            sensorPanel: sensorPanel,
            selector: null
        };
        var that = this,
            itemMap = null,
            itemList = null,
            wallList = null,
            doorSetting = null;
            tmpFurniture = null,
            isWallLock = false,         // true if drawing wall
            isGroundLock = false,       // true if drawing ground
            isKeySetting = false,       // true if setting key
            tmp_keyEles = null,
            mouseX = 0,
            mouseY = 0,
            count = null;

        // method
        this.getList = function () {
            return itemList;
        };

        this.getWall = function () {
            return wallList;
        };

        this.getDoorSetting = function () {
            return doorSetting;
        };

        this.setDoorName = function (idx, name) {
            doorSetting[idx].name = name;
        };

        this.reset = function (hgt, wid, item_in, doorSetting_in) {
            if (itemList != null) {
                for (var k in Data.categoryName) {
                    for (var i = 0, l = itemList[Data.categoryName[k]].length; i < l; i++) {
                        removeItem(Data.categoryName[k], i);
                    }
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
            _html.groundPanel.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            _html.keyPanel.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });            

            itemMap = {};
            itemList = {};
            count = {};
            for (var k in Data.categoryName) {
                itemMap[Data.categoryName[k]] = [];
                itemList[Data.categoryName[k]] = [];
                count[Data.categoryName[k]] = 0;
                for (var i = 0; i < hgt; i++) {
                    itemMap[Data.categoryName[k]][i] = [];
                    for (var j = 0; j < wid; j++) {
                        itemMap[Data.categoryName[k]][i][j] = 0;
                    }
                }
            }

            for (var k in Data.categoryName) {
                var list = item_in[Data.categoryName[k]];
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == null) continue;
                    addItem(list[i]);
                }
            }

            doorSetting = doorSetting_in;
            createWall();
            setupDoor();
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
            _html.groundPanel.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            });
            _html.keyPanel.css({
                width: Data.grid.size * wid,
                height: Data.grid.size * hgt
            }); 

            if (itemMap == null) {
                itemMap = {};
                itemList = {};
                count = {};
                for (var k in Data.categoryName) {
                    itemMap[Data.categoryName[k]] = [];
                    itemList[Data.categoryName[k]] = [];
                    count[Data.categoryName[k]] = 0;
                    for (var i = 0; i < hgt; i++) {
                        itemMap[Data.categoryName[k]][i] = [];
                        for (var j = 0; j < wid; j++) {
                            itemMap[Data.categoryName[k]][i][j] = 0;
                        }
                    }
                }
            } else {
                for (var k in Data.categoryName) {
                    var list = itemList[Data.categoryName[k]];
                    for (var i = 0, l = list.length; i < l; i++) {
                        if (list[i] != null && (list[i].bottom >= hgt || list[i].right >= wid)) removeItem(Data.categoryName[k], i);
                    }
                }
                var itemMap_old = itemMap;
                var w_old = 0;
                var h_old = 0;
                for (var k in itemMap_old) {
                    w_old = itemMap_old[k].length;
                    h_old = itemMap_old[k][0].length;
                    break;
                }

                itemMap = {};
                for (var k in Data.categoryName) {
                    itemMap[Data.categoryName[k]] = [];
                    for (var i = 0; i < hgt; i++) {
                        itemMap[Data.categoryName[k]][i] = [];
                        for (var j = 0; j < wid; j++) {
                            itemMap[Data.categoryName[k]][i][j] = (i < w_old && j < h_old) ? itemMap_old[Data.categoryName[k]][i][j] : 0;
                        }
                    }
                }
            }
            createWall();
            setupDoor();
        };

        this.showFigure = function (x, y) {
            mouseX = x;
            mouseY = y;
            if (isKeySetting) {
                tmpFurniture.move(x, y);
                return;
            }
            if (tmpFurniture.category == null) return;
            if (!isWallLock && !isGroundLock) {
                tmpFurniture.move(x, y);
            } else {
                tmpFurniture.extend(x, y);
            }
            check();
        };

        // set an item
        this.setItem = function (x, y) {
            // add key
            if (isKeySetting) {
                addKey(mouseY, mouseX);
                return;
            }

            //add item
            if (tmpFurniture.category == null) return;
            if (tmpFurniture.ele.hasClass('warning')) return;
            if (tmpFurniture.category == Data.categoryName.wall && !isWallLock) {
                isWallLock = true;
            } else if (tmpFurniture.category == Data.categoryName.ground && !isGroundLock) {
                isGroundLock = true;
            } else {
                addItem(tmpFurniture);
                tmpFurniture.recover();
                tmpFurniture.move(x, y);
                isWallLock = false;
                isGroundLock = false;
                if (tmpFurniture.category == Data.categoryName.wall) createWall();
                if (tmpFurniture.category == Data.categoryName.door) setupDoor();
            }
        };

        this.changeType = function (furnitureData) {
            isWallLock = false;
            isGroundLock = false;
            isKeySetting = false;
            tmpFurniture.reset(furnitureData);
            closeKeyPanel();
            if (tmpFurniture.category == null)
                tmpFurniture.ele.hide();
            else {
                tmpFurniture.ele.show();
            }
        };

        // start setting key of a specified door
        this.setKeyMode = function (idx) {
            if (idx === null || idx === undefined) {
                closeKeyPanel();
                isKeySetting = false;
                tmpFurniture.reset(null);
                tmpFurniture.ele.hide();
                return;
            }
            tmpFurniture.ele.show();
            var furnitureData = {
                "id": idx,
                "category": null,
                "icon": "key.icon.png"
            };
            isWallLock = false;
            isGroundLock = false;
            isKeySetting = true;
            tmpFurniture.reset(furnitureData);
            setupKeyPanel(idx);
        };

        // rotate current setting furniture clockwise by 90 degree
        this.rotate = function () {
            if (tmpFurniture.category == Data.categoryName.wall || tmpFurniture.category == Data.categoryName.ground) return;
            tmpFurniture.rotate((tmpFurniture.rotation + 1) % 4);
            check();
        };

        // delete the furniture the mouse points to
        this.deleteTarget = function () {
            // delete key
            if (isKeySetting) {
                removeKey(mouseY, mouseX);
                return;
            }
             
            // delete item
            var id = 0;
            var category = null;
            for (var i = 0; i < Data.categoryOrder.length; i++) {
                category = Data.categoryName[Data.categoryOrder[i]];
                if (itemMap[category][mouseY][mouseX] != 0) {
                    id = itemMap[category][mouseY][mouseX];
                    break;
                }
            }
            if (id == 0) return;
            removeItem(category, id);
            if (category == Data.categoryName.wall) createWall();
            if (category == Data.categoryName.door || category == Data.categoryName.furniture) setupDoor();
            check();
        };

        // private method
        var check = function () {
            if (tmpFurniture.category == null) return false;
            var illegal = false;

            if (tmpFurniture.category == Data.categoryName.wall
                || tmpFurniture.category == Data.categoryName.furniture
                || tmpFurniture.category == Data.categoryName.door) {

                // check wall / furniture / door
                var m = itemMap[Data.categoryName.furniture];
                for (var i = tmpFurniture.top; i <= tmpFurniture.bottom; i++) {
                    for (var j = tmpFurniture.left; j <= tmpFurniture.right; j++) {
                        if (i < 0 || j < 0 || i >= m.length || j >= m[0].length || m[i][j] != 0) {
                            illegal = true;
                            break;
                        }
                    }
                }

                var m = itemMap[Data.categoryName.wall];
                if (m != null) {
                    for (var i = tmpFurniture.top; i <= tmpFurniture.bottom; i++) {
                        for (var j = tmpFurniture.left; j <= tmpFurniture.right; j++) {
                            if (i < 0 || j < 0 || i >= m.length || j >= m[0].length || m[i][j] != 0) {
                                illegal = true;
                                break;
                            }
                        }
                    }
                }

                var m = itemMap[Data.categoryName.door];
                if (m != null) {
                    for (var i = tmpFurniture.top; i <= tmpFurniture.bottom; i++) {
                        for (var j = tmpFurniture.left; j <= tmpFurniture.right; j++) {
                            if (i < 0 || j < 0 || i >= m.length || j >= m[0].length || m[i][j] != 0) {
                                illegal = true;
                                break;
                            }
                        }
                    }
                }
            } else {
                // check other
                var m = itemMap[tmpFurniture.category];
                for (var i = tmpFurniture.top; i <= tmpFurniture.bottom; i++) {
                    for (var j = tmpFurniture.left; j <= tmpFurniture.right; j++) {
                        if (i < 0 || j < 0 || i >= m.length || j >= m[0].length || m[i][j] != 0) {
                            illegal = true;
                            break;
                        }
                    }
                }
            }
            if (illegal) tmpFurniture.ele.addClass('warning');
            else tmpFurniture.ele.removeClass('warning');
        };

        var addItem = function (item_in) {
            var s = new ItemInstance(item_in);
            var category = s.category;
            count[category]++;
            if (category == Data.categoryName.ground) {
                s.ele.appendTo(groundPanel).css({
                    top: s.y * Data.grid.size,
                    left: s.x * Data.grid.size
                });
            } else {
                s.ele.appendTo(container).css({
                    top: s.y * Data.grid.size,
                    left: s.x * Data.grid.size
                });
            }
            itemList[category][count[category]] = s;

            for (var i = s.top; i <= s.bottom; i++) {
                for (var j = s.left; j <= s.right; j++) {
                    itemMap[s.category][i][j] = count[category];
                }
            }
        };

        var removeItem = function (category, id) {
            if (id == 0 || itemList[category][id] == null) return;
            var item = itemList[category][id];
            item.ele.remove();
            for (var t = item.top, b = item.bottom; t <= b; t++) {
                for (var l = item.left, r = item.right; l <= r; l++) {
                    itemMap[category][t][l] = 0;
                }
            }
            itemList[category][id] = null;
        };

        var createWall = function () {
            if (itemMap == null) return;
            var wid = 0;
            var hgt = 0;
            for (var k in itemMap) {
                hgt = itemMap[k].length;
                wid = itemMap[k][0].length;
                break;
            }
            var wall = null;

            var findWall = function (x, y, r, l) {
                if (wall == null) {
                    wall = new WallInstance();
                    wall.x = x;
                    wall.y = y;
                    wall.len = l || 1;
                    wall.rotation = r;
                } else {
                    wall.len++;
                }
            };

            var noWall = function () {
                if (wall != null) {
                    wall.createEle().appendTo(_html.wallPanel);
                    wallList.push(wall);
                    wall = null;
                }
            };

            _html.wallPanel.empty();
            wallList = [];

            //findWall(wid, 0, 1, hgt);
            //noWall();
            //findWall(wid, hgt, 2, wid);
            //noWall();
            //findWall(0, hgt, 3, hgt);
            //noWall();

            var wallMap = itemMap[Data.categoryName.wall];
            var i, j;
            // top
            for (var i = 1; i < hgt; i++) {
                for (var j = 0; j < wid; j++) {
                    if (wallMap[i][j] != 0 && wallMap[i - 1][j] == 0) {
                        findWall(j, i, 0);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }
            for (var j = 0; j < wid; j++) {
                if (wallMap[i - 1][j] == 0) {
                    findWall(j, i, 0);
                } else {
                    noWall();
                }
            }
            noWall();

            // bottom
            for (var i = hgt - 2; i >= 0; i--) {
                for (var j = wid - 1; j >= 0; j--) {
                    if (wallMap[i][j] != 0 && wallMap[i + 1][j] == 0) {
                        findWall(j + 1, i + 1, 2);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }
            for (var j = wid - 1; j >= 0; j--) {
                if (wallMap[i + 1][j] == 0) {
                    findWall(j + 1, i + 1, 2);
                } else {
                    noWall();
                }
            }
            noWall();

            // left
            for (var j = wid - 2; j >= 0; j--) {
                for (var i = 0; i < hgt; i++) {
                    if (wallMap[i][j] != 0 && wallMap[i][j + 1] == 0) {
                        findWall(j + 1, i, 1);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }
            for (var i = 0; i < hgt; i++) {
                if (wallMap[i][j + 1] == 0) {
                    findWall(j + 1, i, 1);
                } else {
                    noWall();
                }
            }
            noWall();

            // right
            for (var j = 1; j < wid; j++) {
                for (var i = hgt - 1; i >= 0; i--) {
                    if (wallMap[i][j] != 0 && wallMap[i][j - 1] == 0) {
                        findWall(j, i + 1, 3);
                    } else {
                        noWall();
                    }
                }
                noWall();
            }

            for (var i = hgt - 1; i >= 0; i--) {
                if (wallMap[i][j - 1] == 0) {
                    findWall(j, i + 1, 3);
                } else {
                    noWall();
                }
            }
            noWall();
        };

        var setupDoor = function () {
            if (doorSetting == null) doorSetting = {};
            for (var i in itemList[Data.categoryName.door]) {
                var d = itemList[Data.categoryName.door][i];
                if (d == null) continue;
                if (doorSetting[i] == null) {
                    doorSetting[i] = {
                        name: 'Door ' + i,
                        keys: {}
                    };
                } else {
                    for (var idx in doorSetting[i].keys) {
                        var t = doorSetting[i].keys[idx];
                        if (itemList[Data.categoryName.furniture][t] == null) {
                            delete doorSetting[i].keys[idx];
                            continue;
                        }
                    }
                }
                for (var i in doorSetting) {
                    if (itemList[Data.categoryName.door][i] == null) delete doorSetting[i];
                }
            }
        };

        // key panel ------------------------------------------------------------------------------
        // draw key for special door on map
        var setupKeyPanel = function (idx) {
            _html.keyPanel.empty();
            tmp_keyEles = {};
            var keyList = doorSetting[idx].keys;
            for (var i in keyList) {
                tmp_keyEles[i] = itemList[Data.categoryName.furniture][i].ele.clone().css('background-image', tmpFurniture.icon).appendTo(_html.keyPanel);
            }
            _html.keyPanel.fadeIn(200);
        };

        var closeKeyPanel = function () {
            _html.keyPanel.empty().fadeOut(200);
        };

        var addKey = function (y, x) {
            var itemIdx = itemMap[Data.categoryName.furniture][y][x];
            if (itemIdx <= 0) return;
            var idx = tmpFurniture.id;
            var keyList = doorSetting[idx].keys;
            if (itemIdx in keyList) return;
            keyList[itemIdx] = itemIdx;
            tmp_keyEles[itemIdx] = itemList[Data.categoryName.furniture][itemIdx].ele.clone().css('background-image', tmpFurniture.icon).appendTo(_html.keyPanel);
        };

        var removeKey = function (y, x) {
            var itemIdx = itemMap[Data.categoryName.furniture][y][x];
            if (itemIdx <= 0) return;
            var idx = tmpFurniture.id;
            var keyList = doorSetting[idx].keys;
            if (!(itemIdx in keyList)) return;
            delete keyList[itemIdx];
            tmp_keyEles[itemIdx].remove();
            delete tmp_keyEles[itemIdx];
        };

        // init ----------------------------------------------------------------------------------
        var _init = function () {
            tmpFurniture = new ItemInstance();
            tmpFurniture.ele.addClass('_tmp').appendTo(container);

            sensorPanel.hover(function () { tmpFurniture.ele.show(); }, function () { tmpFurniture.ele.hide(); });
            closeKeyPanel();
        };
        _init();
    };

    MapDesigner.DrawManager = DrawManager;
})(window.Rendxx.MapDesigner);