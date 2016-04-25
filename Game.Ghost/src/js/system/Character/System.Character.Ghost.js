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

    // use the item in front of the character
    Ghost.prototype.interaction = function () {
        return;
        if (!this.actived) return;
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

    Ghost.prototype._updateMove = function () {
        // is back?
        var isBack = false,
            _speed_move = this.modelData.para.speed.move,
            _speed_rotate = this.modelData.para.speed.rotate,
            d_back,
            d_body,
            d_head,
            d_headBody,
            realDirection_body,
            realDirection_head,
            speed;

        if (!this.stay && !this.headFollow && !this.rush) {
            d_back = Math.abs(this.requiredRotation.body - this.requiredRotation.head);
            if (d_back > 90 && d_back < 270) isBack = true;
        }
        // body rotation
        realDirection_body = this.stay ? this.currentRotation.head : (isBack ? (this.requiredRotation.body + 180) % 360 : this.requiredRotation.body);
        d_body = realDirection_body - this.currentRotation.body;
        if (d_body < -180) d_body += 360;
        else if (d_body > 180) d_body -= 360;
        if (d_body !== 0) {
            if (Math.abs(d_body) < _speed_rotate.body) {
                this.currentRotation.body += d_body;
            } else {
                this.currentRotation.body += ((d_body < 0) ? -1 : 1) * _speed_rotate.body;
            }
            if (this.currentRotation.body < 0) this.currentRotation.body += 360;
            this.currentRotation.body = this.currentRotation.body % 360;
        }
        // head rotation
        realDirection_head = (!this.stay && (this.headFollow || (this.rush && !isBack))) ? this.currentRotation.body : (this.headFollow ? this.currentRotation.head : this.requiredRotation.head);
        d_head = realDirection_head - this.currentRotation.head;
        if (d_head < -180) d_head += 360;
        else if (d_head > 180) d_head -= 360;
        if (d_head !== 0) {
            if (Math.abs(d_head) < _speed_rotate.head) {
                this.currentRotation.head += d_head;
            } else {
                this.currentRotation.head += ((d_head < 0) ? -1 : 1) * _speed_rotate.head;
            }
            if (this.currentRotation.head < 0) this.currentRotation.head += 360;
            this.currentRotation.head = this.currentRotation.head % 360;
        }
        // head-body rotation
        d_headBody = this.currentRotation.head - this.currentRotation.body;
        if (d_headBody < -180) d_headBody += 360;
        else if (d_headBody > 180) d_headBody -= 360;
        this.currentRotation.headBody = d_headBody;

        // move
        if (this.stay) this.action = 'idle';
        else {
            if (!isBack) {
                if (this.rush) this.action = 'run';
                else this.action = 'walk';
            } else {
                this.action = 'back';
            }

            if (Math.abs(d_body) <= 90) {
                speed = _speed_move[this.action] / 100;
                var _radius_x = 0;
                var _radius_y = 0;
                var _radius = this.modelData.radius;
                var deltaX = speed * Math.sin(this.currentRotation.body / 180 * Math.PI);
                var deltaY = speed * Math.cos(this.currentRotation.body / 180 * Math.PI);

                if (deltaX > 0) _radius_x = _radius;
                else if (deltaX < 0) _radius_x = -_radius;
                if (deltaY > 0) _radius_y = _radius;
                else if (deltaY < 0) _radius_y = -_radius;
                deltaX += _radius_x;
                deltaY += _radius_y;
                var canMove = this.entity.interAction.moveCheck2(this.x, this.y, deltaX, deltaY);
                if (deltaX !== 0) this.x = canMove[0] - _radius_x;
                if (deltaY !== 0) this.y = canMove[1] - _radius_y;
            }
        }
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
    SYSTEM.Character.Ghost = Ghost;
})(window.Rendxx.Game.Ghost.System);