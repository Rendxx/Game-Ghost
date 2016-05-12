window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

(function (RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        html: {
            wrap: '<div class="end-screen"></div>',
            logo: '<div class="ghost-logo"></div>',
            icon: '<div class="_rstIcon"></div>',
            inner: '<div class="_inner"></div>',
            title: '<div class="_title"></div>',
            renew: '<div class="_renew"></div>',
            list: '<div class="_list"></div>',
            item: '<div class="_item"><div class="_text"></div></div>',
            sep: '<div class="_sep"></div>',
            clear: '<div class="_clear"></div>'
        },
        cssClass: {
            success: '_success',
            failed: '_failed',
            dead: '_dead',
            win: '_win'
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

    var CSS = {
        occupied: '_occupied'
    };

    var Prepare = function (opts_in) {
        // Property -------------------------------------
        var // html
            html_wrap = $('.prepare'),
            html_startBtn = $('._start'),
            html_clients = html_wrap.children('._clients'),
            html_playerList = null,
            html_obList = null,
            html_players = [],
            html_obs = {},
            html_mapSelector = null,
            html_mapItemWrap = null,
            html_mapItem = [],
            // data
            _max = 5,
            _map = 5,
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
            html_wrap.fadeIn();
        };

        this.hide = function () {
            isShown = false;
            html_wrap.fadeOut();
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
            for (var id in html_obs) {
                if (!(id in obData) || obData[id].number != -1) {
                    html_obs[id].remove();
                    delete html_obs[id];
                }
            }
            for (var id in obData) {
                if (obData[id].number == -1) continue;
                obCount++;
                if (id in html_obs) continue;
                html_obs[id] = $(HTML.item).html(obData[id].name).addClass(CSS.occupied).appendTo(html_obList);
            }

            if (obCount > 0) html_obList.show();
            else html_obList.hide();
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
                    html_players[i].html(clientData[occupiedNumber[i]].name).addClass(CSS.occupied);
                } else {
                    html_players[i].html("").removeClass(CSS.occupied);
                }
            }
        };

        var _selectMap = function (id) {
            mapId = id;
            html_mapSelector.children('span').text(_map[id]);
        };

        // Setup -----------------------------------------
        var _setupHtml = function () {
            html_playerList = $(HTML.player).appendTo(html_clients);
            html_obList = $(HTML.ob).appendTo(html_clients);
            for (var i = 0; i < _max; i++) {
                html_players[i] = $(HTML.item).appendTo(html_playerList);
            }
            html_startBtn.click(function () {
                $.get('/Host/Start')
            });

            // map selector
            html_mapSelector = $(HTML.mapSelector).appendTo(html_wrap);
            html_mapItemWrap = $(HTML.mapItemWrap).appendTo(html_mapSelector).hide();
            for (var i in _map) {
                var ele = $(HTML.mapItem).text(_map[i]).appendTo(html_mapItemWrap);
                if (mapId == null) _selectMap(i);
                ele.click({ id: i }, function (e) {
                    _selectMap(e.data.id);
                });
                html_mapItem[i] = ele;
            }
            html_mapSelector.click(function () {
                html_mapItemWrap.fadeToggle(200);
            });
        };

        var _init = function (opts_in) {
            _max = opts_in.max;
            _map = opts_in.map || {};
            _setupHtml();
        }(opts_in);
    };
    RENDERER.Prepare = Prepare;
})(window.Rendxx.Game.Ghost.Renderer);