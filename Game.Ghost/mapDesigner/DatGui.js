window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var DatGui = function (container) {
        this.onChange = null;

        var datPkg = new function () {
            this.width = Data.grid.width;
            this.height = Data.grid.height;
            this.change = function () {
                createGrid(this);
            };
        };

        var datGUI;
        datGUI = new dat.GUI();
        datGUI.add(datPkg, 'width', 10, 100).name('Width');
        datGUI.add(datPkg, 'height', 10, 100).name('Height');
        datGUI.add(datPkg, 'change').name('Change');
    };

    MapDesigner.DatGui = DatGui;
})(window.Rendxx.MapDesigner);