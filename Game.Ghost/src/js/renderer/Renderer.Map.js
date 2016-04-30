window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

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
            _loadCount = 0,
            _dangerCache = 0,
            //_textureLoader = null,
            _ddsLoader = null,

            _ambientNormal = null,
            _ambientDanger = null,

            // mesh
            mesh_ground = null,         // ground
            combined_ground = null,
            mesh_ceiling = null,        // ceiling
            combined_ceiling = null,
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
        this.ambient = null;

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
            for (var i in combined_ground) combined_ground[i].material.needsUpdate = true;
            for (var i in combined_ceiling) combined_ceiling[i].material.needsUpdate = true;
            for (var i in combined_wall) combined_wall[i].material.needsUpdate = true;
            for (var i in combined_wallTop) combined_wallTop[i].material.needsUpdate = true;
            for (var i in combined_door)
                for (var j = 0, l2 = combined_door[i].material.materials.length; j < l2; j++)
                    combined_door[i].material.materials[j].needsUpdate = true;
            for (var i in combined_furniture)
                for (var j = 0, l2 = combined_furniture[i].material.materials.length; j < l2; j++)
                    combined_furniture[i].material.materials[j].needsUpdate = true;
            for (var i = 0, l = combined_stuff.length; i < l; i++)
                for (var j = 0, l2 = combined_stuff[i].material.materials.length; j < l2; j++)
                    combined_stuff[i].material.materials[j].needsUpdate = true;
            for (var i in mesh_key) {
                if (mesh_key[i] === null) continue;
                for (var j = 0, l2 = mesh_key[i].material.materials.length; j < l2; j++)
                    mesh_key[i].material.materials[j].needsUpdate = true;
            }
        };

        // get data ---------------------------------
        this.isDoorLock = function (idx) {
            return gameData.door[idx].status === _Data.status.door.Locked;
        };

        // private method ---------------------------
        var setupLight = function (scene) {
            if (that.ambient !== null) {
                scene.remove(that.ambient);
            }
            _ambientNormal = new THREE.Color(Data.light.ambient.normal);
            _ambientDanger = new THREE.Color(Data.light.ambient.danger);

            that.ambient = new THREE.AmbientLight();
            // Ambient
            that.ambient.color.set(_ambientNormal);
            scene.add(that.ambient);
        };

        var setupGround = function (scene, grid, ground_in) {
            /*create ground*/
            that.width = grid.width;
            that.height = grid.height;

            mesh_ground = [];
            for (var i = 0, l = ground_in.length; i < l; i++) {
                if (ground_in[i] === null) continue;
                _loadCount++;
                createGround(i, ground_in[i], scene, function (idx, dat, mesh) {
                    var id = dat.id;
                    if (!mesh_ground.hasOwnProperty(id)) mesh_ground[id] = [];
                    mesh_ground[id].push(mesh);
                    _loadCount--;
                    onLoaded();
                });
            }

            /*create ceiling*/
            mesh_ceiling = [];
            var ceiling = createCeiling(grid);
            mesh_ceiling.push(ceiling);
        };

        var setupWall = function (scene, wall, wallTop) {
            mesh_wall = {};
            for (var i = 0, l = wall.length; i < l; i++) {
                if (wall[i] === null) continue;
                _loadCount++;
                createWall(i, wall[i], scene, function (idx, dat, mesh) {
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
                createWallTop(i, wallTop[i], scene, function (idx, dat, mesh) {
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
            itemTween['door'] = {};
            itemStatus['door'] = {};
            itemData['door'] = {};
            for (var i = 0, l = doors.length; i < l; i++) {
                if (doors[i] === null) continue;
                _loadCount++;
                createDoor(i, doors[i], scene, function (idx, dat, mesh, tween) {
                    var id = dat.id;
                    if (!mesh_door.hasOwnProperty(id)) mesh_door[id] = [];
                    mesh_door[id].push(mesh);

                    itemStatus['door'][idx] = _Data.status.door.Closed;
                    itemTween['door'][idx] = tween;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupFurniture = function (scene, furniture) {
            mesh_furniture = {};
            itemTween['furniture'] = {};
            itemStatus['furniture'] = {};
            _map = [];
            for (var i = 0; i < that.height; i++) {
                _map[i] = [];
                for (var j = 0; j < that.width; j++)
                    _map[i][j] = -1;
            }
            for (var i = 0, l = furniture.length; i < l; i++) {
                if (furniture[i] === null) continue;
                _loadCount++;
                createFurniture(i, furniture[i], scene, function (idx, dat, mesh, tween) {
                    var id = dat.id;
                    if (!mesh_furniture.hasOwnProperty(id)) mesh_furniture[id] = [];
                    mesh_furniture[id].push(mesh);

                    itemStatus['furniture'][idx] = _Data.status.furniture.Closed;
                    itemTween['furniture'][idx] = tween;
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
        var createCeiling = function (grid) {
            var planeGeometry = new THREE.PlaneGeometry(grid.width * GridSize, grid.height * GridSize);
            var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
            var ceiling = new THREE.Mesh(planeGeometry, planeMaterial);
            ceiling.rotation.x = .5 * Math.PI;
            ceiling.position.y = 3 * GridSize;
            ceiling.castShadow = false;
            ceiling.receiveShadow = true;
            return ceiling;
        };

        var createGround = function (idx, dat, scene, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.ground][id];

            getTexture(root + Data.files.path[Data.categoryName.ground] + para.id + '/' + para.texture[0], function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                var geometry = new THREE.PlaneGeometry(w, h, 1, 1);
                // set uv
                var uvs = geometry.faceVertexUvs[0];
                uvs[0][0].set(0, h / GridSize);
                uvs[0][1].set(0, 0);
                uvs[0][2].set(w / GridSize, h / GridSize);
                uvs[1][0].set(0, 0);
                uvs[1][1].set(w / GridSize, 0);
                uvs[1][2].set(w / GridSize, h / GridSize);

                var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
                material.side = THREE.DoubleSide;
                mesh = new THREE.Mesh(geometry, material);

                mesh.position.x = x;
                mesh.position.y = 0;
                mesh.position.z = y;
                mesh.rotation.x = -.5 * Math.PI;
                mesh.receiveShadow = true;

                onSuccess(idx, dat, mesh);
            });
        };

        var createWall = function (idx, dat, scene, onSuccess) {
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
            //console.log(x, y, len, r);
            getTexture(root + Data.files.path[Data.categoryName.wall] + para.id + '/' + para.texture[1], function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                //texture.repeat.x = len / 3;
                //texture.repeat.y = 1;

                var geometry = new THREE.PlaneGeometry(len * GridSize, 3 * GridSize, 1, 1);
                // set uv
                var uvs = geometry.faceVertexUvs[0];
                uvs[0][0].set(0, 0.75);
                uvs[0][1].set(0, 0);
                uvs[0][2].set(len / 4, 0.75);
                uvs[1][0].set(0, 0);
                uvs[1][1].set(len / 4, 0);
                uvs[1][2].set(len / 4, 0.75);

                var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
                material.side = THREE.DoubleSide;
                var mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                x *= GridSize;
                y *= GridSize;
                len *= GridSize;

                mesh.rotation.y = (4 - r) / 2 * Math.PI;
                mesh.position.x = x;
                mesh.position.y = 1.5 * GridSize;
                mesh.position.z = y;

                onSuccess(idx, dat, mesh);
            });
        };

        var createWallTop = function (idx, dat, scene, onSuccess) {
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

            // top wall
            var texture = getTexture(root + Data.files.path[Data.categoryName.wall] + para.id + '/' + para.texture[0], function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                var geometry = new THREE.PlaneGeometry(w, h, 1, 1);
                // set uv
                var uvs = geometry.faceVertexUvs[0];
                uvs[0][0].set(0, h / GridSize);
                uvs[0][1].set(0, 0);
                uvs[0][2].set(w / GridSize, h / GridSize);
                uvs[1][0].set(0, 0);
                uvs[1][1].set(w / GridSize, 0);
                uvs[1][2].set(w / GridSize, h / GridSize);

                var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
                material.side = THREE.DoubleSide;
                var mesh = new THREE.Mesh(geometry, material);

                mesh.position.x = x;
                mesh.position.y = 3 * GridSize;
                mesh.position.z = y;
                //mesh.rotation.y = r / 180 * Math.PI;
                mesh.rotation.x = -.5 * Math.PI;
                mesh.castShadow = false;
                mesh.receiveShadow = false;

                onSuccess(idx, dat, mesh);
            });
        };

        var createFurniture = function (idx, dat, scene, onSuccess) {
            if (dat === null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.furniture][id];

            var mesh = null;

            //console.log(dat);
            //aconsole.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            that.objectPos.furniture[idx] = [x, y];


            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.furniture] + para.id + '/' + para.model, function (geometry, materials) {
                var mesh = null,
                    tweenNew = null;
                if (para.action === undefined || para.action === null) {
                    // static furniture
                    mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                } else {
                    // dynamic furniture
                    for (var i = 0; i < materials.length; i++) {
                        materials[i].skinning = true;
                    }
                    mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));

                    var actionPara = {};
                    var recoverPara = {};
                    for (var i in para.action) {
                        for (var j = 0; j < mesh.skeleton.bones.length; j++) {
                            if (mesh.skeleton.bones[j].name === i) {
                                actionPara[j] = {};
                                recoverPara[j] = {};
                                if ('z' in para.action[i]) {
                                    actionPara[j]['y'] = para.action[i]['z'] / 180 * Math.PI;
                                    recoverPara[j]['y'] = 0;
                                }
                                if ('y' in para.action[i]) {
                                    actionPara[j]['z'] = para.action[i]['y'] / 180 * Math.PI;
                                    recoverPara[j]['z'] = 0;
                                }
                                if ('x' in para.action[i]) {
                                    actionPara[j]['x'] = para.action[i]['x'] / 180 * Math.PI;
                                    recoverPara[j]['x'] = 0;
                                }

                                break;
                            }
                        }
                    }

                    tweenNew = [[], []];
                    for (var i in actionPara) {
                        tweenNew[0].push(new TWEEN.Tween(mesh.skeleton.bones[i].rotation).to(actionPara[i], para.duration).easing(TWEEN.Easing.Quadratic.Out));
                    }
                    for (var i in recoverPara) {
                        tweenNew[1].push(new TWEEN.Tween(mesh.skeleton.bones[i].rotation).to(recoverPara[i], para.duration).easing(TWEEN.Easing.Quadratic.Out));
                    }
                }

                mesh.castShadow = true;
                mesh.receiveShadow = true;

                mesh.position.x = x;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;

                for (var i = dat.top; i <= dat.bottom; i++) {
                    for (var j = dat.left; j <= dat.right; j++)
                        _map[i][j] = id;
                }

                onSuccess(idx, dat, mesh, tweenNew);
            });
        };

        var createDoor = function (idx, dat, scene, onSuccess) {
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
            var mesh = null;

            //console.log(dat);
            //console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            that.objectPos.door[idx] = [x, y];

            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.door] + para.id + '/' + para.model, function (geometry, materials) {
                var mesh = null,
                    tweenNew = null;
                if (para.action === null || para.action === undefined) {
                    // static furniture
                    mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                } else {
                    // dynamic furniture
                    for (var i = 0; i < materials.length; i++) {
                        materials[i].skinning = true;
                    }
                    mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));

                    var actionPara = {};
                    var recoverPara = {};
                    for (var i in para.action) {
                        for (var j = 0; j < mesh.skeleton.bones.length; j++) {
                            if (mesh.skeleton.bones[j].name === i) {
                                actionPara[j] = {};
                                recoverPara[j] = {};
                                if ('z' in para.action[i]) {
                                    actionPara[j]['y'] = para.action[i]['z'] / 180 * Math.PI;
                                    recoverPara[j]['y'] = 0;
                                }
                                if ('y' in para.action[i]) {
                                    actionPara[j]['z'] = para.action[i]['y'] / 180 * Math.PI;
                                    recoverPara[j]['z'] = 0;
                                }
                                if ('x' in para.action[i]) {
                                    actionPara[j]['x'] = para.action[i]['x'] / 180 * Math.PI;
                                    recoverPara[j]['x'] = 0;
                                }

                                break;
                            }
                        }
                    }

                    tweenNew = [[], []];
                    for (var i in actionPara) {
                        tweenNew[0].push(new TWEEN.Tween(mesh.skeleton.bones[i].rotation).to(actionPara[i], para.duration).easing(TWEEN.Easing.Quadratic.Out));
                    }
                    for (var i in recoverPara) {
                        tweenNew[1].push(new TWEEN.Tween(mesh.skeleton.bones[i].rotation).to(recoverPara[i], para.duration).easing(TWEEN.Easing.Quadratic.Out));
                    }
                }

                mesh.castShadow = true;
                mesh.receiveShadow = true;

                mesh.position.x = x;
                //mesh.position.y = depth/2;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;

                onSuccess(idx, dat, mesh, tweenNew);
            });
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

            // ceiling
            if (combined_ceiling !== null) {
                for (var i in combined_ceiling) _scene.remove(combined_ceiling[i]);
            }
            combined_ceiling = {};
            for (var i = 0; i < mesh_ceiling.length; i++) {
                combined_ceiling[i] = mesh_ceiling[i];
                _scene.add(combined_ceiling[i]);
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
            //_textureLoader = new THREE.TextureLoader();
            //_tex['lock'] = _textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_locked.png');
            //_tex['end'] = _textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_EndPos.png');

            _ddsLoader = new THREE.DDSLoader();
            _tex['lock'] = _ddsLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_locked.dds');
            _tex['lock'].anisotropy = 4;
            _tex['end'] = _ddsLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_EndPos.dds');
            _tex['end'].anisotropy = 4;
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
})(window.Rendxx.Game.Ghost.Renderer);