window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer2D = window.Rendxx.Game.Ghost.Renderer2D || {};

/**
 * Loading screen
 */
(function (RENDERER) {
    /**
     * Game Entity
     */
    var Data = RENDERER.Data;
    var _Data = {
        html:{
            wrap: '<div class="loading-screen"></div>',
            logo: '<div class="ghost-logo"></div>',
            loading: '<div class="loading-text">LOADING ...</div>',
            pic: '<div class="_pic"></div>',
        }
    };
    var Loading = function (container) {
        var that = this,
            _html = {};

        this.show = function () {
            _html.wrap.fadeIn()
        };

        this.hide = function () {
            _html.wrap.fadeOut()
        };

        var setupHtml = function () {
            _html = {};
            _html['wrap'] = $(_Data.html.wrap).appendTo($(container));
            _html['logo'] = $(_Data.html.logo).appendTo(_html['wrap']);
            _html['loading'] = $(_Data.html.loading).appendTo(_html['wrap']);
            _html['pic'] = $(_Data.html.pic).appendTo(_html['wrap']);
        };

        var _init = function () {
            setupHtml();
        };
        _init();
    };


    /**
     * Game loading screen
     * @param {game entity} entity - Game entity
     * @param {object} mapData - data used to setup a map
     */
    RENDERER.Loading = Loading;
})(window.Rendxx.Game.Ghost.Renderer2D);