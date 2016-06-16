var window = {};
var _system = null;

var funcMap = {
    "init": function (para) {
        _system = new window.Rendxx.Game.Ghost.System.Core();
        _system.send = function (dat) {
            postMessage({
                func: 'send',
                para: {
                    dat: dat
                }
            });
        }
        _system.onSetuped = function (setupData) {
            postMessage({
                func: 'onSetuped',
                para: {
                    setupData: setupData
                }
            });
        };
        _system.onUpdated = function (gameData, updateData) {
            postMessage({
                func: 'onUpdated',
                para: {
                    gameData: gameData,
                    updateData: updateData
                }
            });
        };
        _system.clientSetup = function (targets, clientData) {
            postMessage({
                func: 'clientSetup',
                para: {
                    targets: targets,
                    clientData: clientData
                }
            });
        };
        _system.clientUpdate = function (targetArr, clientData) {
            postMessage({
                func: 'clientUpdate',
                para: {
                    targetArr: targetArr,
                    clientData: clientData
                }
            });
        };
        _system.onEnd = function (endData) {
            postMessage({
                func: 'onEnd',
                para: {
                    endData: endData
                }
            });
        };
    },
    "action": function (para) {
        if (_system === null) return;
        var clientId = undefined,
            dat = undefined;
        if (para) {
            clientId = para.clientId;
            dat = para.dat;
        }
        _system.action(clientId, dat);
    },
    "receive": function (para) {
        if (_system === null) return;
        var msg = undefined;
        if (para) msg = para.msg;
        _system.receive(msg);
    },
    "reset": function (para) {
        if (_system === null) return;
        var setupData = undefined,
            gameData = undefined;
        if (para) {
            setupData = para.setupData;
            gameData = para.gameData;
        }
        _system.reset(setupData, gameData);
    },
    "setup": function (para) {
        if (_system === null) return;
        var modelData = undefined,
            mapData = undefined,
            playerData = undefined;
        if (para) {
            modelData = para.modelData;
            mapData = para.mapData;
            playerData = para.playerData;
        }
        _system.setup(modelData, mapData, playerData);
    },
    "start": function () {
        if (_system === null) return;
        _system.start();
    },
    "end": function () {
        if (_system === null) return;
        _system.end();
    },
    "renew": function () {
        if (_system === null) return;
        _system.renew();
    },
    "pause": function () {
        if (_system === null) return;
        _system.pause();
    },
    "continue": function () {
        if (_system === null) return;
        _system.continue();
    }
};


onmessage = function (e) {
    if (!funcMap.hasOwnProperty(e.data.func)) return;
    funcMap[e.data.func](e.data.para);
};
