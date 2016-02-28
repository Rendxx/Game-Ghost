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

    var Map = function (entity) {
        // private data ----------------------------
        var that = this,
            _modelData = null;

        // public data -----------------------------
        this.width = 0;
        this.height = 0;
        this.wall = null;
        this.light = null;
        this.item = null;
        this.ground = null;
        this.ceiling = null;

        // public method ---------------------------
        /**
         * Reset map with given data
         */
        this.reset = function (data) {
            if (data == null) throw new Error('Data missing');
            setupGround(entity.env.scene, data.grid, data.item.ground);
            setupWall(entity.env.scene, data.item.wall);
            setupFurniture(entity.env.scene, data.item.furniture);
        };

        /**
         * Load model data
         */
        this.loadModelData = function (data) {
            _modelData = data;
        };

        // private method ---------------------------

        var setupLight = function (scene) {
            if (that.light != null) {
                for (var i = 0, l = that.light.length; i < l; i++) scene.remove(that.light[i]);
                that.light = null;
            }

            that.light = [
                new THREE.AmbientLight(),
                new THREE.SpotLight()
            ];

            var lightTarget = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff3300 }));
            scene.add(lightTarget);

            // Ambient
            that.light[0].color.setHex(Data.light.ambient.ambColor);
            scene.add(that.light[0]);

            // Spot
            that.light[1].castShadow = true;
            that.light[1].position.set(Data.light.spot.lightX, Data.light.spot.lightY, Data.light.spot.lightZ);
            that.light[1].intensity = Data.light.spot.intensity;
            that.light[1].shadowCameraNear = Data.light.spot.shadowCameraNear;
            that.light[1].shadowCameraFar = Data.light.spot.shadowCameraFar;
            that.light[1].shadowCameraVisible = Data.light.spot.shadowCameraVisible;
            that.light[1].shadowBias = Data.light.spot.shadowBias;
            that.light[1].shadowDarkness = Data.light.spot.shadowDarkness;
            scene.add(that.light[1]);
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
            var ceiling = createCeiling();
            scene.add(ceiling);
            that.ceiling.push(ceiling);
        };

        var setupWall = function (scene, wall) {
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
        };

        var setupFurniture = function (scene, stuff) {
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
            for (var i = 0, l = stuff.length; i < l; i++) {
                if (stuff[i] == null) continue;
                var mesh = createFurniture(stuff[i], scene);
            }
        };

        var setupItem = function (scene, item) {
            if (that.item != null) {
                for (var i = 0, l = that.item.length; i < l; i++) scene.remove(that.item[i]);
                that.item = null;
            }
            if (item == null || item.length == 0) return;
            that.item = [];
            for (var i = 0, l = item.length; i < l; i++) {
                if (item[i] == null) continue;
                var mesh = createItem(item[i]);
                scene.add(mesh);
                that.item.push(mesh);
            }
        };

        // Add items ----------------------------------------------------------
        var createCeiling = function () {
            var planeGeometry = new THREE.PlaneGeometry(grid.width * Data.grid.size, grid.height * Data.grid.size);
            var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
            var ceiling = new THREE.Mesh(planeGeometry, planeMaterial);
            ceiling.rotation.x = .5 * Math.PI;
            ceiling.position.y = 2 * Data.grid.size;
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

            
            var texture = THREE.ImageUtils.loadTexture(para.texture[0]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = w / 4;
            texture.repeat.y = h / 4;

            var geometry = new THREE.PlaneGeometry(w, h, w, h);
            var material = new THREE.MeshBasicMaterial({ color: 0xeeeeee, map: texture });
            material.side = THREE.DoubleSide;
            mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = x;
            mesh.position.y = 2 * Data.grid.size;
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

            var texture = THREE.ImageUtils.loadTexture(para.texture[0]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = len/8;

            var geometry = new THREE.PlaneGeometry(len, 2 * Data.grid.size, len, 2);
            var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
            material.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh(geometry, material);

            mesh.rotation.y = (4-r) / 2 * Math.PI;
            mesh.position.x = x;
            mesh.position.y = Data.grid.size;
            mesh.position.z = y
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };

        var createFurniture = function (dat, scene) {
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
            loader.load(para.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                mesh.position.x = x;
                //mesh.position.y = depth/2;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;

                scene.add(mesh);
                that.wall.push(mesh);
            });


            //switch (dat.id) {
            //    case 1: // wall top
            //        var texture = THREE.ImageUtils.loadTexture('/Model/wall-top.png');
            //        texture.wrapS = THREE.RepeatWrapping;
            //        texture.wrapT = THREE.RepeatWrapping;
            //        texture.repeat.x = w / 4;
            //        texture.repeat.y = h / 4;

            //        var geometry = new THREE.PlaneGeometry(w,h,w,h);
            //        var material = new THREE.MeshBasicMaterial({ color: 0xeeeeee, map: texture });
            //        material.side = THREE.DoubleSide;
            //        mesh = new THREE.Mesh(geometry, material);

            //        mesh.position.x = x;
            //        mesh.position.y = 2 * Data.grid.size;
            //        mesh.position.z = y;
            //        //mesh.rotation.y = r / 180 * Math.PI;
            //        mesh.rotation.x = -.5 * Math.PI;
            //        break;
            //    case 2: // door
            //        var manager = new THREE.LoadingManager();
            //        manager.onProgress = function (item, loaded, total) {
            //            console.log(item, loaded, total);
            //        };
            //        var onProgress = function (xhr) {
            //            if (xhr.lengthComputable) {
            //                var percentComplete = xhr.loaded / xhr.total * 100;
            //                console.log(Math.round(percentComplete, 2) + '% downloaded');
            //            }
            //        };
            //        var onError = function (xhr) {
            //        };

            //        var texture = {
            //            'DoorMat': new THREE.Texture(),
            //            'LockerMat': new THREE.Texture(),
            //        };
            //        var loader = new THREE.ImageLoader(manager);
            //        loader.load('/Model/wood-2.jpg', function (image) {
            //            texture['DoorMat'].image = image;
            //            texture['DoorMat'].needsUpdate = true;
            //            texture['DoorMat'].wrapS = texture['DoorMat'].wrapT = THREE.RepeatWrapping;
            //        });
            //        var loader = new THREE.ImageLoader(manager);
            //        loader.load('/Model/steel.jpg', function (image) {
            //            texture['LockerMat'].image = image;
            //            texture['LockerMat'].needsUpdate = true;
            //            texture['LockerMat'].wrapS = texture['LockerMat'].wrapT = THREE.RepeatWrapping;
            //        });

            //        var loader = new THREE.OBJLoader();
            //        loader.load('/Model/door.obj', function (object) {
            //            object.traverse(function (child) {
            //                if (child instanceof THREE.Mesh) {
            //                    child.material.map = texture[child.material.name];
            //                }
            //            });
            //            object.position.x = x;
            //            object.position.z = y;
            //            object.rotation.y = (4 - r) / 2 * Math.PI;
            //            scene.add(object);
            //            that.wall.push(object);
            //        }, onProgress, onError);
            //        return;
            //    case 3: // table 1
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/table.1.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 4: // table 2
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/table.2.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 5: // table 3
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/table.3.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 6: // table 4
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/table.4.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 7: // cabinet 1
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/cabinet.1.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 8: // cabinet 2
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/cabinet.2.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 9: // cabinet 3
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/cabinet.3.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 10: // chair
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/chair.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //    case 11: // shelf
            //        var loader = new THREE.JSONLoader();
            //        loader.load('/Model/shelf.json', function (geometry, materials) {
            //            var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //            mesh.castShadow = true;
            //            mesh.receiveShadow = true;

            //            mesh.position.x = x;
            //            //mesh.position.y = depth/2;
            //            mesh.position.z = y;
            //            mesh.rotation.y = (4 - r) / 2 * Math.PI;

            //            scene.add(mesh);
            //            that.wall.push(mesh);
            //        });
            //        return;
            //}
            if (mesh != null) {
                scene.add(mesh);
                that.wall.push(mesh);
            }
            return mesh;
        };

        var _init = function () {
            setupLight(entity.env.scene);
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