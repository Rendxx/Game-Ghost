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
        ObjType: 'body',
        Operation: {
            Search: 1
        }
    };

    // Construct -----------------------------------------------------
    var Body = function (modelData) {
        SYSTEM.MapObject.Basic.call(this);

        this.modelData = modelData;
        this.objType = _Data.ObjType;
        this.name = "";
        this.key = null;
        this.realPos = {};      // this is for calculating interaction position
    };
    Body.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Body.prototype.constructor = Body;

    // Method --------------------------------------------------------
    Body.prototype.reset = function (_recoverData) {
        if (_recoverData === undefined || _recoverData === null) return;
        if ('id' in _recoverData) this.id = _recoverData.id;
        if ('key' in _recoverData) this.key = _recoverData.key;
    };

    Body.prototype.toJSON = function () {
        return {
            id: this.id,
            key: this.key
        };
    };

    Body.prototype.check = function () {
        return {
            type: _Data.ObjType,
            id: this.id,
            key: this.key
        };
    };

    Body.prototype.takeKey = function (keyIds) {
        if (this.key === null || keyIds === undefined || keyIds.length === 0) return [];
        var rst = {};
        for (var i = 0; i < keyIds.length; i++) {
            var k = keyIds[i];
            if (this.key.hasOwnProperty(k)) {
                rst[k] = this.key[k];
                delete this.key[k];
            }
        }

        var noKey = true;
        for (var i in this.key) {
            noKey = false;
            break;
        }
        if (noKey) this.key = null;

        this.updateData();
        return rst;
    };

    Body.prototype.setup = function (character) {
        if (character === null || character === undefined) return;
        this.name = character.name + "'s Body";
        this.realPos = {
            x: character.x,
            y: character.y
        };
        for (var id in character.key) {
            if (this.key === null) this.key = {};
            this.key[character.key[id]] = id;
        }

        var info = {
            x: Math.floor(character.x),
            y: Math.floor(character.y),
            left: Math.floor(character.x),
            right: Math.floor(character.x),
            top: Math.floor(character.y),
            bottom: Math.floor(character.y),
            rotation: 0
        };
        SYSTEM.MapObject.Basic.prototype.setup.call(this, character.id, info, this.modelData);
    };

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Body = Body;
    SYSTEM.MapObject.Body.Data = _Data;
})(window.Rendxx.Game.Ghost.System);