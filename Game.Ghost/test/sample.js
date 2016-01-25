$(function () {
    var game = window.Rendxx.Game.Ghost.Create(document.getElementById('game-container'), 5, null);
    var cameraControl = new THREE.OrbitControls(game.env.camera);
    game.onRender = function () {
        cameraControl.update();
    };
});