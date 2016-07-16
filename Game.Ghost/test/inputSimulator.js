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
    //codeMap[keyCode['space']] = false;

    $("body").keydown(function (e) {
        //console.log(e.keyCode);
        if (e.keyCode in codeMap) {
            codeMap[e.keyCode] = true;
            getDirection(codeMap);

            if (direction[0] == 0)
                system.action(pId, ['s']);
            else
                system.action(pId, ['m', (direction[0] - 1) * 45]);

            e.preventDefault();
        } else if (e.keyCode == keyCode['g']) {
            if (!longPress2) {
                delayFunc2 = setTimeout(function () {
                    delayFunc2 = null;
                    longPress2 = true;
                    system.action(pId, ['p2']);
                }, 200);
            }
        } else if (e.keyCode == keyCode['f']) {            
        } else if (e.keyCode == keyCode['e']) {
            system.action(pId, ['tm']);
        } else if (e.keyCode == keyCode['space']) {
            if (!longPress) {
                delayFunc = setTimeout(function () {
                    delayFunc = null;
                    longPress = true;
                    system.action(pId, ['p1']);
                }, 200);
            }
        }
    }).keyup(function (e) {
        if (e.keyCode in codeMap) {
            codeMap[e.keyCode] = false;
            getDirection(codeMap, true);

            if (direction[0] == 0)
                system.action(pId, ['s']);
            else
                system.action(pId, ['m', (direction[0] - 1) * 45]);
            e.preventDefault();
        } else if (e.keyCode == keyCode['g']) {
            longPress2 = false;
            if (delayFunc2 != null) {
                clearTimeout(delayFunc2);
                delayFunc2 = null;
                system.action(pId, ['t2']);
            } else {
                system.action(pId, ['r2']);
            }
        } else if (e.keyCode == keyCode['f']) {
        } else if (e.keyCode == keyCode['space']) {
            longPress = false;
            if (delayFunc != null) {
                clearTimeout(delayFunc);
                delayFunc = null;
                system.action(pId, ['t1']);
            } else {
                system.action(pId, ['r1']);
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