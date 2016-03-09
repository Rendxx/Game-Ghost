window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Item: Key
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var Key = function (furnitureId, doorId, name) {
        // data ----------------------------------------------------------
        var that = this;

        this.furnitureId = furnitureId;
        this.doorId = doorId;
        this.name = name;
        this.available = true;

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------

        // recover / init character
        this.reset = function (_recoverData) {
            if (_recoverData == null) return;
            if ('furnitureId' in _recoverData) this.available = _recoverData.furnitureId;
            if ('doorId' in _recoverData) this.available = _recoverData.doorId;
            if ('name' in _recoverData) this.available = _recoverData.name;
            if ('available' in _recoverData) this.available = _recoverData.available;
        };

        this.toJSON = function () {
            return {
                furnitureId: this.furnitureId,
                doorId: this.doorId,
                name: this.name,
                available: this.available
            }
        };

        // private method ------------------------------------------------

        var _onChange = function () {
            if (that.onChange == null) return;
            that.onChange(that.id, that.toJSON());
        };

        var _init = function () {
        };
        _init();
    };

    SYSTEM.Key = Key
})(window.Rendxx.Game.Ghost.System);