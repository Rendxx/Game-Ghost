window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

(function (RENDERER) {
    var _Data = {
        html: {
            wrap: '<div class="end-screen"></div>',
            logo: '<div class="ghost-logo"></div>',
            renew: '<div class="_renew">RENEW</div>',
            item: '<div class="_renew">RENEW</div>'
        }
    };
    var End = function (container, opts_in) {
        var html_wrap = $('.end'),
            isShown = false,
            _html = {},
            html_content = null,
            html_renew = null;

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
            if (gameData.end.survivorWin) {
                s = "survivor win!"
            } else {
                s = "ghost win!"
            }
            html_content.html(s);
        };

        // Private ---------------------------------------
        var _setupHtml = function (opts) {
            var onRenew = (opts && opts.renew != null) ? opts.renew : null;
            _html['container'] = $(container);
            _html['wrap'] = $(_Data.html.wrap).appendTo(_html['container']);
            _html['logo'] = $(_Data.html.logo).appendTo(_html['wrap']);

            if (onRenew !== null) {
                _html['renew'] = $(_Data.html.renew).appendTo(_html['wrap']);
                _html['renew'].click(function () {
                    onRenew();
                });
            }
        };

        var _init = function (opts) {
            _setupHtml(opts);
        }(opts_in);
    };
    RENDERER.End = End;
})(window.Rendxx.Game.Ghost.Renderer);