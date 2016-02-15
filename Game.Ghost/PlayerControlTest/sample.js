$(function () {
    var scene, camera, renderer;
    var controls, guiControls, datGUI;
    var axis, grid, light, panel;
    var stats;
    var SCREEN_WIDTH, SCREEN_HEIGHT;
    var sk_helper;
    var player, playerData, moving, moveDirection;
    var planeGeometry, planeMaterial;

    var action = {}, mixer, fadeAction;

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
            rotation: 0,
            ambColor: 0x555555,
            Def: function () {
                fadeAction('Def');
            },
            Idle1: function () {
                fadeAction('Idle');
            },
            Idel2: function () {
                fadeAction('Idle2');
            },
            Run: function () {
                fadeAction('Run');
            },
            Walk: function () {
                fadeAction('Walk');
            },
            Back: function () {
                fadeAction('Back');
            },
            Turn: function () {
                fadeAction('Turn');
            }
        };
        datGUI = new dat.GUI();
        datGUI.add(guiControls, 'rotation', -90, 90).name('Rotation');
        datGUI.addColor(guiControls, 'ambColor').onChange(function (value) {
            light.color.setHex(value);
        });
        datGUI.add(guiControls, 'Def').name('Def');
        datGUI.add(guiControls, 'Idle1').name('Idle 1');
        datGUI.add(guiControls, 'Idel2').name('Idel 2');
        datGUI.add(guiControls, 'Run').name('Run');
        datGUI.add(guiControls, 'Walk').name('Walk');
        datGUI.add(guiControls, 'Back').name('Back');
        datGUI.add(guiControls, 'Turn').name('Turn');

        $("#webGL-container").append(renderer.domElement);
        // status track
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        $("#webGL-container").append(stats.domElement);
    }

    function AddBlenderMesh(file) {
        var loader = new THREE.JSONLoader();
        var mesh = null;
        loader.load(file, function (geometry, materials) {
            for (var i = 0; i < materials.length; i++) {
                materials[i].skinning = true;
            }
            mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            action.Back = new THREE.AnimationAction(geometry.animations[0]);
            action.Def = new THREE.AnimationAction(geometry.animations[1]);
            action.Idle = new THREE.AnimationAction(geometry.animations[2]);
            action.Idle2 = new THREE.AnimationAction(geometry.animations[3]);
            action.Run = new THREE.AnimationAction(geometry.animations[4]);
            action.Turn = new THREE.AnimationAction(geometry.animations[5]);
            action.Walk = new THREE.AnimationAction(geometry.animations[6]);
            action.Idle.Def = 1;
            action.Idle.weight = 0;
            action.Idle2.weight = 0;
            action.Run.weight = 0;
            action.Walk.weight = 0;
            action.Back.weight = 0;
            action.Turn.weight = 0;

            mixer = new THREE.AnimationMixer(mesh);
            mixer.addAction(action.Def);
            mixer.addAction(action.Idle);
            mixer.addAction(action.Idle2);
            mixer.addAction(action.Run);
            mixer.addAction(action.Walk);
            mixer.addAction(action.Back);
            mixer.addAction(action.Turn);

            scene.add(mesh);

            player = mesh;

            sk_helper = new THREE.SkeletonHelper(mesh);
            scene.add(sk_helper);
            //mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //mesh.castShadow = true;
            //mesh.receiveShadow = true;
            //scene.add(mesh);
        });
    }

    function LoadPlayerData(file) {
        $.getJSON(file, function (json) {
            playerData = json;
        });
    };

    function SetupControl() {
        var moveDirction = 0;
        var direction = [0, 5];
        /*
         * direction[0]: move direction
         * direction[1]: head direction
         * 
         * 0: not move
         * 
         * 5 4 3
         * 6 0 2
         * 7 8 1
         */

        var keyCode = {
            'up': 104,
            'down': 101,
            'left': 100,
            'right': 102,
            'w': 87,
            's': 83,
            'a': 65,
            'd': 68
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

        $("body").keydown(function (e) {
            if (player == null || playerData == null) return;
            if (e.keyCode in codeMap) {
                //console.log(e.keyCode);
                codeMap[e.keyCode] = true;
                getDirection(codeMap);
                controlPlayer(direction);
                e.preventDefault();
            }
        }).keyup(function (e) {
            if (player == null || playerData == null) return;
            if (e.keyCode in codeMap) {
                codeMap[e.keyCode] = false;
                getDirection(codeMap, true);
                controlPlayer(direction);
                e.preventDefault();
            }
        });

        var getDirection = function (codeMap, keyUp) {
            // head
            var up = codeMap[keyCode['up']],
                down = codeMap[keyCode['down']],
                left = codeMap[keyCode['left']],
                right = codeMap[keyCode['right']];
            if (down) {          // down
                if (left) direction[1] = 7;          // left
                else if (right) direction[1] = 1;     // right
                else direction[1] = 8;
            } else if (up) {   // up
                if (left) direction[1] = 5;          // left
                else if (right) direction[1] = 3;     // right
                else direction[1] = 4;
            } else if (left) {   // left
                direction[1] = 6;
            } else if (right) {   // right
                direction[1] = 2;
            } else {   // no move
                direction[1] = 0;
            }

            // move
            up = codeMap[keyCode['w']];
            down = codeMap[keyCode['s']];
            left = codeMap[keyCode['a']];
            right = codeMap[keyCode['d']];
            if (down) {          // down
                if (left) direction[0] = 7;          // left
                else if (right) direction[0] = 1;     // right
                else direction[0] = 8;
            } else if (up) {   // up
                if (left) direction[0] = 5;          // left
                else if (right) direction[0] = 3;     // right
                else direction[0] = 4;
            } else if (left) {   // left
                direction[0] = 6;
            } else if (right) {   // right
                direction[0] = 2;
            } else {   // no move
                direction[0] = 9;
            }
            if (direction[0] != 0) direction[0] -= 4;
        };

        var controlPlayer = function (direction) {
            if (direction[1] != 0) moveDirction = direction[1] * 45;

            var r = direction[0];
            if (r == 5) r = 0;
            var r_head = 0, r_body = 0;

            var back = false;

            if (Math.abs(r) <= 2) {
                r_head = r * 45;
                r_body = r_head + moveDirction;
            } else {
                if (r < 0) r += 4;
                else r -= 4;
                r_head = r * 45;
                r_body = r_head + moveDirction;
                back = true;
            }
            //console.log('direction[0] (move): ' + direction[0]);
            //console.log('direction[1] (head): ' + direction[1]);
            //console.log('moveDirction: ' + moveDirction);
            //console.log('r_head: ' + r_head);
            //console.log('r_body: ' + r_body);
            //console.log(' ');

            guiControls.rotation = r_head;
            moveDirection = r_body / 180 * Math.PI;
            player.rotation.y = moveDirection;
            moving = null;
            if (direction[0] == 5) {
                fadeAction('Idle');
                return;
            }
            if (!back){
                fadeAction('Walk');
                moving = "walk";
            }
            else {
                fadeAction('Back');
                moving = "back";
            }

        };
    };

    function render() {
        /*necessary to make lights function*/
        //cubeMaterial.needsUpdate = true;
        //torMaterial.needsUpdate = true;
        if (player != null) {
            var r = guiControls.rotation / 180 * Math.PI / 3;
            player.skeleton.bones[3].rotation.z = r * 2;
            player.skeleton.bones[4].rotation.z = r;
        }
    }


    fadeAction = function () {
        var activeActionName = 'Def';
        return function (name) {
            if (name == activeActionName) return;
            mixer.crossFade(action[activeActionName], action[name], .3);
            activeActionName = name;
        };
    }();

    function move() {
        if (moving == null) return;
        var deltaX = playerData.speed[moving] / 70 * Math.sin(moveDirection);
        var deltaZ = playerData.speed[moving] / 70 * Math.cos(moveDirection);
        player.position.x += deltaX;
        player.position.z += deltaZ;
    };

    function animate() {
        requestAnimationFrame(animate);
        render();
        move();
        stats.update();

        var delta = clock.getDelta();
        renderer.render(scene, camera);
        if (mixer) mixer.update(delta);
        if (sk_helper) sk_helper.update();
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

    AddBlenderMesh('/Model/player-2.json');
    LoadPlayerData('/Model/player-2.data.json');
    SetupControl();
});
