window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.WebWorker = window.Rendxx.Game.Ghost.WebWorker || {};

/**
 * WebWorker Wrapper
 */
(function (GAME) {
    var WEBWORKER = GAME.WebWorker || {};
    var SYSTEM = GAME.System || {};
    var Data = SYSTEM.Data;
    var Wrapper = function (root, core) {
        // data ----------------------------------------------------------
        var that = this,
            // components
            worker = null,
            fileLoader = null,
            root = root || '',
            // cache
            _mapData = null,
            _modelData = null,
            _playerData = null,
            // function map
            funcMap = {
                "send": function (para) {
                    var dat = undefined;
                    if (para) dat = para.dat;
                    if (that.send) that.send(dat);
                },
                "onSetuped": function (para) {
                    var setupData = undefined;
                    if (para) setupData = para.setupData;
                    if (that.onSetuped) that.onSetuped(setupData);
                },
                "onUpdated": function (para) {
                    var gameData = undefined;
                    if (para) gameData = para.gameData;
                    if (that.onUpdated) that.onUpdated(gameData);
                },
                "clientSetup": function (para) {
                    var targets = undefined;
                    var clientData = undefined;
                    if (para) {
                        targets = para.targets;
                        clientData = para.clientData;
                    }
                    if (that.clientSetup) that.clientSetup(targets, clientData);
                },
                "clientUpdate": function (para) {
                    var targets = undefined;
                    var clientData = undefined;
                    if (para) {
                        targets = para.targets;
                        clientData = para.clientData;
                    }
                    if (that.clientUpdate) that.clientUpdate(targets, clientData);
                },
                "onEnd": function (para) {
                    var endData = undefined;
                    if (para) endData = para.endData;
                    if (that.onEnd) that.onEnd(endData);
                }
            };

        // message -----------------------------------------------
        this.send = null;   // (code, content)

        this.receive = function (msg) {
            worker.postMessage({
                func: 'receive',
                para: {
                    msg: msg
                }
            });
        };

        this.action = function (clientId, dat) {
            worker.postMessage({
                func: 'action',
                para: {
                    clientId: clientId,
                    dat: dat
                }
            });
        };

        // callback ------------------------------------------
        this.onUpdated = null;      // (gameData)
        this.onSetuped = null;      // (setupData)
        this.clientSetup = null;    // (target, clientData)
        this.clientUpdate = null;   // (target, clientData)
        this.onEnd = null;          // (target, clientData)

        // update ---------------------------------------------
        this.reset = function (setupData, gameData) {
            worker.postMessage({
                func: 'reset',
                para: {
                    setupData: setupData,
                    gameData: gameData
                }
            });
        }

        this.setup = function (playerData, para) {
            _playerData = playerData;
            var mapName = para.map;
            if (Data.map.files[mapName] == null) throw new Error('Map can not be found.');
            fileLoader.loadMap(Data.map.files[mapName],
                function (data) {
                    _mapData = data;
                    onLoaded();
                },
                function (e) {
                    throw new Error('Map Loading Error: ' + e);
                });
        };

        // game ------------------------------------------------
        this.start = function () {
            worker.postMessage({
                func: 'start',
                para: {}
            });
        };

        this.end = function () {
            worker.postMessage({
                func: 'end',
                para: {}
            });
        };

        this.renew = function () {
            worker.postMessage({
                func: 'renew',
                para: {}
            });
        };

        this.pause = function () {
            worker.postMessage({
                func: 'pause',
                para: {}
            });
        };

        this.continue = function () {
            worker.postMessage({
                func: 'continue',
                para: {
                }
            });
        };


        // private method ------------------------------------------------
        var onLoaded = function () {
            if (_mapData == null || _modelData == null) return;
            worker.postMessage({
                func: 'setup',
                para: {
                    modelData: _modelData,
                    mapData: _mapData,
                    playerData: _playerData
                }
            });
        };

        var _setupLoader = function () {
            fileLoader = new SYSTEM.FileLoader(root);
            fileLoader.loadBasic(function (data) {
                _modelData = data;
                onLoaded();
            });
        };

        var _setupWebWorker = function () {
            worker = new Worker((root || "") + core);
            worker.onmessage = function (e) {
                if (e == null || e.data == null || e.data.func == null || !funcMap.hasOwnProperty(e.data.func)) return;
                funcMap[e.data.func](e.data.para);
            };
            worker.postMessage({
                func: 'init',
                para: {}
            });
        };

        var _init = function () {
            _setupLoader();
            _setupWebWorker();
        };
        _init();
    };

    /**
     * Create web worker
     */
    WEBWORKER.Create = function (root, core) {
        var wrapper = new Wrapper(root, core);
        return wrapper;
    };
})(window.Rendxx.Game.Ghost);