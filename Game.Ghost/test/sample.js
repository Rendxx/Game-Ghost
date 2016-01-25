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
        this.ambColor = 0xdddddd;

        /*directional light values*/
        this.dirColor = 0xffffff;
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
    }

    datGUI = new dat.GUI();
    /*ambient light controls*/
    var ambFolder = datGUI.addFolder('Ambient Light');
    ambFolder.addColor(guiControls, 'ambColor').onChange(function (value) {
        game.map.light[0].color.setHex(value);
    });

    /*Directional gui controls*/
    var directFolder = datGUI.addFolder('Directional Light');
    directFolder.addColor(guiControls, 'dirColor').onChange(function (value) {
        game.map.light[1].color.setHex(value);
    });
    directFolder.add(guiControls, 'lightXD', -60, 180).onChange(function (value) {
        game.map.light[1].position.x = value;
    });
    directFolder.add(guiControls, 'lightYD', 0, 180).onChange(function (value) {
        game.map.light[1].position.y = value;
    });
    directFolder.add(guiControls, 'lightZD', -60, 180).onChange(function (value) {
        game.map.light[1].position.z = value;
    });
    directFolder.add(guiControls, 'intensityD', 0.01, 5).onChange(function (value) {
        game.map.light[1].intensity = value;
    });
    directFolder.add(guiControls, 'shadowCameraNearD', 0, 100).name("Near").onChange(function (value) {
        game.map.light[1].shadow.camera.near = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    directFolder.add(guiControls, 'shadowLeft', -30, 30).name("Left").onChange(function (value) {
        game.map.light[1].shadow.camera.left = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    directFolder.add(guiControls, 'shadowRight', -30, 30).name("Right").onChange(function (value) {
        game.map.light[1].shadow.camera.right = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    directFolder.add(guiControls, 'shadowTop', -30, 30).name("Top").onChange(function (value) {
        game.map.light[1].shadow.camera.top = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    directFolder.add(guiControls, 'shadowBottom', -30, 30).name("Bottom").onChange(function (value) {
        game.map.light[1].shadow.camera.bottom = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    directFolder.add(guiControls, 'shadowCameraFarD', 0, 100).name("Far").onChange(function (value) {
        game.map.light[1].shadow.camera.far = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    var shadowHelper_direct = null;
    directFolder.add(guiControls, 'shadowCameraVisibleD').onChange(function (value) {

        if (value) {
            if (shadowHelper_direct == null) {
                shadowHelper_direct = new THREE.CameraHelper(game.map.light[1].shadow.camera);
                game.env.scene.add(shadowHelper_direct);
            }
        } else {
            if (shadowHelper_direct != null) {
                game.env.scene.remove(shadowHelper_direct);
                shadowHelper_direct = null;
            }
        }
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    directFolder.add(guiControls, 'shadowBiasD', 0, 1).onChange(function (value) {
        game.map.light[1].shadowBias = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });
    directFolder.add(guiControls, 'shadowDarknessD', 0, 1).onChange(function (value) {
        game.map.light[1].shadowDarkness = value;
        if (shadowHelper_direct != null) shadowHelper_direct.update();
        game.map.light[1].shadow.camera.updateProjectionMatrix();
    });


});