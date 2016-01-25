window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};

/**
 * Setup base environment in three.js 
 */
(function (GAME) {
    /**
     * Setup environment in three.js
     * @param {game entity} entity - Game entity
     * @returns {object} data-pkg of environment 
     */
    var SetupEnv = function (entity) {
        if (entity == null) throw new Error('Container not specified.');
        var scene, camera, renderer;
        var SCREEN_WIDTH, SCREEN_HEIGHT;

        /*creates empty scene object and renderer*/
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 5000);
        camera.position.set(200, 0, 200);
        renderer = new THREE.WebGLRenderer({ antialias: true });

        // add renderer to dom
        $(entity.domElement).append(renderer.domElement);

        // Render scene on screen
        var animate = function () {
            requestAnimationFrame(animate);
            if (entity.onRender != null) entity.onRender();
            renderer.render(scene, camera);
        }

        // set resize
        var resize = function () {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;

            camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            camera.updateProjectionMatrix();

            renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        };

        renderer.setClearColor(0x000000);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        resize();

        $(window).resize(resize);
        animate();

        return {
            scene: scene,
            camera: camera,
            renderer: renderer
        };
    };

    /**
     * Setup game with the viewport domelement
     * @param {game entity} entity - Game entity
     */
    GAME.SetupEnv = SetupEnv;
})(window.Rendxx.Game.Ghost);