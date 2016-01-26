window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var Create = function () {
        var entity = {};
        entity.gird = new MapDesigner.GridPanel($('.gridPanel'));
        entity.stuff = new MapDesigner.Stuff($('.stuffPanel'));
        entity.datGui = new MapDesigner.DatGui();


        entity.datGui.onChange = function (dat) {
            entity.gird.reset(dat.height, width);
        };

        entity.gird.reset(Data.grid.height, Data.grid.width);
        entity.stuff.reset();

        return entity;
    };

    MapDesigner.Create = Create;
})(window.Rendxx.MapDesigner);