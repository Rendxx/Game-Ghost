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
    var Key = function (id, mapObjectId, name, doorId, entity) {
        SYSTEM.Item.Basic.call(this, id, mapObjectId, name, entity);

        this.noiseName = SYSTEM.Noise.Data.Name.Key;
        this.noiseProbability = Data.noise.key.probability;
        this.doorId = doorId;
    };
    Key.prototype = Object.create(SYSTEM.Item.Basic.prototype);
    Key.prototype.constructor = Key;

    // Method --------------------------------------------------------
    Key.prototype.touch = function (x, y) {
        this.entity.noise.generateNoise(this.noiseProbability, this.noiseName, x, y);
    };

    // ---------------------------------------------------------------
    SYSTEM.Item = SYSTEM.Item || {};
    SYSTEM.Item.Key = Key;
})(window.Rendxx.Game.Ghost.System);