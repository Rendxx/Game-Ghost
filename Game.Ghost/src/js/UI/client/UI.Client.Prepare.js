window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.UI = window.Rendxx.Game.Ghost.UI || {};
window.Rendxx.Game.Ghost.UI.Client = window.Rendxx.Game.Ghost.UI.Client || {};

(function (CLIENT) {
    var _Data = {
        html: {
            wrap: '<div class="prepare-screen"></div>',
            name: '<div class="_name"></div>',
            text: '<div class="_text">WAITING FOR START</div>'
        }
    };

    var Prepare = function (container, clientName, onShow) {
        // Property -------------------------------------
        var // html
            _html = {},
            // data
            // flag
            isShown = false;
        // cache     

        // Callback -------------------------------------

        // interface controll --------------------------------
        this.show = function () {
            if (onShow) onShow();
            isShown = true;
            _html['container'].fadeIn();
        };

        this.hide = function () {
            isShown = false;
            _html['container'].fadeOut();
        };

        // Update ---------------------------------------
        this.updateClientList = function (clientData) {
        };

        this.updateObList = function (obData) {
        };

        this.updateGame = function (gameData) {
        };
        // api -------------------------------------------

        // Private ---------------------------------------

        // Setup -----------------------------------------
        var _setupHtml = function () {
            _html = {};
            _html['container'] = $(container);
            _html['wrap'] = $(_Data.html.wrap).appendTo(_html['container']);
            _html['name'] = $(_Data.html.name).text(clientName).appendTo(_html['wrap']);
            _html['text'] = $(_Data.html.text).appendTo(_html['wrap']);
        }

        var _init = function () {
            _setupHtml();
        }();
    };
    CLIENT.Prepare = Prepare;
})(Rendxx.Game.Ghost.UI.Client);