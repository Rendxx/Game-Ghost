window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.UI = window.Rendxx.Game.Ghost.UI || {};
window.Rendxx.Game.Ghost.UI.Client = window.Rendxx.Game.Ghost.UI.Client || {};

(function (CLIENT) {
    var _Data = {
    };

    var Main = function (controller, game, onShow) {
        var isShown = false;

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
            game.updateGame(gameData);
        };
        // api -------------------------------------------
        this.reset = function (setupData) {
            game.reset(setupData.game);
            controller.reset(setupData);
            controller.message = this.message;
        };


        // Private ---------------------------------------
        var _setupHtml = function () {
        };

        var _init = function () {
            _setupHtml();
        }();
    };
    CLIENT.Main = Main;
})(Rendxx.Game.Ghost.UI.Client);