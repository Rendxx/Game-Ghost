﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

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
        if (entity === undefined || entity === null) throw new Error('Entity not specified.');

        // data ----------------------------------------------
        var that = this,
            SCREEN_WIDTH = 0,
            SCREEN_HEIGHT = 0,
            GridSize = Data.grid.size,
            viewPlayerIdx = null,
            ratio = 1,          // scale layers
            renderer = null;

        this.stage = null;
        this.wrap = {};
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
            renderer.render(that.stage);
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
            renderer.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
            _cameraResize(SCREEN_WIDTH, SCREEN_HEIGHT);
        };

        var _setupScale = function () {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;

            var min = Math.max(window.innerHeight, window.innerWidth);
            ratio = min / (Data.visibleSize * GridSize);
        };

        // setup ------------------------
        var _init = function () {
            _setupScale();
            renderer = new PIXI.WebGLRenderer(SCREEN_WIDTH, SCREEN_HEIGHT);
            entity.domElement.appendChild(renderer.view);
            that.stage = new PIXI.Container();
            that.wrap['game'] = new PIXI.Container();
            that.wrap['hud'] = new PIXI.Container();

            that.scene['map'] = new PIXI.Container();
            that.scene['character'] = new PIXI.Container();
            that.scene['effort'] = new PIXI.Container();
            that.scene['marker'] = new PIXI.Container();
            that.scene['hud'] = new PIXI.Container();

            ratio = 1;
            that.scene['map'].scale.x = ratio;
            that.scene['map'].scale.y = ratio;
            that.scene['character'].scale.x = ratio;
            that.scene['character'].scale.y = ratio;
            that.scene['effort'].scale.x = ratio;
            that.scene['effort'].scale.y = ratio;
            that.scene['marker'].scale.x = ratio;
            that.scene['marker'].scale.y = ratio;

            that.stage.addChild(that.wrap['game']);
            that.stage.addChild(that.wrap['hud']);

            that.wrap['game'].addChild(that.scene['map']);
            that.wrap['game'].addChild(that.scene['character']);
            that.wrap['game'].addChild(that.scene['effort']);
            that.wrap['game'].addChild(that.scene['marker']);
            that.wrap['hud'].addChild(that.scene['hud']);

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