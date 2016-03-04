$(function () {
    var cameraControl, stats, datGUI;

    // game -----------------------------------------------------
    var render = window.Rendxx.Game.Ghost.Renderer.Create(document.getElementById('game-container'), 5);
    var system = window.Rendxx.Game.Ghost.System.Create();
    system.onStarted = function (modelData, mapData) {
        render.start();
    };
    system.onLoaded = function (modelData, mapData, playerData) {
        render.load(modelData, mapData, playerData);
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
    system.onChange = render.updateGame;
});