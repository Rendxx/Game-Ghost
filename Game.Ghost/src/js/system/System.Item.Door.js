window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Item: Furniture
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
        Status: {
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3
        }
    };
    var Door = function (id, name, info, modelData, hasKey) {
        Furniture.Item.Basic.call(this, id, info, modelData);
        // data 
        this.name = name;
        this.status = hasKey ? _Data.Status.Locked : _Data.Status.Closed;

        // callback
        this.onChange = null;
    };
    Door.prototype = Object.create(SYSTEM.Item.Basic);
    Door.prototype.constructor = Door;


    // public method -------------------------------------------------
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

    // --------------------------------------------------------
    SYSTEM.Item = Item || {};
    SYSTEM.Item.Door = Door;
    SYSTEM.Item.Door.Data = _Data;
})(window.Rendxx.Game.Ghost.System);