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
            _modelData = null,
            _texture = {},
            _map = null;     // map

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

        // public method ---------------------------
        /**
         * Reset map with given data
         */
        this.reset = function (data) {
            if (data == null) throw new Error('Data missing');
            setupGround(entity.env.scene, data.grid, data.item.ground);
            setupWall(entity.env.scene, data.wall, data.item.wall);
            setupDoor(entity.env.scene, data.item.door);
            setupFurniture(entity.env.scene, data.item.furniture);
            setupStuff(entity.env.scene, data.item.stuff);
        };

        /**
         * Load model data
         */
        this.loadModelData = function (data) {
            _modelData = data;
        };

        // update data from system
        this.update = function () {

        };

        // render model
        this.render = function () {
            for (var i = 0, l = that.ground.length; i < l; i++) that.ground[i].material.needsUpdate = true;
            for (var i = 0, l = that.ceiling.length; i < l; i++) that.ceiling[i].material.needsUpdate = true;
            for (var i = 0, l = that.wall.length; i < l; i++) that.wall[i].material.needsUpdate = true;
            for (var i = 0, l = that.wallTop.length; i < l; i++) that.wallTop[i].material.needsUpdate = true;
            for (var i = 0, l = that.door.length; i < l; i++) that.door[i].material.needsUpdate = true;
            for (var i = 0, l = that.furniture.length; i < l; i++) that.furniture[i].material.needsUpdate = true;
            for (var i = 0, l = that.stuff.length; i < l; i++) that.stuff[i].material.needsUpdate = true;
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

            var lightTarget = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff3300 }));
            scene.add(lightTarget);

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
                for (var i = 0, l = that.door.length; i < l; i++) scene.remove(that.door[i]);
                that.door = null;
            }
            that.door = [];
            for (var i = 0, l = doors.length; i < l; i++) {
                if (doors[i] == null) continue;
                createDoor(doors[i], scene, function (mesh) {
                    scene.add(mesh);
                    that.door.push(mesh);
                });
            }
        };

        var setupFurniture = function (scene, furniture) {
            if (that.furniture != null) {
                for (var i = 0, l = that.furniture.length; i < l; i++) scene.remove(that.furniture[i]);
                that.furniture = null;
            }
            that.furniture = [];
            _map = [];
            for (var i = 0; i < that.height; i++){
                _map[i] = [];
                for (var j = 0; j < that.width; j++)
                    _map[i][j] = -1;
            }
            for (var i = 0, l = furniture.length; i < l; i++) {
                if (furniture[i] == null) continue;
                createFurniture(furniture[i], scene, function (mesh) {
                    scene.add(mesh);
                    that.furniture.push(mesh);
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

        // Add items ----------------------------------------------------------
        var createCeiling = function (grid) {
            var planeGeometry = new THREE.PlaneGeometry(grid.width * Data.grid.size, grid.height * Data.grid.size);
            var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
            var ceiling = new THREE.Mesh(planeGeometry, planeMaterial);
            ceiling.rotation.x = .5 * Math.PI;
            ceiling.position.y = 2 * Data.grid.size;
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

            
            var texture = getTexture(Data.files.path[Data.categoryName.ground] + para.texture[0]);
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

            var texture = getTexture(Data.files.path[Data.categoryName.wall] + para.texture[1]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = len/8;

            var geometry = new THREE.PlaneGeometry(len, 2 * Data.grid.size, len, 2);
            var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
            material.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.rotation.y = (4-r) / 2 * Math.PI;
            mesh.position.x = x;
            mesh.position.y = Data.grid.size;
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
            var texture = getTexture(Data.files.path[Data.categoryName.wall] + para.texture[0]);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.x = w / 4;
            texture.repeat.y = h / 4;

            var geometry = new THREE.PlaneGeometry(w, h, w, h);
            var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, map: texture });
            material.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = x;
            mesh.position.y = 2 * Data.grid.size;
            mesh.position.z = y;
            //mesh.rotation.y = r / 180 * Math.PI;
            mesh.rotation.x = -.5 * Math.PI;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };

        var createFurniture = function (dat, scene, onSuccess) {
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
            loader.load(Data.files.path[Data.categoryName.furniture] + para.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                mesh.position.x = x;
                //mesh.position.y = depth/2;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;
                
                for (var i = dat.top; i <= dat.bottom; i++) {
                    for (var j = dat.left; j <= dat.right; j++)
                        _map[i][j] = id;
                }

                onSuccess(mesh);
            });
        };

        var createDoor = function (dat, scene, onSuccess) {
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
            loader.load(Data.files.path[Data.categoryName.door] + para.model, function (geometry, materials) {
                var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                mesh.position.x = x;
                //mesh.position.y = depth/2;
                mesh.position.z = y;
                mesh.rotation.y = (4 - r) / 2 * Math.PI;

                onSuccess(mesh);
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
            loader.load(Data.files.path[Data.categoryName.stuff] + para.model, function (geometry, materials) {
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
        var getTexture = function (path) {
            return THREE.ImageUtils.loadTexture(path);
            if (_texture[path] == null) _texture[path] = THREE.ImageUtils.loadTexture(path);
            return _texture[path];
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