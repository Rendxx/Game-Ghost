var window = {};
var _system = null;

var funcMap = {
    "init": function (para) {
        _system = window.Rendxx.Game.Ghost.System.Create();
        _system.send = function (dat) {
            postMessage({
                func: 'send',
                para: {
                    dat: dat
                }
            });
        }
        _system.onSetuped = function (dat) {
            postMessage({
                func: 'onSetuped',
                para: {
                    dat: dat
                }
            });
        };
        _system.onChange = function (dat) {
            postMessage({
                func: 'onChange',
                para: {
                    dat: dat
                }
            });
        };
        _system.onStarted = function (modelData, mapData, playerData) {
            postMessage({
                func: 'onStarted',
                para: {
                    modelData: modelData,
                    mapData: mapData,
                    playerData: playerData
                }
            });
        };
        _system.onEnded = function (dat) {
            postMessage({
                func: 'onEnded',
                para: {
                    dat: dat
                }
            });
        };
    },
    "receive": function (para) {
        if (_system == null) return;
        var msg = undefined;
        if (para) msg = para.msg;
        _system.receive(msg);
    },
    "reset": function (para) {
        if (_system == null) return;
        var data = undefined;
        if (para) data = para.data;
        _system.reset(data);
    },
    "start": function () {
        if (_system == null) return;
        _system.start();
    },
    "end": function (para) {
        if (_system == null) return;
        var isWin = undefined;
        if (para) isWin = para.isWin;
        _system.end(isWin);
    },
    "setup": function (para) {
        if (_system == null) return;
        var modelData = undefined,
            mapData = undefined,
            playerData = undefined;
        if (para) {
            modelData = para.modelData;
            mapData = para.mapData;
            playerData = para.playerData;
        }
        _system.setup(modelData, mapData, playerData);
    }
};


onmessage = function (e) {
    if (e == null || e.data == null || e.data.func == null || !funcMap.hasOwnProperty(e.data.func)) return;
    funcMap[e.data.func](e.data.para);
};
