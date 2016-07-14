window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.UI = window.Rendxx.Game.Ghost.UI || {};
window.Rendxx.Game.Ghost.UI.Client = window.Rendxx.Game.Ghost.UI.Client || {};

(function (CLIENT, SYSTEM, RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        text: {
            def: {
                move: 'Move',
                action: 'Action'
            },
            survivor: {
            },
            ghost: {
                'ghost-mary': {
                    move: 'Move',
                    action: 'Attack / Teleport'
                },
                'ghost-specter': {
                    move: 'Move',
                    action: 'Attack / Appear'
                },
                'ghost-butcher': {
                    move: 'Move',
                    action: 'Attack'
                }
            }
        },
        info: {
            html: {
                btn: '<div class="helperBtn"></div>',
                wrapHelper: '<div class="helperWrap"></div>',
                wrapLoad: '<div class="loadWrap"></div>',
                color: '<div class="_color"></div>',
                portrait: '<div class="_portrait"></div>',
                guide: '<div class="_guide"></div>',
                move: '<div class="_move"></div>',
                action: '<div class="_action"></div>',
                inner: '<div class="_inner"></div>',
                instruction: '<div class="_instruction"><div class="_title">#title#</div><div class="_content">#content#</div></div>',
                processTip: '<div class="_processTip"></div>'
            },
            cssClass: {
                survivor: '_survivor',
                ghost: '_ghost'
            },
            content: {
                def: {
                    guide: [
                        'Repair enough generators',
                        'Find keys',
                        'All alive survivors enter the escape room to win',
                    ],
                    move: {
                        'Hold & Move': 'Move your character'
                    },
                    action: {
                        'Tap': 'Interaction with the nearest object',
                        'Hold': 'Run Mode / Block Door / Repair',

                    }
                },
                survivor: {
                },
                ghost: {
                    'ghost-mary': {
                        guide: [
                            'Teleport to a place',
                            'Get crazy after your power-bar is full',
                            'Kill all the survivors',
                        ],
                        move: {
                            'Hold & Move': 'Move your character',
                            'Tap': 'Get CRAZY and will attack nearby!'
                        },
                        action: {
                            'Tap': 'Interaction with the nearest object',
                            'Hold': 'Enter teleporting mode',

                        }
                    },
                    'ghost-specter': {
                        guide: [
                            'Neither you or survivor can see each other before you appear',
                            'You can appear to reality as long as you have power',
                            'Kill all the survivors',
                        ],
                        move: {
                            'Hold & Move': 'Move your character'
                        },
                        action: {
                            'Tap': 'Attack',
                            'Hold': 'Appear'
                        }
                    },
                    'ghost-butcher': {
                        guide: [
                            'You can break any door if you want',
                            'More power will make you go faster',
                            'Kill all the survivors',
                        ],
                        move: {
                            'Hold & Move': 'Move your character'
                        },
                        action: {
                            'Tap': 'Attack / Break door',
                        }
                    }
                }
            }
        }
    };
    var ActionType = SYSTEM.Data.userInput.actionType;
    var Role = SYSTEM.Data.character.type;
    var Status = SYSTEM.Data.status.client;

    var ControlPad = function (container, root) {
        // Property -----------------------------------------------
        var that = this,
            _html = {},
            _currentStatus = null,
            shown = false,
            started = false,
            helperVisible = false,
            setuped = false,
            loaded = false,
            root = root || '',
            controller = {};

        // message -----------------------------------------------
        this.message = {};

        this.action = null;     // (content)

        this.send = null;       // (code, content)

        this.receive = function (msg) {
        };

        this.reset = function (setupData) {
            if (setupData == null) return;
            var helperStr = _createHelper(setupData.role, setupData.modelId);
            var loadingStr = _createLoading(setupData.role, setupData.modelId, setupData.portrait);
            _resetController(setupData.role, setupData.modelId, loadingStr, helperStr);
        };

        // game ---------------------------------------------------
        this.show = function () {
            shown = true;
            _html['container'].fadeIn();
        };
        this.hide = function () {
            shown = false;
            _html['container'].fadeOut();
        };
        this.updateGame = function (status) {
            if (!loaded || _currentStatus === status) return;
            _currentStatus=status;
            if (_currentStatus !== Status.playing) {
                _setLoaded();
            } else {
                _gameStart();
            }
        };
        this.pause = function () {
        };
        this.continue = function () {
        };

        this.setLoaded = function () {
            loaded = true;
            _setLoaded();
        };

        // Controller -----------------------------------------------
        var _resetController = function (role, modleId, loadingStr, helperStr) {
            var isBrief = (role === Role.ghost);

            var t = _Data.text.def;
            if (_Data.text[role] != null && _Data.text[role][modleId] != null) {
                t = _Data.text[role][modleId];
            }
            controller.load.reset({
                content: loadingStr
            });
            controller.helper.reset({
                content: helperStr
            });

            controller.move.reset({
                isBrief: isBrief,
                text: t.move
            });
            controller.action.reset({
                isBrief: isBrief,
                text: t.action
            });

            if (loaded) { _setLoaded(); }
            controller.load.show();
            controller.helper.hide();
            controller.move.hide();
            controller.action.hide();
            setuped = true;
        };

        var _createHelper = function (role, modleId) {
            var dat = _Data.info.content.def;
            if (_Data.info.content[role] != null && _Data.info.content[role][modleId] != null) {
                dat = _Data.info.content[role][modleId];
            }

            var div = $('<div></div>');
            var wrap = $(_Data.info.html.wrapHelper).appendTo(div);
            var color = $(_Data.info.html.color).addClass(_Data.info.cssClass[role]).appendTo(wrap);
            var move = $(_Data.info.html.move).appendTo(wrap);
            var inner_m = $(_Data.info.html.inner).appendTo(move);
            var action = $(_Data.info.html.action).appendTo(wrap);
            var inner_a = $(_Data.info.html.inner).appendTo(action);
            for (var title in dat.move) {
                $(_Data.info.html.instruction.replace('#title#', title).replace('#content#', dat.move[title])).appendTo(inner_m)
            }
            for (var title in dat.action) {
                $(_Data.info.html.instruction.replace('#title#', title).replace('#content#', dat.action[title])).appendTo(inner_a)
            }
            return div.html();
        };

        var _createLoading = function (role, modleId, portraitPath) {
            var dat = _Data.info.content.def;
            if (_Data.info.content[role] != null && _Data.info.content[role][modleId] != null) {
                dat = _Data.info.content[role][modleId];
            }

            var div = $('<div></div>');
            var wrap = $(_Data.info.html.wrapLoad).appendTo(div);
            var color = $(_Data.info.html.color).addClass(_Data.info.cssClass[role]).appendTo(wrap);
            var portrait = $(_Data.info.html.portrait).css('background-image', 'url(' + root + Data.character.path + portraitPath + ')').appendTo(wrap);

            var g = '';
            for (var i = 0; i < dat.guide.length; i++) {
                g += dat.guide[i]+'<br/>';
            }
            var guide = $(_Data.info.html.guide).html(g).appendTo(wrap);
            var processTip = $(_Data.info.html.processTip).text('[ LOADING... ]').appendTo(guide);
            return div.html();
        };

        var _setLoaded = function () {
            var t = $('.loadWrap').find('._processTip');
            if (t == null || t.length == 0) return;
            if (started) {
                _gameStart();
            }
            t.text('[tap to READY]');
            controller.load.onTap = function () {
                that.message.action([ActionType.tap_load]);
                t.text('[READY]');
            };
        };

        var _gameStart = function () {
            controller.load.hide();
            controller.move.show();
            controller.action.show();
            _hideHelper();
        };

        var _showHelper = function () {
            controller.helper.show();
            helperVisible = true;
        };

        var _hideHelper = function () {
            controller.helper.hide();
            helperVisible = false;
        };

        var _setupController = function () {
            // Loading ------------------------------------------------------------------------------
            var controllerLoad = new Rendxx.Game.Client.Controller.Info({
                container: _html['container'],
                css: {
                    'z-index': 70,
                    'background-color': '#111'
                },
                content: ''
            });

            // Helper ------------------------------------------------------------------------------
            var controllerHelper = new Rendxx.Game.Client.Controller.Info({
                container: _html['container'],
                css: {
                    'z-index': 80,
                    'background-color': '#111'
                },
                content: ''
            });

            controllerHelper.onTap = function () {
                _hideHelper();
            };

            // Move ------------------------------------------------------------------------------
            var controllerMove = new Rendxx.Game.Client.Controller.Move({
                container: _html['container'],
                threshold: 20,
                css: {
                    'z-index': 20,
                    'height': '100%',
                    'width': '50%',
                    'left': '0',
                    'top': '0'
                },
                text: 'Move'
            });

            controllerMove.onMove = function (data) {
                that.message.action([ActionType.move, data.degree]);
            };
            controllerMove.onStop = function (data) {
                that.message.action([ActionType.stop]);
            };
            controllerMove.onTap = function (data) {
                that.message.action([ActionType.tap_move]);
            };

            // Action ------------------------------------------------------------------------------
            var controllerAction = new Rendxx.Game.Client.Controller.Button({
                container: _html['container'],
                css: {
                    'z-index': 20,
                    'height': '100%',
                    'width': '50%',
                    'right': '0',
                    'top': '0'
                },
                cssHandler: {
                    'background-color': '#966'
                },
                text: 'Action'
            });

            controllerAction.onTap = function (data) {
                that.message.action([ActionType.tap_1]);
            };

            controllerAction.onPress = function (data) {
                that.message.action([ActionType.press_1]);
            };

            controllerAction.onRelease = function (data) {
                that.message.action([ActionType.release_1]);
            };

            controller = {
                load: controllerLoad,
                helper: controllerHelper,
                action: controllerAction,
                move: controllerMove
            };
        };

        // Setup -----------------------------------------------
        var _setupHtml = function () {
            _html = {
            };
            _html['container'] = $(container);
            _html['helper'] = $(_Data.info.html.btn).appendTo(_html['container']);
            _html['helper'].click(function () {
                if (setuped) {
                    if (helperVisible) _hideHelper();
                    else _showHelper();
                }
            });
        };

        var _init = function () {
            $(window).resize(function () {
                if (controller != null) {
                    for (var c in controller) {
                        controller[c].resize();
                    }
                }
            });
            _setupHtml();
            _setupController();
        }();
    };
    CLIENT.ControlPad = ControlPad;
})(Rendxx.Game.Ghost.UI.Client, window.Rendxx.Game.Ghost.System, window.Rendxx.Game.Ghost.Renderer);