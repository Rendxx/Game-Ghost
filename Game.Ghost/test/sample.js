$(function () {
    var cameraControl, stats, datGUI;

    // game -----------------------------------------------------
    var render = window.Rendxx.Game.Ghost.Renderer.Create(document.getElementById('game-container'), 5);
    var system = window.Rendxx.Game.Ghost.System.Create();
    system.onLoaded = function (modelData, mapData) {
        render.load(modelData, mapData);
    };
    system.setup([], 'test');
});