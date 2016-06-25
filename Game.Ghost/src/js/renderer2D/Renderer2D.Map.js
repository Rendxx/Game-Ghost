window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Setup map, including light, wall and other stuff
 *     y
 *     |
 *     |
 *     o------x
 *    /
 *   /
 *  z
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        keyData: "key_1",
        prefix_furniture: "f_",
        prefix_door: "d_",
        status: {
            furniture: {
                None: 0,
                Closed: 1,
                Opened: 2
            },
            door: {
                Locked: 0,
                Opened: 1,
                Closed: 2,
                Blocked: 3
            }
        },
        animationId: {
            furniture: {
                0: 1,
                1: 1,
                2: 0
            },
            door: {
                0: 1,
                1: 0,
                2: 1,
                3: 1
            }
        },
        html: {
            dark: '<div class="_dark"></div>',
            layer: {
                ground: '<canvas class="_layer _layer_ground"></canvas>',
                wall: '<canvas class="_layer _layer_wall"></canvas>',
                wallEdge: '<canvas class="_layer _layer_wallEdge"></canvas>',
                wallShadow: '<canvas class="_layer _layer_wallShadow"></canvas>',
                furniture2: '<canvas class="_layer _layer_furniture_static"></canvas>',
                stuff: '<canvas class="_layer _layer_stuff"></canvas>',
                staticMapTop: '<canvas class="_layer _layer_static_top"></canvas>',
                staticMapBtm: '<canvas class="_layer _layer_static_btm"></canvas>',

                light: '<div class="_layer _layer_light"></div>',
                door: '<div class="_layer _layer_door"></div>',
                furniture: '<div class="_layer _layer_furniture"></div>',
                pos: '<div class="_layer _layer_pos"></div>'
            },

            ground: '<div class="_ground"></div>',
            wallTop: '<div class="_wallTop"></div>',
            wallEdge: '<div class="_wallEdge"></div>',
            wallShadow: '<div class="_wallShadow"></div>',
            door: '<div class="_door"></div>',
            furniture: '<div class="_furniture"></div>',
            stuff: '<div class="_stuff"></div>',
            pos: '<div class="_pos"></div>'
        }
    };

    var Map = function (entity) {
        // private data ----------------------------
        var that = this,
            GridSize = Data.grid.size,
            _modelData = null,
            _mapData = null,
            _mapSetupData = null,
            gameData = null,
            itemStatus = null,
            itemData = null,
            root = entity.root,
            _tex = {},
            _frames = {},
            _scene = entity.env.scene['map'],
            _layers = entity.env.layers,
            _loadCount = 0,
            darkScreen = null,

            _animation = {},

            // mesh
            mesh_door = null,           // door
            mesh_furniture = null,      // furniture
            mesh_key = null;            // key objects: funiture id: key object


        // public data -----------------------------
        this.width = 0;
        this.height = 0;
        this.objectPos = {              //  id: [x, y]
            furniture: {},
            door: {},
            body: {}
        };
        this.posEnd = null;
        this.dark = null;
        this.danger = 0;

        // callback --------------------------------
        this.onLoaded = null;

        // public method ---------------------------
        /**
         * load map with given data
         */
        this.loadData = function (mapData, modelData, mapSetupData) {
            _modelData = modelData;
            _mapData = mapData;
            _mapSetupData = mapSetupData;
            itemStatus = {};
            itemData = {};
            _loadCount = 1;
            setupGround(_scene, mapData.grid, mapData.item.ground);
            setupDoor(_scene, mapData.item.door);
            setupBody();
            setupFurniture(_scene, mapData.item.furniture);
            setupStuff(_scene, mapData.item.stuff);
            setupWall(_scene, mapData.wall, mapData.item.wall);
            setupKey(_scene);

            createEndPos(_mapSetupData.position.end);
            _loadCount--;
            onLoaded();
        };

        // update data from system
        this.update = function (data_in) {
            gameData = data_in;

            //updateKey();
            updateFuniture();
            updateDoor();
            updateBody();
            updateLight();
        };

        // render model
        this.render = function () {
        };

        // get data ---------------------------------
        this.isDoorLock = function (idx) {
            return itemStatus['door'][idx].status === _Data.status.door.Locked;
        };

        // private method ---------------------------
        var setupLight = function () {
            //_layers['light'] = $(_Data.html.layer.light).appendTo(_scene);
            //var darkScreen = $(_Data.html.dark).appendTo(_layers['light']);
        };

        var setupGround = function (scene, grid, ground_in) {
            /*create ground*/
            that.width = grid.width;
            that.height = grid.height;
            _layers['ground'] = new PIXI.Container();
            _scene.addChild(_layers['ground']);

            var fileArr = [];
            for (var i = 0, l = ground_in.length; i < l; i++) {
                if (ground_in[i] === null) continue;
                _loadCount++;
                loadGroundTex(fileArr, _modelData.items[Data.categoryName.ground][i]);
            }

            PIXI.loader.add(fileArr).load(function (loader, resources) {
                for (var i = 0, l = ground_in.length; i < l; i++) {
                    if (ground_in[i] === null) continue;
                    createGround(i, ground_in[i], _layers['ground'], function (idx, dat) {
                        var id = dat.id;
                        _loadCount--;
                        onLoaded();
                    });
                }
            });
        };

        var setupWall = function (scene, wall, wallTop) {
            _layers['wallShadow'] = new PIXI.Container();
            _scene.addChild(_layers['wallShadow']);
            for (var i = 0, l = wallTop.length; i < l; i++) {
                if (wallTop[i] === null) continue;
                _loadCount++;
                createWallShadow(i, wallTop[i], _layers['wallShadow'], function (idx, dat) {
                    var id = dat.id;
                    _loadCount--;
                    onLoaded();
                });
            }

            var fileArr = [];
            for (var i = 0, l = wallTop.length; i < l; i++) {
                if (wallTop[i] === null) continue;
                _loadCount++;
                loadWallTex(fileArr, _modelData.items[Data.categoryName.wall][i]);
            }

            _layers['wall'] = new PIXI.Container();
            _scene.addChild(_layers['wall']);
            PIXI.loader.add(fileArr).load(function (loader, resources) {
                for (var i = 0, l = wallTop.length; i < l; i++) {
                    if (wallTop[i] === null) continue;
                    createWall(i, wallTop[i], _layers['wall'], function (idx, dat) {
                        var id = dat.id;
                        _loadCount--;
                        onLoaded();
                    });
                }
            });

            _layers['wallEdge'] = new PIXI.Container();
            _scene.addChild(_layers['wallEdge']);
            for (var i = 0, l = wall.length; i < l; i++) {
                if (wall[i] === null) continue;
                _loadCount++;
                createWallEdge(i, wall[i], _layers['wallEdge'], function (idx, dat) {
                    var id = dat.id;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupDoor = function (scene, doors) {
            mesh_door = {};

            _layers['door'] = new PIXI.Container();
            _scene.addChild(_layers['door']);

            itemStatus['door'] = {};
            itemData['door'] = {};
            
            var fileArr = [];
            for (var i = 0, l = doors.length; i < l; i++) {
                if (doors[i] === null) continue;
                _loadCount++;
                loadDoorTex(fileArr, _modelData.items[Data.categoryName.door][i]);
            }
            PIXI.loader.add(fileArr).load(function (loader, resources) {
                for (var i = 0, l = doors.length; i < l; i++) {
                    if (doors[i] === null) continue;
                    createDoor(i, doors[i], _layers['door'], function (idx, dat, mesh) {
                        var id = dat.id;
                        mesh_door[idx] = (mesh);

                        itemStatus['door'][idx] = _Data.status.door.Closed;
                        _loadCount--;
                        onLoaded();
                    });
                }
            });
        };

        var setupFurniture = function (scene, furniture) {
            mesh_furniture = {};
            itemStatus['furniture'] = {};

            _layers['furniture'] = new PIXI.Container();
            _scene.addChild(_layers['furniture']);
            
            var fileArr = [];
            for (var i = 0, l = doors.length; i < l; i++) {
                if (furniture[i] === null) continue;
                _loadCount++;
                loadFurnitureTex(fileArr, _modelData.items[Data.categoryName.furniture][i]);
            }
            
            PIXI.loader.add(fileArr).load(function (loader, resources) {
                for (var i = 0, l = furniture.length; i < l; i++) {
                    if (furniture[i] === null) continue;
                    createFurniture(i, furniture[i], _layers['furniture'], function (idx, dat, mesh) {
                        var id = dat.id;
                        mesh_furniture[idx] = (mesh);

                        itemStatus['furniture'][idx] = (mesh == null) ? _Data.status.furniture.None : _Data.status.furniture.Closed;
                        _loadCount--;
                        onLoaded();
                    });
                }
            });
        };

        var setupBody = function () {
            itemData['body'] = {};
        };

        var setupStuff = function (scene, stuff) {
            _layers['stuff'] = new PIXI.Container();
            _scene.addChild(_layers['stuff']);

            if (stuff === null || stuff.length === 0) return;
            var fileArr = [];
            for (var i = 0, l = stuff.length; i < l; i++) {
                if (stuff[i] === null) continue;
                _loadCount++;
                loadStuffTex(fileArr, _modelData.items[Data.categoryName.stuff][i]);
            }

            PIXI.loader.add(fileArr).load(function (loader, resources) {
                for (var i = 0, l = stuff.length; i < l; i++) {
                    if (stuff[i] === null) continue;
                    createStuff(stuff[i], _layers['stuff'], function (dat) {
                        var id = dat.id;

                        _loadCount--;
                        onLoaded();
                    });
                }
            });
        };

        var setupKey = function (scene) {
            if (mesh_key !== null) {
            }
            mesh_key = {};
        };

        var onLoaded = function () {
            if (_loadCount > 0) return;
            _layers['staticMapTop'] = ($(_Data.html.layer.staticMapTop).attr({ width: that.width * GridSize, height: that.height * GridSize }).appendTo(_scene));
            _layers['staticMapBtm'] = ($(_Data.html.layer.staticMapBtm).attr({ width: that.width * GridSize, height: that.height * GridSize }).appendTo(_scene));

            var ctx = _layers['staticMapBtm'][0].getContext("2d");
            ctx.drawImage(_layers['ground'][0], 0, 0);
            ctx.drawImage(_layers['furniture2'][0], 0, 0);
            ctx.drawImage(_layers['stuff'][0], 0, 0);

            var ctx2 = _layers['staticMapTop'][0].getContext("2d");
            ctx2.drawImage(_layers['wallShadow'][0], 0, 0);
            ctx2.drawImage(_layers['wall'][0], 0, 0);
            ctx2.drawImage(_layers['wallEdge'][0], 0, 0);

            if (that.onLoaded) that.onLoaded();
        };

        // Add items ----------------------------------------------------------
        var loadGroundTex = function (fileArr, para) {
            fileArr.push({
                name: 'g_' + para.id,
                url: root + Data.files.path[Data.categoryName.ground] + para.id + '/' + para.model2D[0],
                onComplete: function (loader, resources) {
                    _tex['g_' + para.id] = resources.texture;
                }
            });
        };

        var createGround = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.ground][id];
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            var obj = new PIXI.extras.TilingSprite(_tex['g_' + para.id], w, h);

            obj.anchor.x = 0;
            obj.anchor.y = 0;
            obj.position.x = x;
            obj.position.y = y;

            layer.addChild(obj);
            onSuccess(idx, dat);
        };
        
        var createWallEdge = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.wall][id];
            var r = dat.rotation;
            var len = dat.len * GridSize;
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var x2 = 0;
            var y2 = 0;
            var wid = GridSize / 8;

            switch (r) {
                case 0:
                    x -= wid / 2;
                    x2 = x + len + wid;
                    y2 = y;
                    break;
                case 1:
                    y -= wid / 2;
                    x2 = x;
                    y2 = y + len + wid;
                    break;
                case 2:
                    x -= wid / 2;
                    x2 = x + len + wid;
                    y2 = y;
                    break;
                case 3:
                    y -= wid / 2;
                    x2 = x;
                    y2 = y + len + wid;
                    break;
            }
            
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(wid, 0x111111, 1);
            graphics.moveTo(x, y);
            graphics.lineTo(x2, y2);

            layer.addChild(graphics);

            onSuccess(idx, dat);
        };

        var loadWallTex = function (fileArr, para) {
            fileArr.push({
                name: 'wall_' + para.id,
                url: root + Data.files.path[Data.categoryName.wall] + para.id + '/' + para.model2D[0],
                onComplete: function (loader, resources) {
                    _tex['wall_' + para.id] = resources.texture;
                }
            });
        };

        var createWall = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.wall][id];
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            var obj = new PIXI.extras.TilingSprite(_tex['wall_' + para.id], w, h);

            obj.anchor.x = 0;
            obj.anchor.y = 0;
            obj.position.x = x;
            obj.position.y = y;

            layer.addChild(obj);
            onSuccess(idx, dat);
        };

        var createWallShadow = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.wall][id];
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(0);
            graphics.beginFill(0x000000);
            graphics.drawRect(x, y, w, h);
            graphics.endFill();

            var dropShadowFilter = new PIXI.filters.DropShadowFilter();
            dropShadowFilter.color = 0x000000;
            dropShadowFilter.alpha = 0.5;
            dropShadowFilter.blur = GridSize/4;
            dropShadowFilter.distance = 0;

            graphics.filters = [dropShadowFilter];
            layer.addChild(graphics);

            onSuccess(idx, dat);
        };

        var loadFurnitureTex = function (fileArr, para) {
            if (!para.hasOwnProperty('action') || para['action'] == null) {
                fileArr.push({
                    name: 'f_' + para.id,
                    url: root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[0],
                    onComplete: function (loader, resources) {
                        _tex['f_' + para.id] = resources.texture;
                    }
                });
            } else {
                fileArr.push({
                    name: 'f_' + para.id,
                    url: root + Data.files.path[Data.categoryName.furniture] + para.id + '/animation_2d.json',
                    onComplete: function (loader, resources) {
                        var _f = [];
                        for (var i = 0; i < 10; i++) {
                            var val = i < 10 ? '0' + i : i;
                            _f.push(PIXI.Texture.fromFrame('sprite00' + val));
                        }
                        _frames['f_' + para.id] = _f;
                    }
                });
            }
        };

        var createFurniture = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.furniture][id];
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var r = dat.rotation;
            var w = para.dimension[0] * GridSize;
            var h = (para.dimension[1]) * GridSize;

            //console.log(dat);
            //aconsole.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            var offset_x = 0;
            var offset_y = 0;
            switch (r) {
                case 1:
                    offset_x = h - GridSize;
                    break;
                case 2:
                    offset_x = w - GridSize;
                    offset_y = h - GridSize;
                    break;
                case 3:
                    offset_y = w - GridSize;
                    break;
            }

            that.objectPos.furniture[idx] = [(dat.left + dat.right) / 2 * GridSize, (dat.top + dat.bottom) / 2 * GridSize];

            _animation['furniture'] = _animation['furniture'] || {};
            _animation['furniture'][idx] = {};

            if (!para.hasOwnProperty('action') || para['action'] == null) {
                var obj = new PIXI.Sprite(_tex['f_' + para.id]);
                obj.anchor.x = 0;
                obj.anchor.y = 0;
                obj.position.x = x;
                obj.position.y = y;
                obj.pivot.set(GridSize * 0.5, GridSize * 0.5);
                obj.rotation = (4 - r) / 2 * Math.PI;

                var dropShadowFilter = new PIXI.filters.DropShadowFilter();
                dropShadowFilter.color = 0x000000;
                dropShadowFilter.alpha = 0.5;
                dropShadowFilter.blur = 6;
                dropShadowFilter.distance = 0;

                obj.filters = [dropShadowFilter];
                layer.addChild(obj);
                onSuccess(idx, dat, obj);
                return;
            }else{                
                var item = new PIXI.extras.MovieClip(_frames['f_' + para.id]);
                item.loop = false;
                item.position.x = x;
                item.position.y = y;
                item.pivot.set(GridSize * 0.5, GridSize * 0.5);
                item.rotation = (4 - r) / 2 * Math.PI;
                layer.addChild(item);

                _animation['furniture'][idx][_Data.status.furniture.None] = function () {
                    item.gotoAndStop(0);
                };
                _animation['furniture'][idx][_Data.status.furniture.Opened] = function () {
                    item.animationSpeed = 1;
                    item.gotoAndPlay(0);
                };
                _animation['furniture'][idx][_Data.status.furniture.Closed] = function () {
                    item.animationSpeed = -1;
                    item.gotoAndPlay(9);
                };
                onSuccess(idx, dat, item);
            }
        };

        var loadDoorTex = function (fileArr,para) {
            fileArr.push({
                name: 'door_' + para.id,
                url: root + Data.files.path[Data.categoryName.door] + para.id + '/animation_2d.json',
                onComplete: function (loader, resources) {
                    var _f = [];
                    for (var i = 0; i < 10; i++) {
                        var val = i < 10 ? '0' + i : i;
                        _f.push(PIXI.Texture.fromFrame('sprite00' + val));
                    }
                    _frames['door_' + para.id] = _f;
                }
            });
        };

        var createDoor = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.door][id];
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var r = dat.rotation;
            var w = para.dimension[0] * GridSize;
            var h = (para.dimension[1]) * GridSize;

            var offset_x = 0;
            var offset_y = 0;
            switch (r) {
                case 1:
                    offset_x = h - GridSize;
                    break;
                case 2:
                    offset_x = w - GridSize;
                    offset_y = h - GridSize;
                    break;
                case 3:
                    offset_y = w - GridSize;
                    break;
            }

            itemData['door'][idx] = {
                x: (dat.left + dat.right) / 2 * GridSize,
                y: (dat.top + dat.bottom) / 2 * GridSize,
                r: r,
                w: w,
                h: h
            }
            that.objectPos.door[idx] = [(dat.left + dat.right) / 2 * GridSize, (dat.top + dat.bottom) / 2 * GridSize];

            _animation['door'] = _animation['door'] || {};
            _animation['door'][idx] = {};

            var item = new PIXI.extras.MovieClip(_frames['door_' + para.id]);
            item.loop = false;
            item.position.x = x;
            item.position.y = y;
            item.pivot.set(GridSize * 0.5, GridSize * 0.5);
            item.rotation = (4 - r) / 2 * Math.PI;
            layer.addChild(item);

            _animation['door'][idx][_Data.status.door.Locked] = function () {
                item.gotoAndStop(0);
            };
            _animation['door'][idx][_Data.status.door.Opened] = function () {
                item.animationSpeed = 1;
                item.gotoAndPlay(0);
            };
            _animation['door'][idx][_Data.status.door.Closed] = function () {
                item.animationSpeed = -1;
                item.gotoAndPlay(9);
            };
            _animation['door'][idx][_Data.status.door.Blocked] = function () {
                item.gotoAndStop(0);
            };
            onSuccess(idx, dat, item);
        };

        var loadStuffTex = function (fileArr, para) {
            fileArr.push({
                name: 'stuff_' + para.id,
                url: root + Data.files.path[Data.categoryName.stuff] + para.id + '/' + para.model2D[0],
                onComplete: function (loader, resources) {
                    _tex['stuff_' + para.id] = resources.texture;
                }
            });
        };

        var createStuff = function (dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var r = dat.rotation;
            var w = GridSize;
            var h = GridSize;
            var para = _modelData.items[Data.categoryName.stuff][id];
            
            var obj = new PIXI.Sprite(_tex['stuff_' + para.id]);

            obj.anchor.x = 0;
            obj.anchor.y = 0;
            obj.position.x = x;
            obj.position.y = y;
            obj.pivot.set(GridSize * 0.5, GridSize * 0.5);
            obj.rotation = (4 - r) / 2 * Math.PI;

            var dropShadowFilter = new PIXI.filters.DropShadowFilter();
            dropShadowFilter.color = 0x000000;
            dropShadowFilter.alpha = 0.5;
            dropShadowFilter.blur = 6;
            dropShadowFilter.distance = 0;

            obj.filters = [dropShadowFilter];
            layer.addChild(obj);
            onSuccess(dat);
        };

        var removeKey = function (idx, scene, onSuccess) {
        };

        // Update items ----------------------------------------------------------
        var updateFuniture = function () {
            // update furniture
            for (var i in gameData.f) {
                if (gameData.f[i].status !== itemStatus['furniture'][i] && itemStatus['furniture'][i] !== null) {
                    itemStatus['furniture'][i] = gameData.f[i].status;
                    _animation['furniture'][i][itemStatus['furniture'][i]]();
                }
            }
        };

        var updateDoor = function () {
            // update door
            for (var i in gameData.d) {
                if (itemStatus['door'][i] !== null) {
                    if (gameData.d[i].status !== itemStatus['door'][i]) {
                        itemStatus['door'][i] = gameData.d[i].status;
                        _animation['door'][i][itemStatus['door'][i]]();
                    }
                }
            }
        };

        var updateBody = function () {
            // update body
            for (var i in gameData.b) {
                if (itemData['body'][i] === undefined || itemData['body'][i] === null) {
                    if (entity.characters !== null && entity.characters[i] !== null) {
                        itemData['body'][i] = {
                            x: entity.characters[i].x,
                            y: entity.characters[i].y,
                        }
                        that.objectPos.body[i] = [entity.characters[i].x, entity.characters[i].y];
                    }
                }
            }
        };

        var updateKey = function () {
            // update key
            if (_mapData === null) return;
        };

        var updateLight = function () {
            if (gameData.da != null) that.danger = gameData.da;
        };

        var createEndPos = function (dat) {
            if (that.posEnd !== null) return;
            that.posEnd = [];

            _layers['pos'] = new PIXI.Container();
            _scene.addChild(_layers['pos']);

            PIXI.loader.add('end', root + Data.files.path[Data.categoryName.sprite] + 'Sprite_EndPos.png').load(function (loader, resources) {
                _tex['end'] = resources['end'].texture;
                for (var i = 0; i < dat.length; i++) {
                    var obj = new PIXI.Sprite(_tex['end']);

                    obj.anchor.x = 0;
                    obj.anchor.y = 0;
                    obj.position.x = dat[i][1] * GridSize;
                    obj.position.y = dat[i][0] * GridSize;
                    _layers['pos'].addChild(obj);
                    that.posEnd[i] = obj;
                }
            });
        };

        // Setup ----------------------------------------------------------
        var _setupTex = function () {
            _tex = {};
        };

        var _init = function () {
            setupLight(_scene);
            _setupTex();
        };

        _init();
    };


    /**
     * Game map
     * @param {game entity} entity - Game entity
     * @param {object} mapData - data used to setup a map
     */
    RENDERER.Map = Map;
})(window.Rendxx.Game.Ghost.Renderer2D);