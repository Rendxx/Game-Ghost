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
        var guiControls = {
            newGame: function () {
                GameSetup();
            },
            reset: function () {
                var setupData = JSON.parse(localStorage.getItem(CACHE_SETUP));
                var gameData = JSON.parse(localStorage.getItem(CACHE_GAME));
                GameReset(setupData, gameData);
            }
        };

        var datGUI = new dat.GUI();
        datGUI.add(guiControls, 'newGame');
        datGUI.add(guiControls, 'reset');
    },
    cacheSetup: function (setupData) {
        localStorage.setItem(CACHE_SETUP, JSON.stringify(setupData));
    },
    loadSetup: function () {
    },
    cacheGame: function (gameData) {
        localStorage.setItem(CACHE_GAME, JSON.stringify(gameData));
    },
    loadGame: function () {
    },
};
