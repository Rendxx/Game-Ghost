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
        ObjType: 'door',
        Status: {
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3,
            Destroyed: 4,
            NoPower: 5
        },
        Operation: {
            Open: 1,
            Close: 2,
            Locked: 3,
            Unlock: 4,
            Block: 5,
            Destroy: 6,
            Check: 7
        }
    };

    // Construct -----------------------------------------------------
    var Door = function (id, info, modelData, name, entity) {
        SYSTEM.MapObject.Basic.call(this, id, info, modelData, entity);

        this.actived = true;
        this.noiseName = SYSTEM.Noise.Data.Name.Door;
        this.noiseProbability = Data.noise.door.probability;
        this.objType = _Data.ObjType;
        this.blockSight = modelData.blockSight;
        this.electric = modelData.electric === true;
        this.blockList = {};
        this.name = name;
        this.status = this.electric ? _Data.Status.NoPower : _Data.Status.Closed;

        this._lockCache = false;// use for lock and electric
    };
    Door.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Door.prototype.constructor = Door;

    // Method --------------------------------------------------------
    Door.prototype.reset = function (_recoverData) {
        if (_recoverData === undefined || _recoverData === null) return;
        if ('status' in _recoverData) this.status = _recoverData.status;
        if ('blockList' in _recoverData) this.blockList = _recoverData.blockList;
        this.actived = (this.status !== _Data.Status.Destroyed);
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

    Door.prototype.open = function (isSuccess) {
        if (!isSuccess) {
            this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.ObjType, this.id, SYSTEM.Sound.Data.Name.CantOpen);
            return;
        }
        this.status = _Data.Status.Opened;
        this.entity.noise.generateNoise(this.noiseProbability, this.noiseName, this.x, this.y);
        this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.ObjType, this.id, SYSTEM.Sound.Data.Name.OpenDoor);
        this.updateData();
    };

    Door.prototype.close = function () {
        this.status = _Data.Status.Closed;
        this.entity.noise.generateNoise(this.noiseProbability, this.noiseName, this.x, this.y);
        this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.ObjType, this.id, SYSTEM.Sound.Data.Name.CloseDoor);
        this.updateData();
    };

    Door.prototype.unlock = function (isSuccess) {
        if (!isSuccess) {
            this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.ObjType, this.id, SYSTEM.Sound.Data.Name.Locked);
            return;
        }
        this.status = _Data.Status.Closed;
        this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.ObjType, this.id, SYSTEM.Sound.Data.Name.Unlock);
        this.updateData();
    };

    Door.prototype.lock = function () {
        if (this.electric) {
            this._lockCache = true;
            return;
        }
        this.status = _Data.Status.Locked;
        //this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.ObjType, this.id, SYSTEM.Sound.Data.Name.Unlock);
        this.updateData();
    };

    Door.prototype.block = function (characterId) {
        this.blockList[characterId] = true;
        this.updateData();
    };

    Door.prototype.unblock = function (characterId) {
        delete this.blockList[characterId];
        this.updateData();
    };

    Door.prototype.destroy = function (characterId) {
        this.actived = false;
        this.blockList = {};
        this.status = _Data.Status.Destroyed;
        this.updateData();
    };

    Door.prototype.powerOn = function () {
        this.status = this._lockCache ? _Data.Status.Locked : _Data.Status.Closed;
        this.updateData();
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Door = Door;
    SYSTEM.MapObject.Door.Data = _Data;
})(window.Rendxx.Game.Ghost.System);