window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = Data.grid.size;
    var _Data = {
        size: 128,
        tileDispDuration: 50,
        Name: {
            'Blood': 0,
            'Electric': 1
        }
    };

    var TextureAnimator = function (texture, tilesHoriz, tilesVert, tileDispDuration) {
        this.isEnd = false;
        this.mesh = null;

        // note: texture passed by reference, will be updated by the update function.
        this.tilesHorizontal = tilesHoriz;
        this.tilesVertical = tilesVert;

        // how many images does this spritesheet contain?
        //  usually equals tilesHoriz * tilesVert, but not necessarily,
        //  if there at blank tiles at the bottom of the spritesheet. 
        this.numberOfTiles = tilesHoriz * tilesVert;
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
            _scene = entity.env.scene;

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
                currentAnimation[i].update(delta);
                if (currentAnimation[i].isEnd) {
                    clearEffort(i);
                    i--;
                }
            }
        };

        // private method -------------------------------------------------
        var createEffort = function (effort) {
            if (effort==null) return;
            var effortName = effort.name;
            var x = effort.x;
            var y = effort.y;

            if (!tex.hasOwnProperty(effortName)) return;
            var animation = new TextureAnimator(
                tex[effortName],
                Math.floor(tex[effortName].image.width / _Data.size), 
                Math.floor(tex[effortName].image.height / _Data.size),
                _Data.tileDispDuration);
            var mat = new THREE.MeshBasicMaterial({ map: tex[effortName], transparent: true });
            var geo = new THREE.PlaneGeometry(_Data.size, _Data.size, 1, 1);
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x * GridSize - entity.map.width / 2, GridSize, y * GridSize - entity.map.height / 2);
            animation.mesh = mesh;
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
            tex[_Data.Name.Blood] = textureLoader.load(path + 'effort.blood.png');
            tex[_Data.Name.Electric] = textureLoader.load(path + 'name-deco-white.png');
        };

        var _init = function () {
            _setupTex();
        };

        _init();
    };

    RENDERER.Effort = Effort;
})(window.Rendxx.Game.Ghost.Renderer);