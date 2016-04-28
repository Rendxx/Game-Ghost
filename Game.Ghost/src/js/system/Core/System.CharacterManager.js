window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};

/**
 * Character manager, setup characters
 */
(function (SYSTEM) {
    var Data = SYSTEM.Data;
    var _Data = {
    };
    var CharacterManager = function (entity, playerData, gameData) {
        // data ----------------------------------------------------------
        var that = this,
            len = 0;

        this.characters = null;
        this.characterIdxMap = {};      // {id: index}
        this.team = {};

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.setup = function () {
        };

        this.reset = function (recoverData) {
            for (var i = 0; i < len; i++) {
                this.characters[i].reset((recoverData !== null) ? recoverData[i] : null);
            }
        };

        this.update = function () {
            for (var i = 0; i < len; i++) {
                this.characters[i].nextInterval();
            }
        };

        this.checkEnd = function () {
            var isEnd = true;
            for (var i = 0; i < len; i++) {
                if (this.characters[i].role === Data.character.type.survivor) {
                     if (this.characters[i].win) {
                        isEnd = true;
                        break;
                     }else if (this.characters[i].hp > 0) {
                         isEnd = false;
                     }
                }
            }
            return isEnd;
        };

        // private method ------------------------------------------------
        var _init = function () {
            var index = 0;
            for (var id in playerData) {
                var p = playerData[id];
                var c = null;
                if (playerData[id].role === Data.character.type.survivor) {
                    c = new SYSTEM.Character.Survivor[Data.character.className.survivor[p.modelId]](index, p, modelData.characters, that);
                    //that.characterRoleMap.survivor.push(index);
                } else if (playerData[id].role === Data.character.type.ghost) {
                    c = new SYSTEM.Character.Ghost[Data.character.className.ghost[p.modelId]](index, p, modelData.characters, that);
                    //that.characterRoleMap.ghost.push(index);
                }
                c.onChange = function (idx, data) {
                    gameData[idx] = data;
                };
                
                that.characters[index] = c;
                if (!that.team.hasOwnProperty(p.team)) that.team[p.team] = [];
                that.team[p.team].push(c);

                that.characterIdxMap[id] = index++;
            }
            len = index;
        };
        _init();
    };

    SYSTEM.CharacterManager = CharacterManager
})(window.Rendxx.Game.Ghost.System);