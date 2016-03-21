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
            _loadCount = 0;

        // public data -----------------------------
        this.width = 0;
        this.height = 0;
        this.wall = null;
        this.wallTop = null;
        this.door = null;
        this.light = null;
        this.stuff = null;
        this.furniture = null;
        this.ground = null;
        this.ceiling = null;
        this.posEnd = null;
        this.key = null;        // key objects: funiture id: key object

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
        };

        // render model
        this.render = function () {
            for (var i = 0, l = that.ground.length; i < l; i++) that.ground[i].material.needsUpdate = true;
            for (var i = 0, l = that.ceiling.length; i < l; i++) that.ceiling[i].material.needsUpdate = true;
            for (var i = 0, l = that.wall.length; i < l; i++) that.wall[i].material.needsUpdate = true;
            for (var i = 0, l = that.wallTop.length; i < l; i++) that.wallTop[i].material.needsUpdate = true;
            for (var i = 0, l = that.door.length; i < l; i++)
                for (var j = 0, l2 = that.door[i].material.materials.length; j < l2; j++)
                    that.door[i].material.materials[j].needsUpdate = true;
            for (var i in that.furniture)
                for (var j = 0, l2 = that.furniture[i].material.materials.length; j < l2; j++)
                    that.furniture[i].material.materials[j].needsUpdate = true;
            for (var i = 0, l = that.stuff.length; i < l; i++)
                for (var j = 0, l2 = that.stuff[i].material.materials.length; j < l2; j++)
                    that.stuff[i].material.materials[j].needsUpdate = true;
            for (var i in that.key) {
                if (that.key[i] == null) continue;
                for (var j = 0, l2 = that.key[i].material.materials.length; j < l2; j++)
                    that.key[i].material.materials[j].needsUpdate = true;
            }
        };

        // private method ---------------------------
        var setupLight = function (scene) {
            if (that.light != null) {
                for (var i = 0, l = that.light.length; i < l; i++) scene.remove(that.light[i]);
                that.light = null;
            }

            that.light = [
                new THREE.AmbientLight()
            ];

            // Ambient
            that.light[0].color.setHex(Data.light.ambient.ambColor);
            scene.add(that.light[0]);
        };

        var setupGround = function (scene, grid, ground_in) {
            /*create ground*/
            that.width = grid.width;
            that.height = grid.height;
            if (that.ground != null) {
                for (var i = 0, l = that.ground.length; i < l; i++) scene.remove(that.ground[i]);
                that.ground = null;
            }

            that.ground = [];
            for (var i = 0, l = ground_in.length; i < l; i++) {
                if (ground_in[i] == null) continue;
                var mesh = createGround(ground_in[i]);
                scene.add(mesh);
                that.ground.push(mesh);
            }

            /*create ceiling*/
            var ceiling = createCeiling(grid);
            scene.add(ceiling);
            that.ceiling = [];
            that.ceiling.push(ceiling);
        };

        var setupWall = function (scene, wall, wallTop) {
            if (that.wall != null) {
                for (var i = 0, l = that.wall.length; i < l; i++) scene.remove(that.wall[i]);
                that.wall = null;
            }
            that.wall = [];
            for (var i = 0, l = wall.length; i < l; i++) {
                if (wall[i] == null) continue;
                var mesh = createWall(wall[i]);
                scene.add(mesh);
                that.wall.push(mesh);
            }

            that.wallTop = [];
            for (var i = 0, l = wallTop.length; i < l; i++) {
                if (wallTop[i] == null) continue;
                var mesh = createWallTop(wallTop[i]);
                scene.add(mesh);
                that.wallTop.push(mesh);
            }
        };

        var setupDoor = function (scene, doors) {
            if (that.door != null) {
                for (var i in that.door) scene.remove(that.door[i]);
                that.door = null;
            }
            that.door = {};
            itemTween['door'] = {};
            itemStatus['door'] = {};
            itemData['door'] = {};
            for (var i = 0, l = doors.length; i < l; i++) {
                if (doors[i] == null) continue;
                _loadCount++;
                createDoor(i, doors[i], scene, function (idx, mesh, tween) {
                    scene.add(mesh);
                    that.door[idx] = mesh;
                    itemStatus['door'][idx] = _Data.status.door.Closed;
                    itemTween['door'][idx] = tween;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupFurniture = function (scene, furniture) {
            if (that.furniture != null) {
                for (var i in that.furniture) scene.remove(that.furniture[i]);
                that.furniture = null;
            }
            that.furniture = {};
            itemTween['furniture'] = {};
            itemStatus['furniture'] = {};
            _map = [];
            for (var i = 0; i < that.height; i++) {
                _map[i] = [];
                for (var j = 0; j < that.width; j++)
                    _map[i][j] = -1;
            }
            for (var i = 0, l = furniture.length; i < l; i++) {
                if (furniture[i] == null) continue;
                _loadCount++;
                createFurniture(i, furniture[i], scene, function (idx, mesh, tween) {
                    scene.add(mesh);
                    that.furniture[idx] = mesh;
                    itemStatus['furniture'][idx] = _Data.status.furniture.Closed;
                    itemTween['furniture'][idx] = tween;
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupStuff = function (scene, stuff) {
            if (that.stuff != null) {
                for (var i = 0, l = that.stuff.length; i < l; i++) scene.remove(that.stuff[i]);
                that.stuff = null;
            }
            that.stuff = [];
            if (stuff == null || stuff.length == 0) return;
            for (var i = 0, l = stuff.length; i < l; i++) {
                if (stuff[i] == null) continue;
                _loadCount++;
                createStuff(stuff[i], scene, function (mesh) {
                    scene.add(mesh);
                    that.stuff.push(mesh);
                    _loadCount--;
                    onLoaded();
                });
            }
        };

        var setupKey = function (scene) {
            if (that.key != null) {
                for (var i in that.key) scene.remove(that.key[i]);
                that.key = null;
            }
            that.key = {};
        };

        var onLoaded = function () {
            if (_loadCount > 0) return;
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

        var createGround = function (dat) {
            if (dat == null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.ground][id];


            var texture = getTexture(root + Data.files.path[Data.categoryName.ground] + para.texture[0]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = w / 4;
            texture.repeat.y = h / 4;

            var geometry = new THREE.PlaneGeometry(w, h, w, h);
            var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
            material.side = THREE.DoubleSide;
            mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = x;
            mesh.position.y = 0;
            mesh.position.z = y;
            mesh.rotation.x = -.5 * Math.PI;
            mesh.receiveShadow = true;
            return mesh;
        };

        var createWall = function (dat) {
            if (dat == null) return null;
            var id = dat.id;
            var r = dat.rotation - 2;
            var len = dat.len;
            var x = dat.left - that.width / 2;
            var y = dat.top - that.height / 2;
            var para = _modelData.items[Data.categoryName.wall][id];

            if ((r & 1) == 0) {
                x += len / 2;
            } else {
                y += len / 2;
            }
            //console.log(x, y, len, r);
            x *= GridSize;
            y *= GridSize;
            len *= GridSize;

            var texture = getTexture(root + Data.files.path[Data.categoryName.wall] + para.texture[1]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = len / 8;

            var geometry = new THREE.PlaneGeometry(len, 3 * GridSize, len, 3);
            var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
            material.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.rotation.y = (4 - r) / 2 * Math.PI;
            mesh.position.x = x;
            mesh.position.y = 1.5 * GridSize;
            mesh.position.z = y;
            return mesh;
        };

        var createWallTop = function (dat) {
            if (dat == null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.wall][id];

            var mesh = null;

            console.log(dat);
            console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            // top wall
            var texture = getTexture(root + Data.files.path[Data.categoryName.wall] + para.texture[0]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = w / 4;
            texture.repeat.y = h / 4;

            var geometry = new THREE.PlaneGeometry(w, h, w, h);
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
            return mesh;
        };

        var createFurniture = function (idx, dat, scene, onSuccess) {
            if (dat == null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.furniture][id];

            var mesh = null;

            console.log(dat);
            console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.furniture] + para.model, function (geometry, materials) {
                var mesh = null,
                    tweenNew = null;
                if (para.action == null) {
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
                            if (mesh.skeleton.bones[j].name == i) {
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

                mesh.castShadow = (para.blockSight==true);
                mesh.receiveShadow = true;

                mesh.position.x = x;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;

                for (var i = dat.top; i <= dat.bottom; i++) {
                    for (var j = dat.left; j <= dat.right; j++)
                        _map[i][j] = id;
                }

                onSuccess(idx, mesh, tweenNew);
            });
        };

        var createDoor = function (idx, dat, scene, onSuccess) {
            if (dat == null) return null;
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

            console.log(dat);
            console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.door] + para.model, function (geometry, materials) {
                var mesh = null,
                    tweenNew = null;
                if (para.action == null) {
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
                            if (mesh.skeleton.bones[j].name == i) {
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

                onSuccess(idx, mesh, tweenNew);
            });
        };

        var createStuff = function (dat, scene, onSuccess) {
            if (dat == null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;
            var para = _modelData.items[Data.categoryName.stuff][id];

            var mesh = null;


            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.stuff] + para.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = false;
                mesh.receiveShadow = true;

                mesh.position.x = x
                var furnitureId = _map[dat.top][dat.left];
                mesh.position.y = furnitureId == -1 ? 0 : _modelData.items[Data.categoryName.furniture][furnitureId].support * GridSize;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;

                console.log(dat);
                console.log(id, 'x:' + x, 'y:' + mesh.position.y, 'w:' + w, 'h:' + h, 'r:' + r);
                onSuccess(mesh);
            });
        };

        var createKey = function (dat, idx, scene, onSuccess) {
            var id = dat.id;

            var id = dat.id;
            var r = dat.rotation;

            var slot = _modelData.items[Data.categoryName.furniture][id].slot;
            var r1 = (((slot[1] >= 0) ? (slot[0] >= 0 ? 0 : 1) : (slot[0] >= 0 ? 3 : 2)) + r) % 4;
            var offset_x = (r1 == 0 || r1 == 3 ? 1 : -1) * Math.abs(((r & 1) == 0) ? slot[0] : slot[1]);
            var offset_y = (r1 == 0 || r1 == 1 ? 1 : -1) * Math.abs(((r & 1) == 0) ? slot[1] : slot[0]);

            var x = (dat.left + dat.right + 1 - that.width) / 2 * GridSize + offset_x * GridSize;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * GridSize + offset_y * GridSize;
            var z = slot[2] * GridSize;
            var w = (dat.right - dat.left + 1) * GridSize;
            var h = (dat.bottom - dat.top + 1) * GridSize;

            var para_Key = _modelData.items[Data.categoryName.stuff][_Data.keyData];

            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.stuff] + para_Key.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = false;
                mesh.receiveShadow = true;

                mesh.position.x = x;
                mesh.position.y = z;
                mesh.position.z = y;

                console.log(dat);
                console.log(id, 'x:' + x, 'y:' + mesh.position.y, 'w:' + w, 'h:' + h, 'r:' + r);
                onSuccess(idx, mesh);
            });
        };

        var removeKey = function (idx, scene, onSuccess) {
            scene.remove(that.key[idx]);
            onSuccess(idx);
        };


        var getTexture = function (path) {
            return THREE.ImageUtils.loadTexture(path);
            if (_texture[path] == null) _texture[path] = THREE.ImageUtils.loadTexture(path);
            return _texture[path];
        };

        // Update items ----------------------------------------------------------
        var updateFuniture = function () {
            // update furniture
            for (var i in gameData.furniture) {
                if (gameData.furniture[i].status != itemStatus['furniture'][i] && itemStatus['furniture'][i] != null) {
                    itemStatus['furniture'][i] = gameData.furniture[i].status;
                    if (itemTween['furniture'] != null && itemTween['furniture'][i] != null) {
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
                if (itemStatus['door'][i] != null) {
                    if (gameData.door[i].status != itemStatus['door'][i]) {
                        itemStatus['door'][i] = gameData.door[i].status;
                        if (itemTween['door'] != null && itemTween['door'][i] != null) {
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
                    else if (gameData.door[i].failedOpen) {
                        createSprite(_Data.prefix_door + i, itemData['door'][i].x, itemData['door'][i].y, 'lock');
                        gameData.door[i].failedOpen = false;
                    }
                }
            }
        };

        var updateKey = function () {
            // update key
            if (_mapData == null) return;
            for (var i in that.key) {
                if (gameData.key.hasOwnProperty(i) && gameData.key[i] != null && gameData.key[i].available == true) continue;
                if (that.key[i] == null) continue;
                removeKey(i, _scene, function (idx) {
                    delete that.key[idx];
                });
            }

            for (var i in gameData.key) {
                if (that.key.hasOwnProperty(i) || gameData.key[i].available == false) continue;
                that.key[i] = null;
                var key = gameData.key[i];
                createKey(_mapData.item.furniture[key.furnitureId], i, _scene, function (idx, mesh) {
                    _scene.add(mesh);
                    that.key[idx] = mesh;
                });
            }
        };

        var createSprite = function (id, x, y, texId) {
            if (_sprite.hasOwnProperty(id)) return;
            var mat = new THREE.SpriteMaterial({ map: _tex[texId] });
            var spr = new THREE.Sprite(mat);
            spr.position.set(x, 2.1 * GridSize, y);
            spr.scale.set(3, 3, 1.0); // imageWidth, imageHeight
            _scene.add(spr);
            _sprite[id] = spr;
            mat.opacity = 0;
            var last = 0;
            var tween1 = new TWEEN.Tween({ t: 0 }).to({ t: 10 }, 100)
                        .onStart(function () {
                            last = 0;
                        }).onUpdate(function () {
                            mat.opacity = this.t * 10;
                            last = this.t;
                        });
            var tween2 = new TWEEN.Tween({ t: 100 }).to({ t: 0 }, 1200).easing(TWEEN.Easing.Quadratic.In)
                        .onStart(function () {
                            last = 100;
                        }).onUpdate(function () {
                            mat.opacity = this.t;
                            last = this.t;
                        }).onStop(function () {
                            delete _sprite[id];
                            _scene.remove(spr);
                        }).onComplete(function () {
                            delete _sprite[id];
                            _scene.remove(spr);
                        });
            tween1.chain(tween2);
            tween1.start();
        };

        var createEndPos = function (dat) {
            if (that.posEnd != null) return;
            that.posEnd = [];
            var mat = new THREE.SpriteMaterial({ map: _tex['end'] });
            for (var i = 0; i < dat.length; i++) {
                var spr = new THREE.Sprite(mat);
                spr.position.set((dat[i][0] - that.width / 2 + 0.5) * GridSize, 1 * GridSize, (dat[i][1] - that.height / 2 + 0.5) * GridSize);
                spr.scale.set(4, 4, 1.0); // imageWidth, imageHeight
                _scene.add(spr);
                that.posEnd[i]=spr;
            }
        };

        // Setup ----------------------------------------------------------
        var _setupTex = function () {
            _tex = {};
            var textureLoader = new THREE.TextureLoader();
            _tex['lock'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_locked.png');
            _tex['end'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'Sprite_EndPos.png');
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