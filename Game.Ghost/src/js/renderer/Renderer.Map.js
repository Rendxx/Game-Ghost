﻿window.Rendxx = window.Rendxx || {};
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
            _modelData = null,
            _mapData = null,
            _texture = {},
            _map = null,     // map
            gameData = null,
            itemTween = null,
            itemStatus = null,
            root = entity.root,
            _scene = entity.env.scene;

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
        this.key = null;        // key objects: funiture id: key object

        // public method ---------------------------
        /**
         * Reset map with given data
         */
        this.reset = function (data) {
            if (data == null) throw new Error('Data missing');
            _mapData = data;
            itemTween = {};
            itemStatus = {};
            setupGround(_scene, data.grid, data.item.ground);
            setupWall(_scene, data.wall, data.item.wall);
            setupDoor(_scene, data.item.door);
            setupFurniture(_scene, data.item.furniture);
            setupStuff(_scene, data.item.stuff);
            setupKey(_scene);
        };

        /**
         * Load model data
         */
        this.loadModelData = function (data) {
            _modelData = data;
        };

        // update data from system
        this.update = function (data_in) {
            gameData = data_in;

            // update key
            if (_mapData == null) return;
            for (var i in that.key) {
                if (gameData.dynamicData.key.hasOwnProperty(i) && gameData.dynamicData.key[i] != null && gameData.dynamicData.key[i].available == true) continue;
                if (that.key[i] == null) continue;
                removeKey(i, _scene, function (idx) {
                    delete that.key[idx];
                });
            }

            for (var i in gameData.dynamicData.key) {
                if (that.key.hasOwnProperty(i) || gameData.dynamicData.key[i].available == false) continue;
                that.key[i] = null;
                var key = gameData.dynamicData.key[i];
                createKey(_mapData.item.furniture[key.furnitureId], i, _scene, function (idx, mesh) {
                    _scene.add(mesh);
                    that.key[idx] = mesh;
                });
            }

            // update furniture
            for (var i in gameData.dynamicData.furniture) {
                if (gameData.dynamicData.furniture[i].status != itemStatus['furniture'][i] && itemStatus['furniture'][i]!=null) {
                    itemStatus['furniture'][i] = gameData.dynamicData.furniture[i].status;
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

            // update door
            for (var i in gameData.dynamicData.door) {
                if (gameData.dynamicData.door[i].status != itemStatus['door'][i] && itemStatus['door'][i] != null) {
                    itemStatus['door'][i] = gameData.dynamicData.door[i].status;
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
            }
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
            for (var i in that.key){
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
            for (var i = 0, l = doors.length; i < l; i++) {
                if (doors[i] == null) continue;
                createDoor(i, doors[i], scene, function (idx, mesh, tween) {
                    scene.add(mesh);
                    that.door[idx] = mesh;
                    itemStatus['door'][idx] = _Data.status.door.Closed;
                    itemTween['door'][idx] = tween;
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
            for (var i = 0; i < that.height; i++){
                _map[i] = [];
                for (var j = 0; j < that.width; j++)
                    _map[i][j] = -1;
            }
            for (var i = 0, l = furniture.length; i < l; i++) {
                if (furniture[i] == null) continue;
                createFurniture(i, furniture[i], scene, function (idx, mesh, tween) {
                    scene.add(mesh);
                    that.furniture[idx] = mesh;
                    itemStatus['furniture'][idx] = _Data.status.furniture.Closed;
                    itemTween['furniture'][idx] = tween;
                });
            }
        };

        var setupStuff = function (scene, stuff) {
            if (that.stuff != null) {
                for (var i = 0, l = that.stuff.length; i < l; i++) scene.remove(that.stuff[i]);
                that.stuff = null;
            }
            if (stuff == null || stuff.length == 0) return;
            that.stuff = [];
            for (var i = 0, l = stuff.length; i < l; i++) {
                if (stuff[i] == null) continue;
                createStuff(stuff[i], scene, function (mesh) {
                    scene.add(mesh);
                    that.stuff.push(mesh);
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

        // Add items ----------------------------------------------------------
        var createCeiling = function (grid) {
            var planeGeometry = new THREE.PlaneGeometry(grid.width * Data.grid.size, grid.height * Data.grid.size);
            var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
            var ceiling = new THREE.Mesh(planeGeometry, planeMaterial);
            ceiling.rotation.x = .5 * Math.PI;
            ceiling.position.y = 3* Data.grid.size;
            ceiling.castShadow = true;
            ceiling.receiveShadow = true;
            return ceiling;
        };

        var createGround = function (dat) {
            if (dat == null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * Data.grid.size;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * Data.grid.size;
            var w = (dat.right - dat.left + 1) * Data.grid.size;
            var h = (dat.bottom - dat.top + 1) * Data.grid.size;
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
            var x = dat.left - that.width/2;
            var y = dat.top - that.height / 2;
            var para = _modelData.items[Data.categoryName.wall][id];

            if ((r & 1) == 0) {
                x += len / 2;
            } else {
                y += len / 2;
            }
            //console.log(x, y, len, r);
            x *= Data.grid.size;
            y *= Data.grid.size;
            len *= Data.grid.size;

            var texture = getTexture(root + Data.files.path[Data.categoryName.wall] + para.texture[1]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = len/8;

            var geometry = new THREE.PlaneGeometry(len, 3 * Data.grid.size, len, 3);
            var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
            material.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.rotation.y = (4-r) / 2 * Math.PI;
            mesh.position.x = x;
            mesh.position.y = 1.5*Data.grid.size;
            mesh.position.z = y;
            return mesh;
        };

        var createWallTop = function (dat) {
            if (dat == null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * Data.grid.size;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * Data.grid.size;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * Data.grid.size;
            var h = (dat.bottom - dat.top + 1) * Data.grid.size;
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
            mesh.position.y = 3 * Data.grid.size;
            mesh.position.z = y;
            //mesh.rotation.y = r / 180 * Math.PI;
            mesh.rotation.x = -.5 * Math.PI;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };

        var createFurniture = function (idx, dat, scene, onSuccess) {
            if (dat == null) return null;
            var id = dat.id;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * Data.grid.size;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * Data.grid.size;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * Data.grid.size;
            var h = (dat.bottom - dat.top + 1) * Data.grid.size;
            var para = _modelData.items[Data.categoryName.furniture][id];

            var mesh = null;

            console.log(dat);
            console.log(id, 'x:' + x, 'y:' + y, 'w:' + w, 'h:' + h, 'r:' + r);

            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.furniture] + para.model, function (geometry, materials) {
                var mesh = null,
                    tweenNew = null;
                if (para.action==null) {
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
            var x = (dat.left + dat.right + 1 - that.width) / 2 * Data.grid.size;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * Data.grid.size;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * Data.grid.size;
            var h = (dat.bottom - dat.top + 1) * Data.grid.size;
            var para = _modelData.items[Data.categoryName.door][id];

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
            var x = (dat.left + dat.right + 1 - that.width) / 2 * Data.grid.size;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * Data.grid.size;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * Data.grid.size;
            var h = (dat.bottom - dat.top + 1) * Data.grid.size;
            var para = _modelData.items[Data.categoryName.stuff][id];

            var mesh = null;


            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.stuff] + para.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                mesh.position.x = x
                var furnitureId = _map[dat.top][dat.left];
                mesh.position.y = furnitureId == -1 ? 0 : _modelData.items[Data.categoryName.furniture][furnitureId].support * Data.grid.size;
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
            var slot = _modelData.items[Data.categoryName.furniture][id].slot;
            var x = (dat.left + dat.right + 1 - that.width) / 2 * Data.grid.size + slot[0] * Data.grid.size;
            var y = (dat.top + dat.bottom + 1 - that.height) / 2 * Data.grid.size + slot[1] * Data.grid.size;
            var z = slot[2] * Data.grid.size;
            var r = dat.rotation;
            var w = (dat.right - dat.left + 1) * Data.grid.size;
            var h = (dat.bottom - dat.top + 1) * Data.grid.size;

            var para_Key = _modelData.items[Data.categoryName.stuff][_Data.keyData];

            var loader = new THREE.JSONLoader();
            loader.load(root + Data.files.path[Data.categoryName.stuff] + para_Key.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = true;
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

        var _init = function () {
            setupLight(_scene);
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