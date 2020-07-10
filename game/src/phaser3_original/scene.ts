import * as Global from './global.js'
import { Tilemaps, Scene, Game, CANVAS, Input } from 'phaser';

namespace UniversalLibrary {

    export class LevelExit {
        exitSprite: Phaser.GameObjects.Sprite = undefined;
        originX: number = undefined;
        originY: number = undefined;
        minX: number = undefined;
        minY: number = undefined;
        maxX: number = undefined;
        maxY: number = undefined;
        initVars() {
            this.minX = this.originX-10;
            this.maxX = this.originX+10;
            this.minY = this.originY-10;
            this.maxY = this.originX+10;
        }
    }
    
    export class Portal {
        portalSprite: Phaser.GameObjects.Sprite = undefined;
        originX: number = undefined;
        originY: number = undefined;
        minX: number = undefined;
        minY: number = undefined;
        maxX: number = undefined;
        maxY: number = undefined;
        portalType: number = undefined;
        portalName: string = undefined;
        initVars() {
            this.minX=this.originX-30;
            this.maxX=this.originX+30;
            this.minY=this.originY-30;
            this.maxY=this.originY+30;
        }
    }

    export class Timer {
        startTime: any = undefined;
        endTime: any = undefined;
        timerStart() {
            if (this.startTime==undefined) {
                this.startTime=0;
                this.endTime=0;
            }
            this.startTime = new Date();
        }
        timerEnd() {
            this.endTime = new Date();
            var timeDiff = this.endTime - this.startTime; //in ms
            // strip the ms
            timeDiff /= 1000;
            return timeDiff;
        }
    }

    export class ClickEvent {
        x: number = undefined;
        y: number = undefined;
        startTime: any = undefined;
    }

}


///////////////////////////////////////////////////////////////////

function endGameMessage() {
    var para = document.createElement("h1");
    var node = document.createTextNode("Thanks for playing!");
    para.appendChild(node);
    var element = document.getElementById("div1");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    element.appendChild(para);
    console.log('endGameMessage');
}

export class C1A7Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A7Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A7Scene' });
    }

    preload() {
        console.log('C1A7 preload');
        this.load.image('escape2', '../assets/game/bg/escape2.png');
        this.load.audio('t3', '../assets/soundtrack/t3.wav')
    }

    player: Phaser.Physics.Arcade.Sprite;
    machine: Phaser.Physics.Arcade.Sprite;
    deadMachine: Phaser.Physics.Arcade.Sprite;
    machine1: Phaser.Physics.Arcade.Sprite;
    snacks: Phaser.GameObjects.Sprite[];
    chick: Phaser.Physics.Arcade.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;
    

    create() {
        console.log('C1A7 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'escape2');

        this.platforms = this.physics.add.staticGroup();

        this.snacks = [
            this.add.sprite(500, 600, 'snack').setScale(0.35),
            this.add.sprite(560, 660, 'snack').setScale(0.35),
            this.add.sprite(620, 695, 'snack').setScale(0.35),
            this.add.sprite(680, 660, 'snack').setScale(0.35),
            this.add.sprite(740, 600, 'snack').setScale(0.35),
            this.add.sprite(500, 500, 'snack').setScale(0.35),
            this.add.sprite(560, 560, 'snack').setScale(0.35),
            this.add.sprite(620, 595, 'snack').setScale(0.35),
            this.add.sprite(680, 560, 'snack').setScale(0.35),
            this.add.sprite(740, 500, 'snack').setScale(0.35)
        ];

        for (var i=0; i<this.snacks.length; i++) {
            this.snacks[i].play('snack', true);
        }
        

        // Fox
        this.player = this.physics.add.sprite(140, 20, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Music
        let standardSoundConfig1 = {
            mute: false,
            volume: 0.72,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }

        let soundLoopConfig1 = {
            mute: false,
            volume: 0.72,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        }
        
        this.sound.stopAll();
        // Game end music
        this.sound.play('t3', standardSoundConfig1);

    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    foxTimer: UniversalLibrary.Timer;
    foxDirection: number;
    fox1Timer: UniversalLibrary.Timer;
    fox1Direction: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;
    portalPlacementBlockToChange: number;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            this.firstUpdate=false;
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////

        ////    Automatically move fox for ending, foxTimer checks to start moving fox after fox spawns, fox1Timer checks interval between jumps after foxTimer has ended

        if (this.foxTimer==undefined) {
            this.foxTimer = new UniversalLibrary.Timer;
            this.foxTimer.timerStart();
        }

        if (this.foxTimer.timerEnd()>2.3) {
            if (this.fox1Timer==undefined) {
                this.fox1Timer = new UniversalLibrary.Timer;
                this.fox1Timer.timerStart();
                this.foxDirection=0;
            }
            if (this.fox1Timer.timerEnd()>1.2) {
                this.foxDirection++;
                this.fox1Timer.timerStart();
                if (this.foxDirection>1) {
                    this.foxDirection=0;
                }
            }
            if (this.foxDirection==0)
            {
                this.player.setVelocityY(-400);
    
                this.player.anims.play('foxLeft', true);
                this.foxDirection=2;
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////

        // Fade out
        this.time.delayedCall(3000, function() {
            this.cameras.main.fade(5000);
            this.time.delayedCall(4950, function() {
                endGameMessage();
                this.scene.pause();
            }, [], this)
        }, [], this);



        ////////////////////////////////////////////////////////////////////////
        

    }

}


///////////////////////////////////////////////////////////////////

export class C1A6Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A6Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A6Scene' });
    }

    preload() {
        console.log('C1A6 preload');
        this.load.image('bg5', '../assets/game/bg/bg5.png');
        this.load.spritesheet('boss', 
            '../assets/game/spritesheets/boss_ss_small.png',
            { frameWidth: 192, frameHeight: 192 }
        );
    }

    player: Phaser.Physics.Arcade.Sprite;
    machine: Phaser.Physics.Arcade.Sprite;
    deadMachine: Phaser.Physics.Arcade.Sprite;
    machine1: Phaser.Physics.Arcade.Sprite;
    snack: Phaser.GameObjects.Sprite;
    boss: Phaser.Physics.Arcade.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;
    

    create() {
        console.log('C1A6 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg5');

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'blockx3').setScale(0.5).refreshBody();
        this.platforms.create(140, 550, 'blockx1').setScale(0.5).refreshBody();

        this.portalPlacementBlocks = [
        ];

        this.nonPortalPlacementBlocks = [
        ];

        this.exit = new UniversalLibrary.LevelExit;
        this.exit.originX = 1200;
        this.exit.originY = 620;
        this.exit.initVars();
        this.exit.exitSprite = this.add.sprite(this.exit.originX, this.exit.originY, 'exit').setScale(0.2, 0.2);

        this.player = this.physics.add.sprite(100, 450, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Human hybrid boss
        this.boss = this.physics.add.sprite(770, 450, 'boss').setScale(1.6);
        this.boss.setBounce(0.1);
        this.boss.setCollideWorldBounds(true);
        this.physics.add.collider(this.boss, this.platforms);

        this.anims.create({
            key: 'bossLeft',
            frames: this.anims.generateFrameNumbers('boss', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'bossTurn',
            frames: [ { key: 'boss', frame: 5 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'bossRight',
            frames: this.anims.generateFrameNumbers('boss', { start: 6, end: 9 }),
            frameRate: 10,
            repeat: -1
        });
        
    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    bossTimer: UniversalLibrary.Timer;
    bossDirection: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;
    portalPlacementBlockToChange: number;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickWasOnPortalBlock=true;
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = (click: UniversalLibrary.ClickEvent) => {

                if (this.portals==undefined||this.portals==null) {
                    this.portals = [];
                    this.portalPlacementIncrement=0;
                }
    
                if ( this.portalPlacementIncrement==undefined || this.portalPlacementIncrement==null ) {
                    this.portalPlacementIncrement=0;
                }
                
                if ( this.portalPlacementIncrement==0 || this.lastPortalPlaced==1 ) {
                    if (this.portalPlacementIncrement!=0) {
                        if (this.portals[0].portalSprite!=undefined) {
                            this.portals[0].portalSprite.destroy();
                        }
                    }
                    this.portals[0] = new UniversalLibrary.Portal;
                    this.portals[0].originX=click.x;
                    this.portals[0].originY=click.y;
                    this.portals[0].portalName='portal0';
                    this.portals[0].portalType=0
                    this.portals[0].initVars();
                    this.portals[0].portalSprite = this.add.sprite(this.portals[0].originX,this.portals[0].originY, this.portals[0].portalName).setScale(0.2);
                    this.lastPortalPlaced=0;
                    console.log('portal0 placed');
                } else if ( this.lastPortalPlaced==0 )  {
                    if (this.portalPlacementIncrement!=1) {
                        if (this.portals[1].portalSprite!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                    this.portals[1] = new UniversalLibrary.Portal;
                    this.portals[1].originX=click.x;
                    this.portals[1].originY=click.y;
                    this.portals[1].portalName='portal1';
                    this.portals[1].portalType=1
                    this.portals[1].initVars();
                    this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                    this.lastPortalPlaced=1;
                    console.log('portal1 placed');
                }

                this.portalPlacementIncrement++;

                this.dblClickThisLoop=true;

                this.clickWasOnPortalBlock=false;

            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff  **/

        /*
        Functions to do on click:
        Single click:
        1. Set a variable letting other functions know that it's a single click
        2. Move the fox

        Double click:
        1. Set a variable letting other functions know that it's a double click
        2. If the click was on a portalPlacementBlock, (green), place a portal
        */

        ////////////////////////////////////////////////////////////////////////
        
        // Set clickHandler: this is the function to be called whenever a click is registered. Also handles double clicks
        if (this.clickHandler==undefined) {
            this.clickHandler = () => {

                console.log('Click');

                if (this.currentClick == undefined) {                    
                    this.currentClick = new UniversalLibrary.ClickEvent;
                    this.currentClick.x = this.input.activePointer.x;
                    this.currentClick.y = this.input.activePointer.y;

                    setTimeout( () => {
                        if (this.currentClick != undefined) {
                            this.singleClickFunc(this.currentClick);
                        }
                        delete this.currentClick; 
 
                    }, 250);
                }
                else { // double click
                    this.doubleClickFunc(this.currentClick);
                    delete this.currentClick;
                }  
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
        }

        if (this.singleClickFunc==undefined) {
            this.singleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                this.foxTargetPosition = click;
            }
        }

        if (this.doubleClickFunc==undefined) {
            this.doubleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                if (this.clickWasOnPortalBlock==true) {
                    this.placePortal(click);
                    this.clickWasOnPortalBlock=false;
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////
        
        if (this.foxTargetPosition != undefined) {
            if (this.player.x<this.foxTargetPosition.x-10 || this.player.x>this.foxTargetPosition.x+10 ) {
                if (this.player.x>this.foxTargetPosition.x ) {

                    this.player.setVelocityX(-600);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( this.player.x<this.foxTargetPosition.x ) {
    
                    this.player.setVelocityX(600);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( this.foxTargetPosition.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-1000);
                }
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
                delete this.foxTargetPosition;
            }
        }
        ////////////////////////////////////////////////////////////////////////

        /**  Machine movement // Human hybrid boss  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Human hybrid boss movement
        if (this.bossTimer==undefined) {
            this.bossTimer = new UniversalLibrary.Timer;
            this.bossTimer.timerStart();
            this.bossDirection=0;
        }
        if (this.bossTimer.timerEnd()>0.82) {
            this.bossDirection++;
            this.bossTimer.timerStart();
            if (this.bossDirection>1) {
                this.bossDirection=0;
            }
        }
        if (this.bossDirection==0)
        {
            this.boss.setVelocityX(-325); 

            this.boss.anims.play('bossLeft', true);


        } else if (this.bossDirection==1){
            this.boss.setVelocityX(325);

            this.boss.anims.play('bossRight', true);

        } else {
            this.boss.setVelocityX(0);

            this.boss.anims.play('bossTurn');
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Check for level exit touched
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exit.exitSprite.getBounds())) {
            console.log('Exit touched');
            this.scene.start('C1A7Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[0].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[1].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[0].originX;
                        this.player.y=this.portals[0].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');

                } else {
                    this.playerIsTouchingPortal=false;
                }

            }
        }

        // Check if portalPlacementBlocks need to change
        /*
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[0].getBounds())&& this.portalPlacementBlockToChange==0) {
            this.checkPortalBlockChange=true
        }
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[3].getBounds())&& this.portalPlacementBlockToChange==1) {
            this.checkPortalBlockChange=true
        }
        if (this.portalPlacementBlockToChange==undefined) {
            this.portalPlacementBlockToChange=0;
        }
        if (this.checkPortalBlockChange==true) {
            this.changePortalPlacementBlocks=true;
            this.checkPortalBlockChange=false;
        }
        if (this.changePortalPlacementBlocks) {
            console.log('Changing portal placement blocks');
            if (this.portalPlacementBlockToChange==0) {
                this.nonPortalPlacementBlocks[1].setActive(false).setVisible(false);
                this.portalPlacementBlocks[3].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=1;
            } else if (this.portalPlacementBlockToChange==1) {
                this.nonPortalPlacementBlocks[0].setActive(false).setVisible(false);
                this.portalPlacementBlocks[2].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=2;
            }
            
            this.changePortalPlacementBlocks=false;
        }
        */

        // Kill player if touching enemy
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.boss.getBounds())) {
            // shake the camera
            this.cameras.main.shake(500);
            this.player.setVelocityX(0);
            this.player.anims.play('foxTurn');
            delete this.foxTargetPosition;

            // fade camera
            this.time.delayedCall(250, function() {
                this.cameras.main.fade(250);
            }, [], this);

            // restart game
            this.time.delayedCall(500, () => {
                this.player.x=140;
                this.player.y=0;
                if (this.portals!=undefined) {
                    if (this.portals[0]!=undefined) {
                        this.portals[0].portalSprite.destroy();
                        if (this.portals[1]!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                }
                
                this.portals=undefined;
                this.cameras.main.resetFX();
            }, [], this);
        }


        ////////////////////////////////////////////////////////////////////////
        

    }

}


///////////////////////////////////////////////////////////////////

export class C1A5Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A5Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A5Scene' });
    }

    preload() {
        console.log('C1A5 preload');
        this.load.image('bg4', '../assets/game/bg/bg4.png');
    }

    player: Phaser.Physics.Arcade.Sprite;
    machine: Phaser.Physics.Arcade.Sprite;
    deadMachine: Phaser.Physics.Arcade.Sprite;
    machine1: Phaser.Physics.Arcade.Sprite;
    snack: Phaser.GameObjects.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;
    

    create() {
        console.log('C1A5 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg4');

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'blockx3').setScale(0.5).refreshBody();
        this.platforms.create(600, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(350, -230, 'blockx2_rot').setScale(0.5).refreshBody();
        this.platforms.create(860, -230, 'blockx2_rot').setScale(0.5).refreshBody();

        this.deadMachine = this.physics.add.sprite(960, 600, 'machine_dead').setScale(0.2);
        this.deadMachine.setBounce(0.1);
        this.deadMachine.setCollideWorldBounds(true);
        this.physics.add.collider(this.deadMachine, this.platforms);

        this.portalPlacementBlocks = [
            this.add.sprite(35, 530, 'blockx1_green_rot').setScale(0.8).setInteractive().setAlpha(0.5),
            this.add.sprite(612, 20, 'blockx1_green').setScale(0.8).setInteractive().setAlpha(0.5)
        ];

        this.nonPortalPlacementBlocks = [
        ];

        this.exit = new UniversalLibrary.LevelExit;
        this.exit.originX = 1120;
        this.exit.originY = 620;
        this.exit.initVars();
        this.exit.exitSprite = this.add.sprite(this.exit.originX, this.exit.originY, 'exit').setScale(0.2, 0.2);

        this.player = this.physics.add.sprite(612, 20, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Machines
        this.machine = this.physics.add.sprite(770, 450, 'machine').setScale(0.5);
        this.machine.setBounce(0.1);
        this.machine.setCollideWorldBounds(true);
        this.physics.add.collider(this.machine, this.platforms);

    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    machineTimer: UniversalLibrary.Timer;
    machineDirection: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;
    portalPlacementBlockToChange: number;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickWasOnPortalBlock=true;
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = (click: UniversalLibrary.ClickEvent) => {

                if (this.portals==undefined||this.portals==null) {
                    this.portals = [];
                    this.portalPlacementIncrement=0;
                }
    
                if ( this.portalPlacementIncrement==undefined || this.portalPlacementIncrement==null ) {
                    this.portalPlacementIncrement=0;
                }
                
                if ( this.portalPlacementIncrement==0 || this.lastPortalPlaced==1 ) {
                    if (this.portalPlacementIncrement!=0) {
                        if (this.portals[0].portalSprite!=undefined) {
                            this.portals[0].portalSprite.destroy();
                        }
                    }
                    this.portals[0] = new UniversalLibrary.Portal;
                    this.portals[0].originX=click.x;
                    this.portals[0].originY=click.y;
                    this.portals[0].portalName='portal0';
                    this.portals[0].portalType=0
                    this.portals[0].initVars();
                    this.portals[0].portalSprite = this.add.sprite(this.portals[0].originX,this.portals[0].originY, this.portals[0].portalName).setScale(0.2);
                    this.lastPortalPlaced=0;
                    console.log('portal0 placed');
                } else if ( this.lastPortalPlaced==0 )  {
                    if (this.portalPlacementIncrement!=1) {
                        if (this.portals[1].portalSprite!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                    this.portals[1] = new UniversalLibrary.Portal;
                    this.portals[1].originX=click.x;
                    this.portals[1].originY=click.y;
                    this.portals[1].portalName='portal1';
                    this.portals[1].portalType=1
                    this.portals[1].initVars();
                    this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                    this.lastPortalPlaced=1;
                    console.log('portal1 placed');
                }

                this.portalPlacementIncrement++;

                this.dblClickThisLoop=true;

                this.clickWasOnPortalBlock=false;

            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff  **/

        /*
        Functions to do on click:
        Single click:
        1. Set a variable letting other functions know that it's a single click
        2. Move the fox

        Double click:
        1. Set a variable letting other functions know that it's a double click
        2. If the click was on a portalPlacementBlock, (green), place a portal
        */

        ////////////////////////////////////////////////////////////////////////
        
        // Set clickHandler: this is the function to be called whenever a click is registered. Also handles double clicks
        if (this.clickHandler==undefined) {
            this.clickHandler = () => {

                console.log('Click');

                if (this.currentClick == undefined) {                    
                    this.currentClick = new UniversalLibrary.ClickEvent;
                    this.currentClick.x = this.input.activePointer.x;
                    this.currentClick.y = this.input.activePointer.y;

                    setTimeout( () => {
                        if (this.currentClick != undefined) {
                            this.singleClickFunc(this.currentClick);
                        }
                        delete this.currentClick; 
 
                    }, 250);
                }
                else { // double click
                    this.doubleClickFunc(this.currentClick);
                    delete this.currentClick;
                }  
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
        }

        if (this.singleClickFunc==undefined) {
            this.singleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                this.foxTargetPosition = click;
            }
        }

        if (this.doubleClickFunc==undefined) {
            this.doubleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                if (this.clickWasOnPortalBlock==true) {
                    this.placePortal(click);
                    this.clickWasOnPortalBlock=false;
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////
        
        if (this.foxTargetPosition != undefined) {
            if (this.player.x<this.foxTargetPosition.x-10 || this.player.x>this.foxTargetPosition.x+10 ) {
                if (this.player.x>this.foxTargetPosition.x ) {

                    this.player.setVelocityX(-325);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( this.player.x<this.foxTargetPosition.x ) {
    
                    this.player.setVelocityX(325);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( this.foxTargetPosition.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-600);
                }
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
                delete this.foxTargetPosition;
            }
        }
        ////////////////////////////////////////////////////////////////////////

        /**  Machine movement  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Machine movement
        // Machine0
        if (this.machineTimer==undefined) {
            this.machineTimer = new UniversalLibrary.Timer;
            this.machineTimer.timerStart();
            this.machineDirection=0;
        }
        if (this.machineTimer.timerEnd()>1.5) {
            this.machineDirection++;
            this.machineTimer.timerStart();
            if (this.machineDirection>1) {
                this.machineDirection=0;
            }
        }
        if (this.machineDirection==0)
        {
            this.machine.setVelocityX(-325); 

            this.machine.anims.play('machineLeft', true);


        } else if (this.machineDirection==1){
            this.machine.setVelocityX(325);

            this.machine.anims.play('machineRight', true);

        } else {
            this.machine.setVelocityX(0);

            this.machine.anims.play('machineTurn');
        }
        

        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Check for level exit touched
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exit.exitSprite.getBounds())) {
            console.log('Exit touched');
            this.scene.start('C1A6Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[0].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[1].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[0].originX;
                        this.player.y=this.portals[0].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');

                } else {
                    this.playerIsTouchingPortal=false;
                }

            }
        }

        // Kill player if touching enemy
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.machine.getBounds())) {
            // shake the camera
            this.cameras.main.shake(500);
            this.player.setVelocityX(0);
            this.player.anims.play('foxTurn');
            delete this.foxTargetPosition;

            // fade camera
            this.time.delayedCall(250, function() {
                this.cameras.main.fade(250);
            }, [], this);

            // restart game
            this.time.delayedCall(500, () => {
                this.player.x=612;
                this.player.y=20;
                if (this.portals!=undefined) {
                    if (this.portals[0]!=undefined) {
                        this.portals[0].portalSprite.destroy();
                        if (this.portals[1]!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                }
                
                this.portals=undefined;
                this.cameras.main.resetFX();
            }, [], this);
        }


        ////////////////////////////////////////////////////////////////////////
        

    }

}


///////////////////////////////////////////////////////////////////

export class C1A4Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A4Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A4Scene' });
    }

    preload() {
        console.log('C1A4 preload');
        this.load.image('bg3', '../assets/game/bg/bg3.png');
    }

    player: Phaser.Physics.Arcade.Sprite;
    machine: Phaser.Physics.Arcade.Sprite;
    deadMachine: Phaser.Physics.Arcade.Sprite;
    deadMachine1: Phaser.Physics.Arcade.Sprite;
    snack: Phaser.GameObjects.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;
    

    create() {
        console.log('C1A4 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg3');

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'blockx3').setScale(0.5).refreshBody();
        this.platforms.create(390, 515, 'blockx2').setScale(0.5).refreshBody();
        this.platforms.create(600, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(100, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(1100, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(350, -230, 'blockx2_rot').setScale(0.5).refreshBody();
        this.platforms.create(860, -230, 'blockx2_rot').setScale(0.5).refreshBody();
        this.platforms.create(870, 1024, 'blockx2_rot').setScale(0.5).refreshBody();

        this.portalPlacementBlocks = [
            this.add.sprite(270, -18, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(1140, 20, 'blockx1_green').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(35, 530, 'blockx1_green_rot').setScale(0.8).setInteractive().setAlpha(0.5).setActive(false).setVisible(false),
            this.add.sprite(612, 20, 'blockx1_green').setScale(0.8).setInteractive().setAlpha(0.5).setActive(false).setVisible(false)
        ];

        this.nonPortalPlacementBlocks = [
            this.add.sprite(35, 530, 'blockx1_red_rot').setScale(0.8).setInteractive().setAlpha(0.5),
            this.add.sprite(612, 20, 'blockx1_red').setScale(0.8).setInteractive().setAlpha(0.5)
        ];

        this.exit = new UniversalLibrary.LevelExit;
        this.exit.originX = 1120;
        this.exit.originY = 620;
        this.exit.initVars();
        this.exit.exitSprite = this.add.sprite(this.exit.originX, this.exit.originY, 'exit').setScale(0.2, 0.2);


        // Snack anims
        this.anims.create({
            key: 'snack',
            frames: this.anims.generateFrameNumbers('snack', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.snack = this.add.sprite(500, 600, 'snack').setScale(0.35);
        this.snack.play('snack', true);

        // Fox anims
        this.player = this.physics.add.sprite(1220, 0, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        this.anims.create({
            key: 'foxLeft',
            frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'foxTurn',
            frames: [ { key: 'fox', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'foxRight',
            frames: this.anims.generateFrameNumbers('fox', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });



        // Machines
        this.machine = this.physics.add.sprite(0, 0, 'machine').setScale(0.5);
        this.machine.setBounce(0.1);
        this.machine.setCollideWorldBounds(true);
        this.physics.add.collider(this.machine, this.platforms);

        this.deadMachine = this.physics.add.sprite(725, 422, 'machine_dead').setScale(0.1);
        this.deadMachine.setBounce(0.1);
        this.deadMachine.setCollideWorldBounds(true);
        this.physics.add.collider(this.deadMachine, this.platforms);

        this.deadMachine1 = this.physics.add.sprite(960, 600, 'machine_dead').setScale(0.2);
        this.deadMachine1.setBounce(0.1);
        this.deadMachine1.setCollideWorldBounds(true);
        this.physics.add.collider(this.deadMachine1, this.platforms);

    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    machineTimer: UniversalLibrary.Timer;
    machineDirection: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;
    portalPlacementBlockToChange: number;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickWasOnPortalBlock=true;
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = (click: UniversalLibrary.ClickEvent) => {

                if (this.portals==undefined||this.portals==null) {
                    this.portals = [];
                    this.portalPlacementIncrement=0;
                }
    
                if ( this.portalPlacementIncrement==undefined || this.portalPlacementIncrement==null ) {
                    this.portalPlacementIncrement=0;
                }
                
                if ( this.portalPlacementIncrement==0 || this.lastPortalPlaced==1 ) {
                    if (this.portalPlacementIncrement!=0) {
                        if (this.portals[0].portalSprite!=undefined) {
                            this.portals[0].portalSprite.destroy();
                        }
                    }
                    this.portals[0] = new UniversalLibrary.Portal;
                    this.portals[0].originX=click.x;
                    this.portals[0].originY=click.y;
                    this.portals[0].portalName='portal0';
                    this.portals[0].portalType=0
                    this.portals[0].initVars();
                    this.portals[0].portalSprite = this.add.sprite(this.portals[0].originX,this.portals[0].originY, this.portals[0].portalName).setScale(0.2);
                    this.lastPortalPlaced=0;
                    console.log('portal0 placed');
                } else if ( this.lastPortalPlaced==0 )  {
                    if (this.portalPlacementIncrement!=1) {
                        if (this.portals[1].portalSprite!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                    this.portals[1] = new UniversalLibrary.Portal;
                    this.portals[1].originX=click.x;
                    this.portals[1].originY=click.y;
                    this.portals[1].portalName='portal1';
                    this.portals[1].portalType=1
                    this.portals[1].initVars();
                    this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                    this.lastPortalPlaced=1;
                    console.log('portal1 placed');
                }

                this.portalPlacementIncrement++;

                this.dblClickThisLoop=true;

                this.clickWasOnPortalBlock=false;

            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff  **/

        /*
        Functions to do on click:
        Single click:
        1. Set a variable letting other functions know that it's a single click
        2. Move the fox

        Double click:
        1. Set a variable letting other functions know that it's a double click
        2. If the click was on a portalPlacementBlock, (green), place a portal
        */

        ////////////////////////////////////////////////////////////////////////
        
        // Set clickHandler: this is the function to be called whenever a click is registered. Also handles double clicks
        if (this.clickHandler==undefined) {
            this.clickHandler = () => {

                console.log('Click');

                if (this.currentClick == undefined) {                    
                    this.currentClick = new UniversalLibrary.ClickEvent;
                    this.currentClick.x = this.input.activePointer.x;
                    this.currentClick.y = this.input.activePointer.y;

                    setTimeout( () => {
                        if (this.currentClick != undefined) {
                            this.singleClickFunc(this.currentClick);
                        }
                        delete this.currentClick; 
 
                    }, 250);
                }
                else { // double click
                    this.doubleClickFunc(this.currentClick);
                    delete this.currentClick;
                }  
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
        }

        if (this.singleClickFunc==undefined) {
            this.singleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                this.foxTargetPosition = click;
            }
        }

        if (this.doubleClickFunc==undefined) {
            this.doubleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                if (this.clickWasOnPortalBlock==true) {
                    this.placePortal(click);
                    this.clickWasOnPortalBlock=false;
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////
        
        if (this.foxTargetPosition != undefined) {
            if (this.player.x<this.foxTargetPosition.x-10 || this.player.x>this.foxTargetPosition.x+10 ) {
                if (this.player.x>this.foxTargetPosition.x ) {

                    this.player.setVelocityX(-325);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( this.player.x<this.foxTargetPosition.x ) {
    
                    this.player.setVelocityX(325);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( this.foxTargetPosition.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-600);
                }
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
                delete this.foxTargetPosition;
            }
        }
        ////////////////////////////////////////////////////////////////////////

        /**  Machine movement  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Machine movement
        // Machine0
        if (this.machineTimer==undefined) {
            this.machineTimer = new UniversalLibrary.Timer;
            this.machineTimer.timerStart();
            this.machineDirection=0;
        }
        if (this.machineTimer.timerEnd()>0.2) {
            this.machineDirection++;
            this.machineTimer.timerStart();
            if (this.machineDirection>1) {
                this.machineDirection=0;
            }
        }
        if (this.machineDirection==0)
        {
            this.machine.setVelocityX(-325); 

            this.machine.anims.play('machineLeft', true);


        } else if (this.machineDirection==1){
            this.machine.setVelocityX(325);

            this.machine.anims.play('machineRight', true);

        } else {
            this.machine.setVelocityX(0);

            this.machine.anims.play('machineTurn');
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Check for level exit touched
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exit.exitSprite.getBounds())) {
            console.log('Exit touched');
            this.scene.start('C1A5Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[0].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[1].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[0].originX;
                        this.player.y=this.portals[0].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');

                } else {
                    this.playerIsTouchingPortal=false;
                }

            }
        }

        // Check if portalPlacementBlocks need to change
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[0].getBounds())&& this.portalPlacementBlockToChange==0) {
            this.checkPortalBlockChange=true
        }
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[3].getBounds())&& this.portalPlacementBlockToChange==1) {
            this.checkPortalBlockChange=true
        }
        if (this.portalPlacementBlockToChange==undefined) {
            this.portalPlacementBlockToChange=0;
        }
        if (this.checkPortalBlockChange==true) {
            this.changePortalPlacementBlocks=true;
            this.checkPortalBlockChange=false;
        }
        if (this.changePortalPlacementBlocks) {
            console.log('Changing portal placement blocks');
            if (this.portalPlacementBlockToChange==0) {
                this.nonPortalPlacementBlocks[1].setActive(false).setVisible(false);
                this.portalPlacementBlocks[3].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=1;
            } else if (this.portalPlacementBlockToChange==1) {
                this.nonPortalPlacementBlocks[0].setActive(false).setVisible(false);
                this.portalPlacementBlocks[2].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=2;
            }
            
            this.changePortalPlacementBlocks=false;
        }
        
        // Kill player if touching enemy
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.deadMachine.getBounds()) || Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.deadMachine1.getBounds()) || Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.machine.getBounds()) ) {
            // shake the camera
            this.cameras.main.shake(500);
            this.player.setVelocityX(0);
            this.player.anims.play('foxTurn');
            delete this.foxTargetPosition;

            // fade camera
            this.time.delayedCall(250, function() {
                this.cameras.main.fade(250);
            }, [], this);

            // restart game
            this.time.delayedCall(500, () => {
                this.player.x=1220;
                this.player.y=0;
                if (this.portals!=undefined) {
                    if (this.portals[0]!=undefined) {
                        this.portals[0].portalSprite.destroy();
                        if (this.portals[1]!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                }
                
                this.portals=undefined;
                this.cameras.main.resetFX();
            }, [], this);
        }


        ////////////////////////////////////////////////////////////////////////
        

    }

}


///////////////////////////////////////////////////////////////////

export class C1A3Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A3Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A3Scene' });
    }

    preload() {
        console.log('C1A3 preload');
        this.load.image('bg6', '../assets/game/bg/bg6.png');
    }

    player: Phaser.Physics.Arcade.Sprite;
    machine: Phaser.Physics.Arcade.Sprite;
    deadMachine: Phaser.Physics.Arcade.Sprite;
    machine1: Phaser.Physics.Arcade.Sprite;
    snack: Phaser.GameObjects.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;
    

    create() {
        console.log('C1A3 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg6');

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'blockx3').setScale(0.5).refreshBody();
        this.platforms.create(390, 515, 'blockx2').setScale(0.5).refreshBody();
        this.platforms.create(600, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(100, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(1100, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(350, -230, 'blockx2_rot').setScale(0.5).refreshBody();
        this.platforms.create(860, -230, 'blockx2_rot').setScale(0.5).refreshBody();
        this.platforms.create(870, 1024, 'blockx2_rot').setScale(0.5).refreshBody();

        this.deadMachine = this.physics.add.sprite(960, 600, 'machine_dead').setScale(0.2);
        this.deadMachine.setBounce(0.1);
        this.deadMachine.setCollideWorldBounds(true);
        this.physics.add.collider(this.deadMachine, this.platforms);

        this.portalPlacementBlocks = [
            this.add.sprite(270, -18, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(1140, 20, 'blockx1_green').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(35, 530, 'blockx1_green_rot').setScale(0.8).setInteractive().setAlpha(0.5).setActive(false).setVisible(false),
            this.add.sprite(612, 20, 'blockx1_green').setScale(0.8).setInteractive().setAlpha(0.5).setActive(false).setVisible(false)
        ];

        this.nonPortalPlacementBlocks = [
            this.add.sprite(35, 530, 'blockx1_red_rot').setScale(0.8).setInteractive().setAlpha(0.5),
            this.add.sprite(612, 20, 'blockx1_red').setScale(0.8).setInteractive().setAlpha(0.5)
        ];

        this.exit = new UniversalLibrary.LevelExit;
        this.exit.originX = 1120;
        this.exit.originY = 620;
        this.exit.initVars();
        this.exit.exitSprite = this.add.sprite(this.exit.originX, this.exit.originY, 'exit').setScale(0.2, 0.2);


        // Snack anims
        this.anims.create({
            key: 'snack',
            frames: this.anims.generateFrameNumbers('snack', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.snack = this.add.sprite(500, 600, 'snack').setScale(0.35);
        this.snack.play('snack', true);

        // Fox anims
        this.player = this.physics.add.sprite(1220, 0, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        this.anims.create({
            key: 'foxLeft',
            frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'foxTurn',
            frames: [ { key: 'fox', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'foxRight',
            frames: this.anims.generateFrameNumbers('fox', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });



        // Machines

    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    machineTimer: UniversalLibrary.Timer;
    machineDirection: number;
    machine1Timer: UniversalLibrary.Timer;
    machine1Direction: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;
    portalPlacementBlockToChange: number;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickWasOnPortalBlock=true;
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = (click: UniversalLibrary.ClickEvent) => {

                if (this.portals==undefined||this.portals==null) {
                    this.portals = [];
                    this.portalPlacementIncrement=0;
                }
    
                if ( this.portalPlacementIncrement==undefined || this.portalPlacementIncrement==null ) {
                    this.portalPlacementIncrement=0;
                }
                
                if ( this.portalPlacementIncrement==0 || this.lastPortalPlaced==1 ) {
                    if (this.portalPlacementIncrement!=0) {
                        if (this.portals[0].portalSprite!=undefined) {
                            this.portals[0].portalSprite.destroy();
                        }
                    }
                    this.portals[0] = new UniversalLibrary.Portal;
                    this.portals[0].originX=click.x;
                    this.portals[0].originY=click.y;
                    this.portals[0].portalName='portal0';
                    this.portals[0].portalType=0
                    this.portals[0].initVars();
                    this.portals[0].portalSprite = this.add.sprite(this.portals[0].originX,this.portals[0].originY, this.portals[0].portalName).setScale(0.2);
                    this.lastPortalPlaced=0;
                    console.log('portal0 placed');
                } else if ( this.lastPortalPlaced==0 )  {
                    if (this.portalPlacementIncrement!=1) {
                        if (this.portals[1].portalSprite!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                    this.portals[1] = new UniversalLibrary.Portal;
                    this.portals[1].originX=click.x;
                    this.portals[1].originY=click.y;
                    this.portals[1].portalName='portal1';
                    this.portals[1].portalType=1
                    this.portals[1].initVars();
                    this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                    this.lastPortalPlaced=1;
                    console.log('portal1 placed');
                }

                this.portalPlacementIncrement++;

                this.dblClickThisLoop=true;

                this.clickWasOnPortalBlock=false;

            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff  **/

        /*
        Functions to do on click:
        Single click:
        1. Set a variable letting other functions know that it's a single click
        2. Move the fox

        Double click:
        1. Set a variable letting other functions know that it's a double click
        2. If the click was on a portalPlacementBlock, (green), place a portal
        */

        ////////////////////////////////////////////////////////////////////////
        
        // Set clickHandler: this is the function to be called whenever a click is registered. Also handles double clicks
        if (this.clickHandler==undefined) {
            this.clickHandler = () => {

                console.log('Click');

                if (this.currentClick == undefined) {                    
                    this.currentClick = new UniversalLibrary.ClickEvent;
                    this.currentClick.x = this.input.activePointer.x;
                    this.currentClick.y = this.input.activePointer.y;

                    setTimeout( () => {
                        if (this.currentClick != undefined) {
                            this.singleClickFunc(this.currentClick);
                        }
                        delete this.currentClick; 
 
                    }, 250);
                }
                else { // double click
                    this.doubleClickFunc(this.currentClick);
                    delete this.currentClick;
                }  
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
        }

        if (this.singleClickFunc==undefined) {
            this.singleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                this.foxTargetPosition = click;
            }
        }

        if (this.doubleClickFunc==undefined) {
            this.doubleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                if (this.clickWasOnPortalBlock==true) {
                    this.placePortal(click);
                    this.clickWasOnPortalBlock=false;
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////
        
        if (this.foxTargetPosition != undefined) {
            if (this.player.x<this.foxTargetPosition.x-10 || this.player.x>this.foxTargetPosition.x+10 ) {
                if (this.player.x>this.foxTargetPosition.x ) {

                    this.player.setVelocityX(-325);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( this.player.x<this.foxTargetPosition.x ) {
    
                    this.player.setVelocityX(325);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( this.foxTargetPosition.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-600);
                }
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
                delete this.foxTargetPosition;
            }
        }
        ////////////////////////////////////////////////////////////////////////

        /**  Machine movement  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Machine movement


        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Check for level exit touched
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exit.exitSprite.getBounds())) {
            console.log('Exit touched');
            this.scene.start('C1A4Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[0].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[1].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[0].originX;
                        this.player.y=this.portals[0].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');

                } else {
                    this.playerIsTouchingPortal=false;
                }

            }
        }

        // Check if portalPlacementBlocks need to change
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[0].getBounds())&& this.portalPlacementBlockToChange==0) {
            this.checkPortalBlockChange=true
        }
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[3].getBounds())&& this.portalPlacementBlockToChange==1) {
            this.checkPortalBlockChange=true
        }
        if (this.portalPlacementBlockToChange==undefined) {
            this.portalPlacementBlockToChange=0;
        }
        if (this.checkPortalBlockChange==true) {
            this.changePortalPlacementBlocks=true;
            this.checkPortalBlockChange=false;
        }
        if (this.changePortalPlacementBlocks) {
            console.log('Changing portal placement blocks');
            if (this.portalPlacementBlockToChange==0) {
                this.nonPortalPlacementBlocks[1].setActive(false).setVisible(false);
                this.portalPlacementBlocks[3].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=1;
            } else if (this.portalPlacementBlockToChange==1) {
                this.nonPortalPlacementBlocks[0].setActive(false).setVisible(false);
                this.portalPlacementBlocks[2].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=2;
            }
            
            this.changePortalPlacementBlocks=false;
        }
        
        // Kill player if touching enemy
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.deadMachine.getBounds())) {
            // shake the camera
            this.cameras.main.shake(500);
            this.player.setVelocityX(0);
            this.player.anims.play('foxTurn');
            delete this.foxTargetPosition;

            // fade camera
            this.time.delayedCall(250, function() {
                this.cameras.main.fade(250);
            }, [], this);

            // restart game
            this.time.delayedCall(500, () => {
                this.player.x=1220;
                this.player.y=0;
                if (this.portals!=undefined) {
                    if (this.portals[0]!=undefined) {
                        this.portals[0].portalSprite.destroy();
                        if (this.portals[1]!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                }
                
                this.portals=undefined;
                this.cameras.main.resetFX();
            }, [], this);
        }


        ////////////////////////////////////////////////////////////////////////
        

    }

}


///////////////////////////////////////////////////////////////////

export class C1A2Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A2Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A2Scene' });
    }

    preload() {
        console.log('C1A2 preload');
        this.load.image('bg2', '../assets/game/bg/bg2.png');
        this.load.image('machine_dead', '../assets/game/machine_dead.png');
    }

    player: Phaser.Physics.Arcade.Sprite;
    machine: Phaser.Physics.Arcade.Sprite;
    machine1: Phaser.Physics.Arcade.Sprite;
    deadMachine: Phaser.Physics.Arcade.Sprite;
    snack: Phaser.GameObjects.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;
    

    create() {
        console.log('C1A2 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg2');

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'blockx3').setScale(0.5).refreshBody();
        this.platforms.create(1120, 550, 'blockx2').setScale(0.5).refreshBody();
        this.platforms.create(600, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(1100, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(350, 20, 'blockx2_rot').setScale(0.5).refreshBody();
        this.platforms.create(860, -230, 'blockx2_rot').setScale(0.5).refreshBody();
        this.platforms.create(75, 500, 'blockx1').setScale(0.5).refreshBody();

        this.portalPlacementBlocks = [
            this.add.sprite(1240, 530, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(275, 225, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(1140, 20, 'blockx1_green').setScale(1).setInteractive().setAlpha(0.5).setActive(false).setVisible(false),
            this.add.sprite(612, 20, 'blockx1_green').setScale(0.8).setInteractive().setAlpha(0.5).setActive(false).setVisible(false)
        ];

        this.nonPortalPlacementBlocks = [
            this.add.sprite(1140, 20, 'blockx1_red').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(612, 20, 'blockx1_red').setScale(0.8).setInteractive().setAlpha(0.5)
        ];

        this.exit = new UniversalLibrary.LevelExit;
        this.exit.originX = 640;
        this.exit.originY = 170;
        this.exit.initVars();
        this.exit.exitSprite = this.add.sprite(this.exit.originX, this.exit.originY, 'exit').setScale(0.2, 0.2);


        // Snack anims
        this.anims.create({
            key: 'snack',
            frames: this.anims.generateFrameNumbers('snack', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.snack = this.add.sprite(500, 600, 'snack').setScale(0.35);
        this.snack.play('snack', true);

        // Fox anims
        this.player = this.physics.add.sprite(100, 600, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Machines
        this.machine = this.physics.add.sprite(1300, 650, 'machine').setScale(0.5);
        this.machine.setBounce(0.1);
        this.machine.setCollideWorldBounds(true);
        this.physics.add.collider(this.machine, this.platforms);

        this.deadMachine = this.physics.add.sprite(950, 0, 'machine_dead').setScale(0.15);
        this.deadMachine.setBounce(0.1);
        this.deadMachine.setCollideWorldBounds(true);
        this.physics.add.collider(this.deadMachine, this.platforms);

    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    machineTimer: UniversalLibrary.Timer;
    machineDirection: number;
    machine1Timer: UniversalLibrary.Timer;
    machine1Direction: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;
    portalPlacementBlockToChange: number;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickWasOnPortalBlock=true;
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = (click: UniversalLibrary.ClickEvent) => {

                if (this.portals==undefined||this.portals==null) {
                    this.portals = [];
                    this.portalPlacementIncrement=0;
                }
    
                if ( this.portalPlacementIncrement==undefined || this.portalPlacementIncrement==null ) {
                    this.portalPlacementIncrement=0;
                }
                
                if ( this.portalPlacementIncrement==0 || this.lastPortalPlaced==1 ) {
                    if (this.portalPlacementIncrement!=0) {
                        if (this.portals[0].portalSprite!=undefined) {
                            this.portals[0].portalSprite.destroy();
                        }
                    }
                    this.portals[0] = new UniversalLibrary.Portal;
                    this.portals[0].originX=click.x;
                    this.portals[0].originY=click.y;
                    this.portals[0].portalName='portal0';
                    this.portals[0].portalType=0
                    this.portals[0].initVars();
                    this.portals[0].portalSprite = this.add.sprite(this.portals[0].originX,this.portals[0].originY, this.portals[0].portalName).setScale(0.2);
                    this.lastPortalPlaced=0;
                    console.log('portal0 placed');
                } else if ( this.lastPortalPlaced==0 )  {
                    if (this.portalPlacementIncrement!=1) {
                        if (this.portals[1].portalSprite!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                    this.portals[1] = new UniversalLibrary.Portal;
                    this.portals[1].originX=click.x;
                    this.portals[1].originY=click.y;
                    this.portals[1].portalName='portal1';
                    this.portals[1].portalType=1
                    this.portals[1].initVars();
                    this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                    this.lastPortalPlaced=1;
                    console.log('portal1 placed');
                }

                this.portalPlacementIncrement++;

                this.dblClickThisLoop=true;

                this.clickWasOnPortalBlock=false;

            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff  **/

        /*
        Functions to do on click:
        Single click:
        1. Set a variable letting other functions know that it's a single click
        2. Move the fox

        Double click:
        1. Set a variable letting other functions know that it's a double click
        2. If the click was on a portalPlacementBlock, (green), place a portal
        */

        ////////////////////////////////////////////////////////////////////////
        
        // Set clickHandler: this is the function to be called whenever a click is registered. Also handles double clicks
        if (this.clickHandler==undefined) {
            this.clickHandler = () => {

                console.log('Click');

                if (this.currentClick == undefined) {                    
                    this.currentClick = new UniversalLibrary.ClickEvent;
                    this.currentClick.x = this.input.activePointer.x;
                    this.currentClick.y = this.input.activePointer.y;

                    setTimeout( () => {
                        if (this.currentClick != undefined) {
                            this.singleClickFunc(this.currentClick);
                        }
                        delete this.currentClick; 
 
                    }, 250);
                }
                else { // double click
                    this.doubleClickFunc(this.currentClick);
                    delete this.currentClick;
                }  
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
        }

        if (this.singleClickFunc==undefined) {
            this.singleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                this.foxTargetPosition = click;
            }
        }

        if (this.doubleClickFunc==undefined) {
            this.doubleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                if (this.clickWasOnPortalBlock==true) {
                    this.placePortal(click);
                    this.clickWasOnPortalBlock=false;
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////
        
        if (this.foxTargetPosition != undefined) {
            if (this.player.x<this.foxTargetPosition.x-10 || this.player.x>this.foxTargetPosition.x+10 ) {
                if (this.player.x>this.foxTargetPosition.x ) {

                    this.player.setVelocityX(-325);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( this.player.x<this.foxTargetPosition.x ) {
    
                    this.player.setVelocityX(325);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( this.foxTargetPosition.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-600);
                }
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
                delete this.foxTargetPosition;
            }
        }
        ////////////////////////////////////////////////////////////////////////

        /**  Machine movement  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Machine movement
        // Machine0
        if (this.machineTimer==undefined) {
            this.machineTimer = new UniversalLibrary.Timer;
            this.machineTimer.timerStart();
            this.machineDirection=0;
        }
        if (this.machineTimer.timerEnd()>1.5) {
            this.machineDirection++;
            this.machineTimer.timerStart();
            if (this.machineDirection>1) {
                this.machineDirection=0;
            }
        }
        if (this.machineDirection==0)
        {
            this.machine.setVelocityX(-325); 

            this.machine.anims.play('machineLeft', true);


        } else if (this.machineDirection==1){
            this.machine.setVelocityX(325);

            this.machine.anims.play('machineRight', true);

        } else {
            this.machine.setVelocityX(0);

            this.machine.anims.play('machineTurn');
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Check for level exit touched
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exit.exitSprite.getBounds())) {
            console.log('Exit touched');
            this.scene.start('C1A3Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[0].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[1].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[0].originX;
                        this.player.y=this.portals[0].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');

                } else {
                    this.playerIsTouchingPortal=false;
                }

            }
        }

        // Check if portalPlacementBlocks need to change
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[1].getBounds())&& this.portalPlacementBlockToChange==0) {
            this.checkPortalBlockChange=true
        }
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portalPlacementBlocks[2].getBounds())&& this.portalPlacementBlockToChange==1) {
            this.checkPortalBlockChange=true
        }
        if (this.portalPlacementBlockToChange==undefined) {
            this.portalPlacementBlockToChange=0;
        }
        if (this.checkPortalBlockChange==true) {
            this.changePortalPlacementBlocks=true;
            this.checkPortalBlockChange=false;
        }
        if (this.changePortalPlacementBlocks) {
            console.log('Changing portal placement blocks');
            if (this.portalPlacementBlockToChange==0) {
                this.nonPortalPlacementBlocks[0].setActive(false).setVisible(false);
                this.portalPlacementBlocks[2].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=1;
            } else if (this.portalPlacementBlockToChange==1) {
                this.nonPortalPlacementBlocks[1].setActive(false).setVisible(false);
                this.portalPlacementBlocks[3].setActive(true).setVisible(true);
                this.changePortalPlacementBlocks=false;
                this.portalPlacementBlockToChange=2;
            }
            
            this.changePortalPlacementBlocks=false;
        }
        
        // Kill player if touching enemy
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.machine.getBounds()) || Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.deadMachine.getBounds())) {
            // shake the camera
            this.cameras.main.shake(500);
            this.player.setVelocityX(0);
            this.player.anims.play('foxTurn');
            delete this.foxTargetPosition;

            // fade camera
            this.time.delayedCall(250, function() {
                this.cameras.main.fade(250);
            }, [], this);

            // restart game
            this.time.delayedCall(500, () => {
                this.player.x=100;
                this.player.y=450;
                if (this.portals!=undefined) {
                    if (this.portals[0]!=undefined) {
                        this.portals[0].portalSprite.destroy();
                        if (this.portals[1]!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                }
                
                this.portals=undefined;
                this.cameras.main.resetFX();
                this.player.y=600;
            }, [], this);
        }


        ////////////////////////////////////////////////////////////////////////
        

    }

}


///////////////////////////////////////////////////////////////////

export class C1A1Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A1Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A1Scene' });
    }

    preload() {
        console.log('C1A1 preload');
        this.load.image('bg1', '../assets/game/bg/bg1.png');
        this.load.spritesheet('machine', 
            '../assets/game/spritesheets/machine_ss.png',
            { frameWidth: 146, frameHeight: 125 }
        );
    }

    player: Phaser.Physics.Arcade.Sprite;
    machine: Phaser.Physics.Arcade.Sprite;
    machine1: Phaser.Physics.Arcade.Sprite;
    snack: Phaser.GameObjects.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;

    create() {
        console.log('C1A1 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg1');

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'blockx3').setScale(0.5).refreshBody();
        this.platforms.create(140, 550, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(1140, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(900, 730, 'blockx2_rot').setScale(0.5).refreshBody();

        this.portalPlacementBlocks = [
            this.add.sprite(1240, 530, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(860, 530, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(1240, 20, 'blockx1_green').setScale(1).setInteractive().setAlpha(0.5).setActive(false).setVisible(false)
        ];

        this.nonPortalPlacementBlocks = [
            this.add.sprite(1240, 20, 'blockx1_red').setScale(1).setInteractive().setAlpha(0.5)
        ];

        this.exit = new UniversalLibrary.LevelExit;
        this.exit.originX = 1200;
        this.exit.originY = 170;
        this.exit.initVars();
        this.exit.exitSprite = this.add.sprite(this.exit.originX, this.exit.originY, 'exit').setScale(0.2, 0.2);


        // Snack anims
        this.anims.create({
            key: 'snack',
            frames: this.anims.generateFrameNumbers('snack', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.snack = this.add.sprite(500, 600, 'snack').setScale(0.35);
        this.snack.play('snack', true);

        // Fox anims
        this.player = this.physics.add.sprite(100, 450, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        this.anims.create({
            key: 'foxLeft',
            frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'foxTurn',
            frames: [ { key: 'fox', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'foxRight',
            frames: this.anims.generateFrameNumbers('fox', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });



        // Machine
        this.machine = this.physics.add.sprite(750, 650, 'machine').setScale(0.5);
        this.machine.setBounce(0.1);
        this.machine.setCollideWorldBounds(true);
        this.physics.add.collider(this.machine, this.platforms);
        this.anims.create({
            key: 'machineLeft',
            frames: this.anims.generateFrameNumbers('machine', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'machineTurn',
            frames: [ { key: 'machine', frame: 3 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'machineRight',
            frames: this.anims.generateFrameNumbers('machine', { start: 4, end: 6 }),
            frameRate: 10,
            repeat: -1
        });


        // Music
        let standardSoundConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }

        let soundLoopConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        }
        
        
        // c1a0 should play once, then play c1a01 directly after on loop, maybe implement later
        //this.sound.play('c1a0', soundLoopConfig);

        

    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    machineTimer: UniversalLibrary.Timer;
    machineDirection: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickWasOnPortalBlock=true;
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = (click: UniversalLibrary.ClickEvent) => {

                if (this.portals==undefined||this.portals==null) {
                    this.portals = [];
                    this.portalPlacementIncrement=0;
                }
    
                if ( this.portalPlacementIncrement==undefined || this.portalPlacementIncrement==null ) {
                    this.portalPlacementIncrement=0;
                }
                
                if ( this.portalPlacementIncrement==0 || this.lastPortalPlaced==1 ) {
                    if (this.portalPlacementIncrement!=0) {
                        if (this.portals[0].portalSprite!=undefined) {
                            this.portals[0].portalSprite.destroy();
                        }
                    }
                    this.portals[0] = new UniversalLibrary.Portal;
                    this.portals[0].originX=click.x;
                    this.portals[0].originY=click.y;
                    this.portals[0].portalName='portal0';
                    this.portals[0].portalType=0
                    this.portals[0].initVars();
                    this.portals[0].portalSprite = this.add.sprite(this.portals[0].originX,this.portals[0].originY, this.portals[0].portalName).setScale(0.2);
                    this.lastPortalPlaced=0;
                    console.log('portal0 placed');
                } else if ( this.lastPortalPlaced==0 )  {
                    if (this.portalPlacementIncrement!=1) {
                        if (this.portals[1].portalSprite!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                    this.portals[1] = new UniversalLibrary.Portal;
                    this.portals[1].originX=click.x;
                    this.portals[1].originY=click.y;
                    this.portals[1].portalName='portal1';
                    this.portals[1].portalType=1
                    this.portals[1].initVars();
                    this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                    this.lastPortalPlaced=1;
                    console.log('portal1 placed');
                }

                this.portalPlacementIncrement++;

                this.dblClickThisLoop=true;

                this.clickWasOnPortalBlock=false;

            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff  **/

        /*
        Functions to do on click:
        Single click:
        1. Set a variable letting other functions know that it's a single click
        2. Move the fox

        Double click:
        1. Set a variable letting other functions know that it's a double click
        2. If the click was on a portalPlacementBlock, (green), place a portal
        */

        ////////////////////////////////////////////////////////////////////////
        
        // Set clickHandler: this is the function to be called whenever a click is registered. Also handles double clicks
        if (this.clickHandler==undefined) {
            this.clickHandler = () => {

                console.log('Click');

                if (this.currentClick == undefined) {                    
                    this.currentClick = new UniversalLibrary.ClickEvent;
                    this.currentClick.x = this.input.activePointer.x;
                    this.currentClick.y = this.input.activePointer.y;

                    setTimeout( () => {
                        if (this.currentClick != undefined) {
                            this.singleClickFunc(this.currentClick);
                        }
                        delete this.currentClick; 
 
                    }, 250);
                }
                else { // double click
                    this.doubleClickFunc(this.currentClick);
                    delete this.currentClick;
                }  
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
        }

        if (this.singleClickFunc==undefined) {
            this.singleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                this.foxTargetPosition = click;
            }
        }

        if (this.doubleClickFunc==undefined) {
            this.doubleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                if (this.clickWasOnPortalBlock==true) {
                    this.placePortal(click);
                    this.clickWasOnPortalBlock=false;
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////
        
        if (this.foxTargetPosition != undefined) {
            if (this.player.x<this.foxTargetPosition.x-10 || this.player.x>this.foxTargetPosition.x+10 ) {
                if (this.player.x>this.foxTargetPosition.x ) {

                    this.player.setVelocityX(-325);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( this.player.x<this.foxTargetPosition.x ) {
    
                    this.player.setVelocityX(325);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( this.foxTargetPosition.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-600);
                }
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
                delete this.foxTargetPosition;
            }
        }
        ////////////////////////////////////////////////////////////////////////

        /**  Machine movement  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Machine movement
        if (this.machineTimer==undefined) {
            this.machineTimer = new UniversalLibrary.Timer;
            this.machineTimer.timerStart();
            this.machineDirection=0;
        }
        if (this.machineTimer.timerEnd()>1.5) {
            this.machineDirection++;
            this.machineTimer.timerStart();
            if (this.machineDirection>1) {
                this.machineDirection=0;
            }
        }
        if (this.machineDirection==0)
        {
            this.machine.setVelocityX(-325); 

            this.machine.anims.play('machineLeft', true);


        } else if (this.machineDirection==1){
            this.machine.setVelocityX(325);

            this.machine.anims.play('machineRight', true);

        } else {
            this.machine.setVelocityX(0);

            this.machine.anims.play('machineTurn');
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Check for level exit touched
        //
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exit.exitSprite.getBounds())) {
            console.log('Exit touched');
            this.scene.start('C1A2Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[0].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[1].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[0].originX;
                        this.player.y=this.portals[0].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');

                } else {
                    this.playerIsTouchingPortal=false;
                }

            }
        }

        // Check if portalPlacementBlocks need to change
        if (this.checkPortalBlockChange==undefined && this.player.x>870) {
            this.changePortalPlacementBlocks=true;
            this.checkPortalBlockChange=false;
        }
        if (this.changePortalPlacementBlocks) {
            console.log('Changing portal placement blocks');
            this.nonPortalPlacementBlocks[0].setActive(false).setVisible(false);
            this.portalPlacementBlocks[2].setActive(true).setVisible(true);
            this.changePortalPlacementBlocks=false;
        }
        
        // Kill player if touching enemy
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.machine.getBounds())) {
            // shake the camera
            this.cameras.main.shake(500);
            this.player.setVelocityX(0);
            this.player.anims.play('foxTurn');
            delete this.foxTargetPosition;

            // fade camera
            this.time.delayedCall(250, function() {
                this.cameras.main.fade(250);
            }, [], this);

            // restart game
            this.time.delayedCall(500, () => {
                this.player.x=100;
                this.player.y=450;
                if (this.portals!=undefined) {
                    if (this.portals[0]!=undefined) {
                        this.portals[0].portalSprite.destroy();
                        if (this.portals[1]!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                }
                
                this.portals=undefined;
                this.cameras.main.resetFX();
            }, [], this);
        }


        ////////////////////////////////////////////////////////////////////////
        

    }
}


///////////////////////////////////////////////////////////////////


export class C1A0Scene extends Phaser.Scene {

    constructor() {
        super({
            key: 'C1A0Scene'
        });
        Phaser.Scene.call(this, { key: 'C1A0Scene' });
    }

    preload() {
        console.log('C1A0 preload');
        this.load.image('bg', '../assets/game/bg/bg0.png');
        this.load.image('blockx1', '../assets/game/blockx1.png');
        this.load.image('blockx1_green', '../assets/game/blockx1_green.png');
        this.load.image('blockx1_green_rot', '../assets/game/blockx1_green_rot.png');
        this.load.image('blockx1_red', '../assets/game/blockx1_red.png');
        this.load.image('blockx1_red_rot', '../assets/game/blockx1_red_rot.png');
        this.load.image('blockx2', '../assets/game/blockx2.png');
        this.load.image('blockx3', '../assets/game/blockx3.png');
        this.load.image('blockx2_rot', '../assets/game/blockx2_rot.png');
        this.load.image('exit', '../assets/game/exit.png')
        this.load.spritesheet('fox', 
            '../assets/game/spritesheets/fox_ss.png',
            { frameWidth: 112, frameHeight: 61 }
        );
        this.load.spritesheet('snack',
            '../assets/game/spritesheets/snack_ss.png',
            { frameWidth: 146, frameHeight: 146 }
        );

        this.load.audio('c1a0', '../assets/soundtrack/c1a0.wav');
        this.load.audio('c1a01', '../assets/soundtrack/c1a01.wav');

        this.load.image('portal0', '../assets/game/portal0.png');
        this.load.image('portal1', '../assets/game/portal1.png');

    }

    player: Phaser.Physics.Arcade.Sprite;
    snack: Phaser.GameObjects.Sprite;

    portalPlacementBlocks: Phaser.GameObjects.Sprite[];
    nonPortalPlacementBlocks: Phaser.GameObjects.Sprite[];
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    sky: Phaser.GameObjects.Image;
    
    exit: UniversalLibrary.LevelExit;
    

    create() {
        console.log('C1A0 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg');

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'blockx3').setScale(0.5).refreshBody();
        this.platforms.create(140, 550, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(1140, 250, 'blockx1').setScale(0.5).refreshBody();
        this.platforms.create(900, 730, 'blockx2_rot').setScale(0.5).refreshBody();

        this.portalPlacementBlocks = [
            this.add.sprite(1240, 530, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(860, 530, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(1240, 20, 'blockx1_green').setScale(1).setInteractive().setAlpha(0.5).setActive(false).setVisible(false)
        ];

        this.nonPortalPlacementBlocks = [
            this.add.sprite(1240, 20, 'blockx1_red').setScale(1).setInteractive().setAlpha(0.5)
        ];

        this.exit = new UniversalLibrary.LevelExit;
        this.exit.originX = 1200;
        this.exit.originY = 170;
        this.exit.initVars();
        this.exit.exitSprite = this.add.sprite(this.exit.originX, this.exit.originY, 'exit').setScale(0.2, 0.2);


        // Snack anims
        this.anims.create({
            key: 'snack',
            frames: this.anims.generateFrameNumbers('snack', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.snack = this.add.sprite(500, 600, 'snack').setScale(0.35);
        this.snack.play('snack', true);

        // Fox anims
        this.player = this.physics.add.sprite(100, 450, 'fox');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        this.anims.create({
            key: 'foxLeft',
            frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'foxTurn',
            frames: [ { key: 'fox', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'foxRight',
            frames: this.anims.generateFrameNumbers('fox', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Music
        let standardSoundConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }

        let soundLoopConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        }
        
        
        // c1a0 should play once, then play c1a01 directly after on loop, maybe implement later, only plays c1a0 atm
        this.sound.play('c1a0', soundLoopConfig);

    }

    
    foxMovementStatus: boolean;
    clickHandler: Function;
    clickWasOnPortalBlock: boolean;
    currentClick: UniversalLibrary.ClickEvent;
    clickType: number;
    singleClickFunc: Function;
    doubleClickFunc: Function;
    foxTargetPosition: UniversalLibrary.ClickEvent;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    changePortalPlacementBlocks: boolean;
    checkPortalBlockChange: boolean;

    firstUpdate: boolean;

    update() {

        // Keyboard input
        /*
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-325); 

            this.player.anims.play('foxLeft', true);
        } else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(325);

            this.player.anims.play('foxRight', true);

        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('foxTurn');
        }
        
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-600);
        }
        */

        ////////////////////////////////////////////////////////////////////////

        /**  Set undefined variables, functions and listeners, reset variables  **/

        ////////////////////////////////////////////////////////////////////////

        // Perform on the first update loop
        if (this.firstUpdate==undefined||this.changePortalPlacementBlocks) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickWasOnPortalBlock=true;
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = (click: UniversalLibrary.ClickEvent) => {

                if (this.portals==undefined||this.portals==null) {
                    this.portals = [];
                    this.portalPlacementIncrement=0;
                }
    
                if ( this.portalPlacementIncrement==undefined || this.portalPlacementIncrement==null ) {
                    this.portalPlacementIncrement=0;
                }
                
                if ( this.portalPlacementIncrement==0 || this.lastPortalPlaced==1 ) {
                    if (this.portalPlacementIncrement!=0) {
                        if (this.portals[0].portalSprite!=undefined) {
                            this.portals[0].portalSprite.destroy();
                        }
                    }
                    this.portals[0] = new UniversalLibrary.Portal;
                    this.portals[0].originX=click.x;
                    this.portals[0].originY=click.y;
                    this.portals[0].portalName='portal0';
                    this.portals[0].portalType=0
                    this.portals[0].initVars();
                    this.portals[0].portalSprite = this.add.sprite(this.portals[0].originX,this.portals[0].originY, this.portals[0].portalName).setScale(0.2);
                    this.lastPortalPlaced=0;
                    console.log('portal0 placed');
                } else if ( this.lastPortalPlaced==0 )  {
                    if (this.portalPlacementIncrement!=1) {
                        if (this.portals[1].portalSprite!=undefined) {
                            this.portals[1].portalSprite.destroy();
                        }
                    }
                    this.portals[1] = new UniversalLibrary.Portal;
                    this.portals[1].originX=click.x;
                    this.portals[1].originY=click.y;
                    this.portals[1].portalName='portal1';
                    this.portals[1].portalType=1
                    this.portals[1].initVars();
                    this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                    this.lastPortalPlaced=1;
                    console.log('portal1 placed');
                }

                this.portalPlacementIncrement++;

                this.dblClickThisLoop=true;

                this.clickWasOnPortalBlock=false;

            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff  **/

        /*
        Functions to do on click:
        Single click:
        1. Set a variable letting other functions know that it's a single click
        2. Move the fox

        Double click:
        1. Set a variable letting other functions know that it's a double click
        2. If the click was on a portalPlacementBlock, (green), place a portal
        */

        ////////////////////////////////////////////////////////////////////////
        
        // Set clickHandler: this is the function to be called whenever a click is registered. Also handles double clicks
        if (this.clickHandler==undefined) {
            this.clickHandler = () => {

                console.log('Click');

                if (this.currentClick == undefined) {                    
                    this.currentClick = new UniversalLibrary.ClickEvent;
                    this.currentClick.x = this.input.activePointer.x;
                    this.currentClick.y = this.input.activePointer.y;

                    setTimeout( () => {
                        if (this.currentClick != undefined) {
                            this.singleClickFunc(this.currentClick);
                        }
                        delete this.currentClick; 
 
                    }, 250);
                }
                else { // double click
                    this.doubleClickFunc(this.currentClick);
                    delete this.currentClick;
                }  
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
        }

        if (this.singleClickFunc==undefined) {
            this.singleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                this.foxTargetPosition = click;
            }
        }

        if (this.doubleClickFunc==undefined) {
            this.doubleClickFunc = (click: UniversalLibrary.ClickEvent) => {
                if (this.clickWasOnPortalBlock==true) {
                    this.placePortal(click);
                    this.clickWasOnPortalBlock=false;
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement, currently uses Phaser click input but it separate from the clickHandler. Will eventually change to work with clickHandler to prevent movement when placing portals  **/

        ////////////////////////////////////////////////////////////////////////
        
        if (this.foxTargetPosition != undefined) {
            if (this.player.x<this.foxTargetPosition.x-10 || this.player.x>this.foxTargetPosition.x+10 ) {
                if (this.player.x>this.foxTargetPosition.x ) {

                    this.player.setVelocityX(-325);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( this.player.x<this.foxTargetPosition.x ) {
    
                    this.player.setVelocityX(325);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( this.foxTargetPosition.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-600);
                }
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
                delete this.foxTargetPosition;
            }
        }
        ////////////////////////////////////////////////////////////////////////

        /**  Machine movement  **/

        ////////////////////////////////////////////////////////////////////////
        


        ////////////////////////////////////////////////////////////////////////

        /**  Checks  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Check for level exit touched
        //
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exit.exitSprite.getBounds())) {
            console.log('Exit touched');
            this.scene.start('C1A1Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[0].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.portals[1].portalSprite.getBounds()))  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[0].originX;
                        this.player.y=this.portals[0].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');

                } else {
                    this.playerIsTouchingPortal=false;
                }

            }
        }

        // Check if portalPlacementBlocks need to change
        if (this.checkPortalBlockChange==undefined && this.player.x>870) {
            this.changePortalPlacementBlocks=true;
            this.checkPortalBlockChange=false;
        }
        if (this.changePortalPlacementBlocks) {
            console.log('Changing portal placement blocks');
            this.nonPortalPlacementBlocks[0].setActive(false).setVisible(false);
            this.portalPlacementBlocks[2].setActive(true).setVisible(true);
            this.changePortalPlacementBlocks=false;
        }
        
        // Kill player if touching enemy


        ////////////////////////////////////////////////////////////////////////
        

    }

}


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

export class MainGameScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'MainGameScene'
        });
        Phaser.Scene.call(this, { key: 'MainGameScene' });
    }

    create() {
        console.log('MainGameScene create');
        /*
        (async () => {
            await Global.delay(1500);
            console.log('Starting C1A0Scene ...')
            this.scene.start('C1A0Scene');
        })();
        */
        console.log('Starting C1A0Scene ...')
        this.scene.start('C1A0Scene');
        /*
        var startButton = document.getElementById("startButton");
        startButton.addEventListener("click", () => {
        
            startButton.parentNode.removeChild(startButton);
        
            if (navigator.userAgent.indexOf("Chrome") !== -1){
                document.body.requestFullscreen();  // Only fullscreen in chrome
            }

            this.input.on('pointerdown', () => {

                
            });
            
        
        }, false);
        */
        
    }
}


///////////////////////////////////////////////////////////////////