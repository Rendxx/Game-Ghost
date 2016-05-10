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
    var CharacterManager = function (entity, modelData, playerData_in, gameData) {
        // data ----------------------------------------------------------
        var that = this,
            len = 0;

        this.characters = null;
        this.setupData = null;
        this.id2Index = {};      // {id: index}
        this.index2Id = {};      // {index: id}
        this.team = {};

        // callback ------------------------------------------------------

        // public method -------------------------------------------------
        this.setup = function (survivorPos, ghostPos) {
            this.setupData = {};
            var t;
            var pos_s = [],
                pos_g = [];

            for (var i = 0; i < survivorPos.length; i++) pos_s[i] = survivorPos[i];
            for (var i = 0; i < ghostPos.length; i++) pos_g[i] = ghostPos[i];

            for (var i = 0; i < len; i++) {
                var c = this.characters[i];
                if (c.role === Data.character.type.survivor) {
                    // survivor
                    var idx = Math.floor(pos_s.length * Math.random());
                    t = pos_s[idx];
                    pos_s.splice(idx, 1);
                } else if (c.role === Data.character.type.ghost) {
                    // ghost
                    var idx = Math.floor(pos_g.length * Math.random());
                    t = pos_g[idx];
                    pos_g.splice(idx, 1);
                }
                c.reset({
                    x: t[0] + 0.5,
                    y: t[1] + 0.5
                });
                this.setupData[this.index2Id[i]] = playerData_in[this.index2Id[i]];
                this.setupData[this.index2Id[i]].setupData = c.getSetupData();
            }
        };

        this.reset = function (setupData_in, recoverData) {
            this.setupData = setupData_in;
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

        this.getEndInfo = function () {
            var survivorWin = false;
            var winTeam = -1;
            var win = 0, isEnd = true, survivorEnd = {}, ghostEnd = {};
            for (var i = 0; i < len; i++) {
                if (this.characters[i].role === Data.character.type.survivor) {
                    if (this.characters[i].win) {
                        survivorWin = true;
                        winTeam = this.characters[i].team;
                    }

                    survivorEnd[this.characters[i].id] = {
                        portrait: this.characters[i].modelData.portrait,
                        name: this.characters[i].name,
                        isWin: this.characters[i].win
                    };
                } else {
                    ghostEnd[this.characters[i].id] = {
                        portrait: this.characters[i].modelData.portrait,
                        name: this.characters[i].name
                    };
                }
            }

            return {
                survivorWin: survivorWin,
                survivor: survivorEnd,
                ghost: ghostEnd,
                team: winTeam
            };
        };

        // private method ------------------------------------------------
        var _init = function () {
            var index = 0;
            that.characters = [];
            for (var id in playerData_in) {
                var p = playerData_in[id];
                var c = null;
                if (p.role === Data.character.type.survivor) {
                    c = new SYSTEM.Character.Survivor[Data.character.className.survivor[p.modelId]](index, p, modelData.characters, entity);
                } else if (p.role === Data.character.type.ghost) {
                    c = new SYSTEM.Character.Ghost[Data.character.className.ghost[p.modelId]](index, p, modelData.characters, entity);
                }
                c.onChange = function (idx, data) {
                    gameData[idx] = data;
                };
                
                that.characters[index] = c;
                if (!that.team.hasOwnProperty(p.team)) that.team[p.team] = [];
                that.team[p.team].push(c);

                that.id2Index[id] = index;
                that.index2Id[index] = id;
                index++;
            }
            len = index;
        };
        _init();
    };

    SYSTEM.CharacterManager = CharacterManager
})(window.Rendxx.Game.Ghost.System);