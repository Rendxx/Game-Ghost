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
            layerDark: '<div class="_layer _layer_dark"></div>',
            layerGround: '<div class="_layer _layer_ground"></div>',
            layerWall: '<div class="_layer _layer_wall"></div>',
            layerDoor: '<div class="_layer _layer_door"></div>',
            layerFurniture: '<div class="_layer _layer_furniture"></div>',
            ground: '<div class="_ground"></div>',
            wall: '<div class="_wall"></div>',
            wallTop: '<div class="_wallTop"></div>',
        }
    };

    var Map = function (entity) {
        // private data ----------------------------
        var that = this,
            GridSize = Data.grid.size,
            _modelData = null,
            _mapData = null,
            _mapSetupData = null,
            _texture = {},
            _map = null,     // map
            gameData = null,
            itemTween = null,
            itemStatus = null,
            itemData = null,
            root = entity.root,
            _tex = {},
            _sprite = {},
            _scene = entity.env.scene,
            _layers = entity.env.layers,
            _loadCount = 0,
            _dangerCache = 0,
            //_textureLoader = null,
            _ddsLoader = null,

            _ambientNormal = null,
            _ambientDanger = null,

            // mesh
            mesh_ground = null,         // ground
            combined_ground = null,
            mesh_wall = null,           // wall
            mesh_wallTop = null,
            combined_wall = null,
            combined_wallTop = null,
            mesh_door = null,           // door
            combined_door = null,
            mesh_furniture = null,      // furniture
            combined_furniture = null,
            mesh_stuff = null,          // stuff
            combined_stuff = null,
            mesh_key = null,            // key objects: funiture id: key object
            combined_key = null;


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
            itemTween = {};
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
            _layers['dark'] = $(_Data.html.layerDark).appendTo(_scene);
            that.dark = $(_Data.html.dark).css({
                'opacity': 0.2
            }).appendTo(_layers['dark']);
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
            mesh_wall = {};
            _layers['wall'] = $(_Data.html.layerWall).appendTo(_scene);
            for (var i = 0, l = wall.length; i < l; i++) {
                if (wall[i] === null) continue;
                _loadCount++;
                createWall(i, wall[i], _layers['wall'], function (idx, dat, mesh) {
                    var id = dat.id;
                    if (!mesh_wall.hasOwnProperty(id)) mesh_wall[id] = [];
                    mesh_wall[id].push(mesh);
                    _loadCount--;
                    onLoaded();
                });
            }

            mesh_wallTop = {};
            for (var i = 0, l = wallTop.length; i < l; i++) {
                if (wallTop[i] === null) continue;
                _loadCount++;
                createWallTop(i, wallTop[i], _layers['wall'], function (idx, dat, mesh) {
                    var id = dat.id;
                    if (!mesh_wallTop.hasOwnProperty(id)) mesh_wallTop[id] = [];
                    mesh_wallTop[id].push(mesh); 
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
                    if (!mesh_door.hasOwnProperty(id)) mesh_door[id] = [];
                    mesh_door[id].push(mesh);

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
            _map = [];
            for (var i = 0; i < that.height; i++) {
                _map[i] = [];
                for (var j = 0; j < that.width; j++)
                    _map[i][j] = -1;
            }
            for (var i = 0, l = furniture.length; i < l; i++) {
                if (furniture[i] === null) continue;
                _loadCount++;
                createFurniture(i, furniture[i], _layers['furniture'], function (idx, dat, mesh) {
                    var id = dat.id;
                    if (!mesh_furniture.hasOwnProperty(id)) mesh_furniture[id] = [];
                    mesh_furniture[id].push(mesh);

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
            if (stuff === null || stuff.length === 0) return;
            for (var i = 0, l = stuff.length; i < l; i++) {
                if (stuff[i] === null) continue;
                _loadCount++;
                createStuff(stuff[i], scene, function (dat, mesh) {
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
                for (var i in mesh_key) scene.remove(mesh_key[i]);
                mesh_key = null;
            }
            mesh_key = {};
        };

        var onLoaded = function () {
            if (_loadCount > 0) return;
            _addToScene();
            if (that.onLoaded) that.onLoaded();
        };

        // Add items ----------------------------------------------------------
        var createGround = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.ground][id];

            var mesh = $(_Data.html.ground).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.ground] + para.id + '/' + para.texture[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate('+((4 - r) *90)+'deg)'
            }).appendTo(layer);
            onSuccess(idx, dat, mesh);
        };

        var createWall = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var r = dat.rotation - 2;
            var len = dat.len;
            var x = dat.left - that.width / 2;
            var y = dat.top - that.height / 2;
            var para = _modelData.items[Data.categoryName.wall][id];

            if ((r & 1) === 0) {
                x += len / 2;
            } else {
                y += len / 2;
            }

            var mesh = $(_Data.html.wall).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.wall] + para.id + '/' + 'wallShadow.png' + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + ((4 - r) * 90) + 'deg)'
            }).appendTo(layer);
            onSuccess(idx, dat, mesh);
        };

        var createWallTop = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.wall][id];

            //console.log(dat);
            //console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);


            var mesh = $(_Data.html.wallTop).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.wall] + para.id + '/' + para.texture[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px'
            }).appendTo(layer);
            onSuccess(idx, dat, mesh);
        };

        var createFurniture = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.furniture][id];
            
            //console.log(dat);
            //aconsole.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            that.objectPos.furniture[idx] = [x, y];
            var mesh = $(_Data.html.furniture).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.wall] + para.id + '/' + para.texture[0] + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + ((4 - r) * 90) + 'deg)'
            }).appendTo(layer);
            onSuccess(idx, dat, mesh);
        };

        var createDoor = function (idx, dat, layer, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.door][id];

            itemData['door'][idx] = {
                x: x,
                y: y,
                r: r,
                w: w,
                h: h
            }
            that.objectPos.door[idx] = [x, y];

            var mesh = $(_Data.html.door).css({
                'background-image': 'url("' + root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.icon + '")',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'transform': 'rotate(' + ((4 - r) * 90) + 'deg)'
            }).appendTo(layer);
            onSuccess(idx, dat, mesh);

            //console.log(dat);
            //console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);
        };

        var createStuff = function (dat, scene, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.stuff][id];

            var mesh = null;


            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.stuff] + para.id + '/' + para.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = false;
                mesh.receiveShadow = true;

                mesh.position.x = x
                var mapObjectId = _map[dat.top][dat.left];
                mesh.position.y = mapObjectId === -1 ? 0 : _modelData.items[Data.categoryName.furniture][mapObjectId].support * GridSize;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;

                //console.log(dat);
                //console.log(id, 'x:' + x, 'y:' + mesh.position.y, 'w:' + w, 'h:' + h, 'r:' + r);
                onSuccess(dat, mesh);
            });
        };

        var createKey = function (dat, idx, scene, onSuccess) {
            var id = dat.id;

            var id = dat.id;
            var r = dat.rotation;

            var slot = _modelData.items[Data.categoryName.furniture][id].slot;
            var r1 = (((slot[1] >= 0) ? (slot[0] >= 0 ? 0 : 1) : (slot[0] >= 0 ? 3 : 2)) + r) % 4;
            var offset_x = (r1 === 0 || r1 === 3 ? 1 : -1) * Math.abs(((r & 1) === 0) ? slot[0] : slot[1]);
            var offset_y = (r1 === 0 || r1 === 1 ? 1 : -1) * Math.abs(((r & 1) === 0) ? slot[1] : slot[0]);

            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize + offset_x * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize + offset_y * GridSize;
            var z = slot[2] * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            var para_Key = _modelData.items[Data.categoryName.stuff][_Data.keyData];
            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.stuff] + para_Key.id + '/' + para_Key.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = false;
                mesh.receiveShadow = true;

                mesh.position.x = x;
                mesh.position.y = z;
                mesh.position.z = y;

                //console.log(dat);
                //console.log(id, 'x:' + x, 'y:' + mesh.position.y, 'w:' + w, 'h:' + h, 'r:' + r);
                onSuccess(idx, mesh);
            });
        };

        var removeKey = function (idx, scene, onSuccess) {
            scene.remove(mesh_key[idx]);
            onSuccess(idx);
        };

        var getTexture = function (path, onSuccess) {
            //return _textureLoader.load(path, onSuccess);
            return _ddsLoader.load(path, function (tex) {
                tex.anisotropy = 4;
                if (onSuccess) onSuccess(tex);
            });
        };

        // Update items ----------------------------------------------------------
        var updateFuniture = function () {
            // update furniture
            for (var i in gameData.furniture) {
                if (gameData.furniture[i].status !== itemStatus['furniture'][i] && itemStatus['furniture'][i] !== null) {
                    itemStatus['furniture'][i] = gameData.furniture[i].status;
                    if (itemTween['furniture'][i] !== null) {
                        var t = itemTween['furniture'][i][1 - _Data.animationId.furniture[itemStatus['furniture'][i]]];
                        for (var j = 0; j < t.length; j++) {
                            t[j].stop();
                        }
                        t = itemTween['furniture'][i][_Data.animationId.furniture[itemStatus['furniture'][i]]];
                        for (var j = 0; j < t.length; j++) {
                            t[j].start();
                        }
                    }
                }
            }
        };

        var updateDoor = function () {
            // update door
            for (var i in gameData.door) {
                if (itemStatus['door'][i] !== null) {
                    if (gameData.door[i].status !== itemStatus['door'][i]) {
                        itemStatus['door'][i] = gameData.door[i].status;
                        if (itemTween['door'] !== null && itemTween['door'][i] !== null) {
                            var t = itemTween['door'][i][1 - _Data.animationId.door[itemStatus['door'][i]]];
                            for (var j = 0; j < t.length; j++) {
                                t[j].stop();
                            }
                            t = itemTween['door'][i][_Data.animationId.door[itemStatus['door'][i]]];
                            for (var j = 0; j < t.length; j++) {
                                t[j].start();
                            }
                        }
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
            for (var i in mesh_key) {
                if (gameData.key.hasOwnProperty(i) && gameData.key[i] !== null && gameData.key[i].mapObjectId !== -1) continue;
                if (mesh_key[i] === null) continue;
                removeKey(i, _scene, function (idx) {
                    delete mesh_key[idx];
                });
            }

            for (var i in gameData.key) {
                if (mesh_key.hasOwnProperty(i) || gameData.key[i].mapObjectId === -1) continue;
                mesh_key[i] = null;
                var key = gameData.key[i];
                createKey(_mapData.item.furniture[key.mapObjectId], i, _scene, function (idx, mesh) {
                    _scene.add(mesh);
                    mesh_key[idx] = mesh;
                });
            }
        };

        var updateLight = function () {
            if (_dangerCache === gameData.danger) return;
            _dangerCache = gameData.danger;
            var vector =  _dangerCache / 100;
            that.ambient.color.r = _ambientNormal.r + (_ambientDanger.r - _ambientNormal.r) * vector;
            that.ambient.color.g = _ambientNormal.g + (_ambientDanger.g - _ambientNormal.g) * vector;
            that.ambient.color.b = _ambientNormal.b + (_ambientDanger.b - _ambientNormal.b) * vector;            
        };

        var createEndPos = function (dat) {
            if (that.posEnd !== null) return;
            that.posEnd = [];
            var mat = new THREE.SpriteMaterial({ map: _tex['end'] });
            mat.transparent = true;
            for (var i = 0; i < dat.length; i++) {
                var spr = new THREE.Sprite(mat);
                spr.position.set((dat[i][0] - that.width / 2 + 0.5) * GridSize, 0.1, (dat[i][1] - that.height / 2 + 0.5) * GridSize);
                spr.scale.set(GridSize * 2, GridSize * 2, 1.0); // imageWidth, imageHeight
                _scene.add(spr);
                that.posEnd[i] = spr;
            }
        };

        // create combined and add to scene -------------------------------
        var _mergeMeshes = function (meshes, mat) {
            var combined = new THREE.Geometry();

            for (var i = 0; i < meshes.length; i++) {
                meshes[i].updateMatrix();
                combined.merge(meshes[i].geometry, meshes[i].matrix);
            }

            var mesh = new THREE.Mesh(combined, mat);
            return mesh;
        }

        var _addToScene = function () {
            // ground
            if (combined_ground !== null) {
                for (var id in combined_ground) _scene.remove(combined_ground[id]);
            }
            combined_ground = {};
            for (var id in mesh_ground) {
                combined_ground[id] = _mergeMeshes(mesh_ground[id], mesh_ground[id][0].material);
                //combined_ground[id].castShadow = true;
                combined_ground[id].receiveShadow = true;
                _scene.add(combined_ground[id]);
            }


            // wall
            if (combined_wall !== null) {
                for (var id in combined_wall) _scene.remove(combined_wall[id]);
            }
            combined_wall = {};
            for (var id in mesh_wall) {
                combined_wall[id] = _mergeMeshes(mesh_wall[id], mesh_wall[id][0].material);
                combined_wall[id].castShadow = true;
                combined_wall[id].receiveShadow = true;
                _scene.add(combined_wall[id]);
            }

            // wall top
            if (combined_wallTop !== null) {
                for (var id in combined_wallTop) _scene.remove(combined_wallTop[id]);
            }
            combined_wallTop = {};
            for (var id in mesh_wallTop) {
                combined_wallTop[id] = _mergeMeshes(mesh_wallTop[id], mesh_wallTop[id][0].material);
                _scene.add(combined_wallTop[id]);
            }

            // door 
            if (combined_door !== null) {
                for (var id in combined_door) _scene.remove(combined_door[id]);
            }
            combined_door = {};
            for (var id in mesh_door) {
                for (var i = 0; i < mesh_door[id].length; i++) {
                    var idx = id + '__' + i;
                    combined_door[idx] = mesh_door[id][i];
                    combined_door[idx].castShadow = true;
                    combined_door[idx].receiveShadow = true;
                    _scene.add(combined_door[idx]);
                }
            }

            // furniture 
            if (combined_furniture !== null) {
                for (var id in combined_furniture) _scene.remove(combined_furniture[id]);
            }
            combined_furniture = {};
            for (var id in mesh_furniture) {
                if (mesh_furniture[id][0] instanceof THREE.SkinnedMesh) {
                    for (var i = 0; i < mesh_furniture[id].length; i++) {
                        var idx = id + '__' + i;
                        combined_furniture[idx] = mesh_furniture[id][i];
                        combined_furniture[idx].castShadow = true;
                        combined_furniture[idx].receiveShadow = true;
                        _scene.add(combined_furniture[idx]);
                    }
                } else {
                    combined_furniture[id] = _mergeMeshes(mesh_furniture[id], mesh_furniture[id][0].material);
                    combined_furniture[id].castShadow = true;
                    combined_furniture[id].receiveShadow = true;
                    _scene.add(combined_furniture[id]);
                }
            }

            // stuff 
            if (combined_stuff !== null) {
                for (var id in combined_stuff) _scene.remove(combined_stuff[id]);
            }
            combined_stuff = {};
            for (var id in mesh_stuff) {
                combined_stuff[id] = _mergeMeshes(mesh_stuff[id], mesh_stuff[id][0].material);
                combined_stuff[id].castShadow = true;
                combined_stuff[id].receiveShadow = true;
                _scene.add(combined_stuff[id]);
            }
        };

        // Setup ----------------------------------------------------------
        var _setupTex = function () {
            _tex = {};
            _tex['highlight'] = _loadImg(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_EndPos.png');
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