window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * QuickTimeEvent manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
        ObjType: 'qte',
        Name: {
            'Generator': 0
        },
        Para: {
            0: 'generator'
        }
    };
    var QuickTimeEvent = function (entity, gameData) {
        // data ----------------------------------------------------------
        var that = this,
            _list = {},
            ratio = 1;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.once = function (name, characterId, onSuccessed, onFailed) {
            if (_list.hasOwnProperty(characterId)) this.fail(characterId);
            var para = Data.qte[_Data.Para[name]];

            var start = 0;
            if (para.duration > para.receive + para.duration / 8) {
                start = Math.floor(Math.random() * (para.duration - para.receive - para.duration / 8)) + para.duration / 8;
            } else if (para.duration > para.receive) {
                start = Math.floor(Math.random() * (para.duration - para.receive));
            }
            var end = start + para.receive;
            _list[characterId] = {
                name: name,
                current:0,
                duration: para.duration,
                start: start,
                end: end,
                onFailed: onFailed,
                onSuccessed: onSuccessed
            };

            gameData[characterId] = [
                name,
                0,
                para.duration,
                start,
                end
            ];
        };

        this.generate = function (probability, name, characterId, onSuccessed, onFailed) {
            if (Math.random() > probability * ratio) return false;
            this.once(name, characterId, onSuccessed, onFailed);
            return true;
        };

        this.update = function () {
            for (var i in _list) {
                var t = _list[i];
                ++t.current;
                gameData[i][1] = t.current;
                if (++t.current >= t.duration) {
                    this.fail(i);
                }
            }
        };

        this.tryCancel = function (characterId) {
            if (!_list.hasOwnProperty(characterId)) return;
            var t = _list[characterId];
            if (t.current < t.start || t.current > t.end) {
                this.fail(characterId);
                return;
            }

            this.success(characterId);
        };

        this.fail = function (characterId) {
            if (!_list.hasOwnProperty(characterId)) return;
            var t = _list[characterId];
            delete _list[characterId];
            delete gameData[characterId];
            if (t.onFailed) t.onFailed();
        };

        this.success = function (characterId) {
            if (!_list.hasOwnProperty(characterId)) return;
            var t = _list[characterId];
            delete _list[characterId];
            delete gameData[characterId];
            if (t.onSuccessed) t.onSuccessed();
        };

        // setup -----------------------------------------------
        var _init = function () {
            _list = {};
        };
        _init();
    };

    SYSTEM.QuickTimeEvent = QuickTimeEvent;
    SYSTEM.QuickTimeEvent.Data = _Data;
})(window.Rendxx.Game.Ghost.System);