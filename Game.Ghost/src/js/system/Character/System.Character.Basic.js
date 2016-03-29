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
            hasKey: "You already have: ",
            doorLock: "The door [#name#] is locked",
            useKey: "Key [#key#] is used",
            noKey: "Nothing found",
        },
        range:{
            danger:8
        },
        flyCountMax:1600
    };

    // Construct -----------------------------------------------------
    var Basic = function (id, characterPara, characterData, entity) {
        // data ----------------------------------------------------------
        var that = this,
            para = characterPara,
            _modelData = characterData[para.role][para.modelId],
            _para = Data.character.para[para.role],
            recover = 0;        // recover time after rush

        this.id = id;
        this.name = para.name;
        this.role = para.role;
        this.modelId = para.modelId;
        this.x = -1;
        this.y = -1;
        this.endurance = _para.init.endurance;
        this.light = _para.init.light;
        this.battery = _para.init.battery;
        this.hp = _para.init.hp;
        this.action = _modelData.action.list[_modelData.action.init];
        this.currentRotation = {
            head: 0,
            body: 0,
            headBody: 0
        };
        this.requiredRotation = {
            head: 0,
            body: 0
        };
        this.rush = false;          // flag: character is rushing
        this.stay = true;           // flag: character does not move
        this.headFollow = true;     // flag: character dose not turn his head

        var rush = false,
            stay = true,
            headFollow = true,
            // cache    
            _last_x = 0,        // last pos, index of grid
            _last_y = 0,
            _actionList = _modelData.action.list,
            _speed_move = _modelData.para.speed.move,
            _speed_rotate = _modelData.para.speed.rotate,
            _radius = _modelData.radius,
            _interactionDistance = _modelData.para.interactionDistance,
            _enduranceRecover = _para.enduranceRecover,
            _enduranceCost = _para.enduranceCost,
            _maxEndurance = _modelData.para.endurance,
            _visibleCheckList = null,
            _danger = 0,
            _visibleList = {},
            _flyCount = 0,
            _interactionObj = {
                surround: {             // surround icon
                    furniture: [],
                    door:[]
                },
                canUse: {               // highlight for object can be use
                    furniture: null,
                    door: null
                },
                marker: {               // permanent marker
                    furniture: [],
                    door: []
                }
            };

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------

        // turn on / off torch light
        this.switchTorch = function () {
            if (this.hp == 0 || this.win) return;
            if (that.role == Data.character.type.survivor) {
                //this.light = 1 - this.light;
            } else {
                if (this.endurance >= _maxEndurance) {
                    rush = true;
                } else {
                    if (this.endurance >= _maxEndurance / 5) {
                        var yx = entity.map.findEmptyPos();
                        this.x = yx[1];
                        this.y = yx[0];
                        this.endurance -= _maxEndurance / 5;
                    }
                }
            }
            _onChange();
        };


        this.nextInterval = function () {
            if (this.hp == 0 || this.win) return;
            // is back?
            var isBack = false;
            if (!stay && !headFollow && !rush) {
                var d_back = Math.abs(this.requiredRotation.body - this.requiredRotation.head);
                if (d_back > 90 && d_back < 270) isBack = true;
            }

            _paraUpdate();

            // body rotation
            var realDirection_body = stay ? this.currentRotation.head : (isBack ? (this.requiredRotation.body + 180) % 360 : this.requiredRotation.body);
            var d_body = realDirection_body - this.currentRotation.body;
            if (d_body < -180) d_body += 360;
            else if (d_body > 180) d_body -= 360;
            if (d_body != 0) {
                if (Math.abs(d_body) < _speed_rotate.body) {
                    this.currentRotation.body += d_body;
                } else {
                    this.currentRotation.body += ((d_body < 0) ? -1 : 1) * _speed_rotate.body;
                }
                if (this.currentRotation.body < 0) this.currentRotation.body += 360;
                this.currentRotation.body = this.currentRotation.body % 360;
            }

            // head rotation
            var realDirection_head = (!stay && (headFollow || (rush && !isBack))) ? this.currentRotation.body : (headFollow ? this.currentRotation.head : this.requiredRotation.head);
            var d_head = realDirection_head - this.currentRotation.head;
            if (d_head < -180) d_head += 360;
            else if (d_head > 180) d_head -= 360;
            if (d_head != 0) {
                if (Math.abs(d_head) < _speed_rotate.head) {
                    this.currentRotation.head += d_head;
                } else {
                    this.currentRotation.head += ((d_head < 0) ? -1 : 1) * _speed_rotate.head;
                }
                if (this.currentRotation.head < 0) this.currentRotation.head += 360;
                this.currentRotation.head = this.currentRotation.head % 360;
            }
            // head-body rotation
            var d_headBody = this.currentRotation.head - this.currentRotation.body;
            if (d_headBody < -180) d_headBody += 360;
            else if (d_headBody > 180) d_headBody -= 360;
            this.currentRotation.headBody = d_headBody;
            var speed;
            // move
            if (stay) this.action = 'idle';
            else {
                if (!isBack) {
                    if (rush) this.action = 'run';
                    else this.action = 'walk';
                } else {
                    this.action = 'back';
                }

                if (Math.abs(d_body) <= 90) {
                    speed = _speed_move[this.action] / 100;
                    _move(
                        speed * Math.sin(this.currentRotation.body / 180 * Math.PI),
                        speed * Math.cos(this.currentRotation.body / 180 * Math.PI)
                    );
                }
            }

            // checking
            _interactionObjCheck();
            _checkVisible();
            _checkDanger();
            // para
            _onChange();
        };

        this.checkRange = function (x, y) {
            return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
        };

        // private method ------------------------------------------------

        var _paraUpdate = function () {
            if (that.role == Data.character.type.survivor) {
                // endurance
                if (that.endurance <= 0) rush = false;
                if (!rush) {
                    if (recover > 0) {
                        recover -= _enduranceRecover / 20;
                    } else {
                        recover = 0;
                        if (that.endurance < _maxEndurance) {
                            that.endurance += _enduranceRecover / 20;
                        } else {
                            that.endurance = _maxEndurance;
                        }
                    }
                } else {
                    recover = 8;
                    that.endurance -= _enduranceCost / 20;
                }
            } else {
                // endurance
                if (that.endurance <= 0) rush = false;
                if (that.endurance < _maxEndurance) {
                    that.endurance += _enduranceRecover / 20;
                }
                if (rush) that.endurance -= _enduranceCost / 20;

                for (var i = 0; i < entity.characters.length; i++) {
                    var c = entity.characters[i];
                    if (c.role == Data.character.type.survivor && c.hp > 0 && !c.win) {
                        var r = that.checkRange(c.x, c.y);
                        if (r > _Data.range.danger) continue;
                        if (r < 1) c.die();     // die
                        else {
                            if (!rush) {
                                if (that.endurance < _maxEndurance) {
                                    if (_visibleList[i]) that.endurance += (_enduranceRecover * (_Data.range.danger - r) / 10);
                                    else that.endurance += (_enduranceRecover * (_Data.range.danger - r) / 20);
                                }
                            }
                        }
                    }
                }

                // random fly
                _flyCount++;
                if (_flyCount >= _Data.flyCountMax) {
                    var yx = entity.map.findEmptyPos();
                    that.x = yx[1];
                    that.y = yx[0];
                    _flyCount = 0;
                }
            }
        };

        var _checkVisible = function () {
            if (_visibleCheckList==null){
                if (that.role == Data.character.type.survivor) {
                    _visibleCheckList= entity.characterRoleMap.ghost;
                } else {
                    _visibleCheckList= entity.characterRoleMap.survivor;
                }
            }
            for (var i = 0; i < _visibleCheckList.length; i++) {
                var c = _visibleCheckList[i];
                if (entity.characters[c].hp <= 0)
                    _visibleList[c] = true;
                else
                    _visibleList[c] = entity.map.checkVisible(that, entity.characters[c]);
            }
        };

        var _checkDanger = function () {
            var min = 100000;
            if (that.role == Data.character.type.survivor) {
                for (var i = 0; i < _visibleCheckList.length; i++) {
                    c = entity.characters[_visibleCheckList[i]];
                    var r = that.checkRange(c.x, c.y);
                    if (r < min) min = r;
                }
                if (min <= _Data.range.danger) _danger = (1 - min / _Data.range.danger);
                else _danger = 0;
            } else {
                _danger = that.endurance / _maxEndurance;
            }
        };

        // move chareacter by offset
        var _move = function (deltaX, deltaY) {
            var x = that.x + deltaX;
            var y = that.y + deltaY;
            var _radius_x = 0;
            var _radius_y = 0;
            if (deltaX > 0) _radius_x = _radius;
            else if (deltaX < 0) _radius_x = -_radius;
            if (deltaY > 0) _radius_y = _radius;
            else if (deltaY < 0) _radius_y = -_radius;
            deltaX += _radius_x;
            deltaY += _radius_y;
            var canMove = entity.map.moveCheck(that.x, that.y, deltaX, deltaY);
            if (deltaX != 0) that.x = canMove[0] - _radius_x;
            if (deltaY != 0) that.y = canMove[1] - _radius_y;

            // win
            if (entity.map.checkInEnd(that.x, that.y)) that.winning();
        };

        // check interaction obj
        var _interactionObjCheck = function () {
            if (that.role == Data.character.type.ghost) return;
            _interactionObj.surround = entity.map.checkInteractionObj(that.x, that.y, that.currentRotation.head);
            _interactionObj.canUse = entity.map.checkAccess(
                that.x,
                that.y,
                that.x + _interactionDistance * Math.sin(that.currentRotation.head / 180 * Math.PI),
                that.y + _interactionDistance * Math.cos(that.currentRotation.head / 180 * Math.PI)
            );
        };
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // Method --------------------------------------------------------
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
        if ('x' in _recoverData) this.x = _recoverData.x;
        if ('y' in _recoverData) this.y = _recoverData.y;
        if ('endurance' in _recoverData) this.endurance = _recoverData.endurance;
        if ('light' in _recoverData) this.light = _recoverData.light;
        if ('battery' in _recoverData) this.battery = _recoverData.battery;
        if ('hp' in _recoverData) this.hp = _recoverData.hp;
        if ('currentRotation' in _recoverData) this.currentRotation = _recoverData.currentRotation;
        if ('action' in _recoverData) this.action = _recoverData.action;
        updateData();
    };

    Basic.prototype.toJSON = function () {
        return {
            x: this.x,
            y: this.y,
            endurance: this.endurance,
            light: this.light,
            battery: this.battery,
            hp: this.hp,
            currentRotation: this.currentRotation,
            action: this.action,
            interactionObj: this.interactionObj,
            visibleList: this.visibleList,
            danger: this.danger
        };
    };

    // move to a directionn with a rotation of head 
    Basic.prototype.move = function (direction, directionHead, rush_in, stay_in, headFollow_in) {
        if (this.hp == 0 || this.win) return;
        if (this.role == Data.character.type.survivor) this.rush = rush_in;
        this.stay = stay_in;
        this.headFollow = headFollow_in;
        if (!stay_in) this.requiredRotation.body = direction;
        if (!headFollow_in) this.requiredRotation.head = directionHead;
    };
    
    // use the item in front of the character
    this.interaction = function () {
        if (this.hp == 0 || this.win) return;
        var rst = entity.map.tryAccess(
            that,
            that.x,
            that.y,
            that.x + _interactionDistance * Math.sin(this.currentRotation.head / 180 * Math.PI),
            that.y + _interactionDistance * Math.cos(this.currentRotation.head / 180 * Math.PI)
        );
        if (rst == null) return;
        if (rst.hasOwnProperty('key') && this.role == Data.character.type.survivor) {
            var key = rst.key;
            if (!this.key.hasOwnProperty(key.doorId)) {
                this.key[key.doorId] = key.name;
                key.token();
                if (this.lockDoor.hasOwnProperty(key.doorId)) this.lockDoor[key.doorId] = false;
                entity.message.send(that.id, _Data.message.getKey + key.name);
            } else {
                entity.message.send(that.id, _Data.message.hasKey + key.name);
            }
        } else if (rst.hasOwnProperty('door')) {
            var door = rst.door;
            if (door.status == SYSTEM.Door.Data.Status.Locked) {
                this.lockDoor[door.id] = true;
                entity.message.send(that.id, _Data.message.doorLock.replace('#name#', door.name));
            } else {
                delete (this.lockDoor[door.id])
            }
        } else if (rst.hasOwnProperty('body')) {
            var body = rst.body;
            var count = 0;
            var keyNames = "";
            for (var i in body) {
                count++;
                this.key[i] = body[i];
                if (this.lockDoor.hasOwnProperty(i)) this.lockDoor[i] = false;
                keyNames += body[i] + ", ";
            }
            if (count == 0) {
                entity.message.send(that.id, _Data.message.noKey);
            } else {
                entity.message.send(that.id, keyNames.substring(0, keyNames.length - 2));
            }
        }
        _onChange();
    };



    Basic.prototype.updateData = function () {
        if (this.onChange == null) return;
        this.onChange(this.id, this.toJSON());
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);