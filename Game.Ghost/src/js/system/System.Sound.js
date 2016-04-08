window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Message manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
        Name: {
            'Key': 0,
            'OpenDoor': 1,
            'CloseDoor': 2,
            'Unlock': 3,
            'CantOpen': 4,
            'OpenCarbinet': 5,
            'CloseCarbinet': 6,
            'Walk': 7,
            'Run': 8,
            'Danger': 9,
            'Die': 10,
            'Scream': 11
        },
        Type: {
            'Character': 0,
            'Furniture': 1,
            'Door': 2,
            'Stuff': 3,
            'Body':4
        }
    }
    var Sound = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            _sounds_once = {},
            _sounds_conherent = {}
        
        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.once = function (objType, id, soundName) {
            _sounds_once[objType] = _sounds_once[objType] || {};
            _sounds_once[objType][id] = _sounds_once[objType][id] || {};
            _sounds_once[objType][id][soundName]=1;
        };

        this.coherent = function (objType, id, soundName, isOn) {
            _sounds_conherent[objType][id] = _sounds_once[objType][id] || {};
            if (isOn) _sounds_conherent[objType][id][soundName] = 1;
            else delete _sounds_conherent[objType][id][soundName];
        };

        this.getSoundDat = function () {
            var s = [_sounds_once, _sounds_conherent];
            _sounds_once = {};
            return s;
        };

        // setup -----------------------------------------------
        var _init = function () {
            for (var i in _Data.Type) {
                _sounds_conherent[_Data.Type[i]] = {};
            }
        };
        _init();
    };

    SYSTEM.Sound = Sound;
    SYSTEM.Sound.Data = _Data;
})(window.Rendxx.Game.Ghost.System);