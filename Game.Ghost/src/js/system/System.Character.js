﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Character manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var Character = function (id, characterPara, characterData, entity) {
        // data ----------------------------------------------------------
        var that = this,
            _info = characterPara,
            _modelData = characterData[_info.role][_info.modelId],
            _para = Data.character.para[_info.role],
            recover = 0;        // recover time after rush

        this.id = id;
        this.name = _info.name;
        this.role = _info.role;
        this.modelId = _info.modelId;
        this.x = -1;
        this.y = -1;
        this.stuff = {};
        this.key = {};
        this.endurance = _modelData.para.endurance;
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
        var rush = false,
            stay = true,
            headFollow = true,
            // cache    
            _actionList = _modelData.action.list,
            _speed_move = _modelData.para.speed.move,
            _speed_rotate = _modelData.para.speed.rotate,
            _radius = _modelData.radius,
            _interactionDistance = _modelData.para.interactionDistance,
            _enduranceRecover = _para.enduranceRecover,
            _enduranceCost = _para.enduranceCost;

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------

        // recover / init character
        this.reset = function (_recoverData) {
            if (_recoverData == null) return;
            if ('x' in _recoverData) this.x = _recoverData.x;
            if ('y' in _recoverData) this.y = _recoverData.y;
            if ('stuff' in _recoverData) this.stuff = _recoverData.stuff;
            if ('key' in _recoverData) this.key = _recoverData.key;
            if ('endurance' in _recoverData) this.endurance = _recoverData.endurance;
            if ('light' in _recoverData) this.light = _recoverData.light;
            if ('battery' in _recoverData) this.battery = _recoverData.battery;
            if ('hp' in _recoverData) this.hp = _recoverData.hp;
            if ('currentRotation' in _recoverData) this.currentRotation = _recoverData.currentRotation;
            if ('action' in _recoverData) this.action = _recoverData.action;
            _onChange();
        };

        this.toJSON = function () {
            return {
                x: that.x,
                y: that.y,
                key: that.key,
                stuff: that.stuff,
                endurance: that.endurance,
                light: that.light,
                battery: that.battery,
                hp: that.hp,
                currentRotation: that.currentRotation,
                action: that.action
            };
        };

        // move to a directionn with a rotation of head 
        this.move = function (direction, directionHead, rush_in, stay_in, headFollow_in) {
            if (this.hp == 0) return;
            rush = rush_in;
            stay = stay_in;
            headFollow = headFollow_in;
            if (!stay) this.requiredRotation.body = direction;
            if (!headFollow) this.requiredRotation.head = directionHead;
        };

        // use the item in front of the character
        this.interaction = function () {
            var key = entity.map.tryAccess(
                that,
                that.x,
                that.y,
                that.x + _interactionDistance * Math.sin(this.currentRotation.head / 180 * Math.PI),
                that.y + _interactionDistance * Math.cos(this.currentRotation.head / 180 * Math.PI)
            );
            if (key == null) return;
            if (!this.key.hasOwnProperty(key.doorId)) {
                this.key[key.doorId] = key.name;
                key.token();
            }
            _onChange();
        };

        // turn on / off torch light
        this.switchTorch = function () {
            if (that.role == Data.character.type.survivor) {
                this.light = 1 - this.light;
            } else {

            }
            _onChange();
        };

        // character die
        this.die = function () {
            this.hp = 0;
        };

        this.nextInterval = function () {
            if (this.hp == 0) return;
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

            // para
            _onChange();
        };

        this.checkCollison = function (x, y, r) {
            return Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2) < Math.pow(r + _radius, 2);
        };

        // private method ------------------------------------------------

        var _paraUpdate = function () {
            if (that.role == Data.character.type.survivor) {
                if (that.endurance <= 0) rush = false;
                if (!rush) {
                    if (recover > 0) {
                        recover -= _enduranceRecover / 20;
                    } else {
                        recover = 0;
                        if (that.endurance < _modelData.para.endurance) {
                            that.endurance += _enduranceRecover / 20;
                        } else {
                            that.endurance = _modelData.para.endurance;
                        }
                    }
                } else {
                    recover = 10;
                    that.endurance -= _enduranceCost / 20;
                }
            } else {

            }
            //console.log(that.endurance + "  " + recover);
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
        };


        var _onChange = function () {
            if (that.onChange == null) return;
            that.onChange(that.id, that.toJSON());
        };

        var _init = function () {
        };
        _init();
    };

    SYSTEM.Character = Character
})(window.Rendxx.Game.Ghost.System);