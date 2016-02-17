window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Character Renderer
 */
(function (RENDERER) {
    var Data = RENDERER.Data.character;
    var Character = function (id, name, para, role) {
        // data ----------------------------------------------
        var that = this,
            id = id,
            name = name,
            para = para,
            role = role,
            scene = null;

        var r_head_1 = null,
            r_head_2 = null,
            currentAction = null;

        this.mesh = null;
        this.materials = null;
        this.actions = null;
        this.mixer = null;
        this.setuped = false;

        // callback -------------------------------------------------------
        this.onSetuped = null;

        // public method --------------------------------------------------
        this.setup = function (scene_in) {
            scene = scene_in;
            if (this.mesh != null) {
                scene.add(this.mesh);
                this.setuped = true;
                if (this.onSetuped != null) this.onSetuped();
            }
        };

        this.render = function (action, x, y, r_body, r_head) {
            if (!this.setuped) return;

            // rotate
            var r = r_head / 180 * Math.PI / 3;
            r_head_1.rotation.z = r * 2;
            r_head_2.rotation.z = r;
            player.rotation.y = r_body / 180 * Math.PI;

            // move
            this.mesh.position.x += x;
            this.mesh.position.z += y;

            if (currentAction != action) {
                this.mixer.crossFade(this.action[currentAction], this.action[action], .3);
                currentAction = action;
            }
        };


        // private method -------------------------------------------------
        var load = function () {
            var para = Data[role];
            var loader = new THREE.JSONLoader();
            loader.load(para.file, function (geometry, materials) {
                var mesh = null,
                    actions = null,
                    mixer = null;
                for (var i = 0; i < materials.length; i++) {
                    materials[i].skinning = true;
                }
                mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                mixer = new THREE.AnimationMixer(mesh);
                for (var i in para.action){
                    var action = new THREE.AnimationAction(geometry.animations[i]);
                    action.weight = 0;
                    mixer.addAction(action);
                    action[para.action[i]] = action;
                }

                currentAction = para.initAction;
                action[currentAction].weight = 1;

                that.mesh = mesh;
                that.action = action;
                that.mixer = mixer;

                // setup cache 
                r_head_1 = mesh.skeleton.bones[3];
                r_head_2 = mesh.skeleton.bones[4];

                // setup if scene is set
                if (scene != null) {
                    scene.add(that.mesh);
                    that.setuped = true;
                    if (that.onSetuped != null) that.onSetuped();
                }
            });
        };

        var _init = function () {
            load();
        };

        _init();
    };

    /**
     * Render character
     * @param {game entity} entity - Game entity
     */
    RENDERER.Character = Character;
})(window.Rendxx.Game.Ghost.Renderer);