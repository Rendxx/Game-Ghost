window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

(function (RENDERER, SYSTEM, GAMESETTING) {
    var Data = RENDERER.Data;
    var Data_System = SYSTEM.Data;
    var _Data = {
        html: {
            wrap: '<div class="prepare-screen"></div>',
            logo: '<div class="ghost-logo"></div>',
            playerList: '<div class="_playerList"></div>',
            playerPanel: '<div class="_playerPanel"></div>',
            optionPanel: '<div class="_optionPanel"></div>',
            obList: '<div class="_obList"></div>',
            mapList: '<div class="_mapList"></div>',
            ghostList: '<div class="_ghostList"></div>',
            start: '<div class="_start"></div>',
            listTitle: '<div class="_title"></div>',
            item: '<div class="_item"><div class="_text"></div></div>',
            sep: '<div class="_sep"></div>',
            clear: '<div class="_clear"></div>'
        },
        cssClass: {
            occupied: '_occupied',
            selected: '_selected'
        }
    };
    var HTML = {
        player: '<div class="_playerList"></div>',
        ob: '<div class="_obList"></div>',
        item: '<div class="_item"></div>',
        mapSelector: '<div class="map-selector"><span></span></div>',
        mapItemWrap: '<div class="map-item-wrap"></div>',
        mapItem: '<div class="_map-item"></div>'
    };

    var Prepare = function (container, onStart) {
        // Property -------------------------------------
        var // html
            _html = {},
            // data
            _max = 5,
            _map = [],
            _ghost = [],
            _survivor = [],
            _team = [],
            mapId = null,
            ghostId = {},
            clientData = {},
            // flag
            isShown = false,
            // cache     
            cache_client = null,
            cache_ob = null,
            cache_game = null;

        // Callback -------------------------------------

        // interface controll --------------------------------
        this.show = function () {
            isShown = true;
            _renderClient(cache_client);
            _renderOb(cache_ob);
            _html['container'].fadeIn();
        };

        this.hide = function () {
            isShown = false;
            _html['container'].fadeOut();
        };

        // Update ---------------------------------------
        this.updateClientList = function (clientData) {
            cache_client = clientData;
            _renderClient(clientData);
        };

        this.updateObList = function (obData) {
            cache_ob = obData;
            _renderOb(obData);
        };

        this.updateGame = function (gameData) {
            cache_game = gameData;
        };
        // api -------------------------------------------
        this.getSetupPara = function () {
            return {
                map: _map[mapId].id,
                clientList: clientData
            };
        };

        // Private ---------------------------------------
        var _renderOb = function (obData) {
            if (obData == null) return;
            // ob
            var obCount = 0;
            for (var id in _html['ob']) {
                if (!(id in obData) || obData[id].number != -1) {
                    _html['ob'][id].remove();
                    delete _html['ob'][id];
                }
            }
            for (var id in obData) {
                if (obData[id].number == -1) continue;
                obCount++;
                if (id in _html['ob']) continue;
                _html['ob'][id] = $(_Data.html.item).html(obData[id].name).addClass(_Data.cssClass.occupied).appendTo(_html['obList']);
            }

            if (obCount > 0) _html['obList'].show();
            else _html['obList'].hide();
        };

        var _renderClient = function (clientData) {
            if (clientData == null) return;
            // player
            var occupiedNumber = {};
            for (var id in clientData) {
                if (clientData[id].number == -1) continue;
                occupiedNumber[clientData[id].number] = id;
            }

            for (var i = 0; i < _max; i++) {
                if (i in occupiedNumber) {
                    _html['player'][i].html(clientData[occupiedNumber[i]].name).addClass(_Data.cssClass.occupied);
                } else {
                    _html['player'][i].html("").removeClass(_Data.cssClass.occupied);
                }
            }
        };

        var _selectMap = function (id) {
            if (_map.hasOwnProperty(mapId)) {
                _html['map'][mapId].removeClass(_Data.cssClass.selected);
            }
            mapId = id;
            _html['map'][mapId].addClass(_Data.cssClass.selected);
        };

        var _toggleGhost = function (id) {
            var count = 0;
            for (var i in ghostId) count++;
            if (ghostId.hasOwnProperty(id)) {
                if (count < 2) return;
                delete ghostId[id];
                _html['ghost'][id].removeClass(_Data.cssClass.selected);
            } else {
                ghostId[id] = true;
                _html['ghost'][id].addClass(_Data.cssClass.selected);
            }
        };

        var _setupPlayer = function () {
            var playerData = {};

            // setup data
            var playerNum = 0;
            for (var i in cache_client) playerNum++;
            var ghostPlayerIdx = Math.floor(playerNum * Math.random());
            var ghostIdxList = [],
                survivorIdxList = [];
            for (var i in ghostId) ghostIdxList.push(i);
            for (var i in _survivor) survivorIdxList.push(i);

            // setup player
            var count = 0,
                ghostIdx = Math.floor(ghostIdxList.length * Math.random()),
                survivorList = [],
                ghostList = [];

            for (var id in cache_client) {
                if (count != ghostPlayerIdx) {
                    var roleIdx = Math.floor(survivorIdxList.length * Math.random());
                    var m = _survivor[survivorIdxList[roleIdx]];
                    survivorIdxList.splice(roleIdx, 1);
                    playerData[id] = {
                        name: cache_client[id].name,
                        id: id,
                        role: Data_System.character.type.survivor,
                        modelId: m.id,
                        team: 0
                    };
                    survivorList.push(id);
                } else {
                    var roleIdx = Math.floor(ghostIdxList.length * Math.random());
                    var m = _ghost[ghostIdxList[roleIdx]];
                    playerData[id] = {
                        name: cache_client[id].name,
                        id: id,
                        role: Data_System.character.type.ghost,
                        modelId: m.id,
                        team: 0
                    };
                    ghostList.push(id);
                }
                count++;
            }

            // setup team
            var survivorTeamIdx = [],
                ghostTeamIdx = [],
                teamIdx = 0;
            for (var i = 0; i < survivorList.length; i++) {
                survivorTeamIdx.push(teamIdx);
                teamIdx = (teamIdx + 1) % _team.survivor.length;
            }
            teamIdx = 0;
            for (var i = 0; i < ghostList.length; i++) {
                ghostTeamIdx.push(teamIdx);
                teamIdx = (teamIdx + 1) % _team.ghost.length;
            }

            for (var i = 0; i < survivorList.length; i++) {
                var t = Math.floor(survivorTeamIdx.length * Math.random());
                playerData[survivorList[i]].team = _team.survivor[survivorTeamIdx[t]].id;
                survivorTeamIdx.splice(t, 1);
            }

            for (var i = 0; i < ghostList.length; i++) {
                var t = Math.floor(ghostTeamIdx.length * Math.random());
                playerData[ghostList[i]].team = _team.ghost[ghostTeamIdx[t]].id;
                ghostTeamIdx.splice(t, 1);
            }

            return playerData;
        };

        // Setup -----------------------------------------
        var _setupHtml = function () {
            // containers
            _html['container'] = $(container);
            _html['wrap'] = $(_Data.html.wrap).appendTo(_html['container']);
            _html['playerPanel'] = $(_Data.html.playerPanel).appendTo(_html['wrap']);
            _html['optionPanel'] = $(_Data.html.optionPanel).appendTo(_html['wrap']);
            _html['start'] = $(_Data.html.start).appendTo(_html['wrap']);

            // player panel
            _html['logo'] = $(_Data.html.logo).appendTo(_html['playerPanel']);
            _html['playerList'] = $(_Data.html.playerList).appendTo(_html['playerPanel']);
            _html['obList'] = $(_Data.html.obList).appendTo(_html['playerPanel']);
            _html['playerTitle'] = $(_Data.html.listTitle).html('Player').appendTo(_html['playerList']);
            _html['obTitle'] = $(_Data.html.listTitle).html('Observer').appendTo(_html['obList']);
            
            _html['player'] = [];
            for (var i = 0; i < _max; i++) {
                _html['player'][i] = $(_Data.html.item).appendTo(_html['playerList']);
            }
            _html['ob'] = [];

            // option panel
            _html['mapList'] = $(_Data.html.mapList).appendTo(_html['optionPanel']);
            _html['mapTitle'] = $(_Data.html.listTitle).html('Map').appendTo(_html['mapList']);
            _html['map'] = [];
            for (var i = 0; i < _map.length; i++) {
                _html['map'][i] = $(_Data.html.item).html(_map[i].name).appendTo(_html['mapList']);
                _html['map'][i].click({ id: i }, function (e) {
                    _selectMap(e.data.id);
                });
            }
            _selectMap(0);

            _html['ghostList'] = $(_Data.html.ghostList).appendTo(_html['optionPanel']);
            _html['ghostTitle'] = $(_Data.html.listTitle).html('Ghost').appendTo(_html['ghostList']);
            _html['ghost'] = [];
            for (var i = 0; i < _ghost.length; i++) {
                _html['ghost'][i] = $(_Data.html.item).html(_ghost[i].name).appendTo(_html['ghostList']);
                _html['ghost'][i].click({ id: i }, function (e) {
                    _toggleGhost(e.data.id);
                });
                _toggleGhost(i);
            }

            // start
            _html['start'].click(function () {
                clientData = _setupPlayer();
                if (onStart) onStart({
                    map: _map[mapId].id,
                    clientList: clientData
                });
            });
        };

        var _init = function () {
            _max = GAMESETTING.max;
            _ghost = GAMESETTING.ghost;
            _survivor = GAMESETTING.survivor;
            _map = GAMESETTING.map;
            _team = GAMESETTING.team;
            _setupHtml();
        }();
    };
    RENDERER.Prepare = Prepare;
})(window.Rendxx.Game.Ghost.Renderer, window.Rendxx.Game.Ghost.System, window.Rendxx.Game.Ghost.GameSetting);