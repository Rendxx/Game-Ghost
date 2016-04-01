﻿window.Rendxx = window.Rendxx || {};
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
        ObjType: 'door',
        Status: {
            Locked: 0,
            Opened: 1,
            Closed: 2
        },
        Operation: {
            Open: 1,
            Close: 2,
            Locked: 3,
            Unlock: 4
        }
    };

    // Construct -----------------------------------------------------
    var Door = function (id, info, modelData, name) {
        SYSTEM.MapObject.Basic.call(this, id, info, modelData);

        this.blockList = {};
        this.name = name;
        this.status = _Data.Status.Closed;
    };
    Door.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Door.prototype.constructor = Door;

    // Method --------------------------------------------------------
    Door.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
        if ('status' in _recoverData) this.status = _recoverData.status;
        if ('blockList' in _recoverData) this.blockList = _recoverData.blockList;
    };

    Door.prototype.toJSON = function () {
        return {
            status: this.status,
            blockList: this.blockList
        };
    };

    Door.prototype.check = function () {
        var blocked = false;
        for (var i in this.blockList) {
            blocked = true;
            break;
        }
        return {
            type: _Data.ObjType,
            id: this.id,
            status: this.status,
            blocked: blocked
        };
    };

    Door.prototype.Open = function () {
        this.status = _Data.Status.Opened;
        updateData();
    };

    Door.prototype.close = function () {
        this.status = _Data.Status.Closed;
        updateData();
    };

    Door.prototype.unlock = function () {
        this.status = _Data.Status.Closed;
        updateData();
    };

    Door.prototype.lock = function () {
        this.status = _Data.Status.Locked;
        updateData();
    };

    Door.prototype.block = function (characterId) {
        this.blockList[characterId] = true;
        updateData();
    };

    Door.prototype.unblock = function (characterId) {
        delete this.blockList[characterId];
        updateData();
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Door = Door;
    SYSTEM.MapObject.Door.Data = _Data;
})(window.Rendxx.Game.Ghost.System);