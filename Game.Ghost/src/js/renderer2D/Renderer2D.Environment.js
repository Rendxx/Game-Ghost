window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

// drop back for no requestAnimationFrame
(function () {
    if (window.requestAnimationFrame != null) return;
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            },
            timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

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

        this.wrap = null;
        this.scene = {};
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
            that.scene['map'] = $(_Data.html.scene).appendTo(that.wrap);

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