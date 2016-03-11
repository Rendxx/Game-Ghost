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
        Status: {
            None: 0,
            Closed: 1,
            Opened: 2
        }
    };
    var Furniture = function (id, info, modelData) {
        // data ----------------------------------------------------------
        var that = this,
            _info = info,
            _modelData = modelData,
            actioning = false;          // this furnition is actioning

        this.id = id;
        this.modelId = _info.modelId;
        this.status = _modelData.statusChange == true ? _Data.Status.Closed : _Data.Status.None;
        this.keyId = -1;            // key id, -1 means no key

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------

        // recover / init character
        this.reset = function (_recoverData) {
            if (_recoverData == null) return;
            if ('status' in _recoverData) this.status = _recoverData.status;
            if ('keyId' in _recoverData) this.keyId = _recoverData.keyId;
        };

        this.toJSON = function () {
            return {
                status: this.status,
                keyId: this.keyId
            }
        };

        // being used by user, return key id if available, otherwise return -1
        this.interaction = function () {
            if (actioning) return -1;                      // no interaction during action
            if ((this.status == _Data.Status.Opened || !_modelData.statusChange) && this.keyId != -1) {
                var k = this.keyId;
                this.keyId = -1;
                _onChange();
                return k;
            }

            if (!_modelData.statusChange) return -1;       // no interaction if status can not being changed
            if (_modelData.duration != null && _modelData.duration != 0) {
                actioning = true;
                setTimeout(function () { actioning = false; }, _modelData.duration);
            }

            this.status = (this.status == _Data.Status.Opened ? _Data.Status.Closed : _Data.Status.Opened);
            _onChange();
            return -1;
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

    SYSTEM.Furniture = Furniture
})(window.Rendxx.Game.Ghost.System);