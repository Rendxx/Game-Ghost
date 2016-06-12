window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Setup base environment in three.js 
 */
(function (RENDERER) {
    var _Data = {
        html: {
            scene: '<div class="_scene"></div>',
            wrap: '<div class="_sceneWrap"></div>'
        }
    };
    var Data = RENDERER.Data;
    /**
     * Setup environment in three.js
     * @param {game entity} entity - Game entity
     * @returns {object} data-pkg of environment 
     */
    var SetupEnv = function (entity) {
        if (entity === undefined || entity === null) throw new Error('Entity not specified.');

        // data ----------------------------------------------
        var that = this,
            SCREEN_WIDTH = 0,
            SCREEN_HEIGHT = 0,
            GridSize = Data.grid.size,
            viewPlayerIdx = null;

        this.scene = null;
        this.wrap = null;
        this.layers = {};
        this.camera = null;

        // public method -------------------------------------------------
        this.viewportSetup = function (viewPlayer_in) {
            viewPlayerIdx = viewPlayer_in;
            _cameraSetup();
        };

        // private method -------------------------------------------------

        // Renderer scene on screen
        var animate = function () {
            requestAnimationFrame(animate);
            _cameraUpdate();
            if (entity._onRender !== null) entity._onRender();
        }

        // camera --------------------------------------------

        var _cameraSetup = function () {
            that.camera = new RENDERER.Camera(entity, that.scene);
            that.camera.setup(entity.characters[viewPlayerIdx], SCREEN_WIDTH, SCREEN_HEIGHT);
        };

        var _cameraUpdate = function () {
            if (that.camera !== null) that.camera.render();
        };

        var _cameraResize = function (w, h) {
            if (that.camera!==null) that.camera.resize(w, h);
        };

        // set resize
        var resize = function () {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            _cameraResize(SCREEN_WIDTH, SCREEN_HEIGHT);
        };

        // helper ------------------------
        var _init = function () {
            that.wrap = $(_Data.html.wrap).appendTo($(entity.domElement));
            that.scene = $(_Data.html.scene).appendTo(that.wrap);

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
})(window.Rendxx.Game.Ghost.Renderer2D);