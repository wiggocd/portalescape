import * as Global from './global.js'
import * as Scene from './scene.js';

/*
let C1A0SceneInstance = new Scene.C1A0Scene;
let C1A1SceneInstance = new Scene.C1A1Scene;
*/
let MainGameSceneInstance = new Scene.MainGameScene;

export let MainGameSceneConfig ={
    type: Phaser.AUTO,
    // Note: size is set to 1280x720 until we get screen scaling working
    width: 1280, //window.innerWidth * window.devicePixelRatio,
    height: 720, //window.innerHeight * window.devicePixelRatio,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 750 },
            debug: false
        }
    },
    scene: {
        create: MainGameSceneInstance.create
    },
    audio: {
        context: Global.audioContext
    }
}

/*
export let C1A0Config = {
    type: Phaser.AUTO,
    // Note: size is set to 1280x720 until we get screen scaling working
    width: 1280, //window.innerWidth * window.devicePixelRatio,
    height: 720, //window.innerHeight * window.devicePixelRatio,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 750 },
            debug: false
        }
    },
    scene: {
        preload: C1A0SceneInstance.preload,
        create: C1A0SceneInstance.create,
        update: C1A0SceneInstance.update
    },
    audio: {
        context: Global.audioContext
    }
}

export let C1A1Config = {
    type: Phaser.AUTO,
    // Note: size is set to 1280x720 until we get screen scaling working
    width: 1280, //window.innerWidth * window.devicePixelRatio,
    height: 720, //window.innerHeight * window.devicePixelRatio,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 750 },
            debug: false
        }
    },
    scene: {
        preload: C1A1SceneInstance.preload,
        create: C1A1SceneInstance.create,
        update: C1A1SceneInstance.update
    },
    audio: {
        context: Global.audioContext
    }
}
*/