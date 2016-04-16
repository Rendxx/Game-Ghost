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
            'Locked': 4,
            'CantOpen': 5,
            'OpenCarbinet': 6,
            'CloseCarbinet': 7,
            'Walk': 8,
            'Run': 9,
            'Danger': 10,
            'Die': 11,
            'Scream': 12,
            'Bell': 13
        }
    };
    var Sound = function (entity) {
        /*
         * Sound Output Data Structure:
         * Once: [0] for character, [1] for all other objects
         *  {id:sound}...
         *  {id:{ type | id | sound }...}...
         * 
         * Conherent: [0] for character, [1] for all other objects
         *  {id:sound}...
         *  {id:{ type | id | sound }...}...
         * 
         */
        // data ----------------------------------------------------------
        var that = this,
            _sounds_once = {},
            _sounds_conherent = {}
        
        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.once = function (objType, id, soundName, isEffort) {
            if (isEffort) {
                _sounds_once[0][id] = soundName;
            } else {
                _sounds_once[1][objType + '_' + id + '_' + soundName] = {
                    type: objType,
                    id: id,
                    sound: soundName
                };
            }
        };

        this.coherent = function (objType, id, soundName, isOn) {
            _sounds_conherent[objType][id] = _sounds_conherent[objType][id] || {};
            if (isOn) _sounds_conherent[objType][id][soundName] = 1;
            else delete _sounds_conherent[objType][id][soundName];
        };

        this.getSoundDat = function () {
            var s = [_sounds_once, _sounds_conherent];
            _sounds_once = [{}, {}];
            return s;
        };

        // setup -----------------------------------------------
        var _init = function () {
            for (var i in _Data.Type) {
                _sounds_conherent[_Data.Type[i]] = {};
            }
            _sounds_once = [{}, {}];
        };
        _init();
    };

    SYSTEM.Sound = Sound;
    SYSTEM.Sound.Data = _Data;
})(window.Rendxx.Game.Ghost.System);