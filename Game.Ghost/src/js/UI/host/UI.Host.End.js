window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.UI = window.Rendxx.Game.Ghost.UI || {};
window.Rendxx.Game.Ghost.UI.Host = window.Rendxx.Game.Ghost.UI.Host || {};

(function (HOST, RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        html: {
            wrap: '<div class="end-screen"></div>',
            logo: '<div class="ghost-logo"></div>',
            icon: '<div class="_rstIcon"></div>',
            inner: '<div class="_inner"></div>',
            title: '<div class="_title"></div>',
            renew: '<div class="_renew"></div>',
            list: '<div class="_list"></div>',
            item: '<div class="_item"><div class="_text"></div></div>',
            sep: '<div class="_sep"></div>',
            clear: '<div class="_clear"></div>'
        },
        cssClass: {
            success: '_success',
            failed: '_failed',
            dead: '_dead',
            win: '_win'
        }
    };
    var End = function (container, root, onRenew) {
        var isShown = false,
            _html = {};

        // interface controll --------------------------------
        this.show = function () {
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
            var s;
            var endData = gameData[9];
            if (endData.survivorWin) {
                s = "Survivor Escaped!"
                _html['icon'].addClass(_Data.cssClass.success);
            } else {
                s = "All Surviors Are Killed!"
                _html['icon'].addClass(_Data.cssClass.failed);
            }
            _html['title'].text(s);

            _html['item'] = {};
            for (var id in endData.survivor) {
                var c = endData.survivor[id];
                _html['item'][id] = $(_Data.html.item).appendTo(_html['list']);
                _html['item'][id].css('background-image', 'url(' + root + Data.character.path + c.portrait + ')');
                _html['item'][id].find('._text').text(c.name);
                if (c.dead) _html['item'][id].addClass(_Data.cssClass.dead);
                if (c.isWin) _html['item'][id].addClass(_Data.cssClass.win);
                else if (c.team !== endData.team) _html['item'][id].addClass(_Data.cssClass.failed);
            }
            _html['sep'] = $(_Data.html.sep).appendTo(_html['list']);
            for (var id in endData.ghost) {
                var c = endData.ghost[id];
                _html['item'][id] = $(_Data.html.item).appendTo(_html['list']);
                _html['item'][id].css('background-image', 'url(' + root + Data.character.path + c.portrait + ')');
                _html['item'][id].find('._text').text(c.name);
                if (c.team !== endData.team) _html['item'][id].addClass(_Data.cssClass.failed);
                else _html['item'][id].addClass(_Data.cssClass.win);
            }
            _html['clear'] = $(_Data.html.clear).appendTo(_html['list']);
        };

        // Private ---------------------------------------
        var _setupItem = function () {

        };

        var _setupHtml = function (opts) {
            _html['container'] = $(container);
            _html['wrap'] = $(_Data.html.wrap).appendTo(_html['container']);
            _html['inner'] = $(_Data.html.inner).appendTo(_html['wrap']);
            _html['icon'] = $(_Data.html.icon).appendTo(_html['inner']);
            _html['title'] = $(_Data.html.title).appendTo(_html['inner']);
            _html['list'] = $(_Data.html.list).appendTo(_html['inner']);
            _html['logo'] = $(_Data.html.logo).appendTo(_html['wrap']); 

            if (onRenew != null) {
                _html['renew'] = $(_Data.html.renew).appendTo(_html['inner']);
                _html['renew'].click(function () {
                    onRenew();
                });
            }
        };

        var _init = function () {
            _setupHtml();
        }();
    };
    HOST.End = End;
})(window.Rendxx.Game.Ghost.UI.Host, window.Rendxx.Game.Ghost.Renderer);