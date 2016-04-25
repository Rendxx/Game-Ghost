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
        PosType: {
            Survivor: 1,
            Ghost: 2,
            End: 3
        },
        Operation: {
            Search: 1
        }
    };

    // Construct -----------------------------------------------------
    var Position = function (id, posArr, posType) {
        var info = {
            x: posArr[0],
            y: posArr[1],
            left: posArr[0],
            right: posArr[0],
            top: posArr[1],
            bottom: posArr[1],
            rotation: 0
        };

        SYSTEM.MapObject.Basic.call(this, id, info);
        this.objType = _Data.ObjType;
        this.posType = posType;
    };
    Position.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Position.prototype.constructor = Position;

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Position = Position;
    SYSTEM.MapObject.Position.Data = _Data;
})(window.Rendxx.Game.Ghost.System);