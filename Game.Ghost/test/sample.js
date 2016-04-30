$(function () {
    var cameraControl, stats, datGUI;

    // game -----------------------------------------------------
    var _root = null;
    var renderer = window.Rendxx.Game.Ghost.Renderer.Create(document.getElementById('game-container'), _root, ['p7'], 2);
    var system = window.Rendxx.Game.Ghost.System.Create(_root, "../js/Game.Ghost.System.Core.js");
    system.onSetuped = function (setupData) {
        renderer.reset(setupData);
    };
    system.onStarted = function (modelData, mapData) {
    };
    system.onEnd = function (endData) {
        renderer.hide();
        var s = endData.survivorWin ? "Survivor Escaped!!!!" : "Survior all killed!!!";
        var t = endData.survivorWin ? "GOOD JOB" + " Team " + endData.team : "GAME OVER";
        $$.info.alert(s, t, false, "rgba(0,0,0,0.6)", null);
        console.log(endData);
    };
    system.onUpdated = function (gamepData) {
        renderer.updateGame(gamepData);
    };
    renderer.onSetuped = function () {
        SetupControl(system, 'p7');
        renderer.show();
    };
    renderer.hide();

    system.setup({
        'p1': {
            id: 'p1',
            name: 'player 1',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'bobo',
            team: 0
        },
        'p2': {
            id: 'p2',
            name: 'player 2',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'capboy',
            team: 1
        },
        //'p3': {
        //    id: 'p3',
        //    name: 'player 3',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'highcircle',
        //    team: 1
        //},
        //'p4': {
        //    id: 'p4',
        //    name: 'player 4',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'girl1',
        //    team: 1
        //},
        //'p5': {
        //    id: 'p5',
        //    name: 'player 5',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'mohicans'
        //},
        //'p6': {
        //    id: 'p6',
        //    name: 'player 6',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'girl2'
        //},
        'p7': {
            id: 'p7',
            name: 'player 7',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.ghost,
            modelId: 'ghost-mary',
            team: 2
        }
    },{ 
        map: 'test'
    });
    system.start();
});


function SetupControl(system, pId) {
    var moveDirction = 0;
    var direction = [0, 0];
    var rush = false;
    var delayFunc = null;
    var delayFunc2 = null;
    var longPress = false;
    var longPress2 = false;
    /*
     * direction[0]: move direction
     * direction[1]: head direction
     * 
     * 0: not move
     * 
     * 6 5 4
     * 7 0 3
     * 8 1 2
     */

    var keyCode = {
        'up': 104,
        'down': 101,
        'left': 100,
        'right': 102,
        'w': 87,
        's': 83,
        'a': 65,
        'd': 68,
        'space': 32,
        'e': 69,
        'f': 70,
        'g': 71,
        'c': 67
    };

    var codeMap = {};
    codeMap[keyCode['up']] = false;
    codeMap[keyCode['down']] = false;
    codeMap[keyCode['left']] = false;
    codeMap[keyCode['right']] = false;
    codeMap[keyCode['w']] = false;
    codeMap[keyCode['s']] = false;
    codeMap[keyCode['a']] = false;
    codeMap[keyCode['d']] = false;
    codeMap[keyCode['space']] = false;

    $("body").keydown(function (e) {
        //console.log(e.keyCode);
        if (e.keyCode in codeMap) {
            codeMap[e.keyCode] = true;
            getDirection(codeMap);

            system.action(pId, {
                actionType: 'm',
                direction: (direction[0] == 0 ? 0 : (direction[0] - 1) * 45),
                directionHead: (direction[1] == 0 ? 0 : (direction[1] - 1) * 45),
                rush: rush,
                stay: direction[0] == 0,
                headFollow: direction[1] == 0
            });
            e.preventDefault();
        } else if (e.keyCode == keyCode['g']) {
            if (!longPress2) {
                delayFunc2 = setTimeout(function () {
                    delayFunc2 = null;
                    longPress2 = true;
                    system.action(pId, {
                        actionType: 'p2'
                    });
                }, 200);
            }
        } else if (e.keyCode == keyCode['f']) {
            if (!longPress) {
                delayFunc = setTimeout(function () {
                    delayFunc = null;
                    longPress = true;
                    system.action(pId, {
                        actionType: 'p1'
                    });
                }, 200);
            }
        } else if (e.keyCode == keyCode['e']) {
            system.action(pId, {
                actionType: 'tm'
            });
        //} else if (e.keyCode == keyCode['c']) {
        //    system.action(pId, {
        //        actionType: 't1'
        //    });
        }
    }).keyup(function (e) {
        if (e.keyCode in codeMap) {
            codeMap[e.keyCode] = false;
            getDirection(codeMap, true);

            system.action(pId, {
                actionType: 'm',
                direction: (direction[0] == 0 ? 0 : (direction[0] - 1) * 45),
                directionHead: (direction[1] == 0 ? 0 : (direction[1] - 1) * 45),
                rush: rush,
                stay: direction[0] == 0,
                headFollow: direction[1] == 0
            });
            e.preventDefault();
        } else if (e.keyCode == keyCode['g']) {
            longPress2 = false;
            if (delayFunc2 != null) {
                clearTimeout(delayFunc2);
                delayFunc2 = null;
                system.action(pId, {
                    actionType: 't2'
                });
            } else {
                system.action(pId, {
                    actionType: 'r2'
                });
            }
        } else if (e.keyCode == keyCode['f']) {
            longPress = false;
            if (delayFunc != null) {
                clearTimeout(delayFunc);
                delayFunc = null;
                system.action(pId, {
                    actionType: 't1'
                });
            } else {
                system.action(pId, {
                    actionType: 'r1'
                });
            }
        }
    });
    //controlPlayer(direction);

    var getDirection = function (codeMap, keyUp) {
        // rush
        rush = codeMap[keyCode['space']];
        //console.log(codeMap);

        // head
        var up = codeMap[keyCode['up']],
            down = codeMap[keyCode['down']],
            left = codeMap[keyCode['left']],
            right = codeMap[keyCode['right']];
        if (down) {          // down
            if (left) direction[1] = 8;          // left
            else if (right) direction[1] = 2;     // right
            else direction[1] = 1;
        } else if (up) {   // up
            if (left) direction[1] = 6;          // left
            else if (right) direction[1] = 4;     // right
            else direction[1] = 5;
        } else if (left) {   // left
            direction[1] = 7;
        } else if (right) {   // right
            direction[1] = 3;
        } else {   // no move
            direction[1] = 0;
        }

        // move
        up = codeMap[keyCode['w']];
        down = codeMap[keyCode['s']];
        left = codeMap[keyCode['a']];
        right = codeMap[keyCode['d']];
        if (down) {          // down
            if (left) direction[0] = 8;          // left
            else if (right) direction[0] = 2;     // right
            else direction[0] = 1;
        } else if (up) {   // up
            if (left) direction[0] = 6;          // left
            else if (right) direction[0] = 4;     // right
            else direction[0] = 5;
        } else if (left) {   // left
            direction[0] = 7;
        } else if (right) {   // right
            direction[0] = 3;
        } else {   // no move
            direction[0] = 0;
        }
    };
};