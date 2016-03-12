window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Main entry of Game.Ghost 
 */
(function (RENDERER) {
    /**
     * Game Entity
     */
    var Entity = function (container, root) {
        // data
        this.domElement = container;
        this.env = null;
        this.map = null;
        this.root = root || '';
        this.characters = null;
        this.test = null;
        this.started = false;

        var that=this,
            _mapData = null,
            _modelData = null,
            _playerData = null;

        // public method --------------------------------
        // load basic data
        this.load = function (modelData, mapData, playerData) {
            _mapData = mapData;
            _modelData = modelData;
            _playerData = playerData;
            this.map.loadModelData(_modelData);
            this.map.reset(_mapData);

            this.characters = [];
            for (var i = 0, l = _playerData.length; i < l; i++) {
                this.characters[i] = new RENDERER.Character(this, i, _modelData.characters, _playerData[i]);
            }
            this.env.viewportSetup(playerData);
            this.test = new RENDERER.Test(this);
        };

        this.start = function () {
            this.started = true;
        };

        // api -------------------------------------------
        this.show = function () {
            this.domElement.fadeIn()
        };

        this.hide = function () {
            this.domElement.fadeOut()
        };

        this.updateClient = function (clientData) {
        };

        this.updateGame = function (gameData) {
            if (gameData == null) return;
            that.map.update(gameData.map);
            for (var i = 0, l = this.characters.length; i < l; i++) {
                that.characters[i].update(gameData.characters[i]);
            }
        };

        // callback
        this.onTimeInterval = null;
        this.onRender = null;

        // inner callback
        this._onRender = function (delta) {
            if (!this.started) return;
            if (that.onTimeInterval != null) that.onTimeInterval();
            this.map.render();
            for (var i = 0, l = this.characters.length; i < l; i++) {
                this.characters[i].render(delta);
            }

            if (that.onRender != null) that.onRender();
        };
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {string} root - root path
     */
    RENDERER.Create = function (container, root) {
        var entity = new Entity(container, root);
        entity.env = new RENDERER.SetupEnv(entity);
        entity.map = new RENDERER.Map(entity);
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer);