window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Setup map, including light, wall and other stuff
 */
(function (RENDERER) {
    var Data = RENDERER.Data;

    /**
     * Create walls, desks, chairs and doors
     */
    var SetupWall = function (scene) {
        var ground, ceiling, walls;

        /*create ground*/
        var planeGeometry = new THREE.PlaneGeometry(100, 100, 100);
        var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
        ground = new THREE.Mesh(planeGeometry, planeMaterial);
        ground.rotation.x = -.5 * Math.PI;
        ground.receiveShadow = true;
        scene.add(ground);

        /*create ceiling*/
        var planeGeometry = new THREE.PlaneGeometry(100, 100, 100);
        var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
        ceiling = new THREE.Mesh(planeGeometry, planeMaterial);
        ceiling.rotation.x = .5 * Math.PI;
        ceiling.position.y = 7.5;
        scene.add(ceiling);

        /*add wall*/
        walls = [];
        var createWall = function (z, x, len, wid, rotate, deep) {
            var cubeGeometry = new THREE.BoxGeometry(len, deep || 8, wid);
            var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

            cube.rotation.y = rotate / 180 * Math.PI;
            cube.position.x = x;
            cube.position.y = 3.5;
            cube.position.z = z
            cube.castShadow = true;
            cube.receiveShadow = true;
            scene.add(cube);

            walls.push(cube);

            var cubeGeometry2 = new THREE.BoxGeometry(len, 1, wid);
            var cubeMaterial2 = new THREE.MeshBasicMaterial({ color: 0x333333 });
            var cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2);

            cube2.rotation.y = rotate / 180 * Math.PI;
            cube2.position.x = x;
            cube2.position.y = 8;
            cube2.position.z = z
            scene.add(cube2);

            walls.push(cube2);
        }
        createWall(0, 10, 20, 2, 90);
        createWall(11, 7, 8, 2, 0);
        createWall(4, 4, 12, 2, 90);
        createWall(-11, 3, 16, 2, 0);
        createWall(-3, 0, 10, 2, 0);

        return {
            ground: ground,
            wall: walls
        };
    };





    /**
     * Create items
     */
    var SetupItem = function (scene) {

    };
    
    /**
     * Create game map
     */
    var SetupMap = function (entity, mapData) {
        var wall = SetupWall(entity.env.scene);
        var light = SetupLight(entity.env.scene);
        var item = SetupItem(entity.env.scene);

        return {
            light: light,
            wall: wall,
            item: item
        };
    };


    var Map = function (entity) {
        // private data ----------------------------
        var that = this;

        // public data -----------------------------
        this.wall = null;
        this.light = null;
        this.item = null;
        this.ground = null;

        // public method ---------------------------
        /**
         * Reset map with given data
         */
        this.reset = function (data) {
            if (data == null) throw new Error('Data missing');
            setupGround(entity.env.scene, data.grid);
            setupWall(entity.env.scene, data.wall, data.stuff);
            setupItem(entity.env.scene, data.item);
        };

        // private method

        var setupLight = function (scene) {
            if (that.light != null) {
                for (var i = 0, l = that.light.length; i < l; i++) scene.remove(that.light[i]);
                that.light = null;
            }

            that.lights = [
                new THREE.AmbientLight(),
                new THREE.SpotLight()
            ];

            var lightTarget = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff3300 }));
            scene.add(lightTarget);

            // Ambient
            that.lights[0].color.setHex(Data.light.ambient.ambColor);
            scene.add(that.lights[0]);

            // Spot
            that.lights[1].castShadow = true;
            that.lights[1].position.set(Data.light.spot.lightX, Data.light.spot.lightY, Data.light.spot.lightZ);
            that.lights[1].intensity = Data.light.spot.intensity;
            that.lights[1].shadowCameraNear = Data.light.spot.shadowCameraNear;
            that.lights[1].shadowCameraFar = Data.light.spot.shadowCameraFar;
            that.lights[1].shadowCameraVisible = Data.light.spot.shadowCameraVisible;
            that.lights[1].shadowBias = Data.light.spot.shadowBias;
            that.lights[1].shadowDarkness = Data.light.spot.shadowDarkness;
            scene.add(that.lights[1]);
        };

        var setupGround = function (scene, grid) {
            if (that.ground != null) {
                for (var i = 0, l = that.ground.length; i < l; i++) scene.remove(that.ground[i]);
                that.ground = null;
            }

            /*create ground*/
            var planeGeometry = new THREE.PlaneGeometry(grid.width * Data.grid.size, grid.height * Data.grid.size);
            var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
            var ground = new THREE.Mesh(planeGeometry, planeMaterial);
            ground.rotation.x = -.5 * Math.PI;
            ground.receiveShadow = true;
            scene.add(ground);

            /*create ceiling*/
            var planeGeometry = new THREE.PlaneGeometry(grid.width * Data.grid.size, grid.height * Data.grid.size);
            var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
            var ceiling = new THREE.Mesh(planeGeometry, planeMaterial);
            ceiling.rotation.x = .5 * Math.PI;
            ceiling.position.y = 7.5;
            scene.add(ceiling);

            that.ground = [
                ground,
                ceiling
            ];
        };

        var setupWall = function (scene, wall, stuff) {
            if (that.wall != null) {
                for (var i = 0, l = that.wall.length; i < l; i++) scene.remove(that.wall[i]);
                that.wall = null;
            }
        };

        var setupItem = function (item) {
            if (that.item != null) {
                for (var i = 0, l = that.item.length; i < l; i++) scene.remove(that.item[i]);
                that.item = null;
            }
            if (item == null || item.length == 0) return;
        };

        // Add stuff
        var addWall = function (x, y, rotation, len) {

        };

        var addStyff = function (dat) {

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