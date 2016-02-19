$(function () {
    var scene, camera, renderer;
    var controls, guiControls, datGUI;
    var axis, grid, light, panel;
    var stats;
    var SCREEN_WIDTH, SCREEN_HEIGHT;
    var sk_helper;
    var player, playerData, moving, moveDirection;
    var planeGeometry, planeMaterial;

    var character_sys, character_render;

    var clock = new THREE.Clock();
    /*variables for lights*/


    function init() {
        /*creates empty scene object and renderer*/
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 5000);
        renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setClearColor(0x000000);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

        /*add controls*/
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', render);

        /*adds helpers*/
        axis = new THREE.AxisHelper(10);
        scene.add(axis);

        camera.position.x = 40;
        camera.position.y = 40;
        camera.position.z = 40;
        camera.lookAt(scene.position);

        /*panel*/
        planeGeometry = new THREE.PlaneGeometry(100, 100, 100);
        planeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -.5 * Math.PI;
        plane.receiveShadow = true;
        scene.add(plane);

        // Ambient
        light = new THREE.AmbientLight();
        light.color.setHex(0xffffff);
        scene.add(light);

        // dat gui
        guiControls = {
            ambColor: 0x555555
        };
        datGUI = new dat.GUI();
        datGUI.addColor(guiControls, 'ambColor').onChange(function (value) {
            light.color.setHex(value);
        });

        $("#webGL-container").append(renderer.domElement);
        // status track
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        $("#webGL-container").append(stats.domElement);


        character_sys = new Rendxx.Game.Ghost.System.Character(1, 'test', { role: Rendxx.Game.Ghost.System.Data.character.role.survivor });
        character_render = new Rendxx.Game.Ghost.Renderer.Character(
            character_sys.id,
            character_sys.name,
            character_sys.para.role
        );
        character_render.setup(scene);
    }

    function SetupControl() {
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
            'space': 32
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
            if (character_sys == null) return;
            //console.log(e.keyCode);
            if (e.keyCode in codeMap) {
                codeMap[e.keyCode] = true;
                getDirection(codeMap);
                //controlPlayer(direction);
                character_sys.move(direction[0] == 0 ? 0 : (direction[0] - 1) * 45, rush, direction[0] == 0);
                character_sys.headMove(direction[1] == 0 ? 0 : (direction[1] - 1) * 45, direction[1] == 0);
                e.preventDefault();
            }
        }).keyup(function (e) {
            if (character_sys == null) return;
            if (e.keyCode in codeMap) {
                codeMap[e.keyCode] = false;
                getDirection(codeMap, true);
                character_sys.move(direction[0] == 0 ? 0 : (direction[0] - 1) * 45, rush, direction[0] == 0);
                character_sys.headMove(direction[1] == 0 ? 0 : (direction[1] - 1) * 45, direction[1] == 0);
                //controlPlayer(direction);
                e.preventDefault();
            }
        });

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

    function render() {
        /*necessary to make lights function*/
        //cubeMaterial.needsUpdate = true;
        //torMaterial.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
        stats.update();

        var delta = clock.getDelta();
        if (character_sys != null) character_sys.animation();
        if (character_render != null && character_render.setuped)
            character_render.render(character_sys.action, character_sys.x, character_sys.y, character_sys.currentRotation.body, character_sys.currentRotation.headBody, delta);
        renderer.render(scene, camera);
    }

    $(window).resize(function () {
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    });

    init();
    animate();

    SetupControl();
});
