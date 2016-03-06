window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Load data file:
 *  Characters
 *  Items
 *  Map
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var FileLoader = function (root) {
        // data ----------------------------------------------------------
        var that = this,
            loadCount = 0,
            loadedCount = 0,
            _data_basic = null,
                root = root;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        // load basic files
        this.loadBasic = function (onSuccess) {
            if (_data_basic == null) _data_basic = {};
            loadCount = 0;

            // items
            var loadItem = function (category, name) {
                $.getJSON(root+Data.item.path[category] + items[category][name], function (data) {
                    if (data == null) throw new Error(category + '.' + name + ': Not found.');
                    if (_data_basic.items[category][data.id] != null) console.log(category + '.' + name + ': load multiple data.');
                    _data_basic.items[category][data.id] = data;
                    loadedCount++;
                    _onloaded();
                });
            };
            var items = Data.item.files;
            _data_basic.items = {};
            for (var category in items) {
                _data_basic.items[category] = {};
                for (var name in items[category]) {
                    loadCount++;
                    loadItem(category, name);
                }
            }


            // character
            var loadCharacter = function (role, name) {
                $.getJSON(root + Data.character.path + characters[role][name], function (data) {
                    if (data == null) throw new Error(role + '.' + name + ': Not found.');
                    if (_data_basic.characters[role][name] != null) console.log(role + '.' + name + ': load multiple data.');
                    _data_basic.characters[role][name] = data;
                    loadedCount++;
                    _onloaded();
                });
            };
            var characters = Data.character.files;
            _data_basic.characters = {};
            for (var role in characters) {
                _data_basic.characters[role] = {};
                for (var name in characters[role]) {
                    loadCount++;
                    loadCharacter(role, name);
                }
            }

            // on loaded
            var _onloaded = function () {
                if (loadedCount >= loadCount) {
                    onSuccess(_data_basic);
                }
            };
            _onloaded();
        };

        // load map data
        this.loadMap = function (file, onSuccess, onError) {
            $.getJSON(root + Data.map.path + file, function (data) {
                try{
                    if (data == null) throw new Error(category + '.' + name + ': Not found.');
                    if (onSuccess != null) onSuccess(data);
                } catch (e) {
                    if (onError!=null) onError(e);
                }
            });
        };

        // private method ------------------------------------------------
        var _loadItemData = function (category, name, file) {
            loadCount++;
            $.getJSON(root + Data.path[category] + file, function (data) {
                if (data == null) throw new Error(category + '.' + name + ': Not find.');
                if (itemData[category][name] != null) console.log(category + '.' + name + ': load multiple data.');
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
                if (loadedCount >= loadCount) {
                    _onLoaded();
                }
            });
        };

        var _init = function () {
        };
        _init();
    };

    /**
     * Game File Loader
     */
    SYSTEM.FileLoader = FileLoader
})(window.Rendxx.Game.Ghost.System);