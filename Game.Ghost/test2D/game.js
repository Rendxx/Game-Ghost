﻿var GameSetup, GameReset;

$(function () {
    // game -----------------------------------------------------
    var _root = null;
    var viewId = 'p7';
    var renderer = window.Rendxx.Game.Ghost.Renderer2D.Create(document.getElementById('game-container'), _root, viewId);
    var system = window.Rendxx.Game.Ghost.System.Create(_root, "../js/Game.Ghost.System.Core.js");
    system.onSetuped = function (setupData) {
        //renderer.reset(setupData);
        HELPER.cacheSetup(setupData);
    };
    system.onStarted = function (modelData, mapData) {
    };
    
    system.onEnd = function (endData) {
        renderer.hide();
        var s = endData.survivorWin ? "Survivor Escaped!!!!" : "Survior all killed!!!";
        var t = endData.survivorWin ? "GOOD JOB" + " Team " + endData.team : "GAME OVER";
        $$.info.alert(s, t, false, "rgba(0,0,0,0.6)", null);
        console.log(endData);
    };
    system.onUpdated = function (renderData, gameData) {
        //renderer.updateGame(clientData[viewId]);
        HELPER.cacheGame(gameData);
        HELPER.updateStat();
    };
    system.clientUpdate = function (targets, clientData) {
        if (viewId == targets[0]) renderer.updateGame(clientData);
    };
    system.clientSetup = function (targets, clientData) {
        if (viewId == targets[0]) renderer.reset(clientData.game);
    };
    

    renderer.onSetuped = function () {
    };
    renderer.onRender = null;
    renderer.onStart = function () {
    };
    renderer.hide();

    // game control --------------------------------------------------
    var playerData = {
        'p1': {
            id: 'p1',
            name: 'player 1',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'bobo',
            team: 1
        },
        'p2': {
            id: 'p2',
            name: 'player 2',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
            modelId: 'capboy',
            team: 2
        },
        //'p3': {
        //    id: 'p3',
        //    name: 'player 3',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'highcircle',
        //    team: 1
        //},
        //'p4': {
        //    id: 'p4',
        //    name: 'player 4',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'girl1',
        //    team: 1
        //},
        //'p5': {
        //    id: 'p5',
        //    name: 'player 5',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'mohicans',
        //    team: 2
        //},
        //'p6': {
        //    id: 'p6',
        //    name: 'player 6',
        //    role: window.Rendxx.Game.Ghost.System.Data.character.type.survivor,
        //    modelId: 'girl2',
        //    team: 2
        //},
        'p7': {
            id: 'p7',
            name: 'player 7',
            role: window.Rendxx.Game.Ghost.System.Data.character.type.ghost,
            modelId: 'ghost-butcher',
            team: 0
        }
    };
    GameSetup = function () {
        system.setup(playerData, {
            player:playerData,
            map: 'test3'
        });
        system.start();
        renderer.show();
    };

    GameReset = function (setupData, gameData) {
        system.reset(setupData, gameData);
        renderer.reset(setupData);
        renderer.updateGame(gameData);
        system.start();
        renderer.show();
    };


    // helper --------------------------------------------------------
    HELPER.addStats($('#game-container'));
    HELPER.addDatGUI($('body'));
    SetupControl(system, viewId);
});