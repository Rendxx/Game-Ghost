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
     * Create lights
     */
    var SetupLight = function (scene) {
        var lights = [
            new THREE.AmbientLight(),
            new THREE.SpotLight()
        ];

        var lightTarget = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff3300 }));
        scene.add(lightTarget);

        // Ambient
        lights[0].color.setHex(Data.light.ambient.ambColor);
        scene.add(lights[0]);

        // Spot
        lights[1].castShadow = true;
        lights[1].position.set(Data.light.spot.lightX, Data.light.spot.lightY, Data.light.spot.lightZ);
        lights[1].intensity = Data.light.spot.intensity;
        lights[1].shadowCameraNear = Data.light.spot.shadowCameraNear;
        lights[1].shadowCameraFar = Data.light.spot.shadowCameraFar;
        lights[1].shadowCameraVisible = Data.light.spot.shadowCameraVisible;
        lights[1].shadowBias = Data.light.spot.shadowBias;
        lights[1].shadowDarkness = Data.light.spot.shadowDarkness;
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
     * Game map
     * @param {game entity} entity - Game entity
     * @param {object} mapData - data used to setup a map
     */
    RENDERER.Map = Map;
})(window.Rendxx.Game.Ghost.Renderer);