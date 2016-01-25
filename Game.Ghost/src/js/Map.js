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
            new THREE.DirectionalLight()
        ];

        var lightTarget = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff3300 }));
        scene.add(lightTarget);

        var lightData = new function () {
            /*ambient light values*/
            this.ambColor = 0xdddddd;

            /*directional light values*/
            this.dirColor = 0x555555;
            this.lightXD = 20;
            this.lightYD = 35;
            this.lightZD = 40;
            this.intensityD = 1;
            this.shadowCameraNearD = 0;
            this.shadowCameraFarD = 75;
            this.shadowLeft = -5;
            this.shadowRight = 5;
            this.shadowTop = 5;
            this.shadowBottom = -5;
            this.shadowCameraVisibleD = false;
            this.shadowMapWidthD = 2056;
            this.shadowMapHeightD = 2056;
            this.shadowBiasD = 0.00;
            this.shadowDarknessD = 0.5;
            this.targetD = lightTarget;
        }

        // Ambient
        lights[0].color.setHex(lightData.ambColor);
        scene.add(lights[0]);

        // Directional
        lights[1].color.setHex(lightData.dirColor);
        lights[1].castShadow = true;
        lights[1].position.set(lightData.lightXD, lightData.lightYD, lightData.lightZD);
        lights[1].intensity = lightData.intensityD;
        lights[1].distance = lightData.distanceD;
        lights[1].angle = lightData.angleD;
        lights[1].exponent = lightData.exponentD;
        lights[1].shadowCameraNear = lightData.shadowCameraNearD;
        lights[1].shadowCameraFar = lightData.shadowCameraFarD;
        lights[1].shadowCameraFov = lightData.shadowCameraFovD;
        lights[1].shadowCameraLeft = lightData.shadowLeft;
        lights[1].shadowCameraRight = lightData.shadowRight;
        lights[1].shadowCameraTop = lightData.shadowTop;
        lights[1].shadowCameraBottom = lightData.shadowBottom;
        lights[1].shadowBias = lightData.shadowBiasD;
        lights[1].shadowDarkness = lightData.shadowDarknessD;
        lights[1].shadowMapWidth = lightData.shadowMapWidthD;
        lights[1].shadowMapHeight = lightData.shadowMapHeightD;
        scene.add(lights[1]);

        return lights;
    };

    /**
     * Create walls, desks, chairs and doors
     */
    var SetupWall = function (scene) {
        var plane, walls;

        /*create plane*/
        var planeGeometry = new THREE.PlaneGeometry(100, 100, 100);
        var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -.5 * Math.PI;
        plane.receiveShadow = true;
        scene.add(plane);

        /*add wall*/
        walls = [];
        var createWall = function (z, x, len, wid, rotate, deep) {
            var cubeGeometry = new THREE.BoxGeometry(len, deep || 6, wid);
            var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xbb44bb });
            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

            cube.rotation.y = rotate / 180 * Math.PI;
            cube.position.x = x;
            cube.position.y = 2;
            cube.position.z = z
            cube.castShadow = true;
            cube.receiveShadow = true;
            scene.add(cube);

            walls.push(cube);
        }
        createWall(0, 10, 20, 2, 90);
        createWall(11, 7, 8, 2, 0);
        createWall(4, 4, 12, 2, 90);
        createWall(-11, 3, 16, 2, 0);
        createWall(-3, 0, 10, 2, 0);

        return {
            plane: plane,
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