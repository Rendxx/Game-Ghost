$(function () {
    var scene, camera, renderer;
    var controls, guiControls, datGUI;
    var axis, grid, light;
    var stats;
    var SCREEN_WIDTH, SCREEN_HEIGHT;
    var sk_helper;

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

        //grid = new THREE.GridHelper(50, 5);
        //grid.setColors(new THREE.Color("rgb(255,0,0)"), 0x000000);
        //scene.add(grid);

        camera.position.x = 40;
        camera.position.y = 40;
        camera.position.z = 40;
        camera.lookAt(scene.position);

        // Ambient
        light = new THREE.AmbientLight();
        light.color.setHex(0xffffff);
        scene.add(light);

        // dat gui
        guiControls = {
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
            }
        };
        datGUI = new dat.GUI();
        datGUI.addColor(guiControls, 'ambColor').onChange(function (value) {
            light.color.setHex(value);
        });
        datGUI.add(guiControls, 'Def').name('Def');
        datGUI.add(guiControls, 'Idle1').name('Idle 1');
        datGUI.add(guiControls, 'Idel2').name('Idel 2');
        datGUI.add(guiControls, 'Run').name('Run');
        datGUI.add(guiControls, 'Walk').name('Walk');
        datGUI.add(guiControls, 'Back').name('Back');

        $("#webGL-container").append(renderer.domElement);
        // status track
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        $("#webGL-container").append(stats.domElement);

        AddBlenderMesh('/Model/player-2.json');
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
            action.Walk = new THREE.AnimationAction(geometry.animations[5]);
            action.Idle.Def = 1;
            action.Idle.weight = 0;
            action.Idle2.weight = 0;
            action.Run.weight = 0;
            action.Walk.weight = 0;
            action.Back.weight = 0;

            mixer = new THREE.AnimationMixer(mesh);
            mixer.addAction(action.Def);
            mixer.addAction(action.Idle);
            mixer.addAction(action.Idle2);
            mixer.addAction(action.Run);
            mixer.addAction(action.Walk);

            mixer.addAction(action.Back);

            scene.add(mesh);

            //sk_helper = new THREE.SkeletonHelper(mesh);
            //scene.add(sk_helper);
            //mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
            //mesh.castShadow = true;
            //mesh.receiveShadow = true;
            //scene.add(mesh);
        });
    }

    function render() {
        /*necessary to make lights function*/
        //cubeMaterial.needsUpdate = true;
        //torMaterial.needsUpdate = true;
    }


    fadeAction = function () {
        var activeActionName = 'Def';
        return function (name) {
            if (name == activeActionName) return;
            mixer.crossFade(action[activeActionName], action[name], .3);
            activeActionName = name;
        };
    }();


    function animate() {
        requestAnimationFrame(animate);
        render();
        stats.update();
        if (sk_helper) sk_helper.update();

        var delta = clock.getDelta();
        if (mixer) mixer.update(delta);
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
});
