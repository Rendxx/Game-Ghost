window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Main entry of Game.Ghost 
 */
(function (RENDERER) {
    /**
     * Game Entity
     */
    var Data = RENDERER.Data;
    var Entity = function (container, root, viewPlayer_in) {
        // data
        this.domElement = container;
        this.env = null;
        this.map = null;
        this.root = root || '';
        this.characters = null;
        this.sound = null;
        this.loading = null;
        this.test = null;
        this.started = false;
        this.viewPlayer = null;
        this.layerIdxMap = null;
        this.team = {};

        var that = this,
            flag_loaded = false;

        // callback -------------------------------------------
        this.onSetuped = null;
        this.onRender = null;
        this.onStarted = null;
        var _onStarted = function () {
            _onStarted = null;
            that.loading.hide();
            if (that.onStarted !== null) that.onStarted();
        };

        // inner callback
        this._onRender = function () {
            if (!this.started || !flag_loaded) return;
            this.map.render();
            for (var i = 0, l = this.characters.length; i < l; i++) {
                this.characters[i].render();
            }

            if (that.onRender !== null) that.onRender();
            if (_onStarted !== null) _onStarted();
        };

        // api -------------------------------------------
        this.show = function () {
            this.started = true;
            $(this.domElement).fadeIn()
        };

        this.hide = function () {
            this.started = false;
            $(this.domElement).fadeOut()
        };

        this.reset = function (setupData) {
            if (setupData === undefined || setupData === null) return;
            // onload callback
            var loadCount = 1;
            var onLoaded = function () {
                if (loadCount > 0) return;
                flag_loaded = true;
                if (that.onSetuped) that.onSetuped();
                if (that.test !== null)
                    that.test.setup();
            };

            // load models
            var _mapSetup = setupData.mapSetup;
            var _mapData = setupData.map;
            var _modelData = setupData.model;
            var _playerData = setupData.player;

            loadCount++;
            this.map.onLoaded = function () {
                loadCount--;
                onLoaded();
            };
            this.map.loadData(_mapData, _modelData, _mapSetup);

            this.characters = [];
            for (var i in _playerData) {
                loadCount++;
                var idx = _playerData[i].setupData.id;
                this.characters[idx] = new RENDERER.Character(this, idx, _modelData.characters, _playerData[i]);
                this.characters[idx].onLoaded = function () {
                    loadCount--;
                    onLoaded();
                };
                this.characters[idx].load();
            }

            this.viewPlayer = _playerData[viewPlayer_in].setupData.id;
            this.team[_playerData[viewPlayer_in].team] = true;

            this.env.viewportSetup(this.viewPlayer);
            this.sound.playerSetup(this.viewPlayer);
            loadCount--;
            onLoaded();
        };

        this.updateClientList = function (clientData) {
        };

        this.updateObList = function (clientData) {
        };

        //var lookCache = false;
        this.updateGame = function (gameData) {
            if (gameData === undefined || gameData === null || !flag_loaded) return;
            that.map.update(gameData.map);

            // handle player visible 
            var playerVisibleList = {};

            for (var i = 0, l = that.characters.length; i < l; i++) {
                if (this.team[that.characters[i].team]===true) {
                    playerVisibleList[i] = true;
                    for (var idx in gameData.characters[i].visibleCharacter) {
                        if (gameData.characters[i].visibleCharacter[idx] === true) playerVisibleList[idx] = true;
                    }
                }
            }

            for (var i = 0, l = that.characters.length; i < l; i++) {
                if (gameData.message!=null && gameData.message[i]!=null) that.characters[i].showMessage(gameData.message[i]);
                that.characters[i].update(gameData.characters[i], playerVisibleList[i] === true);
            }
            that.sound.update(gameData.sound, gameData.characters);
        };
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {string} root - root path
     */
    RENDERER.Create = function (container, root, viewPlayer_in) {
        var entity = new Entity(container, root, viewPlayer_in);
        entity.env = new RENDERER.SetupEnv(entity);
        entity.map = new RENDERER.Map(entity);
        entity.sound = new RENDERER.Sound(entity);
        entity.loading = new RENDERER.Loading(container);
        //entity.test = new RENDERER.Test(entity);
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer2D);