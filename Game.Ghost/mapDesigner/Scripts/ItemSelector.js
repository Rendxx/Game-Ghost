window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var ItemSelector = function (category, selectorList) {
        // data -----------------------------------------------------
        var _html = {
            category: category,
            selectorList: selectorList,
            categoryBtn: null,
            selector: null,
            selectorCategory: null
        };
        var that = this,
            itemData = null,        // all item data package
            loadCount = 0,
            loadedCount = 0,
            lastSelect = null;

        // callback
        this.onChange = null;
        this.onLoaded = null;
        this.onSelectCategory = null;

        // public data
        this.current = 1;

        // method
        this.reset = function () {
            _html.selector = {};
            _html.selectorCategory = {};

            itemData = {};
            _html.selectorList.empty();
            loadCount = 1;
            for (var category in Data.files) {
                itemData[category] = {};
                _html.selectorCategory[category] = $(Data.html.itemSelectorCategory).appendTo(_html.selectorList).hide();
                for (var name in Data.files[category]) {
                    _loadItemData(category, name, Data.files[category][name]);
                }
            }
            loadCount--;
        };
        
        // unselect item
        this.unselect = function () {
            if (lastSelect != null) lastSelect.removeClass('hover');
            lastSelect = null;
            if (that.onChange) that.onChange(null);
        };

        var _loadItemData = function (category, name, file) {
            loadCount++;
            $.getJSON(Data.path[category] + file, function (data) {
                if (data == null) throw new Error(category + '.' + name + ': Not find.');
                if (itemData[category][name] != null) console.log(category+'.'+name+': load multiple data.');
                itemData[category][name] = data;
                var ele = $(Data.html.itemSelector).html((data.dimension != null ? '[' + data.dimension[0] + '*' + data.dimension[1] + ']&nbsp;&nbsp;' : '') + '<b>' + name + '</b>').appendTo(_html.selectorCategory[category])
                    .click(function (e) {
                        if (lastSelect != null) lastSelect.removeClass('hover');
                        lastSelect = ele;
                        ele.addClass('hover');
                        if (that.onChange) that.onChange(data);
                    });
                itemData[category][name].ele = ele;
                itemData[category][name].category = category;
                loadedCount++;
                if (loadedCount>=loadCount){
                    _onLoaded();
                }
            });
        };

        var _onLoaded = function () {
            if (that.onLoaded != null) that.onLoaded();
        };

        var _setupCategory = function () {
            var d = Data.categoryCss;
            _html.categoryBtn = {};
            var _lastClick = null;

            var onBtnClick = function (idx){
                if (_lastClick != null) {
                    _html.categoryBtn[_lastClick].removeClass('_actived');
                    _html.selectorCategory[_lastClick].hide();
                }
                _lastClick = idx;
                _html.categoryBtn[idx].addClass('_actived');
                _html.selectorCategory[idx].show();
                if (that.onSelectCategory) that.onSelectCategory(idx);
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