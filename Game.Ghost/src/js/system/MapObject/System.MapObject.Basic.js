window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * MapObject.Basic 
 * Basic class of object on map
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;
    var _Data = {
        ObjType: 'basic',
        Operation: {
            None: -1
        }
    };

    // Construct -----------------------------------------------------
    var Basic = function (id, para, modelData) {
        this.para;
        this.modelData;

        this.id;
        this.x;
        this.y;
        this.modelId;

        this.setup(id, para, modelData);

        // callback
        this.onChange = null;
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // Method --------------------------------------------------------
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
    };

    Basic.prototype.toJSON = function () {
        return {};
    };

    Basic.prototype.check = function () {
    };

    Basic.prototype.setup = function (id, para, modelData) {
        this.para = para;
        this.modelData = modelData;

        if (id != undefined) this.id = id;
        if (para != undefined) {
            this.x = (para.left + para.right + 1) / 2;
            this.y = (para.top + para.bottom + 1) / 2;
            this.modelId = para.modelId;
        }
    };

    Basic.prototype.updateData = function () {
        if (this.onChange == null) return;
        this.onChange(this.id, this.toJSON());
    };    

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Basic = Basic;
    SYSTEM.MapObject.Basic.Data = _Data;
})(window.Rendxx.Game.Ghost.System);