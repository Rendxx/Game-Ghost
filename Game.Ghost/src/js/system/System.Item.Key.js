window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Item: Key
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;

    // Construct -----------------------------------------------------
    var Key = function (id, mapObjectId, name, doorId) {
        SYSTEM.Item.Basic.call(this, id, mapObjectId, name);

        //data
        this.doorId = doorId;

        // callback
        this.onChange = null;
    };
    Key.prototype = Object.create(SYSTEM.Item.Basic.prototype);
    Key.prototype.constructor = Key;
    
    // Method --------------------------------------------------------

    // ---------------------------------------------------------------
    SYSTEM.Item = SYSTEM.Item || {};
    SYSTEM.Item.Key = Key;
})(window.Rendxx.Game.Ghost.System);