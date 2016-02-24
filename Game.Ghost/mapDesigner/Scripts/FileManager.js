window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var FileManager = function (container, grid, item) {
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
            item: item
        };

        var that = this,
            _fileReader = null;

        // method
        var createJson = function () {
            var blob = [];
            try{
                var data = {
                    grid: {
                        width: component.grid.width,
                        height: component.grid.height,
                    },
                    item: component.item.getList(),
                    wall: component.item.getWall(),
                    doorSetting: component.item.getDoorSetting()
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
                if (!data.hasOwnProperty('grid') || !data.hasOwnProperty('item')) throw new Error('Data missing.');
            } catch (e) {
                return null;
            }
            return data;
        };

        var _init = function () {
            _fileReader = new FileReader();

            _html.save = $(Data.html.fileBtn).addClass('btn-save').html('S').appendTo(_html.container);
            _html.load = $(Data.html.fileBtn).addClass('btn-load').html('L').appendTo(_html.container);
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
                component.item.reset(data.grid.height, data.grid.width, data.item, data.doorSetting);
                _html.upload[0].value = null;
            }
        };
        _init();
    };

    MapDesigner.FileManager = FileManager;
})(window.Rendxx.MapDesigner);