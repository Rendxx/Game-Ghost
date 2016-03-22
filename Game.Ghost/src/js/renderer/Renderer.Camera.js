﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Camera for each player 
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = Data.grid.size;
    var _Data = {
        enduranceBarWidth: 100,
        enduranceBarHeight: 2
    };
    /**
     * Setup camera in three.js
     * @param {game entity} entity - Game entity
     */
    var Camera = function (entity, scene_in, renderer_in) {
        // data ----------------------------------------------
        var that = this,
            tex = {},
            root = entity.root,
            sprites = {};
            // cache

        this.scene = scene_in;
        this.renderer = renderer_in
        this.camera = null;
        this.cameraOrtho = null;
        this.sceneOrtho = null;
        this.character = -1;
        this.width = -1;
        this.height = -1;
        this.x = -1;
        this.y = -1;
        this.color = null;

        // public method -------------------------------------------------
        this.setup = function (character, x, y, w, h) {
            // data
            this.character = character;
            this.width = w;
            this.height = h;
            this.x = x;
            this.y = y;
            this.color = hexToRgb(character.color);

            //camera
            that.camera = new THREE.PerspectiveCamera(45, that.width / that.height, .1, 30 * GridSize);
            that.camera.position.y = 20 * GridSize;
            that.camera.position.x = 0;
            that.camera.position.z = 0;
            that.camera.lookAt(new THREE.Vector3(0, 0, 0));
            that.camera.rotation.z = 0;
            that.camera.rotationAutoUpdate = false;

            that.sceneOrtho = new THREE.Scene();
            that.cameraOrtho = new THREE.OrthographicCamera(0, that.width, 0, -that.height, 1, 10);
            that.cameraOrtho.position.z = 10;

            createFrame();
            createEnduranceBar();
        };

        this.resize = function (x, y, w, h) {
            this.width = w;
            this.height = h;
            this.x = x;
            this.y = y;

            // name
            sprites["name"].position.set(60, -45, 1);

            // name deco
            sprites["nameDeco"].position.set(60, -30, 1);

            // border
            sprites["top"].position.set(that.width / 2, 0, 1);
            sprites["top"].scale.set(that.width, 2, 1.0);

            sprites["right"].position.set(that.width, -that.height / 2, 1);
            sprites["right"].scale.set(2, that.height, 1.0);

            sprites["bottom"].position.set(that.width / 2, -that.height, 1);
            sprites["bottom"].scale.set(that.width, 2, 1.0);

            sprites["left"].position.set(0, -that.height / 2, 1);
            sprites["left"].scale.set(1, that.height, 1.0);

            // camera
            that.camera.aspect = that.width / that.height;
            that.camera.updateProjectionMatrix();
            that.cameraOrtho.left = 0;
            that.cameraOrtho.right = that.width;
            that.cameraOrtho.top = 0;
            that.cameraOrtho.bottom = -that.height;
            that.cameraOrtho.updateProjectionMatrix();
        };

        this.render = function () { 
            var x = that.character.x;
            var y = that.character.y;

            // update camera
            that.camera.position.x = x;
            that.camera.position.z = y +1 ;

            if (that.character.mesh != null) {
                //that.camera.lookAt(that.character.mesh.position);
            }

            // update sprite
            updateEnduranceBar();

            // render
            that.renderer.setViewport(that.x, that.y, that.width, that.height);
            that.renderer.render(that.scene, that.camera);
            that.renderer.render(that.sceneOrtho, that.cameraOrtho);
        };

        // private method -------------------------------------------------

        // Frame ----------------------------------------------------
        var createFrame = function () {
            sprites = {};

            // name
            sprites["name"] = makeTextSprite(that.character.name, { fontsize: 40, borderColor: { r: that.color.r, g: that.color.g, b: that.color.b, a: 1.0 }, color: { r: 255, g: 255, b: 255, a: 1.0 } });
            that.sceneOrtho.add(sprites["name"]);

            // name deco
            sprites["nameDeco"] = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex["nameDeco"] }));
            sprites["nameDeco"].scale.set(120, 30, 1.0);
            sprites["nameDeco"].material.transparent = true;
            sprites["nameDeco"].material.opacity = 0.8;
            that.sceneOrtho.add(sprites["nameDeco"]);

            // border
            var border_mat = new THREE.SpriteMaterial({ color: 0x222222 });
            sprites["top"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["top"]);

            sprites["right"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["right"]);

            sprites["bottom"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["bottom"]);

            sprites["left"] = new THREE.Sprite(border_mat);
            that.sceneOrtho.add(sprites["left"]);

            that.resize(that.x, that.y, that.width, that.height);
        };

        // Endurance ------------------------------------------------
        var createEnduranceBar = function () {
            // endurance
            var mat = new THREE.SpriteMaterial({
                color: 0xcccccc,
                transparent: true
            });
            mat.opacity = 0.8;
            var spr = new THREE.Sprite(mat);
            spr.position.set(0, -50, 2);
            spr.scale.set(_Data.enduranceBarWidth*2, _Data.enduranceBarHeight, 1.0);
            that.sceneOrtho.add(spr);

            sprites["enduranceBar"] = spr;

            // base
            var mat = new THREE.SpriteMaterial({
                color: 0x000000,
                transparent: true
            });
            mat.opacity = 0.6;
            var spr = new THREE.Sprite(mat);
            spr.position.set(0, -50, 1);
            spr.scale.set(2+_Data.enduranceBarWidth * 2, 2+_Data.enduranceBarHeight, 1.0);
            that.sceneOrtho.add(spr);

            sprites["enduranceBarBase"] = spr;
        };

        var updateEnduranceBar = function () {
            if (sprites["enduranceBar"] == null) return;
            var val = that.character.endurance;
            var w = (val / that.character.maxEndurance) ;
            sprites["enduranceBar"].scale.x = w* _Data.enduranceBarWidth * 2;

            if (val >= that.character.maxEndurance) {
                sprites["enduranceBar"].material.color.b = 0.8;
                sprites["enduranceBar"].material.color.g = 0.8;
            } else {
                sprites["enduranceBar"].material.color.b = 0.8 * w;
                sprites["enduranceBar"].material.color.g = 0.8 * w;
            }
        };

        // helper ------------------------
        var makeTextSprite = function (message, parameters) {
            if (parameters === undefined) parameters = {};

            var fontface = parameters.hasOwnProperty("fontface") ?
                parameters["fontface"] : "Arial";

            var fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters["fontsize"] : 18;

            var borderThickness = parameters.hasOwnProperty("borderThickness") ?
                parameters["borderThickness"] : 4;

            var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };

            var borderColor = parameters.hasOwnProperty("borderColor") ?
                parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

            var color = parameters.hasOwnProperty("color") ?
                parameters["color"] : { r: 255, g: 255, b: 255, a: 1.0 };

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.font = "Bold " + fontsize + "px " + fontface;

            // get size data (height depends only on font size)
            var metrics = context.measureText(message);
            var textWidth = metrics.width;

            // background color
            context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                          + backgroundColor.b + "," + backgroundColor.a + ")";
            // border color
            context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                          + borderColor.b + "," + borderColor.a + ")";

            context.lineWidth = borderThickness;
            // 1.4 is extra height factor for text below baseline: g,j,p,q.

            // text color
            context.fillStyle = "rgba(" + color.r + "," + color.g + ","
                                          + color.b + "," + color.a + ")";

            context.fillText(message, borderThickness, fontsize + borderThickness);

            // canvas contents will be used for a texture
            var texture = new THREE.Texture(canvas)
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(100, 50, 1.0);
            return sprite;
        }

        var hexToRgb = function (hex) {
            var result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        // setup -----------------------------------------------------
        var _setupTex = function () {
            tex = {};
            var textureLoader = new THREE.TextureLoader();
            tex['nameDeco'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'name-deco-white.png');
            //tex['enduranceBarBase'] = textureLoader.load(root + Data.files.path[Data.categoryName.sprite] + 'EnduranceBar.png');
        };

        var _init = function () {
            _setupTex();
        };

        _init();
    };

    RENDERER.Camera = Camera;
})(window.Rendxx.Game.Ghost.Renderer);