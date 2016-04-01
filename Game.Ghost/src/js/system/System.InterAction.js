window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Map manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
        Grid: {
            Empty: 0,
            Wall: 1,
            Furniture: 2,
            Door: 3,
            Body: 4
        },
        FurnitureStatus: {
            None: 0,
            Closed: 1,
            Opened: 2
        },
        DoorStatus: {
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3
        },
        FurnitureOperation: {
            Open: 0,
            Key: 1,
            Close: 2,
            CannotTake: 3
        },
        DoorOperation: {
            Blocked: 0
        },
        DoorPrefix: 'd'
    };
    var InterAction = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            map = entity.map,
            width = 0,
            height= 0,
            statusList = {
                door: {},           // door id: door status
                furniture: {}       // furniture id: furniture status
            },
            position = {            // list of position coordinate
                survivor: [],
                ghost: [],
                end: []
            },
            emptyPos = [],
            accessGrid = [],        // [[{id: angle}]]

            // cache
            surroundObj = {
                furniture: [],      // [[{id: angle}]]
                door: []
            };
        
        // public method -------------------------------------------------
        this.reset = function () {
            setupAccess();
            setupInteractionObj();
        };

        // check whether this position can be moved to, return result
        this.moveCheck = function (x, y, deltaX, deltaY) {
            var newX = Math.floor(x + deltaX),
                newY = Math.floor(y + deltaY),
                oldX = Math.floor(x),
                oldY = Math.floor(y);

            var rst = [x + deltaX, y + deltaY];
            if (deltaX != 0 && (newX < 0 || newX >= width || (map.grid.empty[oldY][newX] != _Data.Grid.Empty && !(map.grid.empty[oldY][newX] == _Data.Grid.Door && map.objList['door'][map.grid.door[oldY][newX]].status == _Data.DoorStatus.Opened))))
                rst[0] = (deltaX > 0) ? newX : newX + 1;
            if (deltaY != 0 && (newY < 0 || newY >= height || (map.grid.empty[newY][oldX] != _Data.Grid.Empty && !(map.grid.empty[newY][oldX] == _Data.Grid.Door && map.objList['door'][map.grid.door[newY][oldX]].status == _Data.DoorStatus.Opened))))
                rst[1] = (deltaY > 0) ? newY : newY + 1;
            return rst;
        };

        // get surround interaction obj list
        this.checkInteractionObj = function (x, y, r) {
            var x_idx = Math.floor(x),
                y_idx = Math.floor(y);

            // furniture
            var list_f = surroundObj.furniture[y_idx][x_idx];
            var rst_f = {};

            for (var t in list_f) {
                var d = Math.abs(list_f[t][2] - r);
                if (d > 180) d = 360 - d;
                if (d > 90 && list_f[t][0] > 1.5) continue;

                var d2 = Math.sqrt(Math.pow(list_f[t][0] - x, 2) + Math.pow(list_f[t][1] - y, 2));
                if (d2 > 1.5) continue;

                rst_f[t] = [d2,d];
            }

            // door
            var list_d = surroundObj.door[y_idx][x_idx];
            var rst_d = {};

            for (var t in list_d) {
                var d = Math.abs(list_d[t][2] - r);
                if (d > 180) d = 360 - d;
                var d2 = Math.sqrt(Math.pow(list_d[t][0] - x, 2) + Math.pow(list_d[t][1] - y, 2));
                if (d2 > 1.5) continue;

                rst_d[t] = [d2, d];
            }

            return {
                furniture: rst_f,
                door: rst_d
            };
        };
        
        // get all accessable object of that position
        this.getAccessObject = function (x, y) {
            x = Math.floor(x);
            y = Math.floor(y);
            return accessGrid[y][x];
        };

        // check the access of funiture
        this.tryAccess = function (character, x, y, access_x, access_y) {
            x = Math.floor(x);
            y = Math.floor(y);
            access_x = Math.floor(access_x);
            access_y = Math.floor(access_y);

            if (access_x < 0 || access_y >= width || access_y < 0 || access_y >= height) return null;
            if (accessGrid[y][x] == null && grid.body[access_y][access_x] == -1) return null;

            if (grid.furniture[access_y][access_x] != -1) {
                // furniture
                if (accessGrid[y][x][grid.furniture[access_y][access_x]] !== true) return null;

                var keyId = map.objList.furniture[grid.furniture[access_y][access_x]].interaction();
                if (keyId == -1) return null;
                return { key: map.objList.key[keyId] };
            } else if (grid.door[access_y][access_x] != -1) {
                // door
                if (accessGrid[y][x][_Data.DoorPrefix + grid.door[access_y][access_x]] !== true) return null;
                map.objList.door[grid.door[access_y][access_x]].interaction(character);
                return { door: map.objList.door[grid.door[access_y][access_x]] };
            } else if (grid.body[access_y][access_x] != -1) {
                // door
                var keys = map.objList.body[grid.body[access_y][access_x]].interaction();
                return { body: keys };
            }
            return null;
        };

        this.checkVisible = function (characterA, characterB) {
            var x1 = characterA.x,
                y1 = characterA.y,
                x2 = characterB.x,
                y2 = characterB.y;
            var r = Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI;
            var d = Math.abs(r - characterA.currentRotation.head);
            if (d > 180) d = 360 - d;
            if (d > 80) return false;
            return _checkVisibleLine(x1, x2, y1, y2);
        };

        var _checkVisibleLine = function (x1, x2, y1, y2) {
            var r = Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI;
            if (x1 == x2) {
                var y_min = Math.min(y1, y2),
                    y_max = Math.max(y1, y2),
                    x = Math.floor(x1);
                for (var y = Math.ceil(y_min) ; y <= y_max; y++) {
                    if (!_checkPosVisible(x, y)) return false;
                }
            } else if (y1 == y2) {
                var x_min = Math.min(x1, x2),
                    x_max = Math.max(x1, x2),
                    y = Math.floor(y1);
                for (var x = Math.ceil(x_min) ; x <= x_max; x++) {
                    if (!_checkPosVisible(x, y)) return false;
                }
            } else {
                var k = (y1 - y2) / (x1 - x2),
                    c = y1 - k * x1,
                    x_min = Math.min(x1, x2),
                    x_max = Math.max(x1, x2);
                for (var x = Math.ceil(x_min) ; x <= x_max; x++) {
                    var y = Math.floor(k * x + c);
                    if (!_checkPosVisible(x, y)) return false;
                }
                var k = (x1 - x2) / (y1 - y2),
                    c = x1 - k * y1,
                    y_min = Math.min(y1, y2),
                    y_max = Math.max(y1, y2);
                for (var y = Math.ceil(y_min) ; y <= y_max; y++) {
                    var x = Math.floor(k * y + c);
                    if (!_checkPosVisible(x, y)) return false;
                }
            }
            return true;
        };

        var _checkPosVisible = function (x, y) {
            if (grid.empty[y][x] == _Data.Grid.Empty) return true;
            if (grid.empty[y][x] == _Data.Grid.Furniture && !map.objList.furniture[grid.furniture[y][x]].blockSight) return true;
            if (grid.empty[y][x] == _Data.Grid.Door && !map.objList.door[grid.door[y][x]].status == SYSTEM.MapObject.Door.Data.Status.Opened) return true;
            return false;
        };

        this.findEmptyPos = function () {
            var idx = Math.floor(emptyPos.length * Math.random());
            return emptyPos[idx];
        };

        this.checkInEnd = function (x, y) {
            x = Math.floor(x);
            y = Math.floor(y);
            for (var i = 0; i < position['end'].length; i++) {
                if (x == position['end'][i][0] && y == position['end'][i][1]) return true;
            }
            return false;
        };

        // setup -----------------------------------------------
        var setupAccess = function () {
            accessGrid = [];
            width = map.width;
            height = map.height;
            for (var i = 0; i < height; i++) {
                accessGrid[i] = [];
                for (var j = 0; j < width; j++) {
                    accessGrid[i][j] = null;
                }
            }

            // add accesslist for furniture
            var furnitures = map.objList.furniture;
            for (var k in furnitures) {
                var furniture = furnitures[k];
                var x = furniture.x;
                var y = furniture.y;
                var r = furniture.rotation;
                var accessPos = map.modelData.items[Data.item.categoryName.furniture][furniture.id].accessPos;
                if (accessPos == null) continue;

                for (var i = 0; i < accessPos.length; i++) {
                    var p = accessPos[i];
                    var r1 = (((p[1] >= 0) ? (p[0] >= 0 ? 0 : 1) : (p[0] >= 0 ? 3 : 2)) + r) % 4;
                    var new_x = (r1 == 0 || r1 == 3 ? 1 : -1) * Math.abs(((r & 1) == 0) ? p[0] : p[1]) + x;
                    var new_y = (r1 == 0 || r1 == 1 ? 1 : -1) * Math.abs(((r & 1) == 0) ? p[1] : p[0]) + y;
                    if (new_x < 0 || new_x >= width || new_y < 0 || new_y >= height) continue;
                    if (accessGrid[new_y][new_x] == null) accessGrid[new_y][new_x] = { furniture: {}, door: {}};
                    accessGrid[new_y][new_x]['furniture'][k] = true;
                }
            }

            var doors = map.objList.door;
            for (var k in doors) {
                var door = doors[k];
                var x = door.x;
                var y = door.y;
                var r = door.rotation;
                var accessPos = _modelData.items[Data.item.categoryName.door][door.id].accessPos;
                if (accessPos == null) continue;

                for (var i = 0; i < accessPos.length; i++) {
                    var p = accessPos[i];
                    var r1 = (((p[1] >= 0) ? (p[0] >= 0 ? 0 : 1) : (p[0] >= 0 ? 3 : 2)) + r) % 4;
                    var new_x = (r1 == 0 || r1 == 3 ? 1 : -1) * Math.abs(((r & 1) == 0) ? p[0] : p[1]) + x;
                    var new_y = (r1 == 0 || r1 == 1 ? 1 : -1) * Math.abs(((r & 1) == 0) ? p[1] : p[0]) + y;
                    if (new_x < 0 || new_x >= width || new_y < 0 || new_y >= height) continue;
                    if (accessGrid[new_y][new_x] == null) accessGrid[new_y][new_x] = { furniture: {}, door: {} };
                    accessGrid[new_y][new_x]['door'][k] = true;
                }
            }

            // re-scan matrix for angle
            //    o------------->
            //    | 225 180 135
            //    | 270     90
            //    | 315  0  45
            //    v

            var t;
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    if (accessGrid[i][j] == null) continue;
                    if (i>0){
                        if (j > 0) {
                            t = map.grid.furniture[i - 1][j - 1];
                            if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 225;
                            t = map.grid.door[i - 1][j - 1];
                            if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 225;
                        }
                        if (j < width - 1) {
                            t = map.grid.furniture[i - 1][j + 1];
                            if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 135;
                            t = map.grid.door[i - 1][j + 1];
                            if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 135;
                        }
                        t = map.grid.furniture[i - 1][j];
                        if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 180;
                        t = map.grid.door[i - 1][j];
                        if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 180;
                    }
                    if (i < height-1) {
                        if (j > 0) {
                            t = map.grid.furniture[i + 1][j - 1];
                            if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 315;
                            t = map.grid.door[i + 1][j - 1];
                            if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 315;
                        }
                        if (j < width - 1) {
                            t = map.grid.furniture[i + 1][j + 1];
                            if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 45;
                            t = map.grid.door[i + 1][j + 1];
                            if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 45;
                        }
                        t = map.grid.furniture[i + 1][j];
                        if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 0;
                        t = map.grid.door[i + 1][j];
                        if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 0;
                    }
                    if (j > 0) {
                        t = map.grid.furniture[i][j - 1];
                        if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 270;
                        t = map.grid.door[i][j - 1];
                        if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 270;
                    }
                    if (j < width - 1) {
                        t = map.grid.furniture[i][j + 1];
                        if (t != -1 && accessGrid[i][j].furniture.hasOwnProperty(t)) accessGrid[i][j].furniture[t] = 90;
                        t = map.grid.door[i][j + 1];
                        if (t != -1 && accessGrid[i][j].door.hasOwnProperty(t)) accessGrid[i][j].door[t] = 90;
                    }
                }
            }

            // find empty position 
            emptyPos = [];
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    if (map.grid.empty[i][j] == _Data.Grid.Empty) {
                        emptyPos.push([i, j]);
                    }
                }
            }
        };
        
        // cache -----------------------------------------------
        // setup cache based on the map data
        var setupInteractionObj = function () {
            surroundObj = {
                furniture: [],
                door: []
            };
            var range = Data.map.para.scanRange + 1;
            var range2 = range * range;
            for (var i = 0; i < height; i++) {
                surroundObj.furniture[i] = [];
                surroundObj.door[i] = [];

                for (var j = 0; j < width; j++) {
                    surroundObj.furniture[i][j] = {};
                    surroundObj.door[i][j] = [];
                    var x_min = j - range;
                    var x_max = j + range;
                    var y_min = i - range;
                    var y_max = i + range;
                    if (x_min < 0) x_min = 0;
                    if (x_max >= width) x_max = width - 1;
                    if (y_min < 0) y_min = 0;
                    if (y_max >= height) y_max = height - 1;

                    for (var m = y_min; m <= y_max; m++) {
                        for (var n = x_min; n <= x_max; n++) {
                            // furniture
                            var f_id = map.grid.furniture[m][n];
                            if (f_id == -1) continue;
                            var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                            if (!(f_id in surroundObj.furniture[i][j]) || surroundObj.furniture[i][j][f_id] > r)
                                surroundObj.furniture[i][j][f_id] = r;

                            // door
                            var d_id = map.grid.door[m][n];
                            if (d_id == -1) continue;
                            var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                            if (!(d_id in surroundObj.door[i][j]) || surroundObj.door[i][j][d_id] > r)
                                surroundObj.door[i][j][f_id] = r;
                        }
                    }
                    for (var t in surroundObj.furniture[i][j]) {
                        if (surroundObj.furniture[i][j][t] > range2 || !_checkVisibleLine(j, i, map.objList.furniture[t].x, map.objList.furniture[t].y)) delete surroundObj.furniture[i][j][t];
                        else surroundObj.furniture[i][j][t] = [map.objList.furniture[t].x, map.objList.furniture[t].y, Math.atan2(map.objList.furniture[t].x - j, map.objList.furniture[t].y - i) * 180 / Math.PI];
                    }
                    for (var t in surroundObj.door[i][j]) {
                        if (surroundObj.door[i][j][t] > range2 || !_checkVisibleLine(j, i, map.objList.door[t].x, map.objList.door[t].y)) delete surroundObj.door[i][j][t];
                        else surroundObj.door[i][j][t] = [map.objList.door[t].x, map.objList.door[t].y, Math.atan2(map.objList.door[t].x - j, map.objList.door[t].y - i) * 180 / Math.PI];
                    }
                }
            }
        };

        var updateInteractionObj = function (f_id) {
        };
    };

    SYSTEM.InterAction = InterAction;
})(window.Rendxx.Game.Ghost.System);