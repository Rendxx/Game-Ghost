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
        var that = this,
            lastSelect=null;

        // callback
        this.onSelect = null;
        this.onEditName = null;

        // public data

        // method
        // show and reset panel
        this.show = function (doorList) {
            _html.container.empty().show();
            _html.selector = {};
            for (var i in doorList) {
                var ele = $(Data.html.doorSelector).appendTo(_html.container)                
                    .click({ idx: i }, function (e) {
                        var idx = e.data.idx;
                        var ele = _html.selector[idx];
                        if (lastSelect != null) lastSelect.removeClass('hover');
                        lastSelect = ele;
                        ele.addClass('hover');
                        if (that.onSelect) that.onSelect(idx);
                    });


                ele.find("._name").html('<b>' + doorList[i].name + '</b>');
                ele.find("._edit").click({ idx: i }, function (e) {
                    var idx = e.data.idx;
                    if (that.onEditName) that.onEditName(idx);
                });
                _html.selector[i] = ele;
            }
        };
        
        this.hide = function () {
            if (lastSelect != null) lastSelect.removeClass('hover');
            lastSelect = null;
            _html.container.hide();
            if (this.onSelect != null) this.onSelect();
        };

        this.setDoorName = function (idx, name) {
            _html.selector[idx].find("._name").html('<b>' + name + '</b>');
        };

        var _init = function () {
        };
        _init();
    };

    MapDesigner.DoorSetting = DoorSetting;
})(window.Rendxx.MapDesigner);