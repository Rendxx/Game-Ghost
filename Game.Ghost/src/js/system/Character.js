window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Character manager
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var Character = function (id, characterPara, characterData) {
        // data ----------------------------------------------------------
        var that = this,
            _info = characterPara,
            _modelData = characterData[_info.role].para,
            _para = Data.character.para[_info.role];

        this.id = id;
        this.name = _info.name;
        this.role = _info.role;
        this.x = -1;
        this.y = -1;
        this.package = {};
        this.endurance = _modelData.endurance;
        this.light = _para.init.light;
        this.battery = _para.init.battery;
        this.hp = _para.init.hp;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        // recover / init character
        this.reset = function (_recoverData) {
            if ('x' in _recoverData) this.x = _recoverData.x;
            if ('y' in _recoverData) this.y = _recoverData.y;
            if ('role' in _recoverData) this.role = _recoverData.role;
            if ('package' in _recoverData) this.package = _recoverData.xpackage;
            if ('endurance' in _recoverData) this.endurance = _recoverData.endurance;
            if ('light' in _recoverData) this.light = _recoverData.light;
            if ('battery' in _recoverData) this.battery = _recoverData.battery;
            if ('hp' in _recoverData) this.hp = _recoverData.hp;
        };

        // move to an offset to a rotation with a rotation of head 
        this.move = function (offset, rotation, rotationHead, rush) {

        };

        // use the item in front of the character
        this.use = function () {

        };

        // turn on / off torch light
        this.switchTorch = function () {

        };

        // character die
        this.die = function () {
            this.hp = 0;
        };

        // private method ------------------------------------------------

        var _init = function () {
        };
        _init();
    };

    SYSTEM.Character = Character
})(window.Rendxx.Game.Ghost.System);