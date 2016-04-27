﻿window.Rendxx = window.Rendxx || {};
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
        objType: 'character',
        message: {
            getKey: "Get: ",
            hasKey: "Already have: ",
            doorLock: "The door [#name#] is locked",
            doorBlock: "The door is blocked from other side!",
            useKey: "Key [#key#] is used",
            noKey: "Nothing found",
        },
        range: {
            danger: 14
        },
        teleportCountMax: 3400
    };

    // Construct -----------------------------------------------------
    var Ghost = function (id, characterPara, characterData, entity) {
        SYSTEM.Character.Basic.call(this, id, characterPara, characterData, entity);
        // data
        this.look = false;
        this.danger = 0;        // danger level
        this.teleportCount = 0;      // count to auto fly
    };
    Ghost.prototype = Object.create(SYSTEM.Character.Basic.prototype);
    Ghost.prototype.constructor = Ghost;

    // Method --------------------------------------------------------
    Ghost.prototype.reset = function (_recoverData) {
        if (_recoverData === null || _recoverData === undefined) return;
        SYSTEM.Character.Basic.prototype.reset.call(this, _recoverData);
    };

    Ghost.prototype.toJSON = function () {
        var dat = SYSTEM.Character.Basic.prototype.toJSON.call(this);
        dat['danger'] = this.danger;
        dat['look'] = this.look;
        return dat;
    };

    Ghost.prototype.checkOperation = function (obj) {
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Opened) {
                    return [SYSTEM.MapObject.Door.Data.Operation.Close];
                }
                return [SYSTEM.MapObject.Door.Data.Operation.Open];
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Furniture.Data.Status.None) return [SYSTEM.MapObject.Basic.Data.Operation.None];
                if (info.status === SYSTEM.MapObject.Furniture.Data.Status.Closed) {
                    return [SYSTEM.MapObject.Furniture.Data.Operation.Open];
                }
                return [SYSTEM.MapObject.Furniture.Data.Operation.Close];
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                break;
        }
        return [SYSTEM.MapObject.Basic.Data.Operation.None];
    };

    Ghost.prototype._move = function (deltaX, deltaY) {
        var _radius = this.modelData.radius;
        var x2 = this.x + deltaX + (deltaX > 0 ? _radius : -_radius),
            y2 = this.y + deltaY + (deltaY > 0 ? _radius : -_radius);
        var newX = Math.floor(x2),
            newY = Math.floor(y2),
            oldX = Math.floor(this.x),
            oldY = Math.floor(this.y);

        var obj_x = this.entity.interAction.getObject(newX, oldY);
        var obj_y = this.entity.interAction.getObject(oldX, newY);

        if (obj_x === null || (obj_x.type === SYSTEM.Map.Data.Grid.Door))
            this.x += deltaX;
        else
            this.x = deltaX > 0 ? (newX - _radius) : (newX + 1 + _radius);

        if (obj_y === null || (obj_y.type === SYSTEM.Map.Data.Grid.Door))
            this.y += deltaY;
        else
            this.y = deltaY > 0 ? (newY - _radius) : (newY + 1 + _radius);
    };

    Ghost.prototype._updateStatus = function () {
        // endurance
        if (this.endurance <= 0) this.look = false;
        if (this.endurance < this.modelData.para.endurance) {
            this.endurance += this.enduranceRecover / 20;
        }
        if (this.look) this.endurance -= this.enduranceCost / 20;

        var closest = _Data.range.danger;

        for (var i = 0; i < this.characterCheckingList.length; i++) {
            var c = this.entity.characters[this.characterCheckingList[i]];
            if (!c.actived) continue;
            var r = this.entity.interAction.chracterRange[this.id][this.characterCheckingList[i]];
            if (r > _Data.range.danger) continue;
            if (r < closest) closest = r;
            if (r < 1) c.die();     // die
            else {
            }
        }

        // random fly
        //this.teleportCount++;
        //if (this.teleportCount >= _Data.teleportCountMax) {
        //    var yx = this.entity.interAction.findEmptyPos();
        //    this.x = yx[1] + 0.5;
        //    this.y = yx[0] + 0.5;
        //    this.teleportCount = 0;
        //}

        // danger
        this.danger = (_Data.range.danger - closest) / _Data.range.danger;
        if (this.danger > 0.3) this.danger = 0.3;
        else if (this.danger > 0.6) this.danger = 0.6;
    };


    Ghost.prototype._updateVisible = function () {
        for (var i = 0; i < this.characterCheckingList.length; i++) {
            var c = this.characterCheckingList[i];
            if (this.entity.characters[c].actived) {
                this.visibleCharacter[c] = (this.entity.characters[c].rush || this.look);
            } else {
                this.visibleCharacter[c] = true;
            }
        }
    };

    Ghost.prototype.crazy = function () {
        return;
        if (this.endurance >= this.modelData.para.endurance) {
            this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.objType, this.id, SYSTEM.Sound.Data.Name.Scream);
            this.rush = true;
        }
    };

    Ghost.prototype.teleport = function () {
        if (this.endurance >= this.modelData.para.endurance/2) this.look = true;
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Ghost = SYSTEM.Character.Ghost || {};
    SYSTEM.Character.Ghost.Specter = Ghost;
})(window.Rendxx.Game.Ghost.System);