window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var Stuff = function (container) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            selector: null
        };
        var that = this;

        // public data
        this.current = 1;

        // method
        this.reset = function () {
            _html.selector = {};
            for (var i = Data.stuffType.length - 1; i >= 0; i--) {
                var stuffData = Data.stuffType[i];
                _html.selector[stuffData.id] = $(Data.html.stuffSelector).prependTo(_html.container).html(stuffData.name)
                    .click({ id: stuffData.id }, function (e) {
                        current = e.data.id;
                        _html.selector[current].addClass('hover');
                        _html.selector[current].siblings().removeClass('hover');
                    });
            }

            // init
            _html.selector[Data.stuffType[0].id].click();
        };
    };

    MapDesigner.Stuff = Stuff;
})(window.Rendxx.MapDesigner);