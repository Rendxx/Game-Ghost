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
            Locked: 0,
            Opened: 1,
            Closed: 2,
            Blocked: 3
        }
    };
    var Door = function (id, info, modelData, hasKey) {
        // data ----------------------------------------------------------
        var that = this,
            _info = info,
            _modelData = modelData;

        this.x = (info.left + info.right + 1) / 2;
        this.y = (info.top + info.bottom + 1) / 2;
        this.id = id;
        this.modelId = _info.modelId;
        this.status = hasKey ? _Data.Status.Locked : _Data.Status.Closed;
        this.failedOpen = false;

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------

        // recover / init character
        this.reset = function (_recoverData) {
            if (_recoverData == null) return;
            if ('status' in _recoverData) this.status = _recoverData.status;
        };

        this.toJSON = function () {
            return {
                status: this.status,
                failedOpen: this.failedOpen
            }
        };

        // open or close by character
        this.interaction = function (character) {
            this.failedOpen = false;
            if (this.status == _Data.Status.Opened) {
                this.status = _Data.Status.Closed;
                _onChange();
            } else if (this.status == _Data.Status.Closed) {
                this.status = _Data.Status.Opened;
                _onChange();
            } else if (this.id in character.key) {
                this.status = _Data.Status.Opened;
                _onChange();
            } else {
                this.failedOpen = true;
                _onChange();
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

    SYSTEM.Door = Door
})(window.Rendxx.Game.Ghost.System);