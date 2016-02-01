window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Test controller, use dat-gui to adjust entity parameter 
 */
(function (RENDERER) {
    var Data = RENDERER.Data;

    var Test = function (entity) {
        var datGUI, cameraControl, stats;

        var setup = function () {
            // camera control
            cameraControl = new THREE.OrbitControls(entity.env.camera, entity.env.renderer.domElement);

            // status track
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';
            entity.domElement.appendChild(stats.domElement);

            // dat gui
            datGUI = new dat.GUI();

            // axis
            var axisHelper = new THREE.AxisHelper(100);
            entity.env.scene.add(axisHelper);
        };

        var setupLight = function () {
            var guiControls = new function () {
                this.ambient = {};
                this.spot = {};

                for (var i in Data.light.ambient) {
                    this.ambient[i] = Data.light.ambient[i];
                }

                for (var i in Data.light.spot) {
                    this.spot[i] = Data.light.spot[i];
                }
            };
            /*ambient light controls*/
            var ambFolder = datGUI.addFolder('Ambient Light');
            ambFolder.addColor(guiControls.ambient, 'ambColor').onChange(function (value) {
                entity.map.light[0].color.setHex(value);
            });

            /*spot gui controls*/
            var shadowHelper_spot = null;
            var spotFolder = datGUI.addFolder('Spot Light');
            spotFolder.add(guiControls.spot, 'lightX', -60, 180).onChange(function (value) {
                entity.map.light[1].position.x = value;
            });
            spotFolder.add(guiControls.spot, 'lightY', 0, 180).onChange(function (value) {
                entity.map.light[1].position.y = value;
            });
            spotFolder.add(guiControls.spot, 'lightZ', -60, 180).onChange(function (value) {
                entity.map.light[1].position.z = value;
            });
            spotFolder.add(guiControls.spot, 'intensity', 0.01, 5).onChange(function (value) {
                entity.map.light[1].intensity = value;
            });
            spotFolder.add(guiControls.spot, 'distance', 0, 1000).onChange(function (value) {
                entity.map.light[1].distance = value;
            });
            spotFolder.add(guiControls.spot, 'angle', 0.001, 1.570).onChange(function (value) {
                entity.map.light[1].angle = value;
            });
            spotFolder.add(guiControls.spot, 'exponent', 0, 50).onChange(function (value) {
                entity.map.light[1].exponent = value;
            });
            spotFolder.add(guiControls.spot, 'shadowCameraNear', 0, 100).name("Near").onChange(function (value) {
                entity.map.light[1].shadow.camera.near = value;
                if (shadowHelper_spot != null) shadowHelper_spot.update();
                entity.map.light[1].shadow.camera.updateProjectionMatrix();
            });
            spotFolder.add(guiControls.spot, 'shadowCameraFar', 0, 5000).name("Far").onChange(function (value) {
                entity.map.light[1].shadow.camera.far = value;
                if (shadowHelper_spot != null) shadowHelper_spot.update();
                entity.map.light[1].shadow.camera.updateProjectionMatrix();
            });
            spotFolder.add(guiControls.spot, 'shadowCameraFov', 1, 180).name("Fov").onChange(function (value) {
                entity.map.light[1].shadow.camera.fov = value;
                if (shadowHelper_spot != null) shadowHelper_spot.update();
                entity.map.light[1].shadow.camera.updateProjectionMatrix();
            });
            spotFolder.add(guiControls.spot, 'shadowCameraVisible').onChange(function (value) {
                if (value) {
                    if (shadowHelper_spot == null) {
                        shadowHelper_spot = new THREE.CameraHelper(entity.map.light[1].shadow.camera);
                        entity.env.scene.add(shadowHelper_spot);
                    }
                } else {
                    if (shadowHelper_spot != null) {
                        entity.env.scene.remove(shadowHelper_spot);
                        shadowHelper_spot = null;
                    }
                }
                if (shadowHelper_spot != null) shadowHelper_spot.update();
                entity.map.light[1].shadow.camera.updateProjectionMatrix();
            });
            spotFolder.add(guiControls.spot, 'shadowBias', 0, 1).onChange(function (value) {
                entity.map.light[1].shadowBias = value;
                if (shadowHelper_spot != null) shadowHelper_spot.update();
                entity.map.light[1].shadow.camera.updateProjectionMatrix();
            });
            spotFolder.add(guiControls.spot, 'shadowDarkness', 0, 1).onChange(function (value) {
                entity.map.light[1].shadowDarkness = value;
                if (shadowHelper_spot != null) shadowHelper_spot.update();
                entity.map.light[1].shadow.camera.updateProjectionMatrix();
            });
        };

        var setupLoad = function () {
            var _fileReader = new FileReader();
            var upload = $('<input type="file" accept=".json" style="display:none" />').appendTo($('body')).change(function () {
                var file = this.files[0];
                _fileReader.readAsText(file);
            });

            var parseJson = function (content) {
                var data = null;
                try {
                    data = $.parseJSON(content);
                    if (!data.hasOwnProperty('grid') || !data.hasOwnProperty('stuff')) throw new Error('Data missing.');
                } catch (e) {
                    return null;
                }
                return data;
            };

            _fileReader.onload = function (e) {
                var data = parseJson(_fileReader.result);
                if (data == null) {
                    $$.info.alert("Error occor when read the file.", null, false, "rgba(0,0,0,0.6)");
                    return;
                }

                entity.map.reset(data);
                upload[0].value = null;
            };

            var loadControl = new function () {
                this.loadFile = function () {
                    upload[0].click();
                };
            };
            datGUI.add(loadControl, 'loadFile');
        };

        var _init = function () {
            setup();
            setupLight();
            setupLoad();

            entity.onRender = function () {
                cameraControl.update();
                stats.update();
            };
        };
        _init();
    };

    RENDERER.Test = Test;
})(window.Rendxx.Game.Ghost.Renderer);