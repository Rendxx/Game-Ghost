window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        Name: {
            'Key': 0,
            'Door': 1,
            'Touch': 2,
            'Operation': 3
        }
    };

    var TextureAnimator = function (texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
        this.isEnd = false;
        this.mesh = null;

        // note: texture passed by reference, will be updated by the update function.
        this.tilesHorizontal = tilesHoriz;
        this.tilesVertical = tilesVert;

        // how many images does this spritesheet contain?
        //  usually equals tilesHoriz * tilesVert, but not necessarily,
        //  if there at blank tiles at the bottom of the spritesheet. 
        this.numberOfTiles = numTiles;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

        // how long should each image be displayed?
        this.tileDisplayDuration = tileDispDuration;

        // how long has the current image been displayed?
        this.currentDisplayTime = 0;

        // which image is currently being displayed?
        this.currentTile = 0;

        this.update = function (milliSec) {
            this.currentDisplayTime += milliSec;
            while (this.currentDisplayTime > this.tileDisplayDuration) {
                this.currentDisplayTime -= this.tileDisplayDuration;
                this.currentTile++;
                if (this.currentTile > this.numberOfTiles) {
                    this.isEnd = true;
                    return;
                }
                var currentColumn = this.currentTile % this.tilesHorizontal;
                texture.offset.x = currentColumn / this.tilesHorizontal;
                var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
                texture.offset.y = -currentRow / this.tilesVertical;
            }
        };
    }

    var Effort = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            currentAnimation = [],
            tex = {},
                _scene = null;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.update = function (newEffort) {
            if (newEffort == null || newEffort.length === 0) return;
            for (var i = 0, l = newEffort.length; i < l;i++){
                createEffort(newEffort[i]);
            }
        };

        this.render = function (delta) {
            for (var i = 0; i < currentAnimation.length; i++) {
                currentAnimation[i].update();
                if (currentAnimation[i].isEnd) {
                    clearEffort(i);
                    i--;
                }
            }
            annie.update(delta);
        };

        // private method -------------------------------------------------
        var createEffort = function (effort) {
            if (effort==null) return;
            var effortName = effort.name;
            var x = effort.x;
            var y = effort.y;

            if (!tex.hasOwnProperty(effortName)) return;
            var animation = new TextureAnimator(tex[effortName], 4, 4, 15, 50);
            var mat = new THREE.MeshBasicMaterial({ map: tex[effortName], transparent: true });
            var geo = new THREE.PlaneGeometry(128, 128, 1, 1);
            var mesh = new THREE.Mesh(geo, mat);
            animation.position.set(x, y, 10);
            _scene.add(mesh);
        };

        var clearEffort = function (idx) {
            _scene.remove(currentAnimation[idx].mesh);
            currentAnimation.slice(idx, 1);
        };

        // setup -----------------------------------------------
        var _setupTex = function () {
            tex = {};
            var path = root + Data.files.path[Data.categoryName.sprite];

            // texture loader -------------------------------------------------------------------------------------------
            var textureLoader = new THREE.TextureLoader();
            tex['fog'] = textureLoader.load(path + 'fog.png');
            tex['nameDeco'] = textureLoader.load(path + 'name-deco-white.png');
            tex['deadScreen'] = textureLoader.load(path + 'DeadScreen.png');
            tex['escapeScreen'] = textureLoader.load(path + 'EscapeScreen.png');
        };

        var _init = function () {
            _setupTex();
        };

        _init();
    };

    RENDERER.Effort = Effort;
})(window.Rendxx.Game.Ghost.Renderer);