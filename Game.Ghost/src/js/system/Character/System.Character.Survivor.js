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
    var Survivor = function (id, characterPara, characterData, entity) {
        // data
        this.win = false;       // character is win or not
        this.recover = 0;       // recover enfurance count
    };
    Survivor.prototype = Object.create(SYSTEM.Character.Basic.prototype);
    Survivor.prototype.constructor = Survivor;

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
        updateData();
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
            interactionObj: this.interactionObj,
            visibleList: this.visibleList,
            danger: this.danger
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
        this.accessObject.interaction(this);
    };
    
    Basic.prototype._updateStatus = function () {
    };

    Basic.prototype._updateInteraction = function () {
    };
    
    // ---------------------------------------------------------------
    SYSTEM.Character = SYSTEM.Character || {};
    SYSTEM.Character.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);