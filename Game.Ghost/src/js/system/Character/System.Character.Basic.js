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
        range:{
            danger:8
        },
        flyCountMax:1600
    };

    // Construct -----------------------------------------------------
    var Basic = function (id, characterPara, characterData, entity) {
        // data ----------------------------------------------------------
        var _para = Data.character.para[characterPara.role];

        this.entity = entity;
        this.id = id;
        this.name = characterPara.name;
        this.role = characterPara.role;
        this.modelId = characterPara.modelId;
        this.x = -1;
        this.y = -1;
        this.para = characterPara;
        this.modelData = characterData[characterPara.role][characterPara.modelId];
        this.color = this.modelData.color;
        this.endurance = _para.init.endurance;
        this.light = _para.init.light;
        this.battery = _para.init.battery;
        this.hp = _para.init.hp;
        this.action = this.modelData.action.list[this.modelData.action.init];
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
        this.characterCheckingList = {};
        
        this.enduranceRecover = _para.enduranceRecover;
        this.enduranceCost = _para.enduranceCost;
        this.triggeringList = {};

        // callback ------------------------------------------------------
        this.onChange = null;
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // Method --------------------------------------------------------
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
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
            visibleCharacter: this.visibleCharacter
        };
    };

    // move to a directionn with a rotation of head 
    Basic.prototype.move = function (direction, directionHead, rush_in, stay_in, headFollow_in) {
        if (!this.actived) return;
        if (this.role == Data.character.type.survivor) this.rush = rush_in;
        this.stay = stay_in;
        this.headFollow = headFollow_in;
        if (!stay_in) this.requiredRotation.body = direction;
        if (!headFollow_in) this.requiredRotation.head = directionHead;
    };
    
    // use the item in front of the character
    Basic.prototype.interaction = function () {
        if (!this.actived) return;
        if (this.accessObject == null) return;
        return this.accessObject.check();
    };

    Basic.prototype.checkOperation = function () {
        return null;
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
        realDirection_head = (!this.stay && (this.headFollow || (this.rush && !isBack))) ? this.currentRotation.body : (this.headFollow ? this.currentRotation.head : this.requiredRotation.head);
        d_head = realDirection_head - this.currentRotation.head;
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
                var deltaY =  speed * Math.cos(this.currentRotation.body / 180 * Math.PI);

                if (deltaX > 0) _radius_x = _radius;
                else if (deltaX < 0) _radius_x = -_radius;
                if (deltaY > 0) _radius_y = _radius;
                else if (deltaY < 0) _radius_y = -_radius;
                deltaX += _radius_x;
                deltaY += _radius_y;
                var canMove =  this.entity.interAction.moveCheck(this.x, this.y, deltaX, deltaY);
                if (deltaX != 0) this.x = canMove[0] - _radius_x;
                if (deltaY != 0) this.y = canMove[1] - _radius_y;
            }
        }
    };

    Basic.prototype._updatePositionTrigger = function () {
    };

    Basic.prototype._updateStatus = function () {
    };

    Basic.prototype._updateInteraction = function () {
        this.visibleObject =  this.entity.interAction.checkInteractionObj(this.id, this.x, this.y, this.currentRotation.head);
        this.soundObject = this.entity.interAction.checkSoundObj(this.x, this.y);
        this.accessObject = this.entity.interAction.getAccessObject(this.id, this.x, this.y, this.currentRotation.head);
    };

    Basic.prototype._updateVisible = function () {
        for (var i = 0; i < this.characterCheckingList.length; i++) {
            var c = this.characterCheckingList[i];
            if (!this.entity.characters[c].actived)
                this.visibleCharacter[c] = true;
            else
                this.visibleCharacter[c] =  this.entity.interAction.checkVisible(this, this.entity.characters[c]);
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
        if (this.onChange == null) return;
        this.onChange(this.id, this.toJSON());
    };

    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);