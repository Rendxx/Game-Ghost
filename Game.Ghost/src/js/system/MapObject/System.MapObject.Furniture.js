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
        ObjType: 'furniture',
        Status: {
            None: 0,
            Closed: 1,
            Opened: 2
        },
        Operation: {
            Open: 1,
            Close: 2,
            Key: 3,
            Search: 4
        }
    };

    // Construct -----------------------------------------------------
    var Furniture = function (id, info, modelData) {
        SYSTEM.MapObject.Basic.call(this, id, info, modelData);

        this.actioning = false;          // this furnition is actioning
        this.blockSight = modelData.blockSight;
        this.status = modelData.statusChange == true ? _Data.Status.Closed : _Data.Status.None;
        this.key = null;                // {key id : door id}
    };
    Furniture.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Furniture.prototype.constructor = Furniture;

    // Method --------------------------------------------------------
    Furniture.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
        if ('status' in _recoverData) this.status = _recoverData.status;
        if ('key' in _recoverData) this.key = _recoverData.key;
    };

    Furniture.prototype.toJSON = function () {
        return {
            status: this.status,
            key: this.key
        };
    };

    Furniture.prototype.check = function () {
        return {
            type: _Data.ObjType,
            disabled: this.actioning,
            id: this.id,
            status: this.status,
            key: this.key
        };
    };

    Furniture.prototype.open = function () {
        if (!this.modelData.statusChange) return false;       // no interaction if status can not being changed
        if (this.actioning) return false;                     // no interaction during action
        if (this.modelData.duration != null && this.modelData.duration != 0) {
            this.actioning = true;
            setTimeout(function () { this.actioning = false; }, this.modelData.duration);
        }
        this.status = _Data.Status.Opened;
        this.updateData();
        return true;
    };
    
    Furniture.prototype.close = function () {
        if (!this.modelData.statusChange) return false;       // no interaction if status can not being changed
        if (this.actioning) return false;                     // no interaction during action
        if (this.modelData.duration != null && this.modelData.duration != 0) {
            this.actioning = true;
            setTimeout(function () { this.actioning = false; }, this.modelData.duration);
        }
        this.status = _Data.Status.Closed;
        this.updateData();
        return true;
    };

    Furniture.prototype.takeKey = function (keyIds) {
        if (this.actioning) return [];                     // no interaction during action
        if (this.key == null || keyIds == null || keyIds.length==0) return [];
        var rst = {};
        for (var i = 0; i < keyIds.length; i++) {
            var k = keyIds[i];
            if (this.key.hasOwnProperty(k)) {
                rst[k] = this.key[k];
                delete this.key[k];
            }
        }

        var noKey = true;
        for (var i in this.key) {
            noKey = false;
            break;
        }
        if (noKey) this.key = null;

        this.updateData();
        return rst;
    };
        
    Furniture.prototype.placeKey = function (key) {
        if (this.key == null) this.key = {};
        this.key[key.id] = key.doorId;
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Furniture = Furniture;
    SYSTEM.MapObject.Furniture.Data = _Data;
})(window.Rendxx.Game.Ghost.System);