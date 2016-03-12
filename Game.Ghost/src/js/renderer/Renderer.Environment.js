window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Setup base environment in three.js 
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    /**
     * Setup environment in three.js
     * @param {game entity} entity - Game entity
     * @returns {object} data-pkg of environment 
     */
    var SetupEnv = function (entity) {
        if (entity == null) throw new Error('Container not specified.');

        // data ----------------------------------------------
        var that = this,
            clock = null,
            SCREEN_WIDTH = 0,
            SCREEN_HEIGHT = 0,
            cameraPara = [],
            cameraNum = 0,
            GridSize = Data.grid.size,
                characterData = [];

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // public method -------------------------------------------------
        this.viewportSetup = function (player) {
            cameraNum = player.length;
            _cameraParaReset();
            _cameraSetup();
        };


        // private method -------------------------------------------------

        // Renderer scene on screen
        var animate = function () {
            requestAnimationFrame(animate);
            var delta = clock.getDelta();
            TWEEN.update();
            _cameraUpdate();
            if (entity._onRender != null) entity._onRender(delta);
        }

        // camera --------------------------------------------
        var _cameraParaReset = function () {
            cameraPara = [];
            if (cameraNum <= 4) {
                var w = SCREEN_WIDTH / 2 - 2;
                var h = SCREEN_HEIGHT / 2 - 2;
                cameraPara[0] = {
                    w: w,
                    h: h,
                    x: 1,
                    y: 1
                };
                cameraPara[1] = {
                    w: w,
                    h: h,
                    x: SCREEN_WIDTH / 2 + 1,
                    y: 1
                };
                cameraPara[2] = {
                    w: w,
                    h: h,
                    x: 1,
                    y: SCREEN_HEIGHT / 2 + 1
                };
                cameraPara[3] = {
                    w: w,
                    h: h,
                    x: SCREEN_WIDTH / 2 + 1,
                    y: SCREEN_HEIGHT / 2 + 1
                };
            } else if (num <= 6) {

            }
        };

        var _cameraSetup = function () {
            that.camera = [];
            for (var i = 0; i < cameraNum; i++) {
                var para = cameraPara[i];
                that.camera[i] = new THREE.PerspectiveCamera(45, para.w / para.h, .1, 30 * GridSize);
                that.camera[i].position.y = 20 * GridSize;
                that.camera[i].position.x = 0;
                that.camera[i].position.z = 0;
                that.camera[i].lookAt(new THREE.Vector3(0, 0, 0));
                that.camera[i].rotation.z = 0;
            }
        };

        var _cameraUpdate = function () {
            that.renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            that.renderer.clear();

            for (var i = 0; i < cameraNum; i++) {
                var para = cameraPara[i];
                var character = entity.characters[i];
                that.camera[i].position.x = character.x;
                that.camera[i].position.z = character.y+20;
                if (character.mesh!=null) that.camera[i].lookAt(character.mesh.position);
                that.renderer.setViewport(para.x, para.y, para.w, para.h);
                that.renderer.render(that.scene, that.camera[i]);
                //that.camera[i].rotation.z += 0.1;
            }
        };

        var _cameraResize = function () {
            for (var i = 0; i < cameraNum; i++) {
                var para = cameraPara[i];
                that.camera[i].aspect = para.w / para.h;
                that.camera[i].updateProjectionMatrix();
            }
        };

        // set resize
        var resize = function () {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;

            that.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
            _cameraParaReset();
            _cameraResize();
        };
        
        var _init = function () {
            clock = new THREE.Clock();

            /*creates empty scene object and renderer*/
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;

            that.scene = new THREE.Scene();
            //that.camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, .1, 5000);
            //that.camera.position.set(200, 0, 200);
            that.renderer = new THREE.WebGLRenderer({ antialias: true });
            that.renderer.setClearColor(0x111111);
            that.renderer.autoClear = false; // To allow render overlay on top of sprited sphere
            that.renderer.shadowMapEnabled = true;
            that.renderer.shadowMapSoft = true;

            // add renderer to dom
            $(entity.domElement).append(that.renderer.domElement);

            // bind resize function
            $(window).resize(resize);

            // run funciton for 1st time
            resize();
            animate();
        };

        _init();
    };

    /**
     * Setup game with the viewport domelement
     * @param {game entity} entity - Game entity
     */
    RENDERER.SetupEnv = SetupEnv;
})(window.Rendxx.Game.Ghost.Renderer);