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
        var _para = Data.character.para[characterPara.role];

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
        this.light = _para.init.light;
        this.battery = _para.init.battery;
        this.hp = _para.init.hp;
        this.action = this.modelData.action.list[this.modelData.action.init];

        //    O------------->
        //    | 225 180 135
        //    | 270     90
        //    | 315  0  45
        //    v

        this.currentRotation = {
            head: 0,
            body: 0,
            headBody: 0
        };
        this.requiredRotation = {
            head: 0,
            body: 0
        };
        this.actived = true;
        this.rush = false;          // flag: character is rushing
        this.stay = true;           // flag: character does not move
        this.headFollow = true;     // flag: character dose not turn his head
        this.accessObject = null;   // access object
        this.soundObject = null;    // sound object
        this.visibleObject = {};    // visible object list: {Object type: {Object Id: [distance, angle from front]}}
        this.visibleCharacter = {}; // visible character list

        this.endurance = (this.modelData.para.hasOwnProperty('endurance') && this.modelData.para.endurance.hasOwnProperty('init')) ? this.modelData.para.endurance.init : _para.endurance.init;
        this.enduranceRecover = (this.modelData.para.hasOwnProperty('endurance') && this.modelData.para.endurance.hasOwnProperty('recover')) ? this.modelData.para.endurance.recover : _para.endurance.recover;
        this.enduranceCost = (this.modelData.para.hasOwnProperty('endurance') && this.modelData.para.endurance.hasOwnProperty('cost')) ? this.modelData.para.endurance.cost : _para.endurance.cost;
        this.enduranceMax = (this.modelData.para.hasOwnProperty('endurance') && this.modelData.para.endurance.hasOwnProperty('max')) ? this.modelData.para.endurance.max : _para.endurance.max;
        this.triggeringList = {};
        this.longInteractionObj = null;
        this.warningMark = false;

        // callback ------------------------------------------------------
        this.onChange = null;
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // Method --------------------------------------------------------
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData === null || _recoverData === undefined) return;
        if ('x' in _recoverData) this.x = _recoverData.x;
        if ('y' in _recoverData) this.y = _recoverData.y;
        if ('actived' in _recoverData) this.actived = _recoverData.actived;
        if ('endurance' in _recoverData) this.endurance = _recoverData.endurance;
        if ('light' in _recoverData) this.light = _recoverData.light;
        if ('battery' in _recoverData) this.battery = _recoverData.battery;
        if ('hp' in _recoverData) this.hp = _recoverData.hp;
        if ('currentRotation' in _recoverData) this.currentRotation = _recoverData.currentRotation;
        if ('action' in _recoverData) this.action = _recoverData.action;
        this.updateData();
    };

    Basic.prototype.toJSON = function () {
        return {
            x: this.x,
            y: this.y,
            actived: this.actived,
            endurance: this.endurance,
            light: this.light,
            battery: this.battery,
            hp: this.hp,
            currentRotation: this.currentRotation,
            action: this.action,
            accessObject: this.accessObject,
            visibleObject: this.visibleObject,
            visibleCharacter: this.visibleCharacter,
            longInteractionObj: this.longInteractionObj,
            soundObject: this.soundObject
        };
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
        if (!stay_in) this.requiredRotation.body = direction;
        if (!headFollow_in) this.requiredRotation.head = directionHead;
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
                var deltaX = speed * Math.sin(this.currentRotation.body / 180 * Math.PI);
                var deltaY = speed * Math.cos(this.currentRotation.body / 180 * Math.PI);

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
        var canMove = (obj_new === null || (obj_new.type === SYSTEM.Map.Data.Grid.Door && obj_new.obj.status === SYSTEM.MapObject.Door.Data.Status.Opened));

        if (obj_x === null || (obj_x.type === SYSTEM.Map.Data.Grid.Door && obj_x.obj.status === SYSTEM.MapObject.Door.Data.Status.Opened)) {
            this.x += deltaX;
        } else {
            x_t = deltaX > 0 ? (newX - _radius) : (newX + 1 + _radius);
            if ((deltaX > 0 && x_t > this.x) || (deltaX < 0 && x_t < this.x)) this.x = x_t;                
            canMove = true;
        }

        if (obj_y === null || (obj_y.type === SYSTEM.Map.Data.Grid.Door && obj_y.obj.status === SYSTEM.MapObject.Door.Data.Status.Opened)) {
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

    Basic.prototype._updateInteraction = function () {
        this.visibleObject = this.entity.interAction.checkInteractionObj(this.id, this.x, this.y, this.currentRotation.head);
        this.soundObject = this.entity.interAction.checkSoundObj(this.id, this.x, this.y);
        this.accessObject = this.entity.interAction.getAccessObject(this.id, this.x, this.y, this.currentRotation.head);

        if (this.longInteractionObj !== null && this.longInteractionObj !== this.accessObject) this.cancelLongInteraction();
    };

    Basic.prototype._updateVisible = function () {
        for (var i = 0, l = this.entity.characterManager.characters.length; i < l; i++) {
            var c = this.entity.characterManager.characters[i];
            if (!c.actived || c.team == this.team)
                this.visibleCharacter[c.id] = true;
            else
                this.visibleCharacter[c.id] = this.entity.interAction.checkVisible(this, c);
        }
    };

    Basic.prototype.nextInterval = function () {
        if (!this.actived) return;

        this._updateMove();
        this._updatePositionTrigger();
        this._updateStatus();
        this._updateInteraction();
        this._updateVisible();
        this.updateData();
    };

    Basic.prototype.updateData = function () {
        if (this.onChange === null) return;
        this.onChange(this.id, this.toJSON());
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);