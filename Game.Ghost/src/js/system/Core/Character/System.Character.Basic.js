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
        message: {
            getKey: "Get: ",
            hasKey: "You already have: ",
            doorLock: "The door [#name#] is locked",
            useKey: "Key [#key#] is used",
            noKey: "Nothing found",
        },
        range: {
            danger: 8
        },
        flyCountMax: 1600
    };

    // Construct -----------------------------------------------------
    var Basic = function (id, characterPara, characterData, entity) {
        // data ----------------------------------------------------------
        var _defaultPara = Data.character.para[characterPara.role];

        this.entity = entity;
        this.id = id;
        this.name = characterPara.name;
        this.team = characterPara.team;
        this.role = characterPara.role;
        this.modelId = characterPara.modelId;
        this.x = -1;
        this.y = -1;
        this.para = characterPara;
        this.modelData = characterData[characterPara.role][characterPara.modelId];
        this.color = parseInt(this.modelData.color, 16);
        this.action = this.modelData.action.list[this.modelData.action.init];
        this.actionForce = null;
        this.danger = 0;        // danger level
        this.win = false;       // character is win or not

        //    O------------->
        //    | 225 180 135
        //    | 270     90
        //    | 315  0  45
        //    v

        this.currentRotation = [0, 0, 0]; // [head, body, headBody]

        this.requiredRotation = [0, 0]; // [head, body]
        this.actived = true;
        this.focus = false;         // flag: character is focus on working on something
        this.rush = false;          // flag: character is rushing
        this.stay = true;           // flag: character does not move
        this.headFollow = true;     // flag: character dose not turn his head
        this.accessObject = null;   // access object
        this.soundObject = null;    // sound object
        this.visibleObject = {};    // visible object list: {Object type: {Object Id: [distance, angle from front]}}
        this.visibleCharacter = {}; // visible character list

        this.triggeringList = {};
        this.longInteractionObj = null;
        this.warningMark = false;

        // para
        this.hp = _defaultPara.hp.init;
        this.hpMax = _defaultPara.hp.max;
        this.light = _defaultPara.light;
        this.battery = _defaultPara.battery.init;
        this.batteryMax = _defaultPara.battery.max;
        this.endurance =  _defaultPara.endurance.init;
        this.enduranceRecover = _defaultPara.endurance.recover;
        this.enduranceCost =  _defaultPara.endurance.cost;
        this.enduranceMax = _defaultPara.endurance.max;

        this.speed_rotate = {
            'head': _defaultPara.speed.rotate.head,
            'body': _defaultPara.speed.rotate.body
        };
        this.speed_move = {
            'walk': _defaultPara.speed.move.walk,
            'run': _defaultPara.speed.move.run,
            'back': _defaultPara.speed.move.back
        };

        if (this.modelData.para.hasOwnProperty('light')) this.light = this.modelData.para['light'];
        if (this.modelData.para.hasOwnProperty('hp')) {
            if (this.modelData.para['hp'].hasOwnProperty('init')) this.hp = this.modelData.para['hp']['init'];
            if (this.modelData.para['hp'].hasOwnProperty('max')) this.hpMax = this.modelData.para['hp']['max'];
        }
        if (this.modelData.para.hasOwnProperty('battery')) {
            if (this.modelData.para['battery'].hasOwnProperty('init')) this.battery = this.modelData.para['battery']['init'];
            if (this.modelData.para['battery'].hasOwnProperty('max')) this.batteryMax = this.modelData.para['battery']['max'];
        }

        if (this.modelData.para.hasOwnProperty('endurance')) {
            if (this.modelData.para['endurance'].hasOwnProperty('init')) this.endurance = this.modelData.para['endurance']['init'];
            if (this.modelData.para['endurance'].hasOwnProperty('recover')) this.enduranceRecover = this.modelData.para['endurance']['recover'];
            if (this.modelData.para['endurance'].hasOwnProperty('cost')) this.enduranceCost = this.modelData.para['endurance']['cost'];
            if (this.modelData.para['endurance'].hasOwnProperty('max')) this.enduranceMax = this.modelData.para['endurance']['max'];
        }

        if (this.modelData.para.hasOwnProperty('speed')) {
            if (this.modelData.para['speed'].hasOwnProperty('rotate')) {
                if (this.modelData.para['speed']['rotate'].hasOwnProperty('head')) this.speed_rotate.head = this.modelData.para['speed']['rotate']['head'];
                if (this.modelData.para['speed']['rotate'].hasOwnProperty('body')) this.speed_rotate.body = this.modelData.para['speed']['rotate']['body'];
            }
            if (this.modelData.para['speed'].hasOwnProperty('move')) {
                if (this.modelData.para['speed']['move'].hasOwnProperty('walk')) this.speed_move.walk = this.modelData.para['speed']['move']['walk'];
                if (this.modelData.para['speed']['move'].hasOwnProperty('run')) this.speed_move.run = this.modelData.para['speed']['move']['run'];
                if (this.modelData.para['speed']['move'].hasOwnProperty('back')) this.speed_move.back = this.modelData.para['speed']['move']['back'];
            }
        }


        // callback ------------------------------------------------------
        this.onChange = null;
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // Method --------------------------------------------------------
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData === null || _recoverData === undefined) return;

        if (_recoverData[0] != null) this.x = _recoverData[0];
        if (_recoverData[1] != null) this.y = _recoverData[1];
        if (_recoverData[2] != null) this.endurance = _recoverData[2];
        if (_recoverData[3] != null) this.hp = _recoverData[3];
        if (_recoverData[4] != null) this.currentRotation = _recoverData[4];

        if (_recoverData[5] != null) this.action = _recoverData[5];
        if (_recoverData[6] != null) this.win = _recoverData[6];
        if (_recoverData[7] != null) this.actived = _recoverData[7];
        if (_recoverData[8] != null) this.light = _recoverData[8];
        if (_recoverData[9] != null) this.battery = _recoverData[9];

        if ('x' in _recoverData) this.x = _recoverData.x;
        if ('y' in _recoverData) this.y = _recoverData.y;
        if ('actived' in _recoverData) this.actived = _recoverData.actived;
        if ('endurance' in _recoverData) this.endurance = _recoverData.endurance;
        if ('light' in _recoverData) this.light = _recoverData.light;
        if ('battery' in _recoverData) this.battery = _recoverData.battery;
        if ('hp' in _recoverData) this.hp = _recoverData.hp;
        if ('currentRotation' in _recoverData) this.currentRotation = _recoverData.currentRotation;
        if ('action' in _recoverData) this.action = _recoverData.action;
        if ('win' in _recoverData) this.win = _recoverData.win;
        this.updateData();
    };

    Basic.prototype.toJSON = function () {
        return [
            this.x,                     // 0
            this.y,
            this.endurance,
            this.hp,
            this.currentRotation,

            this.action,                // 5
            this.win,
            this.actived,
            this.light,
            this.battery
        ];
    };

    Basic.prototype.toJSONAssist = function () {
        return [
            this.visibleCharacter,      // 0
            this.danger,
            this.accessObject,              
            this.visibleObject,
            this.longInteractionObj,

            this.soundObject            // 5
        ];
    };

    Basic.prototype.getSetupData = function () {
        return {
            id: this.id,
            enduranceMax: this.enduranceMax
        };
    };

    // move to a directionn with a rotation of head 
    Basic.prototype.move = function (direction, directionHead, rush_in, stay_in, headFollow_in) {
        if (!this.actived) return;
        if (this.role === Data.character.type.survivor) this.rush = rush_in;
        this.stay = stay_in;
        this.headFollow = headFollow_in;
        if (!stay_in) this.requiredRotation[1] = direction;
        if (!headFollow_in) this.requiredRotation[0] = directionHead;
    };

    Basic.prototype.longInteraction = function () {
    };

    Basic.prototype.cancelLongInteraction = function () {
    };

    // use the item in front of the character
    Basic.prototype.interaction = function () {
        if (!this.actived) return;
        if (this.accessObject === null) return;
        return;
    };

    Basic.prototype.checkOperation = function () {
        return null;
    };

    Basic.prototype.warning = function (isWarning) {
        this.warningMark = isWarning;
    };

    Basic.prototype.getDanger = function (d) {
        return d;
    };

    Basic.prototype._updateMove = function () {
        // is back?
        var isBack = false,
            d_back,
            d_body,
            d_head,
            d_headBody,
            realDirection_body,
            realDirection_head,
            speed;

        if (!this.stay && !this.headFollow && !this.rush) {
            d_back = Math.abs(this.requiredRotation[1] - this.requiredRotation[0]);
            if (d_back > 90 && d_back < 270) isBack = true;
        }
        // body rotation
        realDirection_body = this.stay ? this.currentRotation[0] : (isBack ? (this.requiredRotation[1] + 180) % 360 : this.requiredRotation[1]);
        d_body = realDirection_body - this.currentRotation[1];
        if (d_body < -180) d_body += 360;
        else if (d_body > 180) d_body -= 360;
        if (d_body !== 0) {
            if (Math.abs(d_body) < this.speed_rotate.body) {
                this.currentRotation[1] += d_body;
            } else {
                this.currentRotation[1] += ((d_body < 0) ? -1 : 1) * this.speed_rotate.body;
            }
            if (this.currentRotation[1] < 0) this.currentRotation[1] += 360;
            this.currentRotation[1] = this.currentRotation[1] % 360;
        }
        // head rotation
        realDirection_head = (!this.stay && (this.headFollow || (this.rush && !isBack))) ? this.currentRotation[1] : (this.headFollow ? this.currentRotation[0] : this.requiredRotation[0]);
        d_head = realDirection_head - this.currentRotation[0];
        if (d_head < -180) d_head += 360;
        else if (d_head > 180) d_head -= 360;
        if (d_head !== 0) {
            if (Math.abs(d_head) < this.speed_rotate.head) {
                this.currentRotation[0] += d_head;
            } else {
                this.currentRotation[0] += ((d_head < 0) ? -1 : 1) * this.speed_rotate.head;
            }
            if (this.currentRotation[0] < 0) this.currentRotation[0] += 360;
            this.currentRotation[0] = this.currentRotation[0] % 360;
        }
        // head-body rotation
        d_headBody = this.currentRotation[0] - this.currentRotation[1];
        if (d_headBody < -180) d_headBody += 360;
        else if (d_headBody > 180) d_headBody -= 360;
        this.currentRotation[2] = d_headBody;

        // move
        if (this.actionForce !== null) {
            this.action = this.actionForce;
        } else if (this.stay) {
            this.action = 'idle';
        } else {
            if (!isBack) {
                if (this.rush) this.action = 'run';
                else this.action = 'walk';
            } else {
                this.action = 'back';
            }

            if (Math.abs(d_body) <= 90) {
                speed = this.speed_move[this.action] / 100;
                var _radius_x = 0;
                var _radius_y = 0;
                var deltaX = speed * Math.sin(this.currentRotation[1] / 180 * Math.PI);
                var deltaY = speed * Math.cos(this.currentRotation[1] / 180 * Math.PI);

                this._move(deltaX, deltaY);
            }
        }
    };

    Basic.prototype._move = function (deltaX, deltaY) {
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
        var canMove = (obj_new === null || (obj_new.type === SYSTEM.Map.Data.Grid.Door && (obj_new.obj.status === SYSTEM.MapObject.Door.Data.Status.Opened || obj_new.obj.status === SYSTEM.MapObject.Door.Data.Status.Destroyed)));

        if (obj_x === null || (obj_x.type === SYSTEM.Map.Data.Grid.Door && (obj_x.obj.status === SYSTEM.MapObject.Door.Data.Status.Opened || obj_x.obj.status === SYSTEM.MapObject.Door.Data.Status.Destroyed))) {
            this.x += deltaX;
        } else {
            x_t = deltaX > 0 ? (newX - _radius) : (newX + 1 + _radius);
            if ((deltaX > 0 && x_t > this.x) || (deltaX < 0 && x_t < this.x)) this.x = x_t;
            canMove = true;
        }

        if (obj_y === null || (obj_y.type === SYSTEM.Map.Data.Grid.Door && (obj_y.obj.status === SYSTEM.MapObject.Door.Data.Status.Opened || obj_y.obj.status === SYSTEM.MapObject.Door.Data.Status.Destroyed))) {
            this.y += deltaY;
        } else {
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

    Basic.prototype._updatePositionTrigger = function () {
    };

    Basic.prototype._updateStatus = function () {
    };

    Basic.prototype._updateLongInteraction = function () {
    };
    
    Basic.prototype._updateInteraction = function () {
        this.visibleObject = this.entity.interAction.checkInteractionObj(this.id, this.x, this.y, this.currentRotation[0]);
        this.soundObject = this.entity.interAction.checkSoundObj(this.id, this.x, this.y);
        var _a = this.accessObject;
        this.accessObject = this.entity.interAction.getAccessObject(this.id, this.x, this.y, this.currentRotation[0]);
        if (_a !== this.accessObject && this.accessObject !== null)
            this.entity.map.objList[this.accessObject.type][this.accessObject.id].touch();
        if (this.longInteractionObj !== null && this.longInteractionObj !== this.accessObject) this.cancelLongInteraction();
    };

    Basic.prototype._updateVisible = function () {
        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team == this.team)
                this.visibleCharacter[c.id] = true;
            else {
                this.visibleCharacter[c.id] = this.entity.interAction.checkVisible(this, c);
                this.visibleCharacter[c.id] = c.checkVisible(this, this.visibleCharacter[c.id]);
            }
        }
    };
    
    Basic.prototype.checkVisible = function (c, isVisible) {
        return isVisible;
    };

    Basic.prototype.nextInterval = function () {
        if (!this.actived) return;

        this._updateStatus();
        this._updateMove();
        this._updatePositionTrigger();
        this._updateLongInteraction();
        this._updateInteraction();
        this._updateVisible();
        this.updateData();
    };

    Basic.prototype.updateData = function () {
        if (this.onChange === null) return;
        this.onChange(this.id, this.toJSON(), this.toJSONAssist());
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);