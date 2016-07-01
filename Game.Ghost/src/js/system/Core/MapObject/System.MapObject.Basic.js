window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * MapObject.Basic 
 * Basic class of object on map
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;
    var _Data = {
        ObjType: 'basic',
        Operation: {
            None: -1
        }
    };

    // Construct -----------------------------------------------------
    var Basic = function (id, para, modelData, entity) {
        this.para;                          // setup parameters for this object
        this.modelData;                     // parameter of this type 

        this.entity = entity;               // game entity 
        this.objType = _Data.ObjType;       // type of map object
        this.id;                            // object id
        this.x;                             // object coordinate
        this.y;
        this.anchor;                        // top-left position of this object
        this.rotation;                      // rotation from original rotation (facing down)

        this.setup(id, para, modelData);

        // callback
        this.onChange = null;
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // Method --------------------------------------------------------
    // Reset object variable data
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData === undefined || _recoverData === null) return;
    };

    // get all variable data as JSON. These JSON can be used for recovering.
    Basic.prototype.toJSON = function () {
        return {};
    };

    // check object status for interaction
    Basic.prototype.check = function () {
    };

    // touch object when character get close to it
    Basic.prototype.touch = function () {
    };

    // setup Immutable data
    Basic.prototype.setup = function (id, para, modelData) {
        if (id !== undefined && id !== null) this.id = id;
        if (para !== undefined && para !== null) {
            this.para = para;
            this.anchor = [para.x, para.y];
            this.x = (para.left + para.right + 1) / 2;
            this.y = (para.top + para.bottom + 1) / 2;
            this.rotation = para.rotation;
        }
        if (modelData !== undefined && modelData !== null) {
            this.modelData = modelData;
        }
    };

    // update current object data to game entity
    Basic.prototype.updateData = function () {
        if (this.onChange === null) return;
        this.onChange(this.id, this.toJSON());
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Basic = Basic;
    SYSTEM.MapObject.Basic.Data = _Data;
})(window.Rendxx.Game.Ghost.System);