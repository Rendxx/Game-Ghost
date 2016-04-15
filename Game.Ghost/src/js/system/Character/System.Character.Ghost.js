window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Character: Basic
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;
    var _Data = {
        message: {
            getKey: "Get: ",
            hasKey: "Already have: ",
            doorLock: "The door [#name#] is locked",
            doorBlock: "The door is blocked from other side!",
            useKey: "Key [#key#] is used",
            noKey: "Nothing found",
        },
        range: {
            danger: 12
        },
        teleportCountMax: 3400
    };

    // Construct -----------------------------------------------------
    var Ghost = function (id, characterPara, characterData, entity) {
        SYSTEM.Character.Basic.call(this, id, characterPara, characterData, entity);
        // data
        this.danger = 0;        // danger level
        this.teleportCount = 0;      // count to auto fly
    };
    Ghost.prototype = Object.create(SYSTEM.Character.Basic.prototype);
    Ghost.prototype.constructor = Ghost;

    // Method --------------------------------------------------------
    Ghost.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
        SYSTEM.Character.Basic.prototype.reset.call(this, _recoverData);
    };

    Ghost.prototype.toJSON = function () {
        var dat = SYSTEM.Character.Basic.prototype.toJSON.call(this);
        dat['danger'] = this.danger;
        return dat;
    };

    // use the item in front of the character
    Ghost.prototype.interaction = function () {
        if (!this.actived) return;
        if (this.accessObject == null) return;
        var obj = this.entity.map.objList[this.accessObject.type][this.accessObject.id];
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status == SYSTEM.MapObject.Door.Data.Status.Opened) {
                    obj.close();
                } else if (info.status == SYSTEM.MapObject.Door.Data.Status.Locked) {
                    this.entity.message.send(this.id, _Data.message.doorLock.replace('#name#', obj.name));
                } else if (info.blocked) {
                    this.entity.message.send(this.id, _Data.message.doorBlock);
                } else {
                    obj.open();
                }
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                if (info.disabled) break;
                if (info.status == SYSTEM.MapObject.Furniture.Data.Status.Closed) {
                    obj.open();
                } else {
                    obj.close();
                }
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                break;
        }
        this.entity.interAction.updateInteraction(obj.objType, info.id);
        this.updateData();
    };

    Ghost.prototype.checkOperation = function (obj) {
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status == SYSTEM.MapObject.Door.Data.Status.Opened) {
                    return [SYSTEM.MapObject.Door.Data.Operation.Close];
                }
                return [SYSTEM.MapObject.Door.Data.Operation.Open];
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                if (info.status == SYSTEM.MapObject.Furniture.Data.Status.None) return [SYSTEM.MapObject.Basic.Data.Operation.None];
                if (info.status == SYSTEM.MapObject.Furniture.Data.Status.Closed) {
                    return [SYSTEM.MapObject.Furniture.Data.Operation.Open];
                }
                return [SYSTEM.MapObject.Furniture.Data.Operation.Close];
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                break;
        }
        return [SYSTEM.MapObject.Basic.Data.Operation.None];
    };

    Ghost.prototype._updateStatus = function () {
        // endurance
        if (this.endurance <= 0) this.rush = false;
        if (this.endurance < this.modelData.para.endurance) {
            this.endurance += this.enduranceRecover / 20;
        }
        if (this.rush) this.endurance -= this.enduranceCost / 20;

        var closest = _Data.range.danger;

        for (var i = 0; i < this.characterCheckingList.length; i++) {
            var c = this.entity.characters[this.characterCheckingList[i]];
            if (!c.actived) continue;
            var r = Math.sqrt(Math.pow(this.x - c.x, 2) + Math.pow(this.y - c.y, 2));
            if (r > _Data.range.danger) continue;
            if (r < closest) closest = r;
            if (r < 1) c.die();     // die
            else {
                if (!this.rush) {
                    if (this.endurance < this.modelData.para.endurance) {
                        if (this.visibleCharacter[i]) this.endurance += (this.enduranceRecover * (_Data.range.danger - r) / 8);
                        else this.endurance += (this.enduranceRecover * (_Data.range.danger - r) / 24);
                    }
                }
            }
        }

        // random fly
        this.teleportCount++;
        if (this.teleportCount >= _Data.teleportCountMax) {
            var yx =  this.entity.interAction.findEmptyPos();
            this.x = yx[1] + 0.5;
            this.y = yx[0] + 0.5;
            this.teleportCount = 0;
        }

        // danger
        this.danger = (_Data.range.danger - closest) / _Data.range.danger;
        if (this.danger > 0.3) this.danger = 0.3;
    };

    Ghost.prototype.crazy = function () {
        if (this.endurance >= this.modelData.para.endurance) {
            this.rush = true;
        }
    };

    Ghost.prototype.teleport = function () {
        if (this.endurance >= this.modelData.para.endurance / 5) {
            var yx =  this.entity.interAction.findEmptyPos();
            this.x = yx[1] + 0.5;
            this.y = yx[0] + 0.5;
            this.endurance -= this.modelData.para.endurance / 5;
            this.teleportCount = 0;
        }
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Ghost = Ghost;
})(window.Rendxx.Game.Ghost.System);