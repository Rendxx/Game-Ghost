window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var Create = function () {
        var gird = new MapDesigner.GridPanel($('.sensorPanel'), $('.gridPanel'));
        var stuffSelector = new MapDesigner.StuffSelector($('.stuffSelectorList'));
        var datGui = new MapDesigner.DatGui();
        var stuff = new MapDesigner.Stuff($('.stuffPanel'), $('.wallPanel'), $('.sensorPanel'));
        var fileManager = new MapDesigner.FileManager($('.stuffSelectorList'), gird, stuff);

        datGui.onChange = function (dat) {
            dat = dat || {};
            gird.reset(dat.height, dat.width);
            stuff.resize(dat.height, dat.width);
        };

        gird.onMouseEnter = stuff.showFigure;
        gird.onClick = stuff.setStuff;
        stuffSelector.onChange = stuff.changeType;

        gird.reset(Data.grid.height, Data.grid.width);
        stuff.resize(Data.grid.height, Data.grid.width);
        stuffSelector.reset();
        
        var entity = {
            gird:gird,
            stuffSelector:stuffSelector,
            datGui: datGui,
            stuff: stuff,
            fileManager: fileManager,
        };
        return entity;
    };

    MapDesigner.Create = Create;
})(window.Rendxx.MapDesigner);