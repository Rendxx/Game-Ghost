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
            danger: '<div class="_danger"></div>',
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
            _scene = entity.env.scene,
            _layers = entity.env.layers,
            _loadCount = 0,
            _dangerCache = 0,
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
            //updateFuniture();
            updateDoor();
            updateBody();
            updateLight();
        };

        // render model
        this.render = function () {
        };

        // get data ---------------------------------
        this.isDoorLock = function (idx) {
            return gameData.door[idx].status === _Data.status.door.Locked;
        };

        // private method ---------------------------
        var setupLight = function () {
            _layers['light'] = $(_Data.html.layer.light).appendTo(_scene);
            var darkScreen = $(_Data.html.dark).css({
                'opacity': 0.6
            }).appendTo(_layers['light']);
        };

        var setupGround = function (scene, grid, ground_in) {
            /*create ground*/
            that.width = grid.width;
            that.height = grid.height;
            //_layers['ground'] = $(_Data.html.layer.ground).appendTo(_scene);
            _scene.width(that.width * GridSize).height(that.height * GridSize);
            _layers['ground'] = _layers['ground'] || ($(_Data.html.layer.ground).attr({ width: that.width * GridSize, height: that.height * GridSize }));

            for (var i = 0, l = ground_in.length; i < l; i++) {
                if (ground_in[i] === null) continue;
                _loadCount++;
                createGround(i, ground_in[i], _layers['ground'], function (idx, dat) {
                    var id = dat.id;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupWall = function (scene, wall, wallTop) {

            _layers['wallEdge'] = _layers['wallEdge'] || ($(_Data.html.layer.wallEdge).attr({ width: that.width * GridSize, height: that.height * GridSize }));
            for (var i = 0, l = wall.length; i < l; i++) {
                if (wall[i] === null) continue;
                _loadCount++;
                createWallEdge(i, wall[i], _layers['wallEdge'], function (idx, dat) {
                    var id = dat.id;
                    _loadCount--;
                    onLoaded();
                });
            }

            _layers['wallShadow'] = _layers['wallShadow'] || ($(_Data.html.layer.wallShadow).attr({ width: that.width * GridSize, height: that.height * GridSize }));
            for (var i = 0, l = wallTop.length; i < l; i++) {
                if (wallTop[i] === null) continue;
                _loadCount++;
                createWallShadow(i, wallTop[i], _layers['wallShadow'], function (idx, dat) {
                    var id = dat.id;
                    _loadCount--;
                    onLoaded();
                });
            }
            _layers['wall'] = _layers['wall'] || ($(_Data.html.layer.wall).attr({ width: that.width * GridSize, height: that.height * GridSize }));
            for (var i = 0, l = wallTop.length; i < l; i++) {
                if (wallTop[i] === null) continue;
                _loadCount++;
                createWall(i, wallTop[i], _layers['wall'], function (idx, dat) {
                    var id = dat.id;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupDoor = function (scene, doors) {
            mesh_door = {};
            _layers['door'] = $(_Data.html.layer.door).appendTo(_scene);
            itemStatus['door'] = {};
            itemData['door'] = {};
            for (var i = 0, l = doors.length; i < l; i++) {
                if (doors[i] === null) continue;
                _loadCount++;
                createDoor(i, doors[i], _layers['door'], function (idx, dat, mesh) {
                    var id = dat.id;
                    mesh_door[idx] = (mesh);

                    itemStatus['door'][idx] = _Data.status.door.Closed;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupFurniture = function (scene, furniture) {
            mesh_furniture = {};
            itemStatus['furniture'] = {};
            _layers['furniture'] = $(_Data.html.layer.furniture).appendTo(_scene);
            _layers['furniture2'] = _layers['furniture2'] || ($(_Data.html.layer.furniture2).attr({ width: that.width * GridSize, height: that.height * GridSize }));

            for (var i = 0, l = furniture.length; i < l; i++) {
                if (furniture[i] === null) continue;
                _loadCount++;
                createFurniture(i, furniture[i], _layers['furniture'], _layers['furniture2'], function (idx, dat, mesh) {
                    var id = dat.id;
                    mesh_furniture[idx] = (mesh);

                    itemStatus['furniture'][idx] = _Data.status.furniture.Closed;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupBody = function () {
            itemData['body'] = {};
        };

        var setupStuff = function (scene, stuff) {
            _layers['stuff'] = _layers['stuff'] || ($(_Data.html.layer.stuff).attr({ width: that.width * GridSize, height: that.height * GridSize }));

            if (stuff === null || stuff.length === 0) return;
            for (var i = 0, l = stuff.length; i < l; i++) {
                if (stuff[i] === null) continue;
                _loadCount++;
                createStuff(stuff[i], _layers['stuff'], function (dat) {
                    var id = dat.id;

                    _loadCount--;
                    onLoaded();
                });
            }
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
        var createGround = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.ground][id];
            var x = dat.left * GridSize;
            var y = dat.top * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            var img = _loadImg('g_' + id, root + Data.files.path[Data.categoryName.ground] + para.id + '/' + para.model2D[0],
                function () {
                    var ctx = layer[0].getContext("2d");
                    ctx.save();
                    var ptrn = ctx.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
                    ctx.fillStyle = ptrn;
                    ctx.fillRect(x, y, w, h);
                    ctx.restore();
                    onSuccess(idx, dat);
                });
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

            var ctx = layer[0].getContext("2d");
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = wid;
            ctx.strokeStyle = "#111111";
            ctx.stroke();

            ctx.restore();
            onSuccess(idx, dat);
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
            //console.log(dat);
            //console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            var img = _loadImg('wall_' + id, root + Data.files.path[Data.categoryName.wall] + para.id + '/' + para.model2D[0],
                function (img) {
                    var ctx = layer[0].getContext("2d");
                    ctx.save();
                    var ptrn = ctx.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
                    ctx.fillStyle = ptrn;
                    ctx.fillRect(x, y, w, h);

                    ctx.restore();
                    onSuccess(idx, dat);
                });
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

            var ctx = layer[0].getContext("2d");
            ctx.save();
            ctx.shadowBlur = 30;
            ctx.shadowColor = "#000000";
            ctx.fillStyle = "#000000";
            ctx.fillRect(x, y, w, h);
            ctx.fillRect(x, y, w, h);

            ctx.restore();
            onSuccess(idx, dat);
        };
        
        var createFurniture = function (idx, dat, layer, layer2, onSuccess) {
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
                var img = _loadImg('f_' + id, root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[0],
                    function (img) {
                        // data for graw in canvas  
                        var x2 = (dat.left + dat.right + 1)/2 * GridSize;
                        var y2 = (dat.top + dat.bottom + 1) / 2 * GridSize;

                        var ctx = layer2[0].getContext("2d");
                        ctx.save();
                        ctx.translate(x2, y2);

                        // rotate around this point
                        ctx.rotate(-(4 - r) * Math.PI / 2);
                        ctx.translate(-w / 2, -h / 2);
                        ctx.shadowBlur = 20;
                        ctx.shadowColor = "#000000";

                        ctx.drawImage(img, 0, 0, w, h);
                        ctx.restore();
                        onSuccess(idx, dat); 
                    });
                return;
            }


            var mesh = $(_Data.html.furniture).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[0] + '")',
                'margin-top': offset_y + 'px',
                'margin-left': offset_x + 'px',
                'width': w + 'px',
                'height': h + GridSize + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + -((4 - r) * 90) + 'deg)',
                'transform-origin': GridSize / 2 + 'px ' + GridSize / 2 + 'px'
            }).appendTo(layer);

            _animation['furniture'][idx][_Data.status.furniture.None] = function () {
                mesh.css({
                    'background-image': 'url("' + root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[0] + '")'
                });
            };
            _animation['furniture'][idx][_Data.status.furniture.Opened] = function () {
                mesh.css({
                    'background-image': 'url("' + root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[1] + '")'
                });
            };
            _animation['furniture'][idx][_Data.status.furniture.Closed] = function () {
                mesh.css({
                    'background-image': 'url("' + root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[0] + '")'
                });
            };
            onSuccess(idx, dat, mesh);
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

            var mesh = $(_Data.html.door).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[0] + '")',
                'margin-top': offset_y + 'px',
                'margin-left': offset_x + 'px',
                'width': w + 'px',
                'height': h + GridSize + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + -((4 - r) * 90) + 'deg)',
                'transform-origin': GridSize / 2 + 'px ' + GridSize / 2 + 'px'
            }).appendTo(layer);

            _animation['door'] = _animation['door'] || {};
            _animation['door'][idx] = {};
            _animation['door'][idx][_Data.status.door.Locked] = function () {
                mesh.css({
                    'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[0] + '")'
                });
            };
            _animation['door'][idx][_Data.status.door.Opened] = function () {
                mesh.css({
                    'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[1] + '")'
                });
            };
            _animation['door'][idx][_Data.status.door.Closed] = function () {
                mesh.css({
                    'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[0] + '")'
                });
            };
            _animation['door'][idx][_Data.status.door.Blocked] = function () {
                mesh.css({
                    'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[0] + '")'
                });
            };
            onSuccess(idx, dat, mesh);

            //console.log(dat);
            //console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);
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

            _loadImg('stuff_' + id, root + Data.files.path[Data.categoryName.stuff] + para.id + '/' + para.model2D[0],
                function (img) {
                    // data for graw in canvas  
                    var x2 = (dat.left + dat.right + 1) / 2 * GridSize;
                    var y2 = (dat.top + dat.bottom + 1) / 2 * GridSize;

                    var ctx = layer[0].getContext("2d");
                    ctx.save();
                    ctx.translate(x2, y2);

                    // rotate around this point
                    ctx.rotate(-(4 - r) * Math.PI / 2);
                    ctx.translate(-w / 2, -h / 2);
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "#000000";

                    ctx.drawImage(img, 0, 0, w, h);
                    ctx.restore();
                    onSuccess(dat);
                });
        };

        var removeKey = function (idx, scene, onSuccess) {
        };

        // Update items ----------------------------------------------------------
        var updateFuniture = function () {
            // update furniture
            for (var i in gameData.furniture) {
                if (gameData.furniture[i].status !== itemStatus['furniture'][i] && itemStatus['furniture'][i] !== null) {
                    itemStatus['furniture'][i] = gameData.furniture[i].status;
                    _animation['furniture'][i][itemStatus['furniture'][i]]();
                }
            }
        };

        var updateDoor = function () {
            // update door
            for (var i in gameData.door) {
                if (itemStatus['door'][i] !== null) {
                    if (gameData.door[i].status !== itemStatus['door'][i]) {
                        itemStatus['door'][i] = gameData.door[i].status;
                        _animation['door'][i][itemStatus['door'][i]]();
                    }
                }
            }
        };

        var updateBody = function () {
            // update body
            for (var i in gameData.body) {
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
            if (_dangerCache === gameData.danger) return;
            _dangerCache = gameData.danger;
        };

        var createEndPos = function (dat) {
            if (that.posEnd !== null) return;
            that.posEnd = [];

            for (var i = 0; i < dat.length; i++) {
                _layers['pos'] = $(_Data.html.layer.pos).appendTo(_scene);
                var mesh = $(_Data.html.pos).css({
                    'background-image': 'url("' + _tex['end'].src + '")',
                    'width': GridSize * 2 + 'px',
                    'height': GridSize * 2 + 'px',
                    'top': (dat[i][1] * GridSize) + 'px',
                    'left': (dat[i][0] * GridSize) + 'px',
                    'margin-top': -GridSize / 2 + 'px',
                    'margin-left': -GridSize / 2 + 'px'
                }).appendTo(_layers['pos']);
                that.posEnd[i] = mesh;
            }
        };

        // Setup ----------------------------------------------------------
        var _setupTex = function () {
            _tex = {};
            _loadImg('end', root + Data.files.path[Data.categoryName.sprite] + 'Sprite_EndPos.png');
        };

        var _loadImg = function (name, src, onload) {
            if (_tex[name] != null) {
                if (onload) onload(_tex[name]);
                return _tex[name];
            }
            var img = new Image();
            img.onload = function () {
                _tex[name] = img;
                if (onload) onload(img);
            };
            img.src = src;
            return img;
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