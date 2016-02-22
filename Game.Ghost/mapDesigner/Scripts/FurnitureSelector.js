window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var FurnitureSelector = function (container) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            selector: null
        };
        var that = this;

        // callback
        this.onChange;

        // public data
        this.current = 1;

        // method
        this.reset = function () {
            _html.selector = {};
            for (var i = Data.furnitureType.length - 1; i >= 0; i--) {
                var furnitureData = Data.furnitureType[i];
                _html.selector[furnitureData.id] = $(Data.html.furnitureSelector).prependTo(_html.container).html(furnitureData.name)
                    .click({ id: furnitureData.id, idx:i }, function (e) {
                        current = e.data.id;
                        _html.selector[current].addClass('hover');
                        _html.selector[current].siblings().removeClass('hover');
                        if (that.onChange) that.onChange(Data.furnitureType[e.data.idx]);
                    });
            }

            $(Data.html.hotKey).appendTo(_html.container).html('<b>[Q]</b> to rotate');
            $(Data.html.hotKey).appendTo(_html.container).html('<b>[D]</b> to delete');
            // init
            _html.selector[Data.furnitureType[0].id].click();
        };
    };

    MapDesigner.FurnitureSelector = FurnitureSelector;
})(window.Rendxx.MapDesigner);