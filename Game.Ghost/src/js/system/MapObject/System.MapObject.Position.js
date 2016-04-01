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
        ObjType: 'position',
        Operation: {
            Search: 1
        }
    };

    // Construct -----------------------------------------------------
    var Position = function (id, para, modelData) {
    };
    Position.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Position.prototype.constructor = Position;

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Position = Position;
    SYSTEM.MapObject.Position.Data = _Data;
})(window.Rendxx.Game.Ghost.System);