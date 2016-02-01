window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Setup base environment in three.js 
 */
(function (RENDERER) {
    /**
     * Setup environment in three.js
     * @param {game entity} entity - Game entity
     * @returns {object} data-pkg of environment 
     */
    var SetupEnv = function (entity) {
        if (entity == null) throw new Error('Container not specified.');

        // data ----------------------------------------------
        var that = this,
            SCREEN_WIDTH = 0,
            SCREEN_HEIGHT = 0;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // private method -------------------------------------------------

        // Renderer scene on screen
        var animate = function () {
            requestAnimationFrame(animate);
            if (entity.onRender != null) entity.onRender();
            that.renderer.render(that.scene, that.camera);
        }

        // set resize
        var resize = function () {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;

            that.camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            that.camera.updateProjectionMatrix();

            that.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        };

        var _init = function () {

            /*creates empty scene object and renderer*/
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;

            that.scene = new THREE.Scene();
            that.camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, .1, 5000);
            that.camera.position.set(200, 0, 200);
            that.renderer = new THREE.WebGLRenderer({ antialias: true });
            that.renderer.setClearColor(0x000000);
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