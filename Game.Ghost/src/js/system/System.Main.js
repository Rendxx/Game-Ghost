window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * WebWorker Wrapper
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var Main = function (root, corePath) {
        // data ----------------------------------------------------------
        var that = this,
            // components
            core = null,            // webworker for core
            fileLoader = null,

            // parameters
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
            core.postMessage({
                func: 'receive',
                para: {
                    msg: msg
                }
            });
        };

        this.action = function (clientId, dat) {
            core.postMessage({
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
        // reset the game with given data
        this.reset = function (setupData, gameData) {
            core.postMessage({
                func: 'reset',
                para: {
                    setupData: setupData,
                    gameData: gameData
                }
            });
        }

        // setup a new game
        this.setup = function (playerData, para) {
            _playerData = playerData;
            var mapName = para.map;
            if (!Data.map.files.hasOwnProperty(mapName)) throw new Error('Map can not be found.');
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
            core.postMessage({
                func: 'start',
                para: {}
            });
        };

        this.end = function () {
            core.postMessage({
                func: 'end',
                para: {}
            });
        };

        this.renew = function () {
            _mapData = null;
            _playerData = null;
            _setupWebWorker();
        };

        this.pause = function () {
            core.postMessage({
                func: 'pause',
                para: {}
            });
        };

        this.continue = function () {
            core.postMessage({
                func: 'continue',
                para: {
                }
            });
        };

        // private method ------------------------------------------------
        var onLoaded = function () {
            if (_mapData === null || _modelData === null) return;
            core.postMessage({
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
            if (core !== null) core.terminate();
            core = new Worker((root || "") + corePath);
            core.onmessage = function (e) {
                if (!funcMap.hasOwnProperty(e.data.func)) return;
                funcMap[e.data.func](e.data.para);
            };
            core.postMessage({
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
     * Create web core
     */
    SYSTEM.Create = function (root, corePath) {
        var main = new Main(root, corePath);
        return main;
    };
})(window.Rendxx.Game.Ghost.System);