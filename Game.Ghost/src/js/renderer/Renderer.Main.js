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
    var Data = RENDERER.Data;
    var Entity = function (container, root, viewPlayer_in) {
        // data
        this.domElement = container;
        this.env = null;
        this.map = null;
        this.root = root || '';
        this.characters = null;
        this.test = null;
        this.started = false;
        this.viewPlayer = viewPlayer_in;
        this.layerIdxMap = null;
        this.isGhost = false;

        var that = this;

        // callback -------------------------------------------
        this.onSetuped = null;
        this.onRender = null;

        // inner callback
        this._onRender = function (delta) {
            if (!this.started) return;
            this.map.render();
            for (var i = 0, l = this.characters.length; i < l; i++) {
                this.characters[i].render(delta);
            }

            if (that.onRender != null) that.onRender();
        };

        // public method --------------------------------
        this.start = function () {
            this.started = true;
        };

        this.stop = function () {
            this.started = false;
        };

        // api -------------------------------------------
        this.show = function () {
            $(this.domElement).fadeIn()
        };

        this.hide = function () {
            $(this.domElement).fadeOut()
        };

        this.reset = function (setupData) {
            // onload callback
            var loadCount = 1;
            var onLoaded = function () {
                if (loadCount > 0) return;
                if (that.onSetuped) that.onSetuped();
            };


            // load models
            var _mapSetup = setupData.mapSetup;
            var _mapData = setupData.map;
            var _modelData = setupData.model;
            var _playerData = setupData.player;
            this.playerIdxMap = setupData.characterIdxMap;

            loadCount++;
            this.map.loadData(_mapData, _modelData, _mapSetup);
            this.map.onLoaded = function () {
                loadCount--;
                onLoaded();
            };

            this.characters = [];
            for (var i = 0, l = _playerData.length; i < l; i++) {
                loadCount++;
                this.characters[i] = new RENDERER.Character(this, i, _modelData.characters, _playerData[i]);
                this.characters[i].onLoaded = function () {
                    loadCount--;
                    onLoaded();
                };
            }
            this.isGhost = false;
            for (var i = 0; i < this.viewPlayer.length; i++) {
                if (this.characters[this.playerIdxMap[this.viewPlayer[i]]].role == Data.character.type.ghost) {
                    this.isGhost = true;
                    break;
                }
            }

            this.env.viewportSetup(this.viewPlayer);
            loadCount--;
            onLoaded();
        };

        this.updateClient = function (clientData) {
        };

        this.updateGame = function (gameData) {
            if (gameData == null) return;
            that.map.update(gameData.map);

            // handle player visible 
            var playerVisibleList = {};
            if (this.isGhost) {
                for (var i = 0, l = that.characters.length; i < l; i++) {
                    if (that.characters[i].role == Data.character.type.ghost) {
                        playerVisibleList[i] = true;
                        for (var idx in gameData.characters[i].visibleList) {
                            if (gameData.characters[i].visibleList[idx]==true)playerVisibleList[idx] = true;
                        }
                    }
                }
            } else {
                for (var i = 0, l = that.characters.length; i < l; i++) {
                    if (that.characters[i].role == Data.character.type.survivor) {
                        playerVisibleList[i] = true;
                        for (var idx in gameData.characters[i].visibleList) {
                            if (gameData.characters[i].visibleList[idx]==true)playerVisibleList[idx] = true;
                        }
                    }
                }
            }

            for (var i = 0, l = that.characters.length; i < l; i++) {
                if (gameData.message && gameData.message[i]) that.characters[i].showMessage(gameData.message[i]);
                that.characters[i].update(gameData.characters[i], playerVisibleList[i]===true);
            }
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
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer);