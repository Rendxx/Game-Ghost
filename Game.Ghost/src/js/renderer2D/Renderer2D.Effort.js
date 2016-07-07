window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
    var GridSize = Data.grid.size;
    var _Data = {
        size: 3,
        tileSize: 128,
        tileDispDuration: 50,
        Name: {
            'Blood': 0,
            'Electric': 1
        }
    };

    var Effort = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            tex = {},
            _scene = entity.env.scene['effort'];

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.update = function (newEffort) {
            if (newEffort == null || newEffort.length === 0) return;
            for (var i = 0, l = newEffort.length; i < l;i++){
                createEffort(newEffort[i]);
            }
        };

        this.render = function (delta) {
        };

        // private method -------------------------------------------------
        var createEffort = function (effort) {
            if (effort==null) return;
            var effortName = effort[0];
            var x = effort[1];
            var y = effort[2];

            if (!tex.hasOwnProperty(effortName)) return;

            var item = new PIXI.extras.MovieClip(tex[effortName]);
            item.loop = false;
            item.anchor.set(0.5, 0.5);
            item.animationSpeed = 0.5;
            item.position.set(x  * GridSize, y * GridSize);
            item.scale.set(_Data.size * GridSize / _Data.tileSize, _Data.size * GridSize / _Data.tileSize);
            item.onComplete = function () { _scene.removeChild(this) };
            _scene.addChild(item);
            item.play();
        };

        // setup -----------------------------------------------
        var _setupTex = function () {
            tex = {};
            var path = entity.root + Data.files.path[Data.categoryName.sprite];

            // texture loader -------------------------------------------------------------------------------------------
            PIXI.loader
            .add(path + 'effort.blood.json')
            .add(path + 'effort.electric.json')
            .load(function (loader, resources) {
                // blood
                var frames = [];
                var name = path + 'effort.blood.json';
                var _f = resources[name].data.frames;
                var i = 0;
                while (true) {
                    var val = i < 10 ? '0' + i : i;
                    if (!_f.hasOwnProperty('animation00' + val)) break;
                    frames.push(loader.resources[name].textures['animation00' + val]);
                    i++;
                }

                tex[_Data.Name.Blood] = frames;

                // electric
                var frames = [];
                var name = path + 'effort.electric.json';
                var _f = resources[name].data.frames;
                var i = 0;
                while (true) {
                    var val = i < 10 ? '0' + i : i;
                    if (!_f.hasOwnProperty('animation00' + val)) break;
                    frames.push(loader.resources[name].textures['animation00' + val]);
                    i++;
                }

                tex[_Data.Name.Electric] = frames;
            });
        };

        var _init = function () {
            _setupTex();
        };

        _init();
    };

    RENDERER.Effort = Effort;
    RENDERER.Effort.Data = _Data;
})(window.Rendxx.Game.Ghost.Renderer2D);