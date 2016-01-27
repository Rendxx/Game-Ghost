﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var Create = function () {
        var entity = {};
        entity.gird = new MapDesigner.GridPanel($('.gridPanel'));
        entity.stuffSelector = new MapDesigner.StuffSelector($('.stuffSelectorList'));
        entity.datGui = new MapDesigner.DatGui();
        entity.stuff = new MapDesigner.Stuff($('.stuffPanel'));


        entity.datGui.onChange = function (dat) {
            entity.gird.reset(dat.height, dat.width);
            entity.stuff.resize(dat.height, dat.width);
        };

        entity.gird.onMouseEnter = entity.stuff.showFigure;
        entity.stuffSelector.onChange = entity.stuff.changeType;

        entity.gird.reset(Data.grid.height, Data.grid.width);
        entity.stuff.resize(Data.grid.height, Data.grid.width);
        entity.stuffSelector.reset();

        return entity;
    };

    MapDesigner.Create = Create;
})(window.Rendxx.MapDesigner);