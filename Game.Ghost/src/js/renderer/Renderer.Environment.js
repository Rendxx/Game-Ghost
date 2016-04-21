﻿window.Rendxx = window.Rendxx || {};
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
        if (entity === undefined || entity === null) throw new Error('Entity not specified.');

        // data ----------------------------------------------
        var that = this,
            clock = null,
            SCREEN_WIDTH = 0,
            SCREEN_HEIGHT = 0,
            cameraPara = [],
            cameraNum = 0,
            GridSize = Data.grid.size,
            characterData = [],
            viewPlayerIdxList = null;

        this.scene = null;
        this.renderer = null;
        this.camera = [];

        // public method -------------------------------------------------
        this.viewportSetup = function (viewPlayer_in) {
            viewPlayerIdxList = viewPlayer_in;
            cameraNum = viewPlayer_in.length;           // no ghost
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
            if (entity._onRender !== null) entity._onRender(delta);
        }

        // camera --------------------------------------------
        var _cameraParaReset = function () {
            cameraPara = [];
            if (cameraNum <= 1) {
                var w = SCREEN_WIDTH - 2;
                var h = SCREEN_HEIGHT - 2;
                cameraPara[0] = {
                    w: w,
                    h: h,
                    x: 1,
                    y: 1
                };
            } else if (cameraNum <= 4) {
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
            } else if (cameraNum <= 6) {
                var w = SCREEN_WIDTH / 3 - 3;
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
                    x: SCREEN_WIDTH / 3 + 1,
                    y: 1
                };
                cameraPara[2] = {
                    w: w,
                    h: h,
                    x: SCREEN_WIDTH / 3 * 2 + 2,
                    y: 1
                };
                cameraPara[3] = {
                    w: w,
                    h: h,
                    x: 1,
                    y: SCREEN_HEIGHT / 2 + 1
                };
                cameraPara[4] = {
                    w: w,
                    h: h,
                    x: SCREEN_WIDTH / 3 + 1,
                    y: SCREEN_HEIGHT / 2 + 1
                };
                cameraPara[5] = {
                    w: w,
                    h: h,
                    x: SCREEN_WIDTH / 3 * 2 + 2,
                    y: SCREEN_HEIGHT / 2 + 1
                };
            }
        };

        var _cameraSetup = function () {
            that.camera = [];
            for (var i = 0; i < cameraNum; i++) {
                var para = cameraPara[i];
                that.camera[i] = new RENDERER.Camera(entity, that.scene, that.renderer);
                that.camera[i].setup(entity.characters[entity.playerIdxMap[viewPlayerIdxList[i]]], para.x, para.y, para.w, para.h);
            }
        };

        var _cameraUpdate = function () {
            that.renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            that.renderer.clear();
            that.renderer.clearDepth();

            if (cameraNum === 0) return;
            for (var i = 0; i < cameraNum; i++) {
                that.camera[i].render();
            }
        };

        var _cameraResize = function () {
            for (var i = 0; i < cameraNum; i++) {
                var para = cameraPara[i];
                that.camera[i].resize(para.x, para.y, para.w, para.h);
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

        // helper ------------------------
        var _init = function () {
            clock = new THREE.Clock();

            /*creates empty scene object and renderer*/
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;

            that.scene = new THREE.Scene();
            that.renderer = new THREE.WebGLRenderer({ antialias: true });
            that.renderer.setClearColor(0x050505);
            that.renderer.autoClear = false; // To allow render overlay on top of sprited sphere
            that.renderer.shadowMap.enabled = true;
            that.renderer.shadowMap.soft = true;

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