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
            cantAppear: "I need more power!"
        },
        range: {
            danger: 12
        },
        appearingTime: 40,
        touchNumer: 20,
        hurtNumer: 160
    };

    // Construct -----------------------------------------------------
    var Ghost = function (id, characterPara, characterData, entity) {
        SYSTEM.Character.Basic.call(this, id, characterPara, characterData, entity);
        // data
        this.hidden = true;
        this.appearCount = 0;
        this.appearing = false;
        this.touchList = {};
        this.isAction = false;
    };
    Ghost.prototype = Object.create(SYSTEM.Character.Basic.prototype);
    Ghost.prototype.constructor = Ghost;

    // Method --------------------------------------------------------

    Ghost.prototype.reset = function (_recoverData) {
        if (_recoverData === null || _recoverData === undefined) return;
        if (_recoverData[20] != null) this.hidden = _recoverData[20]==0;
        SYSTEM.Character.Basic.prototype.reset.call(this, _recoverData);
    };

    Ghost.prototype.toJSON = function () {
        var dat = SYSTEM.Character.Basic.prototype.toJSON.call(this);
        dat[20] = this.hidden ? this.appearCount / _Data.appearingTime : 1;
        return dat;
    };

    Ghost.prototype.checkOperation = function (obj) {
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                //if (info.status === SYSTEM.MapObject.Door.Data.Status.Opened) {
                //    return [SYSTEM.MapObject.Door.Data.Operation.Close];
                //}
                //return [SYSTEM.MapObject.Door.Data.Operation.Open];
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                //if (info.status === SYSTEM.MapObject.Furniture.Data.Status.None) return [SYSTEM.MapObject.Basic.Data.Operation.None];
                //if (info.status === SYSTEM.MapObject.Furniture.Data.Status.Closed) {
                //    return [SYSTEM.MapObject.Furniture.Data.Operation.Open];
                //}
                //return [SYSTEM.MapObject.Furniture.Data.Operation.Close];
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                break;
        }
        return [SYSTEM.MapObject.Basic.Data.Operation.None];
    };

    Ghost.prototype.getDanger = function (d) {
        return 0.3;
    };
    
    Ghost.prototype.move = function (direction, directionHead, rush_in, stay_in, headFollow_in) {
        if (this.isAction) return;
        rush_in = this.hidden;
        SYSTEM.Character.Basic.prototype.move.call(this, direction, directionHead, rush_in, stay_in, headFollow_in);
    }

    Ghost.prototype._move = function (deltaX, deltaY) {
        if (!this.hidden) {
            SYSTEM.Character.Basic.prototype._move.call(this, deltaX, deltaY);
            return;
        } else if (this.appearing) {
            deltaX /= 4;
            deltaY /= 4;
        }
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
        if (!this.hidden && this.endurance <= 0) { this.hidden = true; }
        if (this.hidden) {
            if (this.endurance < this.enduranceMax) {
                this.endurance += this.enduranceRecover / 20;
            }
            this.entity.map.setDanger(Math.floor(this.appearCount * 50 / _Data.appearingTime));
        } else {
            this.endurance -= this.enduranceMax / 800;
            this.entity.map.setDanger(80);
            if (this.endurance <= 0) {
                this.hidden = true;
            }
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
        this.danger = this.danger;

        // appear
        if (this.appearing) {
            if (++this.appearCount >= _Data.appearingTime) {
                this.hidden = false;
                this.appearCount = 0;
                this.appearing = false;
            }
        } else if (this.appearCount>0) {
            this.appearCount--;
        }
    };
    
    Ghost.prototype._updateVisible = function () {
        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team == this.team || this.touchList.hasOwnProperty(c.id)) {
                this.visibleCharacter[c.id] = true;
            } else if (!this.hidden) {
                this.visibleCharacter[c.id] = c.rush || this.entity.interAction.checkVisible(this, c);
                this.visibleCharacter[c.id] = c.checkVisible(this, this.visibleCharacter[c.id]);
            } else {
                this.visibleCharacter[c.id] = false;
            }
        }
    };

    Ghost.prototype.checkVisible = function (c, isVisible) {
        return (this.hidden && !this.appearing)? false : isVisible;
    };

    Ghost.prototype.kill = function () {
        if (this.isAction || this.hidden) return;
        if (this.endurance < this.enduranceMax / 20 && this.isAction) return;
        this.actionForce = 'attack';
        this.isAction = true;
        var that = this;
        setTimeout(function () {
            that.isAction = false;
            that.actionForce = null;
        },1600);
        this.endurance -= this.enduranceMax / 50;
        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team == this.team) continue;
            var r = this.entity.interAction.chracterRange[this.id][c.id];            
            
            if (r < 0.5) {
                c.die();
                this.touchList[c.id] = _Data.hurtNumer;
            } else if (r < 1.5) {
                var d = Math.abs(this.currentRotation[0] - this.entity.interAction.chracterAngle[this.id][c.id]);
                if (d > 180) d = 360 - d;

                if (d < 50) {
                    c.die();
                    this.touchList[c.id] = _Data.hurtNumer;
                }
            }
            //console.log(angle);
        }
    };

    Ghost.prototype.startToggle = function () {
        if (!this.hidden) {
            return;
        }
        if (this.endurance < this.enduranceMax / 3) {
            this.entity.message.send(this.id, _Data.message.cantAppear);
            return;
        }
        this.appearing = true;
    };

    Ghost.prototype.endToggle = function () {
        this.appearing = false;
    };
    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Ghost = SYSTEM.Character.Ghost || {};
    SYSTEM.Character.Ghost.Specter = Ghost;
})(window.Rendxx.Game.Ghost.System);