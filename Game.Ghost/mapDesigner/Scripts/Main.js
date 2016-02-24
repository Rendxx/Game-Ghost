﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var Create = function () {
        var grid = new MapDesigner.GridPanel($('.sensorPanel'), $('.gridPanel'));
        var itemSelector = new MapDesigner.ItemSelector($('.category'), $('.itemSelectorList'));
        var datGui = new MapDesigner.DatGui();
        var drawManager = new MapDesigner.DrawManager($('.furniturePanel'), $('.wallPanel'), $('.groundPanel'), $('.sensorPanel'));
        var fileManager = new MapDesigner.FileManager($('.file'), grid, drawManager);
        var hotKeyManager = new MapDesigner.HotKey($('.hotKey'));
        var doorSetting = new MapDesigner.DoorSetting($('.doorSetting'));

        // callback ----------------------------------------
        hotKeyManager.callback.rotate = function () {
            drawManager.rotate();
        };
        hotKeyManager.callback.del = function () {
            drawManager.deleteTarget();
        };

        doorSetting.onSelect = function (idx) {

        };

        doorSetting.onEditName = function (idx) {
            $$.info.input({
                instruction: 'Please input door name',
                maxlength: 15
            }, null, false, "rgba(0,0,0,0.6)", function (data) {
                drawManager.setDoorName(idx, data);
                doorSetting.setDoorName(idx, data);
            });
        };

        datGui.onChange = function (dat) {
            dat = dat || {};
            grid.reset(dat.height, dat.width);
            drawManager.resize(dat.height, dat.width);
        };

        datGui.onDoorSetting = function () {
            itemSelector.unselect();
            doorSetting.show(drawManager.getDoorSetting());
        };

        grid.onMouseEnter = drawManager.showFigure;
        grid.onClick = drawManager.setFurniture;
        itemSelector.onChange = function (data) {
            drawManager.changeType(data);
        };

        itemSelector.onSelectCategory = function () {
            doorSetting.hide();
        };
        
        grid.reset(Data.grid.height, Data.grid.width);
        drawManager.resize(Data.grid.height, Data.grid.width);
        itemSelector.reset();
        
        var entity = {
            grid:grid,
            itemSelector:itemSelector,
            datGui: datGui,
            drawManager: drawManager,
            fileManager: fileManager,
        };
        return entity;
    };

    MapDesigner.Create = Create;
})(window.Rendxx.MapDesigner);