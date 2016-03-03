﻿window.Rendxx = window.Rendxx || {};
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
            Furniture:2
        },
        FurnitureStatus:{
            None: 0,
            Closed: 1,
            Opened: 2
        },
        DoorStatus:{
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3
        }
    };
    var Map = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            _data = null,
            _modelData = null,
            grid = [],
            keyList = {},           // furniture id: door id
            statusList = {
                door: {},           // door id: door status
                furniture: {}       // furniture id: furniture status
            },
            position = {            // list of position coordinate
                survivor: [],
                ghost: [],
                end:[]
            };

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        // load map data
        this.load = function (modelData, data) {
            _data = data;
            _modelData = modelData;
            setupGrid();
        };

        // reset key / player / position with given data
        // or create them 
        this.reset = function (recoverData) {
            if (recoverData == null) {
                setupPosition();
                setupKey();
                setupStatus();
            } else {
                recoverPosition(recoverData.position);
                recoverKey(recoverData.key);
                recoverStatus(recoverData.status);
            }
        };

        // private method ------------------------------------------------
        var setupGrid = function () {
            // create grid
            grid = [];
            for (var i = 0; i < _data.grid.height; i++) {
                grid[i] = [];
                for (var j = 0; j < _data.grid.width; j++) {
                    grid[i][j] = _Data.Grid.Empty;
                }
            }

            // add wall
            var walls = _data.item.wall;
            for (var k = 0; k < walls.length; k++) {
                if (walls[k] == null) continue;
                var wall = walls[k];
                for (var i = wall.top; i <= wall.bottom; i++) {
                    for (var j = wall.left; j < wall.right; j++) {
                        grid[i][j] = _Data.Grid.Wall;
                    }
                }
            }

            // add furniture
            var furnitures = _data.item.furniture;
            for (var k = 0; k < furnitures.length; k++) {
                if (furnitures[k] == null) continue;
                var furniture = furnitures[k];
                for (var i = furniture.top; i <= furniture.bottom; i++) {
                    for (var j = furniture.left; j < furniture.right; j++) {
                        grid[i][j] = _Data.Grid.Furniture;
                    }
                }
            }
        };

        // key --------------------------------------------
        var setupKey = function () {
            keyList = {};
            var doors = _data.doorSetting;
            for (var k in doors) {
                if (doors[k] == null) continue;
                var door = doors[k];
                var keyNum = Math.floor(Data.keyNumber * Math.random() + 1);
                var tmpList = [];
                for (var i in door.keys) {
                    tmpList.push(i);
                }
                while (keyNum > 0 && tmpList.length>0) {
                    var idx = Math.floor(tmpList.length * Math.random());
                    keyList[tmpList[idx]] = k;
                    tmpList.splice(idx, 1);
                    keyNum--;
                }
            }
        };

        var recoverKey = function (recoverData) {
            keyList = recoverData;
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
            for (var k = 0, l = positionList.length; i < l;i++) {
                if (positionListp[k] == null) continue;
                var p = positionList[k];
                for (var i in _data.item.positionType) {
                    if (p.id == _data.item.positionType[i]) {
                        tmp[i].push([_data.item.positionType[i].x, _data.item.positionType[i].y]);
                    }
                }
            }

            var t;
            for (var i = 0; i < entity.chacracters.length; i++) {
                if (entity.chacracters[i].role == Data.character.type.survivor) {
                    // survivor
                    var idx = Math.floor(tmp['survivor'].length * Math.random());
                    t = tmp['survivor'][idx];
                    position['survivor'].push(t);
                    tmp['survivor'].splice(idx, 1);
                } else if (entity.chacracters[i].role == Data.character.type.ghost) {
                    // ghost
                    var idx = Math.floor(tmp['ghost'].length * Math.random());
                    t = tmp['ghost'][idx];
                    position['ghost'].push(t);
                    tmp['ghost'].splice(idx, 1);
                }
                entity.chacracters[i].reset({
                    x: t[0],
                    y: t[1]
                });
            }

            // end
            var idx = Math.floor(tmp['end'].length * Math.random());
            position['end'].push(tmp['end'][idx]);
            tmp['end'].splice(idx, 1);
        };

        var recoverPosition = function (recoverData) {
            position = recoverData;
        };

        // status of furniture and door ------------------------
        var setupStatus = function () {
            statusList = {
                door: {},
                furniture: {}
            };

            // furniture
            var furnitureList = _data.item.furniture;
            for (var k = 0, l = furnitureList.length; i < l;i++) {
                if (furnitureList[k] == null) continue;
                var f = _modelData.items[Data.categoryName.furniture][furnitureList[k].id];
                statusList['furniture'][k] = (f.slotInside == true) ? _Data.FurnitureStatus.Closed : _Data.FurnitureStatus.None;
            }

            // door
            var doorList = _data.item.door;
            var doorKey = _data.doorSetting;
            for (var k = 0, l = doorList.length; i < l; i++) {
                if (doorList[k] == null) continue;
                statusList['furniture'][k] = (k in doorKey && doorKey[k].keys.length > 0) ? _Data.DoorStatus.Locked : _Data.DoorStatus.Closed;
            }
        };

        var recoverStatus = function (recoverData) {
            statusList = recoverData;
        };

        var _init = function () {
        };
        _init();
    };

    SYSTEM.Map = Map
})(window.Rendxx.Game.Ghost.System);