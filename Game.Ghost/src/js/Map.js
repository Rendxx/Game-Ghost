window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};

/**
 * Map creator
 */
(function (GAME) {
    /**
     * Create lights
     */
    var SetupLight = function (scene) {
        var lights = [
            new THREE.AmbientLight(),
            new THREE.SpotLight()
        ];

        var lightTarget = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff3300 }));
        scene.add(lightTarget);

        var lightData = new function () {
            /*ambient light values*/
            this.ambColor = 0x000000;

            /*spot light values*/
            this.lightX = 20;
            this.lightY = 5;
            this.lightZ = 40;
            this.intensity = 1;
            this.distance = 80;
            this.angle = 1.570;
            this.exponent = 0;
            this.shadowCameraNear = 10;
            this.shadowCameraFar = 80;
            this.shadowCameraFov = 50;
            this.shadowCameraVisible = false;
            this.shadowMapWidth = 2056;
            this.shadowMapHeight = 2056;
            this.shadowBias = 0.00;
            this.shadowDarkness = 1;
            this.target = lightTarget;
        }

        // Ambient
        lights[0].color.setHex(lightData.ambColor);
        scene.add(lights[0]);

        // Spot
        lights[1].castShadow = true;
        lights[1].position.set(lightData.lightX, lightData.lightY, lightData.lightZ);
        lights[1].intensity = lightData.intensity;
        lights[1].shadowCameraNear = lightData.shadowCameraNear;
        lights[1].shadowCameraFar = lightData.shadowCameraFar;
        lights[1].shadowCameraVisible = lightData.shadowCameraVisible;
        lights[1].shadowBias = lightData.shadowBias;
        lights[1].shadowDarkness = lightData.shadowDarkness;
        scene.add(lights[1]);
        return lights;
    };

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

    /**
     * Create game map
     * @param {game entity} entity - Game entity
     * @param {object} mapData - data used to setup a map
     */
    GAME.SetupMap = SetupMap;
})(window.Rendxx.Game.Ghost);