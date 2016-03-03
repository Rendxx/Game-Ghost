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
            _para = characterPara,
            _data = characterData[_para.role].para;

        this.id = id;
        this.name = _para.name;
        this.role = _para.role;
        this.x = -1;
        this.y = -1;
        this.package = {};
        this.endurance = _data.endurance;
        this.light = 1;
        this.battery = 10;
        this.hp = _data.hp;

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        // move to an offset to a rotation with a rotation of head 
        this.move = function (offset, rotation, rotationHead, rush) {

        };

        // examine the place in front of the character
        this.examine = function () {

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