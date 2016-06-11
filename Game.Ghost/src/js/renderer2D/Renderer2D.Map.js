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
            layerLight: '<div class="_layer _layer_light"></div>',
            layerGround: '<div class="_layer _layer_ground"></div>',
            layerWall: '<div class="_layer _layer_wall"></div>',
            layerDoor: '<div class="_layer _layer_door"></div>',
            layerFurniture: '<div class="_layer _layer_furniture"></div>',
            layerStuff: '<div class="_layer _layer_stuff"></div>',
            layerPos: '<div class="_layer _layer_pos"></div>',            
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
            dangerScreen = null,

            _animation = {},

            // mesh
            mesh_ground = null,         // ground
            mesh_wallTop = null,        // wall       
            mesh_wallEdge = null,
            mesh_wallShadow = null,    
            mesh_door = null,           // door
            mesh_furniture = null,      // furniture
            mesh_stuff = null,          // stuff
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
            setupWall(_scene, mapData.wall, mapData.item.wall);
            setupDoor(_scene, mapData.item.door);
            setupBody();
            setupFurniture(_scene, mapData.item.furniture);
            setupStuff(_scene, mapData.item.stuff);
            setupKey(_scene);

            createEndPos(_mapSetupData.position.end);
            _loadCount--;
            onLoaded();
        };

        // update data from system
        this.update = function (data_in) {
            gameData = data_in;

            updateKey();
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
            return gameData.door[idx].status === _Data.status.door.Locked;
        };

        // private method ---------------------------
        var setupLight = function () {
            _layers['light'] = $(_Data.html.layerLight).appendTo(_scene);
            var darkScreen = $(_Data.html.dark).css({
                'opacity': 0.2
            }).appendTo(_layers['light']);
            var dangerScreen = $(_Data.html.danger).css({
                'opacity': 0
            }).appendTo(_layers['light']);
        };

        var setupGround = function (scene, grid, ground_in) {
            /*create ground*/
            that.width = grid.width;
            that.height = grid.height;
            _layers['ground'] = $(_Data.html.layerGround).appendTo(_scene);

            mesh_ground = [];
            for (var i = 0, l = ground_in.length; i < l; i++) {
                if (ground_in[i] === null) continue;
                _loadCount++;
                createGround(i, ground_in[i], _layers['ground'], function (idx, dat, mesh) {
                    var id = dat.id;
                    if (!mesh_ground.hasOwnProperty(id)) mesh_ground[id] = [];
                    mesh_ground[id].push(mesh);
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupWall = function (scene, wall, wallTop) {
            _layers['wall'] = $(_Data.html.layerWall).appendTo(_scene);

            mesh_wallTop = {};
            mesh_wallEdge = {};
            mesh_wallShadow = {};
            for (var i = 0, l = wallTop.length; i < l; i++) {
                if (wallTop[i] === null) continue;
                _loadCount++;
                createWall(i, wallTop[i], _layers['wall'], function (idx, dat, mesh, meshEdge, meshShadow) {
                    var id = dat.id;
                    if (!mesh_wallTop.hasOwnProperty(id)) mesh_wallTop[id] = [];
                    if (!mesh_wallEdge.hasOwnProperty(id)) mesh_wallEdge[id] = [];
                    if (!mesh_wallShadow.hasOwnProperty(id)) mesh_wallShadow[id] = [];
                    mesh_wallTop[id].push(mesh);
                    mesh_wallEdge[id].push(meshEdge);
                    mesh_wallShadow[id].push(meshShadow);
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupDoor = function (scene, doors) {
            mesh_door = {};
            _layers['door'] = $(_Data.html.layerDoor).appendTo(_scene);
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
            _layers['furniture'] = $(_Data.html.layerFurniture).appendTo(_scene);
            for (var i = 0, l = furniture.length; i < l; i++) {
                if (furniture[i] === null) continue;
                _loadCount++;
                createFurniture(i, furniture[i], _layers['furniture'], function (idx, dat, mesh) {
                    var id = dat.id;
                    mesh_furniture[idx]=(mesh);

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
            mesh_stuff = {};
            _layers['stuff'] = $(_Data.html.layerStuff).appendTo(_scene);
            if (stuff === null || stuff.length === 0) return;
            for (var i = 0, l = stuff.length; i < l; i++) {
                if (stuff[i] === null) continue;
                _loadCount++;
                createStuff(stuff[i], _layers['stuff'], function (dat, mesh) {
                    var id = dat.id;
                    if (!mesh_stuff.hasOwnProperty(id)) mesh_stuff[id] = [];
                    mesh_stuff[id].push(mesh);

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
            if (that.onLoaded) that.onLoaded();
        };

        // Add items ----------------------------------------------------------
        var createGround = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.ground][id];
            var x = dat.left  * GridSize;
            var y = dat.top * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            var mesh = $(_Data.html.ground).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.ground] + para.id + '/' + para.model2D[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px'
            }).appendTo(layer);
            onSuccess(idx, dat, mesh);
        };

        var createWall = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.wall][id];
            var x = dat.left* GridSize;
            var y = dat.top * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            //console.log(dat);
            //console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);


            var meshTop = $(_Data.html.wallTop).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.wall] + para.id + '/' + para.model2D[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px'
            }).appendTo(layer);

            var meshEdge = $(_Data.html.wallEdge).css({
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px'
            }).appendTo(layer);

            var meshShadow = $(_Data.html.wallShadow).css({
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px'
            }).appendTo(layer);

            onSuccess(idx, dat, meshTop, meshEdge, meshShadow);
        };

        var createFurniture = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.furniture][id];
            var x = dat.left  * GridSize;
            var y = dat.top  * GridSize;
            var r = dat.rotation;
            var w = para.dimension[0] * GridSize;
            var h = para.dimension[2] * GridSize;
            
            //console.log(dat);
            //aconsole.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            that.objectPos.furniture[idx] = [x, y];
            var mesh = $(_Data.html.furniture).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + -((4 - r) * 90) + 'deg)',
                'transform-origin': GridSize / 2 + 'px ' + GridSize / 2 + 'px'
            }).appendTo(layer);
            
            _animation['furniture'] = _animation['furniture'] || {};
            _animation['furniture'][idx] = [
                function () {
                    mesh.css({
                        'background-image': 'url("' + root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[0] + '")'
                    });
                },
                function () {
                    mesh.css({
                        'background-image': 'url("' + root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model2D[1] + '")'
                    });
                }];
            onSuccess(idx, dat, mesh);
        };

        var createDoor = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var para = _modelData.items[Data.categoryName.door][id];
            var x = dat.left * GridSize;
            var y = dat.top  * GridSize;
            var r = dat.rotation;
            var w = para.dimension[0] * GridSize;
            var h = para.dimension[2] * GridSize;

            itemData['door'][idx] = {
                x: x,
                y: y,
                r: r,
                w: w,
                h: h
            }
            that.objectPos.door[idx] = [x, y];

            var mesh = $(_Data.html.door).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + -((4 - r) * 90) + 'deg)',
                'transform-origin': GridSize / 2 + 'px ' + GridSize / 2 + 'px'
            }).appendTo(layer);

            _animation['door'] = _animation['door'] || {};
            _animation['door'][idx] = [
                function () {
                    mesh.css({
                        'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[0] + '")'
                    });
                },
                function () {
                    mesh.css({
                        'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model2D[1] + '")'
                    });
                }];
            onSuccess(idx, dat, mesh);

            //console.log(dat);
            //console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);
        };

        var createStuff = function (dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = dat.left  * GridSize;
            var y = dat.top * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.stuff][id];

            var mesh = $(_Data.html.stuff).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.stuff] + para.id + '/' + para.model2D[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + -((4 - r) * 90) + 'deg)'
            }).appendTo(layer);
            onSuccess(dat, mesh);
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
            var vector =  _dangerCache / 100;            
            dangerScreen.css({
                'opacity': vector
            });
        };

        var createEndPos = function (dat) {
            if (that.posEnd !== null) return;
            that.posEnd = [];
            
            for (var i = 0; i < dat.length; i++) {
                _layers['pos'] = $(_Data.html.layerPos).appendTo(_scene);
                var mesh = $(_Data.html.pos).css({
                    'background-image': 'url("' + _tex['end'].src + '")',
                    'width': GridSize * 2 + 'px',
                    'height': GridSize * 2 + 'px',
                    'top': (dat[i][1]) + 'px',
                    'left': (dat[i][0]) + 'px'
                }).appendTo(_layers['pos']);
                that.posEnd[i] = mesh;
            }
        };
        
        // Setup ----------------------------------------------------------
        var _setupTex = function () {
            _tex = {};
            _tex['end'] = _loadImg(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_EndPos.png');
        };

        var _loadImg = function (name) {
            var img = new Image();
            img.src = name;
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