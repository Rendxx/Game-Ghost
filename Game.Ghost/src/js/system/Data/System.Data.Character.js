window.Rendxx = window.Rendxx || {};
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
                light: 1,               // torch type
                hp: {
                    init: 2,
                    max: 2
                },
                battery: {
                    init: 100,
                    max: 100
                },
                endurance: {
                    init: 10,
                    max: 10,
                    cost: 3,
                    recover: 1.2
                },
                speed: {
                    "rotate": {
                        "head": 80,
                        "body": 60
                    },
                    "move": {
                        "walk": 10,
                        "run": 19,
                        "back": -6
                    }
                },
                interactionDistance: 0.6,
                batteryCost: 0
            },
            ghost: {
                light: 0,
                hp: {
                    init: 1,
                    max: 1
                },
                battery: {
                    init: 0,
                    max: 100
                },
                endurance: {
                    init: 0,
                    max: 1000,
                    cost: 500,
                    recover: 16
                },
                speed: {
                    "rotate": {
                        "head": 40,
                        "body": 20
                    },
                    "move": {
                        "walk": 12,
                        "run": 80,
                        "back": -4
                    }
                },
                interactionDistance: 0.6,
                batteryCost: 0
            }
        }
    };
})(window.Rendxx.Game.Ghost.System.Data);