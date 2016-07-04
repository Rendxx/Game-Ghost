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
            danger: 16
        },
        touchNumer: 60,
        hurtNumer: 160
    };

    // Construct -----------------------------------------------------
    var Ghost = function (id, characterPara, characterData, entity) {
        SYSTEM.Character.Basic.call(this, id, characterPara, characterData, entity);
        // data
        this.observing = false;
        this.obCount = 0;       // count to observer
        this.touchList = {};
        this.isAction = false;
    };
    Ghost.prototype = Object.create(SYSTEM.Character.Basic.prototype);
    Ghost.prototype.constructor = Ghost;

    // Method --------------------------------------------------------

    Ghost.prototype.checkOperation = function (obj) {
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Opened || info.status === SYSTEM.MapObject.Door.Data.Status.Destroyed) {
                    break;
                }
                return [SYSTEM.MapObject.Door.Data.Operation.Destroy];
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                break;
        }
        return [SYSTEM.MapObject.Basic.Data.Operation.None];
    };

    Ghost.prototype.getDanger = function (d) {
        return Math.max(d-0.3,0);
    };
    
    Ghost.prototype.move = function (direction, directionHead, rush_in, stay_in, headFollow_in) {
        if (this.isAction) return;
        SYSTEM.Character.Basic.prototype.move.call(this, direction, directionHead, rush_in, stay_in, headFollow_in);
    }
    
    Ghost.prototype._updateStatus = function () {
        // endurance
        if ((this.obCount <= 0 || this.endurance <= 0) && this.observing) { this.observing = false; this.obCount = 0; }
        if (this.endurance < this.enduranceMax) {
            this.endurance += this.enduranceRecover / 20;
        }
        if (this.observing) {
            this.obCount--;
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
        this.danger = Math.floor((_Data.range.danger - closest) / 2) * 2 / (_Data.range.danger);
        if (this.danger > 0.6) this.danger = 0.6;
    };

    Ghost.prototype.observe = function () {
        if (this.obCount === 0 && this.endurance >= this.enduranceMax / 3) {
            this.endurance -= this.enduranceMax / 2;
            this.observing = true;
            this.obCount = 24;
        }
    };
    
    Ghost.prototype.checkVisible = function (c, isVisible) {
        return c.focus || c.rush ? isVisible : true;
    };

    Ghost.prototype.kill = function () {
        if (this.isAction) return;
        if (this.endurance < this.enduranceMax / 20 && this.isAction) return;
        this.actionForce = 'attack';
        this.isAction = true;
        var that = this;
        setTimeout(function () {
            that.isAction = false;
            that.actionForce = null;
        },1600);
        this.endurance -= this.enduranceMax / 20;
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

        this.destroyDoor();
    };

    Ghost.prototype.destroyDoor = function () {
        if (this.accessObject === null) return;
        var obj = this.entity.map.objList[this.accessObject.type][this.accessObject.id];
        var info = obj.check();
        if (obj.objType == SYSTEM.MapObject.Door.Data.ObjType) {
            if (info.status === SYSTEM.MapObject.Door.Data.Status.Opened) {
                return;
            }

            obj.destroy();
        }
        this.entity.interAction.updateInteraction(obj.objType, info.id);
        this.updateData();
    }

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Ghost = SYSTEM.Character.Ghost || {};
    SYSTEM.Character.Ghost.Butcher = Ghost;
})(window.Rendxx.Game.Ghost.System);