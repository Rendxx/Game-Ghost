$(function () {
    var cameraControl, stats, datGUI;

    // game -----------------------------------------------------
    var _root = null;
    var renderer = window.Rendxx.Game.Ghost.Renderer.Create(document.getElementById('game-container'), _root, ['p7'], false);
    var systemWrapper = window.Rendxx.Game.Ghost.WebWorker.Create(_root, "../js/Game.Ghost.System.Core.js");
    systemWrapper.onSetuped = function (setupData) {
        renderer.reset(setupData);
    };
    systemWrapper.onStarted = function (modelData, mapData) {
    };
    systemWrapper.onEnded = function (isWin) {
        renderer.hide();
        var s = isWin ? "Survivor Escaped!!!!" : "Survior all killed!!!";
        var t = isWin ? "GOOD JOB" : "GAME OVER";
        $$.info.alert(s, t, false, "rgba(0,0,0,0.6)", null);
    };
    systemWrapper.setup({
        'p1': {
            id: 'p1',
            name: 'player 1',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'green'
        },
        //'p2': {
        //    id: 'p2',
        //    name: 'player 2',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'red'
        //},
        //'p3': {
        //    id: 'p3',
        //    name: 'player 3',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'blue'
        //},
        //'p4': {
        //    id: 'p4',
        //    name: 'player 4',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'yellow'
        //},
        //'p5': {
        //    id: 'p5',
        //    name: 'player 5',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'orange'
        //},
        //'p6': {
        //    id: 'p6',
        //    name: 'player 6',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'purple'
        //},
        'p7': {
            id: 'p7',
            name: 'player 7',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.ghost,
            modelId: 'white'
        }
    },{ 
        map: 'test'
    });
    //system.setup([
    //    {
    //        name: 'player 1',
    //        role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
    //        modelId: 'green'
    //    }
    //], 'test2');
    systemWrapper.onUpdated = function (gamepData) {
        renderer.updateGame(gamepData);
    }; 
    //renderer.onTimeInterval = system.nextInterval;

    renderer.onSetuped = function () {
        SetupControl(systemWrapper, 'p1');
        systemWrapper.start();
        renderer.show();
    };
    renderer.hide();
});


function SetupControl(system, pId) {
    var moveDirction = 0;
    var direction = [0, 0];
    var rush = false;
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
                actionType: '01',
                direction: (direction[0] == 0 ? 0 : (direction[0] - 1) * 45),
                directionHead: (direction[1] == 0 ? 0 : (direction[1] - 1) * 45),
                rush: rush,
                stay: direction[0] == 0,
                headFollow: direction[1] == 0
            });
            e.preventDefault();
        } else if (e.keyCode == keyCode['f']) {
            system.action(pId, {
                actionType: '02'
            });
        } else if (e.keyCode == keyCode['e']) {
            system.action(pId, {
                actionType: '03'
            });
        } else if (e.keyCode == keyCode['g']) {
            system.action(pId, {
                actionType: '04'
            });
        } else if (e.keyCode == keyCode['c']) {
            system.action(pId, {
                actionType: '05'
            });
        }
    }).keyup(function (e) {
        if (e.keyCode in codeMap) {
            codeMap[e.keyCode] = false;
            getDirection(codeMap, true);

            system.action(pId, {
                actionType: '01',
                direction: (direction[0] == 0 ? 0 : (direction[0] - 1) * 45),
                directionHead: (direction[1] == 0 ? 0 : (direction[1] - 1) * 45),
                rush: rush,
                stay: direction[0] == 0,
                headFollow: direction[1] == 0
            });
            e.preventDefault();
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