$(function () {
    var cameraControl, stats, datGUI;

    // game -----------------------------------------------------
    var game = window.Rendxx.Game.Ghost.Create(document.getElementById('game-container'), 5, null);
    game.onRender = function () {
        cameraControl.update();
        stats.update();
    };

    // test -----------------------------------------------------
    // camera control
    cameraControl = new THREE.OrbitControls(game.env.camera, game.env.renderer.domElement);

    // status track
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById('game-container').appendChild(stats.domElement);

    // dat-gui
    var guiControls = new function () {
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
    }

    datGUI = new dat.GUI();
    /*ambient light controls*/
    var ambFolder = datGUI.addFolder('Ambient Light');
    ambFolder.addColor(guiControls, 'ambColor').onChange(function (value) {
        game.map.light[0].color.setHex(value);
    });

    /*spot gui controls*/
    var shadowHelper_spot = null;
    var spotFolder = datGUI.addFolder('Spot Light');
    spotFolder.add(guiControls, 'lightX', -60, 180).onChange(function (value) {
        game.map.light[1].position.x = value;
    });
    spotFolder.add(guiControls, 'lightY', 0, 180).onChange(function (value) {
        game.map.light[1].position.y = value;
    });
    spotFolder.add(guiControls, 'lightZ', -60, 180).onChange(function (value) {
        game.map.light[1].position.z = value;
    });
    spotFolder.add(guiControls, 'intensity', 0.01, 5).onChange(function (value) {
        game.map.light[1].intensity = value;
    });
    spotFolder.add(guiControls, 'distance', 0, 1000).onChange(function (value) {
        game.map.light[1].distance = value;
    });
    spotFolder.add(guiControls, 'angle', 0.001, 1.570).onChange(function (value) {
        game.map.light[1].angle = value;
    });
    spotFolder.add(guiControls, 'exponent', 0, 50).onChange(function (value) {
        game.map.light[1].exponent = value;
    });
    spotFolder.add(guiControls, 'shadowCameraNear', 0, 100).name("Near").onChange(function (value) {
        game.map.light[1].shadow.camera.near = value;
        if (shadowHelper_spot != null) shadowHelper_spot.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    spotFolder.add(guiControls, 'shadowCameraFar', 0, 5000).name("Far").onChange(function (value) {
        game.map.light[1].shadow.camera.far = value;
        if (shadowHelper_spot != null) shadowHelper_spot.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    spotFolder.add(guiControls, 'shadowCameraFov', 1, 180).name("Fov").onChange(function (value) {
        game.map.light[1].shadow.camera.fov = value;
        if (shadowHelper_spot != null) shadowHelper_spot.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    spotFolder.add(guiControls, 'shadowCameraVisible').onChange(function (value) {
        if (value) {
            if (shadowHelper_spot == null) {
                shadowHelper_spot = new THREE.CameraHelper(game.map.light[1].shadow.camera);
                game.env.scene.add(shadowHelper_spot);
            }
        } else {
            if (shadowHelper_spot != null) {
                game.env.scene.remove(shadowHelper_spot);
                shadowHelper_spot = null;
            }
        }
        if (shadowHelper_spot != null) shadowHelper_spot.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    spotFolder.add(guiControls, 'shadowBias', 0, 1).onChange(function (value) {
        game.map.light[1].shadowBias = value;
        if (shadowHelper_spot != null) shadowHelper_spot.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    spotFolder.add(guiControls, 'shadowDarkness', 0, 1).onChange(function (value) {
        game.map.light[1].shadowDarkness = value;
        if (shadowHelper_spot != null) shadowHelper_spot.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
});