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
            _modelData = characterData[_info.role][_info.modelId],
            _para = Data.character.para[_info.role];

        this.id = id;
        this.name = _info.name;
        this.role = _info.role;
        this.modelId = _info.modelId;
        this.x = -1;
        this.y = -1;
        this.package = {};
        this.endurance = _modelData.para.endurance;
        this.light = _para.init.light;
        this.battery = _para.init.battery;
        this.hp = _para.init.hp;
        this.action = _modelData.action.list[_modelData.action.init];
        this.currentRotation = {
            head: 0,
            body: 0,
            headBody: 0
        };
        this.requiredRotation = {
            head: 0,
            body: 0
        };
        var rush = false,
            stay = true,
            headFollow = true;

        // callback ------------------------------------------------------
        this.onChange = null;

        // public method -------------------------------------------------

        // recover / init character
        this.reset = function (_recoverData) {
            if (_recoverData == null) return;
            if ('x' in _recoverData) this.x = _recoverData.x;
            if ('y' in _recoverData) this.y = _recoverData.y;
            if ('role' in _recoverData) this.role = _recoverData.role;
            if ('package' in _recoverData) this.package = _recoverData.xpackage;
            if ('endurance' in _recoverData) this.endurance = _recoverData.endurance;
            if ('light' in _recoverData) this.light = _recoverData.light;
            if ('battery' in _recoverData) this.battery = _recoverData.battery;
            if ('hp' in _recoverData) this.hp = _recoverData.hp;
            if ('rotation' in _recoverData) this.hp = _recoverData.rotation;
            if ('action' in _recoverData) this.hp = _recoverData.action;
            if ('rush' in _recoverData) this.hp = _recoverData.rush;
            _onChange();
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
        var _onChange = function () {
            if (this.onChange == null) return;
            this.onChange({
                x: x,
                y: y,
                endurance: endurance,
                light: light,
                battery: battery,
                hp: hp,
                currentRotation: currentRotation,
                action: action
            });
        };

        var _init = function () {
        };
        _init();
    };

    SYSTEM.Character = Character
})(window.Rendxx.Game.Ghost.System);