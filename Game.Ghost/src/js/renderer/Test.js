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
            };
            /*ambient light controls*/
            var ambFolder = datGUI.addFolder('Ambient Light');
            ambFolder.addColor(guiControls.ambient, 'ambColor').onChange(function (value) {
                entity.map.light[0].color.setHex(value);
            });
        };
        var _init = function () {
            setup();
            setupLight();

            entity.onRender = function () {
                cameraControl.update();
                stats.update();
            };
        };
        _init();
    };

    RENDERER.Test = Test;
})(window.Rendxx.Game.Ghost.Renderer);