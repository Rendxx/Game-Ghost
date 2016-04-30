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
            danger: 14
        },
        touchNumer: 16
    };

    // Construct -----------------------------------------------------
    var Ghost = function (id, characterPara, characterData, entity) {
        SYSTEM.Character.Basic.call(this, id, characterPara, characterData, entity);
        // data
        this.observing = false;
        this.danger = 0;        // danger level
        this.teleportCount = 0;      // count to auto fly
        this.touchList = {};
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
        dat['observing'] = this.observing;
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

    Ghost.prototype.getDanger = function (d) {
        return 0.3;
    };

    Ghost.prototype._move = function (deltaX, deltaY) {
        var _radius = this.modelData.radius;
        var x2 = this.x + deltaX + (deltaX > 0 ? _radius : -_radius),
            y2 = this.y + deltaY + (deltaY > 0 ? _radius : -_radius),
            x_t = 0,
            y_t = 0;

        var newX = Math.floor(x2),
            newY = Math.floor(y2),
            oldX = Math.floor(this.x),
            oldY = Math.floor(this.y);

        var obj_x = this.entity.interAction.getObject(newX, oldY);
        var obj_y = this.entity.interAction.getObject(oldX, newY);
        var obj_new = this.entity.interAction.getObject(newX, newY);
        var canMove = (obj_new === null || (obj_new.type === SYSTEM.Map.Data.Grid.Door));

        if (obj_x === null || (obj_x.type === SYSTEM.Map.Data.Grid.Door))
            this.x += deltaX;
        else {
            x_t = deltaX > 0 ? (newX - _radius) : (newX + 1 + _radius);
            if ((deltaX > 0 && x_t > this.x) || (deltaX < 0 && x_t < this.x)) this.x = x_t;
            canMove = true;
        }

        if (obj_y === null || (obj_y.type === SYSTEM.Map.Data.Grid.Door))
            this.y += deltaY;
        else {
            y_t = deltaY > 0 ? (newY - _radius) : (newY + 1 + _radius);
            if ((deltaY > 0 && y_t > this.y) || (deltaY < 0 && y_t < this.x)) this.y = y_t;
            canMove = true;
        }

        if (!canMove) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                y_t = deltaY > 0 ? (newY - _radius) : (newY + 1 + _radius);
                if ((deltaY > 0 && y_t > this.y) || (deltaY < 0 && y_t < this.x)) this.y = y_t;
            } else {
                x_t = deltaX > 0 ? (newX - _radius) : (newX + 1 + _radius);
                if ((deltaX > 0 && x_t > this.x) || (deltaX < 0 && x_t < this.x)) this.x = x_t;
            }
        }
    };

    Ghost.prototype._updateStatus = function () {
        // endurance
        if (this.endurance <= 0 && this.observing) this.observing = false;
        if (this.endurance < this.enduranceMax) {
            this.endurance += this.enduranceRecover / 20;
        }
        if (this.observing) {
            this.endurance -= this.enduranceCost / 20;
            this.entity.map.setDanger(Math.floor(50 + this.endurance * 50 / this.enduranceMax));
        } else {
            this.entity.map.setDanger(0);
        }

        var closest = _Data.range.danger;

        for (var i in this.touchList) {
            this.touchList[i]--;
            if (this.touchList[i] == 0) {
                delete (this.touchList[i]);
                this.entity.characterManager.characters[i].warning(false);
            }
        }

        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team == this.team) continue;
            var r = this.entity.interAction.chracterRange[this.id][c.id];
            if (r > _Data.range.danger) continue;
            if (r < closest) closest = r;
            if (r < 0.5) {
                this.touchList[c.id] = _Data.touchNumer;
                c.warning(true);
            }
        }

        // danger
        this.danger = (_Data.range.danger - closest) / _Data.range.danger;
        this.danger = Math.floor(this.danger * 3) / 3;
    };


    Ghost.prototype._updateVisible = function () {
        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team == this.team || this.touchList.hasOwnProperty(c.id)) {
                this.visibleCharacter[c.id] = true;
            } else {
                this.visibleCharacter[c.id] = (c.rush || this.observing);
            }
        }
    };

    Ghost.prototype.observe = function () {
        if (this.endurance >= this.enduranceMax / 2) this.observing = true;
    };

    Ghost.prototype.kill = function () {
        if (this.endurance < this.enduranceMax / 10) return;
        this.endurance -= this.enduranceMax / 10;
        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team == this.team) continue;
            var r = this.entity.interAction.chracterRange[this.id][c.id];            
            
            if (r < 1) {
                c.die();
            } else if (r < 2) {
                var d = Math.abs(this.currentRotation.head - this.entity.interAction.chracterAngle[this.id][c.id]);
                if (d > 180) d = 360 - d;

                if (d < 60) c.die();
            }
            //console.log(angle);
        }
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Ghost = SYSTEM.Character.Ghost || {};
    SYSTEM.Character.Ghost.Specter = Ghost;
})(window.Rendxx.Game.Ghost.System);