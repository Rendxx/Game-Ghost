window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var Create = function () {
        var gird = new MapDesigner.GridPanel($('.sensorPanel'), $('.gridPanel'));
        var furnitureSelector = new MapDesigner.FurnitureSelector($('.furnitureSelectorList'));
        var datGui = new MapDesigner.DatGui();
        var furniture = new MapDesigner.Furniture($('.furniturePanel'), $('.wallPanel'), $('.sensorPanel'));
        var fileManager = new MapDesigner.FileManager($('.furnitureSelectorList'), gird, furniture);

        datGui.onChange = function (dat) {
            dat = dat || {};
            gird.reset(dat.height, dat.width);
            furniture.resize(dat.height, dat.width);
        };

        gird.onMouseEnter = furniture.showFigure;
        gird.onClick = furniture.setFurniture;
        furnitureSelector.onChange = furniture.changeType;

        gird.reset(Data.grid.height, Data.grid.width);
        furniture.resize(Data.grid.height, Data.grid.width);
        furnitureSelector.reset();
        
        var entity = {
            gird:gird,
            furnitureSelector:furnitureSelector,
            datGui: datGui,
            furniture: furniture,
            fileManager: fileManager,
        };
        return entity;
    };

    MapDesigner.Create = Create;
})(window.Rendxx.MapDesigner);