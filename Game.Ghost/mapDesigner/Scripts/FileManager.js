window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var FileManager = function (container, grid, stuff) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            save: null,
            load: null,
            download: null,
            upload: null
        };
        var component = {
            grid: grid,
            stuff: stuff
        };

        var that = this,
            _fileReader = null;

        // method
        this.reset = function () {
            _html.selector = {};
            for (var i = Data.stuffType.length - 1; i >= 0; i--) {
                var stuffData = Data.stuffType[i];
                _html.selector[stuffData.id] = $(Data.html.stuffSelector).prependTo(_html.container).html(stuffData.name)
                    .click({ id: stuffData.id, idx:i }, function (e) {
                        current = e.data.id;
                        _html.selector[current].addClass('hover');
                        _html.selector[current].siblings().removeClass('hover');
                        if (that.onChange) that.onChange(Data.stuffType[e.data.idx]);
                    });
            }

            $(Data.html.hotKey).appendTo(_html.container).html('<b>[Q]</b> to rotate');
            $(Data.html.hotKey).appendTo(_html.container).html('<b>[D]</b> to delete');
            // init
            _html.selector[Data.stuffType[0].id].click();
        };

        var createJson = function () {
            var blob = [];
            try{
                var data = {
                    grid: {
                        width: component.grid.width,
                        height: component.grid.height,
                    },
                    stuff: component.stuff.getList(),
                    wall: component.stuff.getWall()
                };
                var content = JSON.stringify(data);
                blob[0] = new Blob([content], { type: 'application/json' });
            } catch (e) {
                return null;
            }
            return blob;
        };

        var parseJson = function (content) {
            var data = null;
            try{
                data = $.parseJSON(content);
                if (!data.hasOwnProperty('grid') || !data.hasOwnProperty('stuff')) throw new Error('Data missing.');
            } catch (e) {
                return null;
            }
            return data;
        };

        var _init = function () {
            _fileReader = new FileReader();

            _html.save = $(Data.html.fileBtn).addClass('btn-save').appendTo(_html.container).html('SAVE');
            _html.load = $(Data.html.fileBtn).addClass('btn-load').appendTo(_html.container).html('LOAD');
            _html.download = $('<a style="display:none"></a>').appendTo($('body'));
            _html.upload = $('<input type="file" accept=".json" style="display:none" />').appendTo($('body'));

            _html.save.click(function () {
                var blob = createJson();
                if (blob == null) {
                    $$.info.alert("Error occor when prepare the file.", null, false, "rgba(0,0,0,0.6)");
                    return;
                } 
                _html.download[0].href = URL.createObjectURL(blob[0]);
                _html.download[0].download = 'MapData.json';
                _html.download[0].click();
            });

            _html.load.click(function () {
                _html.upload[0].click();
            });

            _html.upload.change(function () {
                var file = this.files[0];
                _fileReader.readAsText(file);
            });

            _fileReader.onload = function (e) {
                var data = parseJson(_fileReader.result);
                if (data == null) {
                    $$.info.alert("Error occor when read the file.", null, false, "rgba(0,0,0,0.6)");
                    return;
                }
                component.grid.reset(data.grid.height, data.grid.width);
                component.stuff.reset(data.grid.height, data.grid.width, data.stuff);
                _html.upload[0].value = null;
            }
        };
        _init();
    };

    MapDesigner.FileManager = FileManager;
})(window.Rendxx.MapDesigner);