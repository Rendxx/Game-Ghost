window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Map manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var InterAction = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            map = entity.map,
            characters = entity.characterManager.characters,
            width = 0,
            height = 0,
            statusList = {
                door: {},           // door id: door status
                furniture: {}       // furniture id: furniture status
            },
            emptyPos = [],
            /* this is designed for checking next available in O(1)
             * Any character interact with object will update these data
             * 
             *  * op: operation
             * objOperation:    { obj-type { obj-id [ character { type | id | op }]}}
             * accessGrid:      [ grid-y [ grid-x [ character [ obj-packages { angle | info } ]]]]
             * surroundGrid:    [ grid-y [ grid-x [ character [ obj-packages { angle | dst | info } ]]]]
             * positionGrid:    [ grid-y [ grid-x [ character [ info ]]]]
             * soundGrid:       [ grid-y [ grid-x { obj-id: distance }]]
             */
            accessGrid = [],
            objOperation = [],
            surroundGrid = [],
            positionGrid = [],
            soundGrid = [];

        this.chracterRange;

        // public method -------------------------------------------------
        this.reset = function () {
            width = map.width;
            height = map.height;
            setupCharacterCheckingList();
            setupObjOperation();
            setupAccess();
            setupTriggerPos();
            setupInteractionObj();
            setupSoundObj();
            setupCharacterRange();
        };

        this.updateMap = function () {
            setupObjOperation();
            setupAccess();
            setupTriggerPos();
            setupInteractionObj();
            setupSoundObj();
        };

        // update in time data
        this.update = function () {
            for (var c = 0, l= characters.length; c <l; c++) {
                for (var c2 = c + 1; c2 < l; c2++) {
                    this.chracterRange[c][c2] = this.chracterRange[c2][c] = Math.sqrt(Math.pow(characters[c].x - characters[c2].x, 2) + Math.pow(characters[c].y - characters[c2].y, 2));
                }
            }
        };

        // get object on the position
        this.getObject = function (x, y) {
            if (x < 0 || x >= width || y < 0 || y >= height) return { type: SYSTEM.Map.Data.Grid.Wall };
            if (map.grid.empty[y][x] === SYSTEM.Map.Data.Grid.Empty) return null;
            var t = map.grid.empty[y][x];
            var name = SYSTEM.Map.Data.ObjectMap[t];
            if (map.objList.hasOwnProperty(name)) return { type: t, obj: map.objList[name][map.grid[name][y][x]] };
            return { type: t };
        };

        // get obj triggered in the position
        this.checkPosTrigger = function (c, x, y) {
            x = Math.floor(x);
            y = Math.floor(y);
            var list = positionGrid[y][x][c];
            return list;
        };

        this.checkSoundObj = function (c, x, y) {
            x = Math.floor(x);
            y = Math.floor(y);
            var s = soundGrid[y][x];
            s.character = {};

            for (var i = 0, l = characters.length; i < l; i++) {
                if (i !== c && this.chracterRange[c][i] <= Data.map.para.soundRange) {
                    s.character[i] = this.chracterRange[c][i];
                }
            }

            return s;
        };

        // get surround interaction obj list
        this.checkInteractionObj = function (c, x, y, r) {
            var x_idx = Math.floor(x),
                y_idx = Math.floor(y);

            // furniture
            var rst = [];
            var list = surroundGrid[y_idx][x_idx][c];
            for (var i = 0; i < list.length; i++) {
                var f = list[i];
                if (f.info.op === SYSTEM.MapObject.Basic.Data.Operation.None) continue;
                var obj = map.objList[f.info.type][f.info.id];

                var d = Math.abs(f.angle - r);
                if (d > 180) d = 360 - d;

                var d2 = Math.sqrt(Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2));
                if (d > 90 && d2 > 1.5) continue;

                rst.push(f.info);
            }

            return rst;
        };

        // get all accessable object of that position
        this.getAccessObject = function (c, x, y, r) {
            x = Math.floor(x);
            y = Math.floor(y);

            var list = accessGrid[y][x][c];
            if (list === null || list.length === 0) return null;

            var closestAngle = 360;
            var objId = -1;
            var bodyInfo = null;
            var bodyDistance = 4;
            for (var i = 0; i < list.length; i++) {
                if (list[i].info.op === SYSTEM.MapObject.Basic.Data.Operation.None) continue;
                if (list[i].info.type === SYSTEM.MapObject.Body.Data.ObjType) {
                    if (bodyInfo === null) bodyInfo = list[i].info;
                    else {
                        var realPos = map.ObjList.body[list[i].info.id].realPos;
                        var d3 = Math.pow(realPos.x - x, 2) + Math.pow(realPos.y - y, 2);
                        if (d3 < bodyDistance) {
                            bodyDistance = d3;
                            bodyInfo = list[i].info;
                        }
                    }
                    continue;
                }
                var d = Math.abs(r - list[i].angle);
                if (d > 180) d = 360 - d;
                if (d > 80) continue;

                if (d < closestAngle) {
                    closestAngle = d;
                    objId = i;
                }
            }
            if (objId === -1 || bodyInfo !== null && closestAngle > 45) return bodyInfo;

            if (objId === -1) return null;
            return list[objId].info;
        };

        this.checkVisible = function (characterA, characterB) {
            var x1 = characterA.x,
                y1 = characterA.y,
                x2 = characterB.x,
                y2 = characterB.y;
            var r = Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI;
            var d = Math.abs(r - characterA.currentRotation.head);
            if (d > 180) d = 360 - d;
            var d2 = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            if (d > 60 && d2 > 2.5) return false;
            return _checkVisibleLine(x1, y1, x2, y2, null, null);
        };

        var _checkVisibleLine = function (x1, y1, x2, y2, objType, objId) {
            var r = Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI;
            if (x1 === x2) {
                var y_min = Math.min(y1, y2),
                    y_max = Math.max(y1, y2),
                    x = Math.floor(x1);
                for (var y = Math.ceil(y_min) ; y <= y_max; y++) {
                    if (!_checkPosVisible(x, y, objType, objId)) return false;
                }
            } else if (y1 === y2) {
                var x_min = Math.min(x1, x2),
                    x_max = Math.max(x1, x2),
                    y = Math.floor(y1);
                for (var x = Math.ceil(x_min) ; x <= x_max; x++) {
                    if (!_checkPosVisible(x, y, objType, objId)) return false;
                }
            } else {
                var k = (y1 - y2) / (x1 - x2),
                    c = y1 - k * x1,
                    x_min = Math.min(x1, x2),
                    x_max = Math.max(x1, x2);
                for (var x = Math.ceil(x_min) ; x <= x_max; x++) {
                    var y = Math.floor(k * x + c);
                    if (y < 0) y = 0;
                    if (!_checkPosVisible(x, y, objType, objId)) return false;
                }
                var k = (x1 - x2) / (y1 - y2),
                    c = x1 - k * y1,
                    y_min = Math.min(y1, y2),
                    y_max = Math.max(y1, y2);
                for (var y = Math.ceil(y_min) ; y <= y_max; y++) {
                    var x = Math.floor(k * y + c);
                    if (x < 0) y = 0;
                    if (!_checkPosVisible(x, y, objType, objId)) return false;
                }
            }
            return true;
        };

        var _checkPosVisible = function (x, y, objType, objId) {
            if (map.grid.empty[y][x] === SYSTEM.Map.Data.Grid.Empty) return true;
            if (map.grid.empty[y][x] === SYSTEM.Map.Data.Grid.Furniture) {
                if (map.objList.furniture[map.grid.furniture[y][x]].blockSight
                    && !(objType === SYSTEM.Map.Data.Grid.Furniture && objId === map.grid.furniture[y][x])) {
                    return false;
                }
                return true;
            }
            if (map.grid.empty[y][x] === SYSTEM.Map.Data.Grid.Door) {
                if ((!(map.objList.door[map.grid.door[y][x]].status === SYSTEM.MapObject.Door.Data.Status.Opened) && map.objList.door[map.grid.door[y][x]].blockSight)
                && !(objType === SYSTEM.Map.Data.Grid.Door && objId === map.grid.door[y][x])) {
                    return false;
                }
                return true;
            }

            return false;
        };

        this.findEmptyPos = function () {
            var idx = Math.floor(emptyPos.length * Math.random());
            return emptyPos[idx];
        };

        // update ----------------------------------------------
        // update interaction of that object for all characters
        this.updateInteraction = function (type, id) {
            for (var c = 0, l = characters.length; c < l; c++) {
                objOperation[type][id][c]['op'] = characters[c].checkOperation(map.objList[type][id]);
            }
        };

        // update the lock informatin for that character
        this.updateDoorInteraction = function (doorIds, characterId) {
            for (var k in doorIds) {
                objOperation['door'][k][characterId]['op'] = characters[characterId].checkOperation(map.objList['door'][k]);
            }
        };

        // setup -----------------------------------------------
        var setupObjOperation = function () {
            objOperation = {
                furniture: {},
                door: {},
                body: {}
            };

            var furnitures = map.objList.furniture;
            for (var k in furnitures) {
                var furniture = furnitures[k];

                objOperation['furniture'][k] = [];
                for (var c = 0, l = characters.length; c < l; c++) {
                    objOperation['furniture'][k][c] = {
                        'type': 'furniture',
                        'id': k,
                        'op': characters[c].checkOperation(furniture)
                    };
                }
            }

            var doors = map.objList.door;
            for (var k in doors) {
                var door = doors[k];

                objOperation['door'][k] = [];
                for (var c = 0, l = characters.length; c < l; c++) {
                    objOperation['door'][k][c] = {
                        'type': 'door',
                        'id': k,
                        'op': characters[c].checkOperation(door)
                    };
                }
            }

            var bodies = map.objList.body;
            for (var k in bodies) {
                var body = bodies[k];

                objOperation['body'][k] = [];
                for (var c = 0, l = characters.length; c < l; c++) {
                    objOperation['body'][k][c] = {
                        'type': 'body',
                        'id': k,
                        'op': characters[c].checkOperation(body)
                    };
                }
            }
        };

        var setupAccess = function () {
            // prepare data
            var accessGrid_angle = [];          // use to record angle
            for (var i = 0; i < height; i++) {
                accessGrid_angle[i] = [];
                for (var j = 0; j < width; j++) {
                    accessGrid_angle[i][j] = null;
                }
            }

            // add accesslist for furniture
            var furnitures = map.objList.furniture;
            for (var k in furnitures) {
                var furniture = furnitures[k];
                var x = furniture.anchor[0];
                var y = furniture.anchor[1];
                var r = furniture.rotation;
                var accessPos = furniture.modelData.accessPos;
                if (accessPos === null) continue;

                for (var i = 0; i < accessPos.length; i++) {
                    var p = accessPos[i];
                    var r1 = (((p[1] >= 0) ? (p[0] >= 0 ? 0 : 1) : (p[0] >= 0 ? 3 : 2)) + r) % 4;
                    var new_x = (r1 === 0 || r1 === 3 ? 1 : -1) * Math.abs(((r & 1) === 0) ? p[0] : p[1]) + x;
                    var new_y = (r1 === 0 || r1 === 1 ? 1 : -1) * Math.abs(((r & 1) === 0) ? p[1] : p[0]) + y;
                    if (new_x < 0 || new_x >= width || new_y < 0 || new_y >= height) continue;
                    if (accessGrid_angle[new_y][new_x] === null) accessGrid_angle[new_y][new_x] = { furniture: {}, door: {}, body: {} };
                    accessGrid_angle[new_y][new_x]['furniture'][k] = -1;
                }
            }

            // add accesslist for door
            var doors = map.objList.door;
            for (var k in doors) {
                var door = doors[k];
                var x = door.anchor[0];
                var y = door.anchor[1];
                var r = door.rotation;
                var accessPos = door.modelData.accessPos;
                if (accessPos === null || accessPos === undefined) continue;

                for (var i = 0; i < accessPos.length; i++) {
                    var p = accessPos[i];
                    var r1 = (((p[1] >= 0) ? (p[0] >= 0 ? 0 : 1) : (p[0] >= 0 ? 3 : 2)) + r) % 4;
                    var new_x = (r1 === 0 || r1 === 3 ? 1 : -1) * Math.abs(((r & 1) === 0) ? p[0] : p[1]) + x;
                    var new_y = (r1 === 0 || r1 === 1 ? 1 : -1) * Math.abs(((r & 1) === 0) ? p[1] : p[0]) + y;
                    if (new_x < 0 || new_x >= width || new_y < 0 || new_y >= height) continue;
                    if (accessGrid_angle[new_y][new_x] === null) accessGrid_angle[new_y][new_x] = { furniture: {}, door: {}, body: {} };
                    accessGrid_angle[new_y][new_x]['door'][k] = -1;
                }
            }

            // add accesslist for body
            var bodies = map.objList.body;
            for (var k in bodies) {
                var body = bodies[k];
                var x = body.anchor[0];
                var y = body.anchor[1];
                var r = body.rotation;
                var accessPos = body.modelData.accessPos;
                if (accessPos === null || accessPos === undefined) continue;

                for (var i = 0; i < accessPos.length; i++) {
                    var p = accessPos[i];
                    var r1 = (((p[1] >= 0) ? (p[0] >= 0 ? 0 : 1) : (p[0] >= 0 ? 3 : 2)) + r) % 4;
                    var new_x = (r1 === 0 || r1 === 3 ? 1 : -1) * Math.abs(((r & 1) === 0) ? p[0] : p[1]) + x;
                    var new_y = (r1 === 0 || r1 === 1 ? 1 : -1) * Math.abs(((r & 1) === 0) ? p[1] : p[0]) + y;
                    if (new_x < 0 || new_x >= width || new_y < 0 || new_y >= height) continue;
                    if (accessGrid_angle[new_y][new_x] === null) accessGrid_angle[new_y][new_x] = { furniture: {}, door: {}, body: {} };
                    accessGrid_angle[new_y][new_x]['body'][k] = -1;
                }
            }

            // re-scan matrix for angle
            //    O------------->
            //    | 225 180 135
            //    | 270 -1  90
            //    | 315  0  45
            //    v

            var t;
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    if (accessGrid_angle[i][j] === null) continue;
                    if (i > 0) {
                        if (j > 0) {
                            t = map.grid.furniture[i - 1][j - 1];
                            if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 225;
                            t = map.grid.door[i - 1][j - 1];
                            if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 225;
                        }
                        if (j < width - 1) {
                            t = map.grid.furniture[i - 1][j + 1];
                            if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 135;
                            t = map.grid.door[i - 1][j + 1];
                            if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 135;
                        }
                        t = map.grid.furniture[i - 1][j];
                        if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 180;
                        t = map.grid.door[i - 1][j];
                        if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 180;
                    }
                    if (i < height - 1) {
                        if (j > 0) {
                            t = map.grid.furniture[i + 1][j - 1];
                            if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 315;
                            t = map.grid.door[i + 1][j - 1];
                            if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 315;
                        }
                        if (j < width - 1) {
                            t = map.grid.furniture[i + 1][j + 1];
                            if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 45;
                            t = map.grid.door[i + 1][j + 1];
                            if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 45;
                        }
                        t = map.grid.furniture[i + 1][j];
                        if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 0;
                        t = map.grid.door[i + 1][j];
                        if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 0;
                    }
                    if (j > 0) {
                        t = map.grid.furniture[i][j - 1];
                        if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 270;
                        t = map.grid.door[i][j - 1];
                        if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 270;
                    }
                    if (j < width - 1) {
                        t = map.grid.furniture[i][j + 1];
                        if (t !== -1 && accessGrid_angle[i][j].furniture.hasOwnProperty(t)) accessGrid_angle[i][j].furniture[t] = 90;
                        t = map.grid.door[i][j + 1];
                        if (t !== -1 && accessGrid_angle[i][j].door.hasOwnProperty(t)) accessGrid_angle[i][j].door[t] = 90;
                    }
                }
            }

            // build accessGrid
            accessGrid = [];
            for (var i = 0; i < height; i++) {
                accessGrid[i] = [];
                for (var j = 0; j < width; j++) {
                    accessGrid[i][j] = [];
                    for (var c = 0; c < characters.length; c++) {
                        accessGrid[i][j][c] = [];
                    }
                }
            }
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    if (accessGrid_angle[i][j] === null) continue;
                    for (var k in accessGrid_angle[i][j].furniture) {
                        for (var c = 0; c < characters.length; c++) {
                            accessGrid[i][j][c].push({
                                angle: accessGrid_angle[i][j].furniture[k],
                                info: objOperation.furniture[k][c]
                            });
                        }
                    }
                    for (var k in accessGrid_angle[i][j].door) {
                        for (var c = 0; c < characters.length; c++) {
                            accessGrid[i][j][c].push({
                                angle: accessGrid_angle[i][j].door[k],
                                info: objOperation.door[k][c]
                            });
                        }
                    }
                    for (var k in accessGrid_angle[i][j].body) {
                        for (var c = 0; c < characters.length; c++) {
                            accessGrid[i][j][c].push({
                                angle: accessGrid_angle[i][j].body[k],
                                info: objOperation.body[k][c]
                            });
                        }
                    }
                }
            }

            // find empty position 
            emptyPos = [];
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    if (map.grid.empty[i][j] === SYSTEM.Map.Data.Grid.Empty) {
                        emptyPos.push([i, j]);
                    }
                }
            }
        };

        var setupSoundObj = function () {
            var range = Data.map.para.soundRange + 1;
            var range2 = range * range;
            // build sound grid
            soundGrid = [];

            console.log("SOUND -------------------------------");
            for (var i = 0; i < height; i++) {
                soundGrid[i] = [];

                for (var j = 0; j < width; j++) {
                    soundGrid[i][j] = { furniture: {}, door: {}, body: {} };
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
                            if (f_id !== -1) {
                                var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                                if (!(f_id in soundGrid[i][j].furniture) || soundGrid[i][j].furniture[f_id] > r)
                                    soundGrid[i][j].furniture[f_id] = r;
                            }
                            // door
                            var d_id = map.grid.door[m][n];
                            if (d_id !== -1) {
                                var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                                if (!(d_id in soundGrid[i][j].door) || soundGrid[i][j].door[d_id] > r)
                                    soundGrid[i][j].door[d_id] = r;
                            }
                            // body
                            var b_id = map.grid.body[m][n];
                            if (b_id !== -1) {
                                var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                                if (!(b_id in soundGrid[i][j].body) || soundGrid[i][j].body[b_id] > r)
                                    soundGrid[i][j].body[b_id] = r;
                            }
                        }
                    }

                    for (var t in soundGrid[i][j].furniture) {
                        soundGrid[i][j].furniture[t] = Math.sqrt(soundGrid[i][j].furniture[t]);
                        if (!_checkVisibleLine(j, i, map.objList.furniture[t].x, map.objList.furniture[t].y, SYSTEM.Map.Data.Grid.Furniture, t))
                            soundGrid[i][j].furniture[t] += 1;
                        if (soundGrid[i][j].furniture[t] > range) delete soundGrid[i][j].furniture[t];
                    }
                    for (var t in soundGrid[i][j].door) {
                        soundGrid[i][j].door[t] = Math.sqrt(soundGrid[i][j].door[t]);
                        if (!_checkVisibleLine(j, i, map.objList.door[t].x, map.objList.door[t].y, SYSTEM.Map.Data.Grid.door, t))
                            soundGrid[i][j].door[t] += 1;
                        if (soundGrid[i][j].door[t] > range) delete soundGrid[i][j].door[t];
                    }
                    for (var t in soundGrid[i][j].body) {
                        soundGrid[i][j].body[t] = Math.sqrt(soundGrid[i][j].body[t]);
                        if (!_checkVisibleLine(j, i, map.objList.body[t].x, map.objList.body[t].y, SYSTEM.Map.Data.Grid.body, t))
                            soundGrid[i][j].body[t] += 1;
                        if (soundGrid[i][j].body[t] > range) delete soundGrid[i][j].body[t];
                    }
                }
            }
        };

        var setupInteractionObj = function () {
            // prepare data
            var sGrid = [];
            var range = Data.map.para.scanRange + 1;
            var range2 = range * range;

            for (var i = 0; i < height; i++) {
                sGrid[i] = [];

                for (var j = 0; j < width; j++) {
                    sGrid[i][j] = null;
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
                            if (f_id !== -1) {
                                if (sGrid[i][j] === null) sGrid[i][j] = { furniture: {}, door: {}, body: {} };
                                var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                                if (!(f_id in sGrid[i][j].furniture) || sGrid[i][j].furniture[f_id] > r)
                                    sGrid[i][j].furniture[f_id] = r;
                            }
                            // door
                            var d_id = map.grid.door[m][n];
                            if (d_id !== -1) {
                                if (sGrid[i][j] === null) sGrid[i][j] = { furniture: {}, door: {}, body: {} };
                                var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                                if (!(d_id in sGrid[i][j].door) || sGrid[i][j].door[d_id] > r)
                                    sGrid[i][j].door[d_id] = r;
                            }
                            // body
                            var b_id = map.grid.body[m][n];
                            if (b_id !== -1) {
                                if (sGrid[i][j] === null) sGrid[i][j] = { furniture: {}, door: {}, body: {} };
                                var r = Math.pow(m - i, 2) + Math.pow(n - j, 2);
                                if (!(b_id in sGrid[i][j].body) || sGrid[i][j].body[b_id] > r)
                                    sGrid[i][j].body[b_id] = r;
                            }
                        }
                    }
                    if (sGrid[i][j] === null) continue;
                    for (var t in sGrid[i][j].furniture) {
                        if (sGrid[i][j].furniture[t] > range2 || !_checkVisibleLine(j, i, map.objList.furniture[t].x, map.objList.furniture[t].y, SYSTEM.Map.Data.Grid.Furniture, t)) delete sGrid[i][j].furniture[t];
                        else sGrid[i][j].furniture[t] = [sGrid[i][j].furniture[t], Math.atan2(map.objList.furniture[t].x - j, map.objList.furniture[t].y - i) * 180 / Math.PI];
                    }
                    for (var t in sGrid[i][j].door) {
                        if (sGrid[i][j].door[t] > range2 || !_checkVisibleLine(j, i, map.objList.door[t].x, map.objList.door[t].y, SYSTEM.Map.Data.Grid.Door, t)) delete sGrid[i][j].door[t];
                        else sGrid[i][j].door[t] = [sGrid[i][j].door[t], Math.atan2(map.objList.door[t].x - j, map.objList.door[t].y - i) * 180 / Math.PI];
                    }
                    for (var t in sGrid[i][j].body) {
                        if (sGrid[i][j].body[t] > range2 || !_checkVisibleLine(j, i, map.objList.body[t].x, map.objList.body[t].y, SYSTEM.Map.Data.Grid.Door, t)) delete sGrid[i][j].body[t];
                        else sGrid[i][j].body[t] = [sGrid[i][j].body[t], Math.atan2(map.objList.body[t].x - j, map.objList.body[t].y - i) * 180 / Math.PI];
                    }

                    var nothing = true;
                    for (var t in sGrid[i][j].furniture) { nothing = false; break; }
                    for (var t in sGrid[i][j].door) { nothing = false; break; }
                    for (var t in sGrid[i][j].body) { nothing = false; break; }
                    if (nothing) sGrid[i][j] = null;
                }
            }

            // build surroundGrid
            surroundGrid = [];
            for (var i = 0; i < height; i++) {
                surroundGrid[i] = [];
                for (var j = 0; j < width; j++) {
                    surroundGrid[i][j] = [];
                    for (var c = 0; c < characters.length; c++) {
                        surroundGrid[i][j][c] = [];
                    }
                }
            }

            console.log('---------------------------------------------------------------');
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    if (sGrid[i][j] === null) continue;
                    for (var k in sGrid[i][j].furniture) {
                        for (var c = 0; c < characters.length; c++) {
                            surroundGrid[i][j][c].push({
                                angle: sGrid[i][j].furniture[k][1],
                                dst: sGrid[i][j].furniture[k][0],
                                info: objOperation.furniture[k][c]
                            });
                        }
                    }
                    for (var k in sGrid[i][j].door) {
                        for (var c = 0; c < characters.length; c++) {
                            surroundGrid[i][j][c].push({
                                angle: sGrid[i][j].door[k][1],
                                dst: sGrid[i][j].door[k][0],
                                info: objOperation.door[k][c]
                            });
                        }
                    }
                    for (var k in sGrid[i][j].body) {
                        for (var c = 0; c < characters.length; c++) {
                            surroundGrid[i][j][c].push({
                                angle: sGrid[i][j].body[k][1],
                                dst: sGrid[i][j].body[k][0],
                                info: objOperation.body[k][c]
                            });
                        }
                    }
                }
            }
            console.log('---------------------------------------------------------------');
        };

        var setupTriggerPos = function () {
            // build positionGrid
            positionGrid = [];
            for (var i = 0; i < height; i++) {
                positionGrid[i] = [];
                for (var j = 0; j < width; j++) {
                    positionGrid[i][j] = [];
                    for (var c = 0; c < characters.length; c++) {
                        positionGrid[i][j][c] = null;
                    }
                }
            }

            // add position grid for end
            var ends = map.position['end'];
            for (var k = 0; k < ends.length; k++) {
                var endPos = ends[k];
                for (var c = 0; c < characters.length; c++) {
                    if (positionGrid[endPos[1]][endPos[0]][c] === null) positionGrid[endPos[1]][endPos[0]][c] = {};
                    positionGrid[endPos[1]][endPos[0]][c]['position' + k] = {
                        'type': 'position',
                        'id': k
                    };
                }
            }
        };

        var setupCharacterRange = function () {
            that.chracterRange = [];
            for (var c = 0; c < characters.length; c++) {
                that.chracterRange[c] = [];
                for (var c2 = 0; c2 < characters.length; c2++) {
                    that.chracterRange[c][c2] = -1;
                }
            }
        };
    };

    SYSTEM.InterAction = InterAction;
})(window.Rendxx.Game.Ghost.System);