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
            _data = null,
            _modelData = null,
            width = 0,
            height = 0,
            gameData = {
            },
            grid = {
                furniture: [],
                wall: [],
                door: [],
                body: [],
                empty: []
            },
            itemList = {
                furniture: {},
                door: {},
                body: {},
                key: {}
            },
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
            accessGrid = [],        // 2d matrix same as grid. reocrd accessable furniture id of that grid in a list

            // cache
            _surroundObj = [];

        this.setupData = {};

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------
        // load basic data and map data
        this.setup = function (modelData, data) {
            _data = data;
            _modelData = modelData;
            that.setupData = {};
            setupGrid();
            setupPosition();
            setupFurniture();
            setupKey();
            setupDoor();
            setupInteractionObj();
            setupBody();
            _onChange();
        };

        // reset key / player / position with given data
        this.reset = function (setupData_in, gameData_in) {
            that.setupData = setupData_in;
            recoverPosition(setupData_in.mapSetup.position);
            recoverKey(setupData_in.key);
            recoverFurniture(gameData_in.furniture);
            recoverDoor(gameData_in.door);
            recoverBody(gameData_in.body);
            setupInteractionObj();
        };

        // check whether this position can be moved to, return result
        this.moveCheck = function (x, y, deltaX, deltaY) {
            var newX = Math.floor(x + deltaX),
                newY = Math.floor(y + deltaY),
                oldX = Math.floor(x),
                oldY = Math.floor(y);

            var rst = [x + deltaX, y + deltaY];
            if (deltaX != 0 && (newX < 0 || newX >= width || (grid.empty[oldY][newX] != _Data.Grid.Empty && !(grid.empty[oldY][newX] == _Data.Grid.Door && itemList['door'][grid.door[oldY][newX]].status == _Data.DoorStatus.Opened))))
                rst[0] = (deltaX > 0) ? newX : newX + 1;
            if (deltaY != 0 && (newY < 0 || newY >= height || (grid.empty[newY][oldX] != _Data.Grid.Empty && !(grid.empty[newY][oldX] == _Data.Grid.Door && itemList['door'][grid.door[newY][oldX]].status == _Data.DoorStatus.Opened))))
                rst[1] = (deltaY > 0) ? newY : newY + 1;
            return rst;
        };

        // get surround interaction obj list
        this.checkInteractionObj = function (x, y, r) {
            var x = Math.floor(x),
                y = Math.floor(y);

            // furniture
            var list_f = _surroundObj.furniture[y][x];
            var rst_f = {};

            for (var t in list_f) {
                var d = Math.abs(list_f[t][1] - r);
                if (d > 180) d = 360 - d;
                if (d > 90) continue;
                if (itemList.furniture[t].status == _Data.FurnitureStatus.Closed) {
                    rst_f[t] = _Data.FurnitureOperation.Open;
                } else {
                    if (itemList.furniture[t].keyId != -1) {
                        rst_f[t] = _Data.FurnitureOperation.Key;
                    } else if (itemList.furniture[t].status == _Data.FurnitureStatus.Opened) {
                        rst_f[t] = _Data.FurnitureOperation.Close;
                    }
                }
            }

            // door
            var list_d = _surroundObj.door[y][x];
            var rst_d = {};

            for (var t in list_d) {
                if (itemList.door[t].status == _Data.DoorStatus.Blocked) {
                    rst_d[t] = _Data.DoorOperation.Blocked;
                }
            }

            return {
                furniture: rst_f,
                door: rst_d
            };
        };

        this.checkAccess = function (x, y, access_x, access_y) {
            x = Math.floor(x);
            y = Math.floor(y);
            access_x = Math.floor(access_x);
            access_y = Math.floor(access_y);

            if (access_x < 0 || access_y >= width || access_y < 0 || access_y >= height) return null;
            if (accessGrid[y][x] == null) return null;

            var f_id = grid.furniture[access_y][access_x];
            var d_id = grid.door[access_y][access_x];
            if (f_id != -1) {
                // furniture
                if (accessGrid[y][x][f_id] !== true) return null;
                return { furniture: f_id };
            } else if (d_id != -1) {
                // door
                if (accessGrid[y][x][_Data.DoorPrefix + d_id] !== true) return null;
                return { door: d_id };
            }

            return null;
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

                var keyId = itemList.furniture[grid.furniture[access_y][access_x]].interaction();
                if (keyId == -1) return null;
                return { key: itemList.key[keyId] };
            } else if (grid.door[access_y][access_x] != -1) {
                // door
                if (accessGrid[y][x][_Data.DoorPrefix + grid.door[access_y][access_x]] !== true) return null;
                itemList.door[grid.door[access_y][access_x]].interaction(character);
                return { door: itemList.door[grid.door[access_y][access_x]] };
            } else if (grid.body[access_y][access_x] != -1) {
                // door
                var keys = itemList.body[grid.body[access_y][access_x]].interaction();
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
            if (grid.empty[y][x] == _Data.Grid.Furniture && !itemList.furniture[grid.furniture[y][x]].blockSight) return true;
            if (grid.empty[y][x] == _Data.Grid.Door && !itemList.door[grid.door[y][x]].status == SYSTEM.MapObject.Door.Data.Status.Opened) return true;
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
            width = _data.grid.width;
            height = _data.grid.height;
            for (var i = 0; i < _data.grid.height; i++) {
                accessGrid[i] = [];
                for (var j = 0; j < _data.grid.width; j++) {
                    accessGrid[i][j] = null;
                }
            }

            // add accesslist for furniture
            var furnitures = _data.item.furniture;
            for (var k = 0; k < furnitures.length; k++) {
                if (furnitures[k] == null) continue;
                var furniture = furnitures[k];
                var x = furniture.x;
                var y = furniture.y;
                var r = furniture.rotation;
                var accessPos = _modelData.items[Data.item.categoryName.furniture][furniture.id].accessPos;
                if (accessPos == null) continue;

                for (var i = 0; i < accessPos.length; i++) {
                    var p = accessPos[i];
                    var r1 = (((p[1] >= 0) ? (p[0] >= 0 ? 0 : 1) : (p[0] >= 0 ? 3 : 2)) + r) % 4;
                    var new_x = (r1 == 0 || r1 == 3 ? 1 : -1) * Math.abs(((r & 1) == 0) ? p[0] : p[1]) + x;
                    var new_y = (r1 == 0 || r1 == 1 ? 1 : -1) * Math.abs(((r & 1) == 0) ? p[1] : p[0]) + y;
                    if (new_x < 0 || new_x >= width || new_y < 0 || new_y >= height) continue;
                    if (accessGrid[new_y][new_x] == null) accessGrid[new_y][new_x] = {};
                    accessGrid[new_y][new_x][k] = true;
                }
            }

            var doors = _data.item.door;
            for (var k = 0; k < doors.length; k++) {
                if (doors[k] == null) continue;
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
                    if (accessGrid[new_y][new_x] == null) accessGrid[new_y][new_x] = {};
                    accessGrid[new_y][new_x][_Data.DoorPrefix + k] = true;
                }
            }

            // find empty position 
            emptyPos = [];
            for (var i = 0; i < _data.grid.height; i++) {
                for (var j = 0; j < _data.grid.width; j++) {
                    if (grid.empty[i][j] == _Data.Grid.Empty) {
                        emptyPos.push([i, j]);
                    }
                }
            }
        };


        // cache -----------------------------------------------
        // setup cache based on the map data
        var setupInteractionObj = function () {
            _surroundObj = {
                furniture: [],
                door: []
            };
            var range = Data.map.para.scanRange;
            var range2 = range * range;
            for (var i = 0; i < height; i++) {
                _surroundObj.furniture[i] = [];
                _surroundObj.door[i] = [];

                for (var j = 0; j < width; j++) {
                    _surroundObj.furniture[i][j] = {};
                    _surroundObj.door[i][j] = [];
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
                            var f_id = grid.furniture[m][n];
                            if (f_id == -1) continue;
                            var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                            if (!(f_id in _surroundObj.furniture[i][j]) || _surroundObj.furniture[i][j][f_id] > r)
                                _surroundObj.furniture[i][j][f_id] = r;

                            // door
                            var d_id = grid.door[m][n];
                            if (d_id == -1) continue;
                            var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                            if (!(d_id in _surroundObj.door[i][j]) || _surroundObj.door[i][j][d_id] > r)
                                _surroundObj.door[i][j][f_id] = r;
                        }
                    }
                    for (var t in _surroundObj.furniture[i][j]) {
                        if (_surroundObj.furniture[i][j][t] > range2) delete _surroundObj.furniture[i][j][t];
                        else _surroundObj.furniture[i][j][t] = [r, Math.atan2(itemList.furniture[t].x - j, itemList.furniture[t].y - i) * 180 / Math.PI];
                    }
                    for (var t in _surroundObj.door[i][j]) {
                        if (_surroundObj.door[i][j][t] > range2) delete _surroundObj.door[i][j][t];
                        else _surroundObj.door[i][j][t] = [r, Math.atan2(itemList.door[t].x - j, itemList.door[t].y - i) * 180 / Math.PI];
                    }
                }
            }
        };

        var updateInteractionObj = function (f_id) {
        };
    };

    SYSTEM.InterAction = InterAction;
})(window.Rendxx.Game.Ghost.System);