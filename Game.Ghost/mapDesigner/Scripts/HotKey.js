window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var HotKey = function (container) {
        // data -----------------------------------------------------
        var _html = {
            container: container
        };

        var that = this,
            hotKeyMap = {};

        this.callback = {};

        // method

        var _setupFunction = function () {
            // bind hot key
            $(document).on('keypress', function (e) {
                var c = String.fromCharCode(e.which).toLowerCase();
                if (c in hotKeyMap && that.callback[hotKeyMap[c]] != null) {
                    that.callback[hotKeyMap[c]]();
                    return false;
                }
            });
        };

        var _init = function () {
            for (var i in Data.hotKey) {
                var d = Data.hotKey[i];
                hotKeyMap[d.key.toLowerCase()] = i;
                $(Data.html.hotKey).html('[<b>' + d.key.toUpperCase() + '</b>]').attr('data-commend', d.commend).appendTo(_html.container);
            }
            _setupFunction();
        };
        _init();
    };

    MapDesigner.HotKey = HotKey;
})(window.Rendxx.MapDesigner);