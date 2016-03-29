window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Item.Basic 
 * Basic class of item on map
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;

    // construct ---------------------------------------------------------
    var Basic = function (id, para, modelData) {
        // data
        this.para = para;
        this.modelData = modelData;

        this.id = id;
        this.x = (para.left + para.right + 1) / 2;
        this.y = (para.top + para.bottom + 1) / 2;
        this.modelId = para.modelId;

        // callback
        this.onChange = null;
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // public method -------------------------------------------------
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
    };

    Basic.prototype.toJSON = function () {
        return {};
    };

    Basic.prototype.interaction = function () {
    };

    Basic.prototype.updateData = function () {
        if (this.onChange == null) return;
        this.onChange(this.id, this.toJSON());
    };    

    // --------------------------------------------------------
    SYSTEM.Item = Item || {};
    SYSTEM.Item.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);