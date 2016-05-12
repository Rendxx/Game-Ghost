window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        html: {
            wrap: '<div class="prepare-screen"></div>',
            logo: '<div class="ghost-logo"></div>',
            playerList: '<div class="_playerList"></div>',
            playerPanel: '<div class="_playerPanel"></div>',
            optionPanel: '<div class="_optionPanel"></div>',
            obList: '<div class="_obList"></div>',
            mapList: '<div class="_mapList"></div>',
            start: '<div class="_start"></div>',
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

    var Prepare = function (container, opts_in, onStart) {
        // Property -------------------------------------
        var // html
            _html = {},
            html_mapSelector = null,
            html_mapItemWrap = null,
            html_mapItem = [],
            // data
            _max = 5,
            _map = [],
            mapId = null,
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
                map: mapId
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

            _html['player'] = [];
            for (var i = 0; i < _max; i++) {
                _html['player'][i] = $(_Data.html.item).appendTo(_html['playerList']);
            }
            _html['ob'] = [];

            // option panel
            _html['mapList'] = $(_Data.html.mapList).appendTo(_html['optionPanel']);
            _html['map'] = [];
            for (var i = 0; i < _map.length; i++) {
                _html['map'][i] = $(_Data.html.item).html(_map[i].name).appendTo(_html['mapList']);
                _html['map'][i].click({ id: i }, function (e) {
                    _selectMap(e.data.id);
                });
            }
            _selectMap(0);

            // start
            _html['start'].click(function () {
                if (onStart) onStart();
            });
            // map selector
            //html_mapSelector = $(HTML.mapSelector).appendTo(html_wrap);
            //html_mapItemWrap = $(HTML.mapItemWrap).appendTo(html_mapSelector).hide();
            //for (var i in _map) {
            //    var ele = $(HTML.mapItem).text(_map[i]).appendTo(html_mapItemWrap);
            //    if (mapId == null) _selectMap(i);
            //    ele.click({ id: i }, function (e) {
            //        _selectMap(e.data.id);
            //    });
            //    html_mapItem[i] = ele;
            //}
            //html_mapSelector.click(function () {
            //    html_mapItemWrap.fadeToggle(200);
            //});
        };

        var _init = function (opts_in) {
            _max = opts_in.max;
            _map = opts_in.map || {};
            _setupHtml();
        }(opts_in);
    };
    RENDERER.Prepare = Prepare;
})(window.Rendxx.Game.Ghost.Renderer);