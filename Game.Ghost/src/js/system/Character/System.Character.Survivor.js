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
        if ('win' in _recoverData) this.win = _recoverData.win;
        if ('key' in _recoverData) this.key = _recoverData.key;
        if ('recover' in _recoverData) this.recover = _recoverData.recover;
        SYSTEM.Character.Basic.reset.call(this, _recoverData);
    };

    Basic.prototype.toJSON = function () {
        var dat = SYSTEM.Character.Basic.toJSON.call(this);
        dat['win'] = this.win;
        dat['key'] = this.key;
        dat['lockDoor'] = this.lockDoor;
        dat['danger'] = this.danger;
        dat['recover'] = this.recover;
        return dat;
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