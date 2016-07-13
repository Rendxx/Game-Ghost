window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.UI = window.Rendxx.Game.Ghost.UI || {};
window.Rendxx.Game.Ghost.UI.Client = window.Rendxx.Game.Ghost.UI.Client || {};

(function (CLIENT, RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        html: {
            wrap: '<div class="end-screen"></div>',
            character: '<div class="_characterIcon"></div>',
            icon: '<div class="_icon"></div>',
            text: '<div class="_text"></div>',
            color: '<div class="_color"></div>'
        },
        cssClass: {
            success: '_success',
            failed: '_failed',
            dead: '_dead'
        }
    };

    var End = function (container, root, onShow) {
        var _html = {},
            isShown = false;


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
            var endData = gameData[8];
            var id = Number(gameData[9]);
            var c = null;

            if (endData.ghost.hasOwnProperty(id)) {
                c = endData.ghost[id];
            } else {
                c =  endData.survivor[id];
            }

            _html['icon'].css('background-image', 'url(' + root + Data.character.path + c.portrait + ')');
            _html['wrap'].addClass(c.team === endData.team ? _Data.cssClass.success : _Data.cssClass.failed);
            if (c.dead) _html['icon'].addClass(_Data.cssClass.dead);
            _html['text'].text((endData.survivorWin) ? "SURVIVOR ESCAPED" : "ALL KILLED");
        };

        // Private ---------------------------------------
        var _setupHtml = function () {
            _html = {};
            _html['container'] = $(container);
            _html['wrap'] = $(_Data.html.wrap).appendTo(_html['container']);
            _html['color'] = $(_Data.html.color).appendTo(_html['wrap']);
            _html['text'] = $(_Data.html.text).appendTo(_html['wrap']);
            _html['character'] = $(_Data.html.character).appendTo(_html['wrap']);
            _html['icon'] = $(_Data.html.icon).appendTo(_html['character']);
        };

        var _init = function () {
            _setupHtml();
        }();
    };
    CLIENT.End = End;
})(Rendxx.Game.Ghost.UI.Client, window.Rendxx.Game.Ghost.Renderer);