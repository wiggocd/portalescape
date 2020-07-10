// <reference path="./node_modules/phaser3-docs/typescript/phaser.d.ts" />
import * as Global from './global.js'
//import splashScreen from './splash.js'        Splashscreen replaced from thunkable
import * as Config from './config.js'
import * as Scene from './scene.js'

console.log("Entry loaded");

console.log('Starting MainGameScene ...');
var game = new Phaser.Game(Config.MainGameSceneConfig);
console.log('Adding game level scenes ...');
game.scene.add('C1A0Scene', Scene.C1A0Scene, false);
game.scene.add('C1A1Scene', Scene.C1A1Scene, false);
game.scene.add('C1A2Scene', Scene.C1A2Scene, false);
game.scene.add('C1A3Scene', Scene.C1A3Scene, false);
game.scene.add('C1A4Scene', Scene.C1A4Scene, false);
game.scene.add('C1A5Scene', Scene.C1A5Scene, false);
game.scene.add('C1A6Scene', Scene.C1A6Scene, false);
game.scene.add('C1A7Scene', Scene.C1A7Scene, false);