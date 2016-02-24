window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var DatGui = function (container) {
        var that = this;
        this.onChange = null;
        this.onDoorSetting = null;

        var datPkg = new function () {
            this.width = Data.grid.width;
            this.height = Data.grid.height;
            this.change = function () {
                if (that.onChange != null) that.onChange(this);
            };
            this.doorSetting = function () {
                if (that.onDoorSetting != null) that.onDoorSetting();
            };
        };

        var datGUI;
        datGUI = new dat.GUI();
        datGUI.add(datPkg, 'width', 10, 100).name('Width').step(1);
        datGUI.add(datPkg, 'height', 10, 100).name('Height').step(1);
        datGUI.add(datPkg, 'change').name('Change');
        datGUI.add(datPkg, 'doorSetting').name('Door Setting');
    };

    MapDesigner.DatGui = DatGui;
})(window.Rendxx.MapDesigner);