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
                    var dat = undefined;
                    if (para) dat = para.dat;
                    if (that.onSetuped) that.onSetuped(dat);
                },
                "onChange": function (para) {
                    var dat = undefined;
                    if (para) dat = para.dat;
                    if (that.onChange) that.onChange(dat);
                },
                "onLoaded": function (para) {
                    var modelData = undefined;
                    var mapData = undefined;
                    var playerData = undefined;
                    if (para) {
                        modelData = para.modelData;
                        mapData = para.mapData;
                        playerData = para.playerData;
                    }
                    if (that.onLoaded) that.onLoaded(modelData, mapData, playerData);
                },
                "onStarted": function (para) {
                    var modelData = undefined;
                    var mapData = undefined;
                    var playerData = undefined;
                    if (para) {
                        modelData = para.modelData;
                        mapData = para.mapData;
                        playerData = para.playerData;
                    }
                    if (that.onStarted) that.onStarted(modelData, mapData, playerData);
                },
                "onEnded": function (para) {
                    var dat = undefined;
                    if (para) dat = para.dat;
                    if (that.onEnded) that.onEnded(dat);
                }


            };

        // callback ------------------------------------------------------
        this.onSetuped = null;
        this.onChange = null;
        this.onStarted = null;
        this.onEnded = null;
        this.send = null;

        // public method -------------------------------------------------
        this.receive = function (msg) {
            worker.postMessage({
                func: 'receive',
                para: {
                    msg: msg
                }
            });
        };
        this.reset = function (data) {
            worker.postMessage({
                func: 'reset',
                para: {
                    data: data
                }
            });
        }
        this.start = function () {
            worker.postMessage({
                func: 'start',
                para: {}
            });
        }
        this.end = function (isWin) {
            worker.postMessage({
                func: 'end',
                para: {
                    isWin: isWin
                }
            });
        }
        this.setup = function (playerData, mapName) {
            _playerData = playerData;
            if (Data.map.files[mapName] == null) throw new Error('Map can not be found.');
            fileLoader.loadMap(Data.map.files[mapName], function (data) {
                    _mapData = data;
                    onLoaded();
                },
                function (e) {
                    throw new Error('Map Loading Error: ' + e);
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