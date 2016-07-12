window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.UI = window.Rendxx.Game.Ghost.UI || {};
window.Rendxx.Game.Ghost.UI.Client = window.Rendxx.Game.Ghost.UI.Client || {};

(function (CLIENT, SYSTEM, RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        Role: {
            Survivor: 'survivor',
            Ghost: 'ghost'
        },
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
        helper: {
            html: {
                wrap: '<div class="helperWrap"></div>',
                color: '<div class="_color"></div>',
                portrait: '<div class="_portrait"></div>',
                move: '<div class="_move"></div>',
                action: '<div class="_action"></div>',
                instruction: '<div class="_instruction"><div class="_title">#title#</div><div class="_content">#content#</div></div>'
            },
            cssClass: {
                survivor: '_survivor',
                ghost: '_ghost'
            },
            content: {
                def: {
                    move: {
                        'Hold & Move': 'Move your character'
                    },
                    action: {
                        'Tap': 'Interaction with the nearest object',
                        'Hold': 'Run (if you\'re moving)<br/>' +
                                'Blocked a closed door<br/>' +
                                'Repairing a generator',

                    }
                },
                survivor: {
                },
                ghost: {
                    'ghost-mary':  {
                        'Hold & Move': 'Move your character',
                        'Tap': 'Get CRAZY and will attack nearby!'
                    },
                    action: {
                        'Tap': 'Interaction with the nearest object',
                        'Hold': 'Enter teleporting mode<br/>' ,

                    },
                    'ghost-specter': {
                        move: {
                            'Hold & Move': 'Move your character'
                        },
                        action: {
                            'Tap': 'Attack',
                            'Hold': 'Appear<br/>' +
                                    'Be able to see and attack survivors'
                        }
                    },
                    'ghost-butcher': {
                        move: {
                            'Hold & Move': 'Move your character'
                        },
                        action: {
                            'Tap': 'Attack<br/>' +
                                    'Break door',
                        }
                    }
                }
            }
        }
    };
    var ActionType = SYSTEM.Data.userInput.actionType;

    var ControlPad = function (container, root) {
        // Property -----------------------------------------------
        var that = this,
            _html = {},
            started = false,
            controller = {};

        // message -----------------------------------------------
        this.message = {};

        this.action = null;     // (content)

        this.send = null;       // (code, content)

        this.receive = function (msg) {
        };

        this.reset = function (setupData) {
            if (setupData == null) return;
            var helper = _createHelper(setupData.role, setupData.modelId,setupData.portrait);
            _resetController(setupData.role, setupData.modelId, helper);
        };

        // game ---------------------------------------------------
        this.show = function () {
            started = true;
            _html['container'].fadeIn();
        };
        this.hide = function () {
            started = false;
            _html['container'].fadeOut();
        };
        this.pause = function () {
        };
        this.continue = function () {
        };

        // Controller -----------------------------------------------
        var _resetController = function (role, modleId, helper) {
            var isBrief = (role !== _Data.Role.Survivor);

            var t = _Data.text.def;
            if (_Data.text[role] != null && _Data.text[role][modleId] != null) {
                t = _Data.text[role][modleId];
            }
            controller.info.reset({
                content: helper
            });

            controller.move.reset({
                isBrief: isBrief,
                text: t.move
            });
            controller.action.reset({
                isBrief: isBrief,
                text: t.action
            });

            controller.info.onTap = function () {
                controller.info.hide();
                controller.move.show();
                controller.action.show();
            };

            controller.info.show();
            controller.move.hide();
            controller.action.hide();
        };

        var _createHelper = function (role, modleId, portraitPath) {
            var dat = _Data.helper.content.def;
            if (_Data.helper.content[role] != null && _Data.helper.content[role][modleId] != null) {
                dat = _Data.helper.content[role][modleId];
            }

            var div = $('div');
            var wrap = $(_Data.helper.html.wrap).appendTo(div);
            var color = $(_Data.helper.html.color).addClass(_Data.helper.cssClass[role]).appendTo(wrap);
            var portrait = $(_Data.helper.html.portrait).css('background-image', 'url(' + root + Data.character.path + portraitPath + ')').appendTo(wrap);
            var move = $(_Data.helper.html.move).appendTo(wrap);
            var action = $(_Data.helper.html.action).appendTo(wrap);
            for (var title in dat.move) {
                $(_Data.helper.html.instruction.replace('#title#', title).replace('#content#', dat.move[title])).appendTo(move)
            }
            for (var title in dat.action) {
                $(_Data.helper.html.instruction.replace('#title#', title).replace('#content#', dat.action[title])).appendTo(action)
            }
            return div.html();
        };

        var _setupController = function () {
            // Info ------------------------------------------------------------------------------
            var controllerInfo = new Rendxx.Game.Client.Controller.Info({
                container: _html['container'],
                css: {
                    'background-color': '#111'
                },
                content: ''
            });

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
                that.message.action([ ActionType.stop]);
            };
            controllerMove.onTap = function (data) {
                that.message.action([ ActionType.tap_move]);
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
                that.message.action([ ActionType.tap_1 ]);
            };

            controllerAction.onPress = function (data) {
                that.message.action([ ActionType.press_1 ]);
            };

            controllerAction.onRelease = function (data) {
                that.message.action([ ActionType.release_1 ]);
            };

            controller = {
                info: controllerInfo,
                action: controllerAction,
                move: controllerMove
            };
        };

        // Setup -----------------------------------------------
        var _setupHtml = function () {
            _html = {};
            _html['container'] = $(container);
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