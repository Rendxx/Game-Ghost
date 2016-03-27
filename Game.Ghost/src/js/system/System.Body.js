window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Item: Furniture
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
    };
    var Body = function (character) {
        // data ----------------------------------------------------------
        var that = this,
            _character = character;

        this.x = 0;
        this.y = 0;
        this.id = -1;
        this.name = "";
        this.key = {};

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------

        // recover / init character
        this.reset = function (_recoverData) {
            if (_recoverData == null) return;
            if ('x' in _recoverData) this.x = _recoverData.x;
            if ('y' in _recoverData) this.y = _recoverData.y;
            if ('id' in _recoverData) this.id = _recoverData.id;
            if ('name' in _recoverData) this.name = _recoverData.name;
            if ('key' in _recoverData) this.key = _recoverData.key;
        };

        this.toJSON = function () {
            return {
                x: this.x,
                y: this.y,
                id: this.id,
                name: this.name,
                key: this.key
            }
        };

        // open or close by character
        this.interaction = function () {
            return this.key;
        };

        // private method ------------------------------------------------

        var _onChange = function () {
            if (that.onChange == null) return;
            that.onChange(that.id, that.toJSON());
        };

        var _init = function () {
            if (character == null) return;
            that.x = Math.floor(character.x);
            that.y = Math.floor(character.y);
            that.id = character.id;
            that.name = character.name + "'s Body";
            for (var id in character.key) {
                that.key[id] = character.key[id];
            }
        };
        _init();
    };

    SYSTEM.Body = Body
})(window.Rendxx.Game.Ghost.System);