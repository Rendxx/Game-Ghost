﻿window.Rendxx = window.Rendxx || {};
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
    var Entity = function (container, root, viewPlayer_in, team_in) {
        // data
        this.domElement = container;
        this.env = null;
        this.map = null;
        this.root = root || '';
        this.characters = null;
        this.sound = null;
        this.effort = null;
        this.quickTimeEvent = null;
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
        this._onRender = function (delta) {
            if (!this.started || !flag_loaded) return;
            this.map.render();
            this.effort.render(delta);
            for (var i = 0, l = this.characters.length; i < l; i++) {
                this.characters[i].render(delta);
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
            this.map.loadData(_mapData, _modelData, _mapSetup);
            this.map.onLoaded = function () {
                loadCount--;
                onLoaded();
            };

            this.characters = [];
            for (var i in _playerData) {
                loadCount++;
                var idx = _playerData[i].setupData.id;
                this.characters[idx] = new RENDERER.Character(this, idx, _modelData.characters, _playerData[i]);
                this.characters[idx].onLoaded = function () {
                    loadCount--;
                    onLoaded();
                };
            }
            if (team_in !== undefined || team_in !== null) {
                this.team = team_in;
                this.viewPlayer = [];
                for (var i in _playerData) {
                    if (this.team[_playerData[i].team]===true) {
                        this.viewPlayer.push(_playerData[i].setupData.id);
                    }
                }
            } else {
                this.viewPlayer = viewPlayer_in;
                this.team = {};
                for (var i = 0; i < this.viewPlayer.length; i++) {
                    this.team[this.characters[this.viewPlayer[i]].team] = true;
                    break;
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

        //var lookCache = false;
        this.updateGame = function (gameData) {
            if (gameData === undefined || gameData === null || !flag_loaded) return;
            var _dat_map = gameData[0],
                _dat_character = gameData[1],
                _dat_character_assist = gameData[2],
                _dat_message = gameData[3],
                _dat_sound = gameData[4],
                _dat_noise = gameData[5],
                _dat_effort = gameData[6],
                _dat_qte = gameData[7];

            that.map.update(_dat_map);

            // handle player visible 
            //var playerVisibleList = {};

            //for (var i = 0, l = that.characters.length; i < l; i++) {
            //    if (this.team[that.characters[i].team]===true) {
            //        playerVisibleList[i] = true;
            //        for (var idx in _dat_character_assist[i][0]) {
            //            if (_dat_character_assist[i][0][idx] === true) playerVisibleList[idx] = true;
            //        }
            //    }
            //}

            //for (var i = 0, l = that.characters.length; i < l; i++) {
            //    if (_dat_message != null && _dat_message[i] != null) that.characters[i].showMessage(_dat_message[i]);
            //    that.characters[i].update(_dat_character[i], _dat_character_assist[i], playerVisibleList[i] === true);
            //}

            for (var i = 0, l = that.characters.length; i < l; i++) {
                if (_dat_message != null && _dat_message[i] != null) that.characters[i].showMessage(_dat_message[i]);
                that.characters[i].update(_dat_character[i], _dat_character_assist[i], true);
            }

            that.sound.update(_dat_sound, _dat_character_assist);
            that.noise.update(_dat_noise);
            that.effort.update(_dat_effort);
            that.quickTimeEvent.update(_dat_qte);
        };
    };

    /**
     * Create a game in domElement
     * @param {dom element} container - Dom element to contain the scene
     * @param {string} root - root path
     */
    RENDERER.Create = function (container, root, viewPlayer_in, team_in) {
        var entity = new Entity(container, root, viewPlayer_in, team_in);
        entity.env = new RENDERER.SetupEnv(entity);
        entity.map = new RENDERER.Map(entity);
        entity.sound = new RENDERER.Sound(entity);
        entity.noise = new RENDERER.Noise(entity);
        entity.effort = new RENDERER.Effort(entity);
        entity.quickTimeEvent = new RENDERER.QuickTimeEvent(entity);        
        entity.loading = new RENDERER.Loading(container);
        //entity.test = new RENDERER.Test(entity);
        return entity;
    };
})(window.Rendxx.Game.Ghost.Renderer);