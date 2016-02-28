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
        }
    };
    var Map = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            _data = null,
            grid = [],
            keyList = {};           // furniture id: door id

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        // load map data and reset map
        this.load = function (data) {
            _data = data;
            setupGrid();
            setupKey();
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
        var _init = function () {
        };
        _init();
    };

    SYSTEM.Map = Map
})(window.Rendxx.Game.Ghost.System);