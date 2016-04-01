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
        message: {
            getKey: "Get: ",
            hasKey: "Already have: ",
            doorLock: "The door [#name#] is locked",
            doorBlock: "The door is blocked from other side!",
            useKey: "Key [#key#] is used",
            noKey: "Nothing found",
        },
        range: {
            danger: 8
        }
    };

    // Construct -----------------------------------------------------
    var Survivor = function (id, characterPara, characterData, entity) {
        // data
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
        if (_recoverData == null) return;
        if ('win' in _recoverData) this.win = _recoverData.win;
        if ('key' in _recoverData) this.key = _recoverData.key;
        if ('recover' in _recoverData) this.recover = _recoverData.recover;
        SYSTEM.Character.Basic.reset.call(this, _recoverData);
    };

    Survivor.prototype.toJSON = function () {
        var dat = SYSTEM.Character.Basic.toJSON.call(this);
        dat['win'] = this.win;
        dat['key'] = this.key;
        dat['lockDoor'] = this.lockDoor;
        dat['danger'] = this.danger;
        dat['recover'] = this.recover;
        return dat;
    };

    // use the item in front of the character
    Survivor.prototype.interaction = function () {
        if (!this.actived) return;
        if (this.accessObject == null) return;
        var info = this.accessObject.check();
        switch (info.objType) {
            case SYSTEM.MapObject.Door.Data.ObjType:
                if (info.status == SYSTEM.MapObject.Door.Data.Status.Opened) {
                    this.accessObject.close();
                    break;
                }
                if (info.status == SYSTEM.MapObject.Door.Data.Status.Locked) {
                    if (this.key.hasOwnProperty(info.id)) {
                        this.accessObject.unlock();
                        this.entity.message.send(this.id, _Data.message.useKey.replace('#key#', this.entity.map.objList.key[this.key[info.id]].name));
                        delete (this.lockDoor[info.id])
                    } else {
                        this.lockDoor[info.id] = true;
                        this.entity.message.send(this.id, _Data.message.doorLock.replace('#name#', info.name));
                        break;
                    }
                }
                if (info.blocked) {
                    this.entity.message.send(this.id, _Data.message.doorBlock);                    
                } else {
                    this.accessObject.open();
                }
                break;
            case SYSTEM.MapObject.Furniture.Data.ObjType:
                if (info.disabled) break;
                if (info.status == SYSTEM.MapObject.Furniture.Data.Status.Closed) {
                    this.accessObject.open();
                } else if (info.key == null) {
                    this.accessObject.close();
                } else {
                    var k = [];
                    var keyNames = "";
                    for (var i in info.key) {
                        if (!this.key.hasOwnProperty(info.key[i])) k.push(i);
                        else keyNames += this.entity.map.objList.key[i].name + ", ";
                    }
                    if (k.length == 0) {
                        this.entity.message.send(this.id, _Data.message.hasKey + keyNames.substring(0, keyNames.length - 2));
                        break;
                    }

                    var newKeys = this.accessObject.takeKey(k);

                    var keyNames = "";
                    for (var i in newKeys) {
                        this.key[newKeys[i]] = i;
                        keyNames += this.entity.map.objList.key[i].name + ", ";
                    }
                    if (keyNames.length > 0) {
                        this.entity.message.send(this.id, _Data.message.getKey + keyNames.substring(0, keyNames.length - 2));
                    }
                }
                break;
            case SYSTEM.MapObject.Body.Data.ObjType:
                if (info.key == null) {
                    this.entity.message.send(this.id, _Data.message.noKey);
                    break;
                }

                var k = [];
                var keyNames = "";
                for (var i in info.key) {
                    if (!this.key.hasOwnProperty(info.key[i])) k.push(i);
                    else keyNames += this.entity.map.objList.key[i].name + ", ";
                }
                if (k.length == 0) {
                    this.entity.message.send(this.id, _Data.message.hasKey + keyNames.substring(0, keyNames.length - 2));
                    break;
                }

                var newKeys = this.accessObject.takeKey(k);

                var keyNames = "";
                for (var i in newKeys) {
                    this.key[newKeys[i]] = i;
                    keyNames += this.entity.map.objList.key[i].name + ", ";
                }
                if (keyNames.length > 0) {
                    this.entity.message.send(this.id, _Data.message.getKey + keyNames.substring(0, keyNames.length - 2));
                }
                break;
        }
        this.updateData();
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
            var c = this.entity.characters[this.characterCheckingList[i]];
            var r = Math.sqrt(Math.pow(this.x - c.x, 2) + Math.pow(this.y - c.y, 2));
            if (r < min) min = r;
        }
        if (min <= _Data.range.danger) _danger = (1 - min / _Data.range.danger);
        else _danger = 0;
    };

    Survivor.prototype._updateInteraction = function () {
        this.visibleObject = this.entity.interaction.checkInteractionObj(this.x, this.y, this.currentRotation.head);
        var objType = null,
            objId = -1;
        for (var i in this.visibleObject.furniture) {
            if (this.visibleObject.furniture[i][0]>modelData.para.interactionDistance)
        }


        this.accessObject = this.entity.map.getAccessObject(this.x, this.y, this.currentRotation.head);
    };

    Survivor.prototype.die = function () {
        if (!this.actived) return;
        this.hp = 0;
        this.action = 'die';
        this.actived = false;
        this.entity.map.createBody(this);
        this.updateData();
    };

    Survivor.prototype.winning = function () {
        if (!this.actived) return;
        this.win = true;
        this.action = 'idle';
        this.actived = false;
        this.updateData();
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);