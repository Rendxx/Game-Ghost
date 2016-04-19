window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Item: Basic
 * Items on MapObject
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;

    // Construct -----------------------------------------------------
    var Basic = function (id, mapObjectId, name) {
        this.id = id;
        this.mapObjectId = mapObjectId;
        this.characterId = -1;
        this.name = name;

        // callback
        this.onChange = null;        
    };
    Basic.prototype = Object.create(null);
    Basic.prototype.constructor = Basic;

    // Method --------------------------------------------------------
    Basic.prototype.reset = function (_recoverData) {
        if (_recoverData === undefined || _recoverData === null) return;
        if ('mapObjectId' in _recoverData) this.mapObjectId = _recoverData.mapObjectId;
        if ('characterId' in _recoverData) this.characterId = _recoverData.characterId;
    };

    Basic.prototype.toJSON = function () {
        return {
            mapObjectId: this.mapObjectId,
            characterId: this.characterId
        }
    };

    Basic.prototype.take = function (characterId) {
        this.mapObjectId = -1;
        this.characterId = characterId;
        this.updateData();
    };

    Basic.prototype.place = function (mapObjectId) {
        this.mapObjectId = mapObjectId;
        this.characterId = -1;
        this.updateData();
    };
    
    Basic.prototype.updateData = function () {
        if (this.onChange == null) return;
        this.onChange(this.id, this.toJSON());
    };

    // ----------------------------------------------------------------
    SYSTEM.Item = SYSTEM.Item || {};
    SYSTEM.Item.Basic = Basic;
})(window.Rendxx.Game.Ghost.System);