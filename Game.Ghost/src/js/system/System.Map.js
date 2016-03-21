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
            Door: 3
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
        DoorPrefix : 'd'
    };
    var Map = function (entity) {
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
                empty: []
            },
            itemList = {
                furniture: {},
                door: {},
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
            accessGrid = [];        // 2d matrix same as grid. reocrd accessable furniture id of that grid in a list

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
            _onChange();
        };

        // reset key / player / position with given data
        this.reset = function (setupData_in, gameData_in) {
            that.setupData = setupData_in;
            recoverPosition(setupData_in.map.position);
            recoverKey(gameData_in.key);
            recoverFurniture(gameData_in.furniture);
            recoverDoor(gameData_in.door);
        };

        // check whether this position can be moved to, return result
        this.moveCheck = function (x, y, deltaX, deltaY) {
            var newX = Math.floor(x + deltaX),
                newY = Math.floor(y + deltaY),
                oldX = Math.floor(x),
                oldY = Math.floor(y);

            var rst = [x + deltaX, y + deltaY];
            if (deltaX != 0 && (newX < 0 || newX >= width || (grid.empty[oldY][newX] != _Data.Grid.Empty && !(grid.empty[oldY][newX] == _Data.Grid.Door && itemList['door'][grid.door[oldY][newX]].status == _Data.DoorStatus.Opened))))
                rst[0] = (deltaX > 0) ? newX : newX+1;
            if (deltaY != 0 && (newY < 0 || newY >= height || (grid.empty[newY][oldX] != _Data.Grid.Empty && !(grid.empty[newY][oldX] == _Data.Grid.Door && itemList['door'][grid.door[newY][oldX]].status == _Data.DoorStatus.Opened))))
                rst[1] = (deltaY > 0) ? newY : newY + 1;
            return rst;
        };

        // check the access of funiture
        this.tryAccess = function (character, x, y, access_x, access_y) {
            x = Math.floor(x);
            y = Math.floor(y);
            access_x = Math.floor(access_x);
            access_y = Math.floor(access_y);

            if (access_x < 0 || access_y >= width || access_y < 0 || access_y >= height) return null;
            if (accessGrid[y][x] == null) return null;

            if (grid.furniture[access_y][access_x] != -1) {
                // furniture
                if (accessGrid[y][x][grid.furniture[access_y][access_x]] !== true) return null;

                var keyId = itemList.furniture[grid.furniture[access_y][access_x]].interaction();
                if (keyId == -1) return null;
                return itemList.key[keyId];
            } else if (grid.door[access_y][access_x] != -1) {
                // door
                if (accessGrid[y][x][_Data.DoorPrefix + grid.door[access_y][access_x]] !== true) return null;

                itemList.door[grid.door[access_y][access_x]].interaction(character);
                return null;
            }
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

        // private method ------------------------------------------------
        var _onChange = function () {
            if (that.onChange == null) return;
            that.onChange(gameData);
        };

        // grid -------------------------------------------
        var setupGrid = function () {
            // create grid
            grid = {
                furniture: [],
                wall: [],
                door: [],
                empty: []
            };
            accessGrid = [];
            width = _data.grid.width;
            height = _data.grid.height;
            for (var i = 0; i < _data.grid.height; i++) {
                grid.furniture[i] = [];
                grid.wall[i] = [];
                grid.door[i] = [];
                grid.empty[i] = [];
                accessGrid[i] = [];
                for (var j = 0; j < _data.grid.width; j++) {
                    grid.furniture[i][j] = -1;
                    grid.wall[i][j] = -1;
                    grid.door[i][j] = -1;
                    grid.empty[i][j] = _Data.Grid.Empty;
                    accessGrid[i][j] = null;
                }
            }

            // add wall
            var walls = _data.item.wall;
            for (var k = 0; k < walls.length; k++) {
                if (walls[k] == null) continue;
                var wall = walls[k];
                for (var i = wall.top; i <= wall.bottom; i++) {
                    for (var j = wall.left; j <= wall.right; j++) {
                        grid.empty[i][j] = _Data.Grid.Wall;
                        grid.wall[i][j] = k;
                    }
                }
            }

            // add furniture
            var furnitures = _data.item.furniture;
            for (var k = 0; k < furnitures.length; k++) {
                if (furnitures[k] == null) continue;
                var furniture = furnitures[k];
                for (var i = furniture.top; i <= furniture.bottom; i++) {
                    for (var j = furniture.left; j <= furniture.right; j++) {
                        grid.empty[i][j] = _Data.Grid.Furniture;
                        grid.furniture[i][j] = k;
                    }
                }
            }

            // add door
            var doors = _data.item.door;
            for (var k = 0; k < doors.length; k++) {
                if (doors[k] == null) continue;
                var door = doors[k];
                for (var i = door.top; i <= door.bottom; i++) {
                    for (var j = door.left; j <= door.right; j++) {
                        grid.empty[i][j] = _Data.Grid.Door;
                        grid.door[i][j] = k;
                    }
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
                    var new_x = (r1 == 0 || r1 == 3 ? 1 : -1) * Math.abs(((r & 1 )== 0) ? p[0] : p[1]) + x;
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

        // key --------------------------------------------
        var setupKey = function () {
            itemList.key = {};
            gameData.key = {};
            var doors = _data.doorSetting;
            var index = 0;

            var hasKeyList = {};
            for (var k in doors) {
                if (doors[k] == null) continue;
                var door = doors[k];
                var keyNum = Math.floor(Data.keyNumber * Math.random() + 1);
                var tmpList = [];
                for (var i in door.keys) {
                    if (hasKeyList.hasOwnProperty(i)) continue;
                    tmpList.push(i);
                }
                while (keyNum > 0 && tmpList.length > 0) {
                    var idx = Math.floor(tmpList.length * Math.random());
                    var keyItem = new SYSTEM.Key(index, tmpList[idx], k, 'Key of ' + door.name);
                    keyItem.onChange = function (idx, data) {
                        gameData.key[idx] = data;
                        itemList.furniture[itemList.key[idx].furnitureId].token();
                    };

                    itemList.furniture[tmpList[idx]].keyId = index;
                    itemList.key[index] = keyItem;
                    gameData.key[index] = keyItem.toJSON();
                    hasKeyList[tmpList[idx]] = true;
                    tmpList.splice(idx, 1);
                    keyNum--;
                    index++;
                }
            }
        };

        var recoverKey = function (recoverData) {
            itemList.key = {};
            for (var i in recoverData) {
                var keyItem = new SYSTEM.Key();
                keyItem.reset(recoverData[i]);
                itemList.key[i] = keyItem;
            }
        };

        // door --------------------------------------------
        var setupDoor = function () {
            itemList.door = {};
            gameData.door = {};
            var doors = _data.item.door;
            var doorSetting = _data.doorSetting;
            for (var k = 0; k < doors.length; k++) {
                if (doors[k] == null) continue;
                var door = doors[k];

                var hasKey = false;
                if (doors[k] != null && doorSetting[k].keys != null) {
                    for (var x in doorSetting[k].keys) {
                        hasKey = true;
                        break;
                    }
                }
                itemList.door[k] = new SYSTEM.Door(k, door, _modelData.items[Data.item.categoryName.door][door.id], hasKey);
                gameData.door[k] = itemList.door[k].toJSON();
                itemList.door[k].onChange = function (idx, data) {
                    gameData.door[idx] = data;
                };
            }
        };

        var recoverDoor = function () {
            itemList.door = {};
            var doors = _data.item.door;
            for (var k = 0; k < doors.length; k++) {
                if (doors[k] == null) continue;
                var door = doors[k];
                itemList.door[k] = new SYSTEM.Door(k, door, _modelData.items[Data.item.categoryName.door][door.id], true);
                itemList.door[k].onChange = function (idx, data) {
                    gameData.door[idx] = data;
                };
            }
            for (var k in gameData.door) {
                itemList.door[k].reset(gameData.door[k]);
            }
        };

        // furniture --------------------------------------------
        var setupFurniture = function () {
            itemList.furniture = {};
            gameData.furniture = {};
            var furnitures = _data.item.furniture;
            for (var k = 0; k < furnitures.length; k++) {
                if (furnitures[k] == null) continue;
                var f = furnitures[k];
                itemList.furniture[k] = new SYSTEM.Furniture(k, f, _modelData.items[Data.item.categoryName.furniture][f.id]);
                gameData.furniture[k] = itemList.furniture[k].toJSON();
                itemList.furniture[k].onChange = function (idx, data) {
                    gameData.furniture[idx] = data;
                };
            }
        };

        var recoverFurniture = function () {
            itemList.furniture = {};
            gameData.furniture = {};
            var furnitures = _data.item.furniture;
            for (var k = 0; k < furnitures.length; k++) {
                if (furnitures[k] == null) continue;
                var f = furnitures[k];
                itemList.furniture[k] = new SYSTEM.Furniture(k, f, _modelData.items[Data.item.categoryName.furniture][f.id]);
                itemList.furniture[k].onChange = function (idx, data) {
                    gameData.furniture[idx] = data;
                };
            }
            for (var k in gameData.furniture) {
                itemList.furniture[k].reset(gameData.furniture[k]);
            }
        };

        // position --------------------------------------------
        var setupPosition = function () {
            position = {
                survivor: [],
                ghost: [],
                end: []
            };
            var positionList = _data.item.position;
            var tmp = {
                survivor: [],
                ghost: [],
                end: []
            };
            for (var k = 0, l = positionList.length; k < l; k++) {
                if (positionList[k] == null) continue;
                var p = positionList[k];
                for (var i in Data.item.positionType) {
                    if (p.id == Data.item.positionType[i]) {
                        tmp[i].push([p.x, p.y]);
                        break;
                    }
                }
            }

            var t;
            for (var i = 0; i < entity.characters.length; i++) {
                if (entity.characters[i].role == Data.character.type.survivor) {
                    // survivor
                    var idx = Math.floor(tmp['survivor'].length * Math.random());
                    t = tmp['survivor'][idx];
                    position['survivor'].push(t);
                    tmp['survivor'].splice(idx, 1);
                } else if (entity.characters[i].role == Data.character.type.ghost) {
                    // ghost
                    var idx = Math.floor(tmp['ghost'].length * Math.random());
                    t = tmp['ghost'][idx];
                    position['ghost'].push(t);
                    tmp['ghost'].splice(idx, 1);
                }
                entity.characters[i].reset({
                    x: t[0] + 0.5,
                    y: t[1] + 0.5
                });
            }

            // end
            var idx = Math.floor(tmp['end'].length * Math.random());
            position['end'].push(tmp['end'][idx]);
            tmp['end'].splice(idx, 1);

            that.setupData.position = position;
        };

        var recoverPosition = function (recoverData) {
            position = recoverData;
        };

        var _init = function () {
        };
        _init();
    };

    SYSTEM.Map = Map
})(window.Rendxx.Game.Ghost.System);