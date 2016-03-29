window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * MapObject: Body
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;
    var _Data = {
    };

    // Construct -----------------------------------------------------
    var Body = function () {
        SYSTEM.MapObject.Basic.call(this);
        // data 
        this.name = "";
        this.key = {};

        // callback 
        this.onChange = null;
    };
    Body.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Body.prototype.constructor = Body;

    // Method --------------------------------------------------------
    Body.prototype.reset = function (_recoverData) {
        if (_recoverData == null) return;
        if ('id' in _recoverData) this.id = _recoverData.id;
        if ('key' in _recoverData) this.key = _recoverData.key;
    };

    Body.prototype.toJSON = function () {
        return {
            id: this.id,
            key: this.key
        };
    };

    Body.prototype.interaction = function () {
        return this.key;
    };

    Body.prototype.setup = function (character) {
        this.name = character.name + "'s Body";
        this.key = {};
        for (var id in character.key) {
            this.key[id] = character.key[id];
        }

        var info = {
            left: Math.floor(character.x),
            right: Math.ceil(character.x),
            top: Math.floor(character.y),
            bottom: Math.ceil(character.y)
        };
        SYSTEM.MapObject.Basic.setup.call(this, character.id, info, null);
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Body = Body;
})(window.Rendxx.Game.Ghost.System);