window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.UI = window.Rendxx.Game.Ghost.UI || {};
window.Rendxx.Game.Ghost.UI.Client = window.Rendxx.Game.Ghost.UI.Client || {};

(function (CLIENT, SYSTEM) {
    var _Data = {
    };
    var Role = SYSTEM.Data.character.type;

    var Main = function (controller, game, onShow) {
        var isShown = false;
        var gameDisplay = false;
        this.message = {};

        // interface controll --------------------------------
        this.show = function () {
            if (onShow) onShow();
            isShown = true;
            game.show();
            controller.show();
        };

        this.hide = function () {
            isShown = false;
            game.hide();
            controller.hide();
        };

        // Update ---------------------------------------
        this.updateClientList = function (clientData) {
        };

        this.updateObList = function (obData) {
        };

        this.updateGame = function (gameData) {
            if (gameDisplay) {
                game.updateGame(gameData);
                controller.updateGame(gameData[8]);
            } else {
                controller.updateGame(gameData);
            }
        };

        // api -------------------------------------------
        this.reset = function (setupData) {
            controller.reset(setupData);
            controller.message = this.message;
            if (setupData.role !== Role.ghost) {
                gameDisplay = false;
                game.hide();
                controller.setLoaded();
            } else {
                gameDisplay = true;
                game.reset(setupData.game);
            }
        };


        // Private ---------------------------------------
        var _setupHtml = function () {
        };

        var _init = function () {
            game.onSetuped = function () { controller.setLoaded(); };
            _setupHtml();
        }();
    };
    CLIENT.Main = Main;
})(Rendxx.Game.Ghost.UI.Client, window.Rendxx.Game.Ghost.System);