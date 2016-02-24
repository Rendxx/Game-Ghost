window.Rendxx = window.Rendxx || {};
window.Rendxx.MapDesigner = window.Rendxx.MapDesigner || {};

(function (MapDesigner) {
    var Data = MapDesigner.Data;

    var DoorSetting = function (container) {
        // data -----------------------------------------------------
        var _html = {
            container: container,
            selector: null
        };
        var that = this;

        // callback
        this.onSelect = null;

        // public data

        // method
        // show and reset panel
        this.show = function (data) {
        };
        
        this.hide = function () {
        };

        var _init = function () {
        };
        _init();
    };

    MapDesigner.DoorSetting = DoorSetting;
})(window.Rendxx.MapDesigner);