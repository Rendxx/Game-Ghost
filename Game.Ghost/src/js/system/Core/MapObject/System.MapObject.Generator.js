window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * MapObject: Furniture
 */
(function (SYSTEM) {
    // Data ----------------------------------------------------------
    var Data = SYSTEM.Data;
    var _Data = {
        ObjType: 'generator',
        Status: {
            Broken: 0,
            Fixing: 1,
            Worked: 2
        },
        Operation: {
            Fix: 1
        },
        message: {
            fixing: 'Repearing: ',
            fixed: 'Generator Repaired!'
        }
    };

    // Construct -----------------------------------------------------
    var Generator = function (id, info, modelData, entity) {
        SYSTEM.MapObject.Basic.call(this, id, info, modelData, entity);

        this.objType = _Data.ObjType;
        this.actioning = false;          // this furnition is actioning
        this.noiseName = SYSTEM.Noise.Data.Name.Operation;
        this.noiseProbability = Data.noise.generator.probability;
        this.blockSight = modelData.blockSight;
        this.status = _Data.Status.Broken;
        this.process = modelData.process;
        this.maxProcess = modelData.process;
        this.fixFunc = {};

        // callback
        this.onFixed = null;
    };
    Generator.prototype = Object.create(SYSTEM.MapObject.Basic.prototype);
    Generator.prototype.constructor = Generator;

    // Method --------------------------------------------------------
    Generator.prototype.reset = function (_recoverData) {
        if (_recoverData === undefined || _recoverData === null) return;
        if ('status' in _recoverData) this.status = _recoverData.status;
        if ('process' in _recoverData) this.process = _recoverData.process;
    };

    Generator.prototype.toJSON = function () {
        return {
            status: this.status,
            process: this.process
        };
    };

    Generator.prototype.check = function () {
        return {
            type: _Data.ObjType,
            id: this.id,
            status: this.status
        };
    };

    Generator.prototype.fix = function (characterId) {
        this.status = _Data.Status.Fixing;
        this.entity.sound.once(SYSTEM.Sound.Data.Type.Normal, _Data.ObjType, this.id, SYSTEM.Sound.Data.Name.Key);

        if (this.fixFunc.hasOwnProperty(characterId)) clearInterval(this.fixFunc[characterId]);
        var that = this;
        var messageCount=15;
        this.fixFunc[characterId] = setInterval(function () {
            if (that.process <= 0) {
                that.process = 0;
                that.status = _Data.Status.Worked;
                if (that.entity.noise.generateNoise(1, that.noiseName, that.x, that.y)) {
                    that.entity.effort.once(SYSTEM.Effort.Data.Name.Electric, that.x, that.y);
                }
                that.entity.interAction.updateInteraction(that.objType, that.id);
                that.stopFix(characterId);
                that.entity.message.send(characterId, _Data.message.fixed);
                if (that.onFixed) that.onFixed(that.id);
                return;
            }
            that.process--;
            that.entity.noise.generateNoise(that.noiseProbability, that.noiseName, that.x, that.y);
            if (--messageCount <= 0) {
                that.entity.message.send(characterId, _Data.message.fixing + (100-Math.ceil(that.process * 100 / that.maxProcess)) + '%');
                messageCount = 15;
            }
            that.updateData();
        }, 40);
        this.updateData();
    };

    Generator.prototype.stopFix = function (characterId) {
        if (this.fixFunc.hasOwnProperty(characterId)) clearInterval(this.fixFunc[characterId]);
        this.updateData();
    }

    // ----------------------------------------------------------------
    SYSTEM.MapObject = SYSTEM.MapObject || {};
    SYSTEM.MapObject.Generator = Generator;
    SYSTEM.MapObject.Generator.Data = _Data;
})(window.Rendxx.Game.Ghost.System);