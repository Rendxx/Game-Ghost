window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * MapObject: Door
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;
    var _Data = {
        Status: {
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3
        }
    };

    // Construct -----------------------------------------------------
    var Door = function (id, info, modelData, name, hasKey) {
        SYSTEM.MapObject.Basic.call(this, id, info, modelData);
        // data 
        this.name = name;
        this.status = hasKey ? _Data.Status.Locked : _Data.Status.Closed;

        // callback
        this.onChange = null;
    };
    Door.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Door.prototype.constructor = Door;

    // Method --------------------------------------------------------
    Door.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
        if ('status' in _recoverData) this.status = _recoverData.status;
    };

    Door.prototype.toJSON = function () {
        return {
            status: this.status
        };
    };

    Door.prototype.interaction = function (character) {
        if (this.status == _Data.Status.Opened) {
            this.status = _Data.Status.Closed;
            updateData();
        } else if (this.status == _Data.Status.Closed) {
            this.status = _Data.Status.Opened;
            updateData();
        } else if (this.id in character.key) {
            this.status = _Data.Status.Opened;
            updateData();
        } else {
            updateData();
            return false;
        }
        return true;
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Door = Door;
    SYSTEM.MapObject.Door.Data = _Data;
})(window.Rendxx.Game.Ghost.System);