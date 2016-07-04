﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.System = window.Rendxx.Game.Ghost.System || {};
window.Rendxx.Game.Ghost.System.Data = window.Rendxx.Game.Ghost.System.Data || {};

/**
 * Character Data
 */
(function (DATA) {
    DATA.character = {
        type: {
            survivor: 'survivor',
            ghost: 'ghost'
        },
        files: {
            survivor: {
                bobo: 'player_survivor_bobo.data.json',
                highcircle: 'player_survivor_highcircle.data.json',
                girl1: 'player_survivor_girl1.data.json',
                girl2: 'player_survivor_girl2.data.json',
                mohicans: 'player_survivor_mohicans.data.json',
                capboy: 'player_survivor_capboy.data.json'
            },
            ghost: {
                'ghost-mary': 'player_ghost_mary.data.json',
                'ghost-specter': 'player_ghost_specter.data.json',
                'ghost-butcher': 'player_ghost_butcher.data.json'
            }
        },
        className: {
            survivor: {
                bobo: 'Normal',
                highcircle: 'Normal',
                girl1: 'Normal',
                girl2: 'Normal',
                mohicans: 'Normal',
                capboy: 'Normal'
            },
            ghost: {
                'ghost-mary': 'Mary',
                'ghost-specter': 'Specter',
                'ghost-butcher': 'Butcher'
            }
        },
        path: '/Model/Player/',
        para: {
            survivor: {
                init: {
                    hp: 2,
                    light: 1,
                    battery: 100,
                },
                endurance: {
                    init: 18,
                    max: 18,
                    cost: 3,
                    recover: 1.0
                },
                batteryCost: 0
            },
            ghost: {
                init: {
                    hp: 100,
                    light: 0,
                    battery: 100
                },
                endurance: {
                    init: 0,
                    max: 1000,
                    cost: 500,
                    recover: 20
                },
                batteryCost: 0
            }
        }
    };
})(window.Rendxx.Game.Ghost.System.Data);