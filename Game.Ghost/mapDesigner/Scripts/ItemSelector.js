window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var ItemSelector = function (category, selectorList) {
        // data -----------------------------------------------------
        var _html = {
            category: category,
            selectorList: selectorList,
            categoryBtn : null,
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
                _html.selector[furnitureData.id] = $(Data.html.itemSelector).prependTo(_html.selectorList).html(furnitureData.name)
                    .click({ id: furnitureData.id, idx:i }, function (e) {
                        current = e.data.id;
                        _html.selector[current].addClass('hover');
                        _html.selector[current].siblings().removeClass('hover');
                        if (that.onChange) that.onChange(Data.furnitureType[e.data.idx]);
                    });
            }

            $(Data.html.hotKey).appendTo(_html.selectorList).html('<b>[Q]</b> to rotate');
            $(Data.html.hotKey).appendTo(_html.selectorList).html('<b>[D]</b> to delete');
            // init
            _html.selector[Data.furnitureType[0].id].click();
        };

        var _setupCategory = function () {
            var d = Data.categoryCss;
            _html.categoryBtn = {};
            var _lastClick = null;

            var onBtnClick = function (idx){
                if (_lastClick != null) _html.categoryBtn[_lastClick].removeClass('_actived');
                _lastClick = idx;
                _html.categoryBtn[idx].addClass('_actived');
            };

            for (var i in d) {
                var btn = $(Data.html.categoryBtn).addClass(d[i]).appendTo(_html.category);
                btn.click({idx:i}, function (e) {
                    onBtnClick(e.data.idx);
                });
                _html.categoryBtn[i] = btn;
            }
        };

        var _init = function () {
            _setupCategory();
        };
        _init();
    };

    MapDesigner.ItemSelector = ItemSelector;
})(window.Rendxx.MapDesigner);