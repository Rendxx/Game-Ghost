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
    var Entity = function (container, playerNumber) {
        // data
        this.domElement = container;
        this.playerNumber = playerNumber;
        this.env = null;
        this.map = null;
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
            that.map.update(gameData.map);
            for (var i = 0, l = this.characters.length; i < l; i++) {
                that.characters[i].update(gameData.characters[i]);
            }
        };

        // callback
        this.onRender = null;

        // inner callback
        this._onRender = function () {
            if (!this.started) return;
            this.map.render();
            for (var i = 0, l = this.characters.length; i < l; i++) {
                this.characters[i].render();
            }

            if (that.onRender != null) that.onRender();
        };
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {number} playerNumber - player number
     * @param {object} map - data used to create a map
     */
    RENDERER.Create = function (container, playerNumber) {
        var entity = new Entity(container, playerNumber);
        entity.env = new RENDERER.SetupEnv(entity);
        entity.map = new RENDERER.Map(entity);
        entity.test = new RENDERER.Test(entity);
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer);