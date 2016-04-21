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
        teamColor: [
            0xFF6600,
            0x0099CC
        ]
    };

    // Construct -----------------------------------------------------
    var Survivor = function (id, characterPara, characterData, entity) {
        SYSTEM.Character.Basic.call(this, id, characterPara, characterData, entity);
        // data
        this.team = characterPara.team;
        this.color = _Data.teamColor[this.team];
        this.win = false;       // character is win or not
        this.recover = 0;       // recover enfurance count
        this.key = {};          // key list {door id : key id}
        this.lockDoor = {};     // record of locked door
        this.danger = 0;        // danger level
    };
    Survivor.prototype = Object.create(SYSTEM.Character.Basic.prototype);
    Survivor.prototype.constructor = Survivor;

    // Method --------------------------------------------------------
    Survivor.prototype.reset = function (_recoverData) {
        if (_recoverData === null || _recoverData === undefined) return;
        if ('win' in _recoverData) this.win = _recoverData.win;
        if ('key' in _recoverData) this.key = _recoverData.key;
        if ('recover' in _recoverData) this.recover = _recoverData.recover;
        SYSTEM.Character.Basic.prototype.reset.call(this, _recoverData);
    };

    Survivor.prototype.toJSON = function () {
        var dat = SYSTEM.Character.Basic.prototype.toJSON.call(this);
        dat['win'] = this.win;
        dat['key'] = this.key;
        dat['lockDoor'] = this.lockDoor;
        dat['danger'] = this.danger;
        dat['recover'] = this.recover;
        return dat;
    };

    Survivor.prototype.longInteraction = function () {
        if (!this.actived) return;
        if (this.accessObject === null) return;
        var obj = this.entity.map.objList[this.accessObject.type][this.accessObject.id];
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Closed) {
                    this.longInteractionObj = this.accessObject;
                    obj.block(this.id);
                }
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                break;
        }
        this.entity.interAction.updateInteraction(obj.objType, info.id);
        this.updateData();
    };

    Survivor.prototype.cancelLongInteraction = function () {
        if (this.longInteractionObj !== null) {
            var obj = this.entity.map.objList[this.longInteractionObj.type][this.longInteractionObj.id];
            var info = obj.check();
            switch (obj.objType) {
                case SYSTEM.MapObject.Door.Data.ObjType:
                    if (info.status === SYSTEM.MapObject.Door.Data.Status.Closed) {
                        obj.unblock(this.id);
                    }
                    break;
            }
        }

        this.longInteractionObj = null;
    };

    // use the item in front of the character
    Survivor.prototype.interaction = function () {
        if (!this.actived) return;
        if (this.accessObject === null) return;
        var obj = this.entity.map.objList[this.accessObject.type][this.accessObject.id];
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Opened) {
                    obj.close();
                    break;
                }
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Locked) {
                    if (this.key.hasOwnProperty(info.id)) {
                        obj.unlock(true);
                        this.entity.message.send(this.id, _Data.message.useKey.replace('#key#', this.entity.map.objList.key[this.key[info.id]].name));
                        delete (this.lockDoor[info.id])
                    } else {
                        this.lockDoor[info.id] = true;
                        obj.unlock(false);
                        this.entity.message.send(this.id, _Data.message.doorLock.replace('#name#', obj.name));
                        break;
                    }
                }
                if (info.blocked) {
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
                } else if (info.key === null) {
                    obj.close();
                } else {
                    var k = [];
                    var keyNames = "";
                    for (var i in info.key) {
                        if (!this.key.hasOwnProperty(info.key[i])) k.push(i);
                        else keyNames += this.entity.map.objList.key[i].name + ", ";
                    }
                    if (k.length === 0) {
                        this.entity.message.send(this.id, _Data.message.hasKey + keyNames.substring(0, keyNames.length - 2));
                        break;
                    }

                    var newKeys = obj.takeKey(k);

                    var keyNames = "";
                    for (var i in newKeys) {
                        this.key[newKeys[i]] = i;
                        this.entity.map.objList.key[i].take(this.id);
                        keyNames += this.entity.map.objList.key[i].name + ", ";
                    }
                    if (keyNames.length > 0) {
                        this.entity.sound.once(SYSTEM.Sound.Data.Type.Effort, null, this.id, SYSTEM.Sound.Data.Name.Key);
                        this.entity.message.send(this.id, _Data.message.getKey + keyNames.substring(0, keyNames.length - 2));
                    }
                    this.entity.interAction.updateDoorInteraction(this.key, this.id);
                }
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                if (info.key === null) {
                    this.entity.message.send(this.id, _Data.message.noKey);
                    break;
                }

                var k = [];
                var keyNames = "";
                for (var i in info.key) {
                    if (!this.key.hasOwnProperty(info.key[i])) k.push(i);
                    else keyNames += this.entity.map.objList.key[i].name + ", ";
                }
                if (k.length === 0) {
                    this.entity.message.send(this.id, _Data.message.hasKey + keyNames.substring(0, keyNames.length - 2));
                    break;
                }

                var newKeys = obj.takeKey(k);

                var keyNames = "";
                for (var i in newKeys) {
                    this.key[newKeys[i]] = i;
                    this.entity.map.objList.key[i].take(this.id);
                    keyNames += this.entity.map.objList.key[i].name + ", ";
                }
                if (keyNames.length > 0) {
                    this.entity.message.send(this.id, _Data.message.getKey + keyNames.substring(0, keyNames.length - 2));
                }
                break;
        }
        this.entity.interAction.updateInteraction(obj.objType, info.id);
        this.updateData();
    };

    Survivor.prototype.checkOperation = function (obj) {
        var info = obj.check();
        switch (obj.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Opened) {
                    return [SYSTEM.MapObject.Door.Data.Operation.Close];
                }
                if (info.status === SYSTEM.MapObject.Door.Data.Status.Locked) {
                    if (this.key.hasOwnProperty(info.id)) {
                        return [SYSTEM.MapObject.Door.Data.Operation.Unlock];
                    } else if (this.lockDoor[info.id]) {
                        return [SYSTEM.MapObject.Door.Data.Operation.Locked];
                    }
                }
                return [SYSTEM.MapObject.Door.Data.Operation.Open, SYSTEM.MapObject.Door.Data.Operation.Block];
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                if (info.status === SYSTEM.MapObject.Furniture.Data.Status.Closed) {
                    return [SYSTEM.MapObject.Furniture.Data.Operation.Open];
                } else if (info.key !== null) {
                    return [SYSTEM.MapObject.Furniture.Data.Operation.Key];
                } else if (info.status === SYSTEM.MapObject.Furniture.Data.Status.Opened) {
                    return [SYSTEM.MapObject.Furniture.Data.Operation.Close];
                }
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                return [SYSTEM.MapObject.Body.Data.Operation.Search];
                break;
        }
        return [SYSTEM.MapObject.Basic.Data.Operation.None];
    };

    Survivor.prototype._updateStatus = function () {
        // endurance
        if (this.endurance <= 0) this.rush = false;
        if (!this.rush) {
            if (this.recover > 0) {
                this.recover -= this.enduranceRecover / 20;
            } else {
                this.recover = 0;
                if (this.endurance < this.modelData.para.endurance) {
                    this.endurance += this.enduranceRecover / 20;
                } else {
                    this.endurance = this.modelData.para.endurance;
                }
            }
        } else {
            this.recover = 8;
            this.endurance -= this.enduranceCost / 20;
        }

        // danger
        var min = 100000;
        for (var i = 0; i < this.characterCheckingList.length; i++) {
            var r = this.entity.interAction.chracterRange[this.id][this.characterCheckingList[i]];
            if (r < min) min = r;
        }
        if (min <= _Data.range.danger) this.danger = (1 - min / _Data.range.danger);
        else this.danger = 0;
        //if (this.entity.interAction.checkInEnd(this.x, this.y)) {
        //    this.winning();
        //}
    };

    Survivor.prototype._updatePositionTrigger = function () {
        // position check
        var triggerList = this.entity.interAction.checkPosTrigger(this.id, this.x, this.y);

        // leave
        if (this.triggeringList !== null) {
            for (var i in this.triggeringList) {
                if (triggerList === null || !triggerList.hasOwnProperty(i)) {
                    var obj = this.entity.map.objList[this.triggeringList[i].type][this.triggeringList[i].id];
                    var info = obj.check();
                    switch (obj.objType) {
                        //case SYSTEM.MapObject.Door.Data.ObjType:
                        //    if (info.status === SYSTEM.MapObject.Door.Data.Status.Closed) {
                        //        obj.unblock(this.id);
                        //    }
                        //    break;
                    }
                }
            }
        }

        // enter
        if (triggerList !== null) {
            for (var i in triggerList) {
                if (this.triggeringList === null || !this.triggeringList.hasOwnProperty(i)) {
                    var obj = this.entity.map.objList[triggerList[i].type][triggerList[i].id];
                    var info = obj.check();
                    switch (obj.objType) {
                        //case SYSTEM.MapObject.Door.Data.ObjType:
                        //    if (info.status === SYSTEM.MapObject.Door.Data.Status.Closed) {
                        //        obj.block(this.id);
                        //    }
                        //    break;
                        case SYSTEM.MapObject.Position.Data.ObjType:
                            this.winning();
                            break;
                    }
                }
            }
        }

        this.triggeringList = triggerList;
    };

    Survivor.prototype.die = function () {
        if (!this.actived) return;
        this.hp = 0;
        this.action = 'die';
        this.actived = false;
        this.accessObject = null;
        this.visibleObject = {};
        this.visibleCharacter = {};
        this.entity.map.createBody(this);
        this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.objType, this.id, SYSTEM.Sound.Data.Name.Die);
        this.entity.sound.once(SYSTEM.Sound.Data.Type.OverAll, _Data.objType, this.id, SYSTEM.Sound.Data.Name.Bell);
        this.updateData();
    };

    Survivor.prototype.winning = function () {
        if (!this.actived) return;
        this.win = true;
        this.action = 'idle';
        this.actived = false;
        this.entity.sound.once(SYSTEM.Sound.Data.Type.OverAll, _Data.objType, this.id, SYSTEM.Sound.Data.Name.Bell);
        this.updateData();
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Survivor = Survivor;
})(window.Rendxx.Game.Ghost.System);