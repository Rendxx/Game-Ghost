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
        ObjectMap: {
            0: 'empty',
            1: 'wall',
            2: 'furniture',
            3: 'door',
            4: 'body'
        },
        bodyId: 'body_1'
    };

    var Map = function (entity, modelData, mapData, gameData) {
        // data ----------------------------------------------------------
        var that = this;

        this.modelData = modelData;
        this.width = 0;
        this.height = 0;
        this.grid = {
            furniture: [],
            wall: [],
            door: [],
            body: [],
            empty: []
        };
        this.objList = {
            furniture: {},
            door: {},
            body: {},
            key: {},
            position: {}
        };
        this.position = {            // list of position coordinate
            survivor: [],
            ghost: [],
            end: []
        };
        this.setupData = {};
        this.danger = 0;

        // public method -------------------------------------------------
        // setup game map data for 1st time
        this.setup = function () {
            this.setupData = {};
            setupPosition(mapData.item.position);
            setupFurniture();
            setupKey(mapData.doorSetting);
            setupDoor(mapData.doorSetting);
            setupBody();
        };

        // reset key / player / position with given data
        this.reset = function (setupData_in) {
            this.setupData = setupData_in;
            recoverPosition(setupData_in.position);
            recoverFurniture(gameData.furniture);
            recoverKey(setupData_in.key);
            recoverDoor(gameData.door);
            recoverBody(gameData.body);
        };

        // set map danger effort
        this.setDanger = function (danger_in) {            
            gameData.danger = this.danger = danger_in;
        };

        // data ------------------------------------------------
        var initData = function () {
            gameData.danger = 0;
        };

        // grid ------------------------------------------------
        var initGrid = function (_data) {
            // create that.grid
            that.grid = {
                furniture: [],
                wall: [],
                door: [],
                empty: [],
                body: []
            };
            that.width = _data.grid.width;
            that.height = _data.grid.height;
            for (var i = 0; i < _data.grid.height; i++) {
                that.grid.furniture[i] = [];
                that.grid.wall[i] = [];
                that.grid.door[i] = [];
                that.grid.empty[i] = [];
                that.grid.body[i] = [];
                for (var j = 0; j < _data.grid.width; j++) {
                    that.grid.furniture[i][j] = -1;
                    that.grid.wall[i][j] = -1;
                    that.grid.door[i][j] = -1;
                    that.grid.body[i][j] = -1;
                    that.grid.empty[i][j] = _Data.Grid.Empty;
                }
            }

            // add wall
            var walls = _data.item.wall;
            for (var k = 0; k < walls.length; k++) {
                if (walls[k] === null) continue;
                var wall = walls[k];
                for (var i = wall.top; i <= wall.bottom; i++) {
                    for (var j = wall.left; j <= wall.right; j++) {
                        that.grid.empty[i][j] = _Data.Grid.Wall;
                        that.grid.wall[i][j] = k;
                    }
                }
            }

            // add furniture
            var furnitures = _data.item.furniture;
            for (var k = 0; k < furnitures.length; k++) {
                if (furnitures[k] === null) continue;
                var furniture = furnitures[k];
                for (var i = furniture.top; i <= furniture.bottom; i++) {
                    for (var j = furniture.left; j <= furniture.right; j++) {
                        that.grid.empty[i][j] = _Data.Grid.Furniture;
                        that.grid.furniture[i][j] = k;
                    }
                }
            }

            // add door
            var doors = _data.item.door;
            for (var k = 0; k < doors.length; k++) {
                if (doors[k] === null) continue;
                var door = doors[k];
                for (var i = door.top; i <= door.bottom; i++) {
                    for (var j = door.left; j <= door.right; j++) {
                        that.grid.empty[i][j] = _Data.Grid.Door;
                        that.grid.door[i][j] = k;
                    }
                }
            }
        };

        // position --------------------------------------------
        var initPosition = function () {
            that.position = {
                survivor: [],
                ghost: [],
                end: []
            };
        };

        var setupPosition = function (positionList) {
            var tmp = {
                survivor: [],
                ghost: [],
                end: []
            };
            for (var k = 0, l = positionList.length; k < l; k++) {
                if (positionList[k] === null) continue;
                var p = positionList[k];
                for (var i in Data.item.positionType) {
                    if (p.id === Data.item.positionType[i]) {
                        tmp[i].push([p.x, p.y]);
                        break;
                    }
                }
            }

            that.position['survivor'] = tmp['survivor'];
            that.position['ghost'] = tmp['ghost'];
            // end
            var idx = Math.floor(tmp['end'].length * Math.random());
            that.position['end'].push(tmp['end'][idx]);
            that.objList.position[0] = new SYSTEM.MapObject.Position(0, that.position['end'][0], SYSTEM.MapObject.Position.Data.PosType.End);
            tmp['end'].splice(idx, 1);

            that.setupData.position = that.position;
        };

        var recoverPosition = function (recoverData) {
            that.position = recoverData;
            that.objList.position[0] = new SYSTEM.MapObject.Position(0, that.position['end'][0], SYSTEM.MapObject.Position.Data.PosType.End);
        };

        // furniture --------------------------------------------
        var initFurniture = function (furnitures) {
            that.objList.furniture = {};
            gameData.furniture = {};
            for (var k = 0; k < furnitures.length; k++) {
                if (furnitures[k] === null) continue;
                var f = furnitures[k];
                that.objList.furniture[k] = new SYSTEM.MapObject.Furniture(k, f, modelData.items[Data.item.categoryName.furniture][f.id], entity);
                gameData.furniture[k] = that.objList.furniture[k].toJSON();
                that.objList.furniture[k].onChange = function (idx, data) {
                    gameData.furniture[idx] = data;
                };
            }
        };

        var setupFurniture = function () {
        };

        var recoverFurniture = function (furnitures) {
            for (var k in furnitures) {
                that.objList.furniture[k].reset(furnitures[k]);
            }
        };

        // key --------------------------------------------
        var initKey = function () {
            that.objList.key = {};
            gameData.key = {};
        };

        var setupKey = function (doors) {
            var setupData = {};
            var index = 0;

            var hasKeyList = {};
            for (var k in doors) {
                if (doors[k] === null) continue;
                var door = doors[k];
                var keyNum = Math.floor(Data.keyNumber * Math.random() + 1);
                var tmpList = [];
                for (var i in door.keys) {
                    if (hasKeyList.hasOwnProperty(i)) continue;
                    tmpList.push(i);
                }
                while (keyNum > 0 && tmpList.length > 0) {
                    var idx = Math.floor(tmpList.length * Math.random());
                    var _setupDat = {
                        id: index,
                        mapObjectId: tmpList[idx],
                        name: 'Key of ' + door.name,
                        doorId: k
                    };
                    setupData[index] = _setupDat;
                    var keyItem = new SYSTEM.Item.Key(_setupDat.id, _setupDat.mapObjectId, _setupDat.name, _setupDat.doorId);
                    keyItem.onChange = function (idx, data) {
                        gameData.key[idx] = data;
                    };

                    that.objList.key[index] = keyItem;
                    that.objList.furniture[tmpList[idx]].placeKey(keyItem);
                    gameData.key[index] = keyItem.toJSON();
                    hasKeyList[tmpList[idx]] = true;
                    tmpList.splice(idx, 1);
                    keyNum--;
                    index++;
                }
            }
            that.setupData.key = setupData;
        };

        var recoverKey = function (recoverData) {
            that.objList.key = {};
            for (var i in recoverData) {
                var setupData = recoverData[i];
                var keyItem = new SYSTEM.Item.Key(setupData.id, setupData.mapObjectId, setupData.name, setupData.doorId);
                keyItem.reset();
                that.objList.key[i] = keyItem;
            }
            for (var k in gameData.key) {
                that.objList.key[k].reset(gameData.key[k]);
            }
        };

        // door --------------------------------------------
        var initDoor = function (doors, doorSetting) {
            that.objList.door = {};
            gameData.door = {};
            for (var k = 0; k < doors.length; k++) {
                if (doors[k] === null) continue;
                var door = doors[k];
                that.objList.door[k] = new SYSTEM.MapObject.Door(k, door, modelData.items[Data.item.categoryName.door][door.id], doorSetting[k].name, entity);
                gameData.door[k] = that.objList.door[k].toJSON();
                that.objList.door[k].onChange = function (idx, data) {
                    gameData.door[idx] = data;
                };
            }
        };

        var setupDoor = function (doorSetting) {
            for (var k in that.objList.door) {
                if (doorSetting[k].keys !== null) {
                    for (var x in doorSetting[k].keys) {
                        that.objList.door[k].lock();
                        break;
                    }
                }
            }
        };

        var recoverDoor = function (doors) {
            for (var k in doors) {
                that.objList.door[k].reset(doors[k]);
            }
        };

        // body ------------------------------------------------
        var initBody = function () {
            that.objList.body = {};
            gameData.body = {};
        };

        var setupBody = function () {
        };

        var recoverBody = function () {
            that.objList.body = {};
            for (var k in gameData.body) {
                var b = new SYSTEM.MapObject.Body(modelData.items[Data.item.categoryName.body][_Data.bodyId]);
                var character = entity.characterManager.characters[gameData.body[k].id];
                b.setup(character);
                b.reset(gameData.body[k]);
                that.objList.body[k] = b;
                that.grid.body[b.y][b.x] = b.id;
            }
        };

        this.createBody = function (character) {
            var b = new SYSTEM.MapObject.Body(modelData.items[Data.item.categoryName.body][_Data.bodyId]);
            b.setup(character);
            that.grid.body[Math.floor(b.y)][Math.floor(b.x)] = b.id;
            that.objList.body[character.id] = b;
            gameData.body[character.id] = b.toJSON();

            entity.interAction.updateMap();
        };

        // init -----------------------------
        var _init = function () {
            that.setupData = {};
            initGrid(mapData);
            initPosition();
            initFurniture(mapData.item.furniture);
            initKey();
            initDoor(mapData.item.door, mapData.doorSetting);
            initBody();
            initData();
        };
        _init();
    };

    SYSTEM.Map = Map;
    SYSTEM.Map.Data = _Data;
})(window.Rendxx.Game.Ghost.System);