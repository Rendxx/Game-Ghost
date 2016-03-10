$(function () {
    var cameraControl, stats, datGUI;

    // game -----------------------------------------------------
    var _root = null;
    var renderer = window.Rendxx.Game.Ghost.Renderer.Create(document.getElementById('game-container'), _root);
    var system = window.Rendxx.Game.Ghost.System.Create(_root);
    system.onStarted = function (modelData, mapData) {
        renderer.start();
        SetupControl(system);
    };
    system.onLoaded = function (modelData, mapData, playerData) {
        renderer.load(modelData, mapData, playerData);
        system.start();
    };
    system.setup([
        {
            name: 'player 1',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'green'
        },
        {
            name: 'player 2',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'red'
        },
        {
            name: 'player 3',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'blue'
        }
    ], 'test');
    system.onChange = renderer.updateGame;
    renderer.onTimeInterval = system.nextInterval;
});


function SetupControl(system) {
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
        'f': 70
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

            system.interAction.receive({
                actionType: '01',
                characterId: 0,
                direction: (direction[0] == 0 ? 0 : (direction[0] - 1) * 45),
                directionHead: (direction[1] == 0 ? 0 : (direction[1] - 1) * 45),
                rush: rush,
                stay: direction[0] == 0,
                headFollow: direction[1] == 0
            });
            e.preventDefault();
        } else if (e.keyCode == keyCode['f']) {
            system.interAction.receive({
                actionType: '02',
                characterId: 0
            });
        } else if (e.keyCode == keyCode['e']) {
            system.interAction.receive({
                actionType: '03',
                characterId: 0
            });
        }
    }).keyup(function (e) {
        if (e.keyCode in codeMap) {
            codeMap[e.keyCode] = false;
            getDirection(codeMap, true);

            system.interAction.receive({
                actionType: '01',
                characterId: 0,
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