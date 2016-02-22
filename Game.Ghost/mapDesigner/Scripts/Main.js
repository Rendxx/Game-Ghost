window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var Create = function () {
        var gird = new MapDesigner.GridPanel($('.sensorPanel'), $('.gridPanel'));
        var itemSelector = new MapDesigner.ItemSelector($('.category'), $('.itemSelectorList'));
        var datGui = new MapDesigner.DatGui();
        var furniture = new MapDesigner.Furniture($('.furniturePanel'), $('.wallPanel'), $('.sensorPanel'));
        var fileManager = new MapDesigner.FileManager($('.file'), gird, furniture);

        datGui.onChange = function (dat) {
            dat = dat || {};
            gird.reset(dat.height, dat.width);
            furniture.resize(dat.height, dat.width);
        };

        gird.onMouseEnter = furniture.showFigure;
        gird.onClick = furniture.setFurniture;
        itemSelector.onChange = furniture.changeType;

        gird.reset(Data.grid.height, Data.grid.width);
        furniture.resize(Data.grid.height, Data.grid.width);
        itemSelector.reset();
        
        var entity = {
            gird:gird,
            itemSelector:itemSelector,
            datGui: datGui,
            furniture: furniture,
            fileManager: fileManager,
        };
        return entity;
    };

    MapDesigner.Create = Create;
})(window.Rendxx.MapDesigner);