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
    var Entity = function (container, root, viewPlayer_in, isGhost_in) {
        // data
        this.domElement = container;
        this.env = null;
        this.map = null;
        this.root = root || '';
        this.characters = null;
        this.sound = null;
        this.test = null;
        this.started = false;
        this.viewPlayer = null;
        this.layerIdxMap = null;
        this.isGhost = false;

        var that = this,
            flag_loaded = false;

        // callback -------------------------------------------
        this.onSetuped = null;
        this.onRender = null;

        // inner callback
        this._onRender = function (delta) {
            if (!this.started || !flag_loaded) return;
            this.map.render();
            for (var i = 0, l = this.characters.length; i < l; i++) {
                this.characters[i].render(delta);
            }

            if (that.onRender != null) that.onRender();
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
            if (setupData == null) return;
            // onload callback
            var loadCount = 1;
            var onLoaded = function () {
                if (loadCount > 0) return;
                flag_loaded = true;
                if (that.onSetuped) that.onSetuped();
                if (that.test != null)
                    that.test.setup();
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
            if (isGhost_in != undefined) {
                this.isGhost = isGhost_in;
                this.viewPlayer = [];
                for (var i = 0, l = _playerData.length; i < l; i++) {
                    if ((_playerData[i].role == Data.character.type.ghost) == this.isGhost)
                        this.viewPlayer.push(_playerData[i].id);
                }
            } else {
                this.viewPlayer = viewPlayer_in;
                this.isGhost = false;
                for (var i = 0; i < this.viewPlayer.length; i++) {
                    if (this.characters[this.playerIdxMap[this.viewPlayer[i]]].role == Data.character.type.ghost) {
                        this.isGhost = true;
                        break;
                    }
                }
            }

            this.env.viewportSetup(this.viewPlayer);
            this.sound.playerSetup(this.viewPlayer);
            loadCount--;
            onLoaded();
        };

        this.updateClientList = function (clientData) {
        };

        this.updateObList = function (clientData) {
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
                        for (var idx in gameData.characters[i].visibleCharacter) {
                            if (gameData.characters[i].visibleCharacter[idx] == true) playerVisibleList[idx] = true;
                        }
                    }
                }
            } else {
                for (var i = 0, l = that.characters.length; i < l; i++) {
                    if (that.characters[i].role == Data.character.type.survivor) {
                        playerVisibleList[i] = true;
                        for (var idx in gameData.characters[i].visibleCharacter) {
                            if (gameData.characters[i].visibleCharacter[idx] == true) playerVisibleList[idx] = true;
                        }
                    }
                }
            }

            for (var i = 0, l = that.characters.length; i < l; i++) {
                if (gameData.message && gameData.message[i]) that.characters[i].showMessage(gameData.message[i]);
                that.characters[i].update(gameData.characters[i], playerVisibleList[i]===true);
            }
            that.sound.update(gameData.sound, gameData.characters);
        };
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {string} root - root path
     */
    RENDERER.Create = function (container, root, viewPlayer_in, isGhost_in) {
        var entity = new Entity(container, root, viewPlayer_in, isGhost_in);
        entity.env = new RENDERER.SetupEnv(entity);
        entity.map = new RENDERER.Map(entity);
        entity.sound = new RENDERER.Sound(entity);
        //entity.test = new RENDERER.Test(entity);
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer);