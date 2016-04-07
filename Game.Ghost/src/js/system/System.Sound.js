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
        'Key': 'Key',
        'OpenDoor': 'OpenDoor',
        'CloseDoor': 'CloseDoor',
        'Unlock': 'Unlock',
        'CantOpen': 'CantOpen',
        'OpenCarbinet': 'OpenCarbinet',
        'CloseCarbinet': 'CloseCarbinet',
        'Walk': 'Walk',
        'Run': 'Run',
        'Danger': 'Danger',
        'Die': 'Die',
        'Scream': 'Scream'
    }
    var Sound = function (entity) {
        // data ----------------------------------------------------------
        var that = this,
            _sounds_once = {},
            _sounds_conherent = {}
        
        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.once = function (characterId, soundName) {
            _sounds_once[characterId] = soundName;
        };

        this.coherent = function (characterId, soundName, isOn) {
            _sounds_conherent[characterId] = isOn ? 1 : 0;
        };

        this.getSoundDat = function () {
            var s = [_sounds_once, _sounds_conherent];
            _sounds_once = {};
            return s;
        };

        // setup -----------------------------------------------
        var _init = function () {
        };
        _init();
    };

    SYSTEM.Sound = Sound;
    SYSTEM.Sound.Data = _Data;
})(window.Rendxx.Game.Ghost.System);