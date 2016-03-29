window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * MapObject: Furniture
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;
    var _Data = {
        Status: {
            None: 0,
            Closed: 1,
            Opened: 2
        }
    };

    // Construct -----------------------------------------------------
    var Furniture = function (id, info, modelData) {
        SYSTEM.MapObject.Basic.call(this, id, info, modelData);
        // data 
        this.actioning = false;          // this furnition is actioning
        this.blockSight = modelData.blockSight;
        this.status = modelData.statusChange == true ? _Data.Status.Closed : _Data.Status.None;
        this.keyId = -1;            // key id, -1 means no key

        // callback 
        this.onChange = null;
    };
    Furniture.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Furniture.prototype.constructor = Furniture;

    // Method --------------------------------------------------------
    Furniture.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
        if ('status' in _recoverData) this.status = _recoverData.status;
        if ('keyId' in _recoverData) this.keyId = _recoverData.keyId;
    };

    Furniture.prototype.toJSON = function () {
        return {
            status: this.status,
            keyId: this.keyId
        };
    };

    Furniture.prototype.interaction = function () {
        if (this.actioning) return -1;                      // no interaction during action
        if ((this.status == _Data.Status.Opened || !this.modelData.statusChange) && this.keyId != -1) {
            var k = this.keyId;
            return k;
        }

        if (!this.modelData.statusChange) return -1;       // no interaction if status can not being changed
        if (this.modelData.duration != null && this.modelData.duration != 0) {
            this.actioning = true;
            setTimeout(function () { this.actioning = false; }, this.modelData.duration);
        }

        this.status = (this.status == _Data.Status.Opened ? _Data.Status.Closed : _Data.Status.Opened);
        this.updateData();
        return -1;
    };

    Furniture.prototype.token = function () {
        this.keyId = -1;
        this.updateData();
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Furniture = Furniture;
})(window.Rendxx.Game.Ghost.System);