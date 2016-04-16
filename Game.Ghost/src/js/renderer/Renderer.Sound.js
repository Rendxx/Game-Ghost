﻿window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Ghost = window.Rendxx.Game.Ghost || {};
window.Rendxx.Game.Ghost.Renderer = window.Rendxx.Game.Ghost.Renderer || {};

/**
 * Sound
 */
(function (RENDERER) {
    var Data = RENDERER.Data;
    var _Data = {
        Name: {
            'Key': 0,
            'OpenDoor': 1,
            'CloseDoor': 2,
            'Unlock': 3,
            'Locked': 4,
            'CantOpen': 5,
            'OpenCarbinet': 6,
            'CloseCarbinet': 7,
            'Walk': 8,
            'Run': 9,
            'Danger': 10,
            'Die': 11,
            'Scream': 12,
            'Bell': 13
        },
        Type: {
            'Character': 0,
            'Furniture': 1,
            'Door': 2,
            'Stuff': 3,
            'Body': 4
        },
        MaxDistance: 6
    };
    var Sound = function (entity) {
        if (entity == null) throw new Error('Container not specified.');

        // data ----------------------------------------------
        var that = this,
            root = entity.root,
            viewPlayerIdxList = null,
            playerNum = null,
            turnIdx = -1,
            characterIdList = [],
            playingSound = {},
            sounds = {};

        // public method -------------------------------------------------
        this.playerSetup = function (viewPlayer_in) {
            viewPlayerIdxList = viewPlayer_in;
            playerNum = viewPlayer_in.length;
            characterIdList = [];
            for (var i = 0; i < playerNum; i++) {
                characterIdList.push(entity.playerIdxMap[viewPlayerIdxList[i]]);
            }
        };

        this.update = function (soundDat, characterDat) {
            if (soundDat == null) return;
            // once ------------------------------------
            // character
            var s_character = soundDat[0][0];
            for (var i = 0; i < playerNum; i++) {
                if (characterIdList[i] in s_character) playSound(s_character[characterIdList[i]], 100);
            }
            // object
            var s_obj = soundDat[0][1];
            var soundList = {};
            for (var i = 0; i < playerNum; i++) {
                var soundObj = characterDat[characterIdList[i]].soundObject;
                for (var t in s_obj) {
                    if (soundObj[s_obj[t].type].hasOwnProperty(s_obj[t].id)) {
                        if (soundList[s_obj[t].sound] == null || soundList[s_obj[t].sound] < soundObj[s_obj[t].id])
                            soundList[s_obj[t].sound] = soundObj[s_obj[t].id];
                    }
                }
            }

            for (var i in soundList) playSound(i, (_Data.MaxDistance - soundList[i]) * 100 / _Data.MaxDistance);

            // conherent ------------------------------------
            // character
            var s_character = soundDat[1][0];
            for (var i = 0; i < playerNum; i++) {
                if (characterIdList[i] in s_character)
                    updateSound(s_character[characterIdList[i]], 100);
            }

            // object
            var s_obj = soundDat[1][1];
            var soundList = {};
            for (var i in s_obj) {
                for (var i = 0; i < playerNum; i++) {
                    var soundObj = characterDat[characterIdList[i]].soundObject;
                    if (soundObj.hasOwnProperty(s_obj[i].id)) {
                        if (soundList[s_obj[i].sound] == null || soundList[s_obj[i].sound] < soundObj[s_obj[i].id])
                            soundList[s_obj[i].sound] = soundObj[s_obj[i].id];
                    }
                }
            }

            for (var i in soundList) updateSound(i, (_Data.MaxDistance - soundList[i]) * 100 / _Data.MaxDistance);
            clearSounds();
        };

        // private method -------------------------------------------------
        var playSound = function (id, volume) {
            if (sounds.hasOwnProperty(id)) sounds[id].play();
        };

        // update conherent sound
        var updateSound = function (id, volume) {
            turnIdx++;
            if (turnIdx > 900) turnIdx = -1;
            if (!playingSound.hasOwnProperty(id)) createSound(id);
            if (!playingSound[id].playing) startSound(id);
            sstVolume(id, volume);
        };

        // stop useless conherent sounds
        var clearSounds = function () {
            for (var id in playingSound) {
                if (playingSound[id].turn != turnId) stopSound(id);
            }
        };

        var createSound = function (id) {

        };

        var startSound = function (id) {

        };

        var stopSound = function (id) {

        };

        var sstVolume = function (id, volume) {

        };


        // helper ------------------------
        var _init = function () {
            var path = root + Data.sound.path;
            sounds[_Data.Name.Key] = new Howl({
                urls: [path + 'key.mp3'],
                loop: false
            });
            sounds[_Data.Name.OpenDoor] = new Howl({
                urls: [path + 'door4.mp3'],
                loop: false
            });
            sounds[_Data.Name.CloseDoor] = new Howl({
                urls: [path + 'door.mp3'],
                loop: false
            });
            sounds[_Data.Name.Locked] = new Howl({
                urls: [path + 'lock.mp3'],
                loop: false
            });
            sounds[_Data.Name.Unlock] = new Howl({
                urls: [path + 'unlock.mp3'],
                loop: false
            });
            sounds[_Data.Name.CantOpen] = new Howl({
                urls: [path + 'knock.mp3'],
                loop: false
            });
            sounds[_Data.Name.OpenCarbinet] = new Howl({
                urls: [path + 'cabinet4.wav'],
                loop: false
            });
            sounds[_Data.Name.CloseCarbinet] = new Howl({
                urls: [path + 'cabinet4.wav'],
                loop: false
            });
            sounds[_Data.Name.Walk] = new Howl({
                urls: [path + 'step.mp3'],
                loop: false
            });
            sounds[_Data.Name.Run] = new Howl({
                urls: [path + 'step.mp3'],
                loop: false
            });
            sounds[_Data.Name.Danger] = new Howl({
                urls: [path + 'door.wav'],
                loop: false
            });
            sounds[_Data.Name.Die] = new Howl({
                urls: [path + 'die.mp3'],
                loop: false
            });
            sounds[_Data.Name.Scream] = new Howl({
                urls: [path + 'scream.wav'],
                loop: false
            });
            sounds[_Data.Name.Bell] = new Howl({
                urls: [path + 'bell.wav'],
                loop: false
            });
        };

        _init();
    };

    RENDERER.Sound = Sound;
})(window.Rendxx.Game.Ghost.Renderer);