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
        this.teleporting = false;
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
        dat['teleporting'] = this.teleporting;
        return dat;
    };

    // use the item in front of the character
    Ghost.prototype.interaction = function () {
        if (!this.actived || this.teleporting) return;
        if (this.accessObject === null) return;
        var obj = this.entity.map.objList[this.accessObject.type][this.accessObject.id];
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Opened) {
                    obj.close();
                } else if (info.status === SYSTEM.MapObject.Door.Data.Status.Locked) {
                    obj.unlock(false);
                    this.entity.message.send(this.id, _Data.message.doorLock.replace('#name#', obj.name));
                } else if (info.blocked) {
                    obj.open(false);
                    this.entity.message.send(this.id, _Data.message.doorBlock);
                } else {
                    obj.open(true);
                }
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                if (info.disabled) break;
                if (info.status === SYSTEM.MapObject.Furniture.Data.Status.Closed) {
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

    Ghost.prototype._updateStatus = function () {
        // endurance
        if (this.endurance <= 0) {
            this.rush = false;
            if (this.teleporting) this._teleport();
        }
        if (this.endurance < this.enduranceMax && !this.teleporting && !this.rush) {
            this.endurance += this.enduranceRecover / 20;
        }
        if (this.rush) this.endurance -= this.enduranceCost / 20;
        if (this.teleporting) this.endurance -= this.enduranceCost /60;

        var closest = _Data.range.danger;

        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team==this.team) continue;
            var r = this.entity.interAction.chracterRange[this.id][c.id];
            if (r > _Data.range.danger) continue;
            if (r < closest) closest = r;
            if (r < 1 && !this.teleporting && this.rush) c.die();     // die
            else {
                if (!this.rush && !this.teleporting) {
                    if (this.endurance < this.enduranceMax) {
                        if (this.visibleCharacter[i]) this.endurance += (this.enduranceRecover * (_Data.range.danger - r) / 8);
                        else this.endurance += (this.enduranceRecover * (_Data.range.danger - r) / 320);
                    }
                }
            }
        }

        // random fly
        this.teleportCount++;
        if (this.teleportCount >= _Data.teleportCountMax) {
            var yx = this.entity.interAction.findEmptyPos();
            this.x = yx[1] + 0.5;
            this.y = yx[0] + 0.5;
            this.teleportCount = 0;
        }

        // danger
        this.danger = (_Data.range.danger - closest) / _Data.range.danger;
        if (this.danger > 0.3) this.danger = 0.3;
    };

    Ghost.prototype._updateVisible = function () {
        if (this.teleporting) {
            for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
                var c = this.entity.characterManager.characters[i];
                this.visibleCharacter[c.id] = false;
            }
        } else {
            SYSTEM.Character.Basic.prototype._updateVisible.call(this);
        }
    };

    Ghost.prototype._move = function (deltaX, deltaY) {
        if (this.teleporting) {
            deltaX *= 30;
            deltaY *= 30;
            this._teleporting(deltaX, deltaY);
        } else {
            SYSTEM.Character.Basic.prototype._move.call(this, deltaX, deltaY);
        }
    };

    Ghost.prototype._teleporting = function (deltaX, deltaY) {
        var _radius = this.modelData.radius;
        var x2 = this.x + deltaX + (deltaX > 0 ? _radius : -_radius),
            y2 = this.y + deltaY + (deltaY > 0 ? _radius : -_radius),
            x_t = 0,
            y_t = 0;

        var newX = Math.floor(x2),
            newY = Math.floor(y2),
            oldX = Math.floor(this.x),
            oldY = Math.floor(this.y);

        x_t = this.x + deltaX;
        y_t = this.y + deltaY;
        if (x_t < 0.5) x_t = 0.5;
        else if (x_t >= this.entity.map.width - 0.5) x_t = this.entity.map.width - 0.5;
        if (y_t < 0.5) y_t = 0.5;
        else if (y_t >= this.entity.map.height - 0.5) y_t = this.entity.map.height - 0.5;

        this.x = x_t;
        this.y = y_t;
        return;
    };
    Ghost.prototype.crazy = function () {
        if (this.endurance >= this.enduranceMax && !this.teleporting) {
            this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.objType, this.id, SYSTEM.Sound.Data.Name.Scream);
            this.rush = true;
        }
    };

    Ghost.prototype.teleportStart = function () {
        if (this.endurance < this.enduranceMax / 5 || this.teleporting) return;
        this.endurance -= this.enduranceMax / 10;
        this.teleporting = true;
    };

    Ghost.prototype.teleportEnd = function () {
        if (!this.teleporting) return;
        this._teleport();
    };

    Ghost.prototype._teleport = function () {
        if (!this.teleporting) return;
        this.teleporting = false;
        this.teleportCount = 0;
        var yx = this.entity.interAction.findEmptyPos2(this.y, this.x);
        this.x = yx[1] + 0.5;
        this.y = yx[0] + 0.5;
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Ghost = SYSTEM.Character.Ghost || {};
    SYSTEM.Character.Ghost.Mary = Ghost;
})(window.Rendxx.Game.Ghost.System);