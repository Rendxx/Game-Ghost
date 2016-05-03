var stats, datGUI;
var CACHE_GAME = "gameDat";
var CACHE_SETUP = "SetupDat";
var HELPER = {
    addStats: function (container) {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        container.append(stats.domElement);
    },
    updateStat: function () {
        stats.update();
    },
    addDatGUI: function (container) {
    },
    cacheSetup: function (setupData) {
        localStorage.setItem(CACHE_SETUP, setupData);
    },
    loadSetup: function () {
    },
    cacheGame: function (gameData) {
        localStorage.setItem(CACHE_GAME, gameData);
    },
    loadGame: function () {
    },
};
