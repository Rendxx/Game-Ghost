window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        html: {
            wrap: '<div class="end-screen"></div>',
            logo: '<div class="ghost-logo"></div>',
            icon: '<div class="_rstIcon"></div>',
            inner: '<div class="_inner"></div>',
            title: '<div class="_title">RENEW</div>',
            renew: '<div class="_renew">RENEW</div>',
            list: '<div class="_list"></div>',
            item: '<div class="_renew">RENEW</div>'
        },
        cssClass: {
            success: '_success',
            failed: '_failed'
        }
    };
    var End = function (container, root, onRenew) {
        var isShown = false,
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
            var s;
            if (gameData.survivorWin) {
                s = "Survivor Escaped!"
                _html['icon'].addClass(_Data.cssClass.success);
            } else {
                s = "All Surviors Are Killed!"
                _html['icon'].addClass(_Data.cssClass.failed);
            }
            _html['title'].text(s);
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
    RENDERER.End = End;
})(window.Rendxx.Game.Ghost.Renderer);