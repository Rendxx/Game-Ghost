window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};
window.Rendxx.Game.Ghost.System.Data = window.Rendxx.Game.Ghost.System.Data || {};

/**
 * Map Data
 */
(function (DATA) {
    DATA.map = {
        files: {
            test: 'MapDataTest.json',
            test2: 'MapDataTest2.json',
            test3: 'MapDataTest3.json',
            debug: 'MapData4debug_1.json',
            dogcan2: 'DogCan2.json',
            FurnitureTest: 'FurnitureTest.json',
            Hospital1: 'Hospital1.json',
            Hospital4: 'Hospital4.json',
            Hospital5: 'Hospital5.json',
            TestApple: 'TestApple.json'
        },
        path: '/GameData/Map/',
        para: {
            soundRange: 6,
            scanRange: 3
        },
        keyNumber: 1
    };
})(window.Rendxx.Game.Ghost.System.Data);