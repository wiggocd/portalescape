import * as Global from './global.js'
import { Tilemaps, Scene, Game, CANVAS } from 'phaser';

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
        portalSprite: any = undefined;
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
        startTime;
        endTime;
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

}

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

    }

    player: any;
    platforms: any;
    cursors: any;
    sky: any;
    snack: any;
    machine: any;
    exit: any;
    portalPlacementBlocks: any;

    create() {
        console.log('C1A1 create');
        this.cameras.main.resetFX();

        // Image and sprite creation
        this.sky = this.add.image(640, 360, 'bg1');
    }

    update() {

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
        this.load.image('blockx2', '../assets/game/blockx2.png');
        this.load.image('blockx3', '../assets/game/blockx3.png');
        this.load.image('blockx2_rot', '../assets/game/blockx2_rot.png');
        this.load.image('exit', '../assets/game/exit.png')
        this.load.spritesheet('fox', 
            '../assets/game/spritesheets/fox_ss.png',
            { frameWidth: 112, frameHeight: 61 }
        );
        this.load.spritesheet('machine', 
            '../assets/game/spritesheets/machine_ss.png',
            { frameWidth: 146, frameHeight: 125 }
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

    player: any;
    platforms: any;
    cursors: any;
    sky: any;
    snack: any;
    machine: any;
    exit: any;
    portalPlacementBlocks: any;

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
            this.add.sprite(860, 530, 'blockx1_green_rot').setScale(1).setInteractive().setAlpha(0.5),
            this.add.sprite(1140, 20, 'blockx1_green').setScale(1).setInteractive().setAlpha(0.5)
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

    
    singleClickStatus: any;
    clickHandler: Function;
    isDblClick: boolean;
    firstUpdate: boolean;

    machineTimer: UniversalLibrary.Timer;
    machineDirection: number;

    portals: UniversalLibrary.Portal[];
    portalPlacementIncrement: number;
    lastPortalPlaced: number;
    portalStatus: boolean;
    dblClickThisLoop: boolean;
    placePortal: Function;
    playerIsTouchingPortal: boolean;
    portalTimer: UniversalLibrary.Timer;

    // These timer functions are for the placePortal function only. Change later to use UniversalLibrary.Timer
    msecondsSinceLastPlacement;
    startTime;
    endTime;
    timerStart() {
        this.startTime = new Date();
    }
    timerEnd() {
        this.endTime = new Date();
        var timeDiff = this.endTime - this.startTime; //in ms
        // strip the ms
        timeDiff /= 1000;
        //console.log(timeDiff);
        // get seconds 
        //var seconds = Math.round(timeDiff);
        //console.log(seconds + " seconds");
        this.msecondsSinceLastPlacement=timeDiff;
    }

    
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

        /**  Set undefined variables, functions and listeners  **/

        // Perform on the first update loop
        if (this.firstUpdate==undefined) {
            // Add portal double tap for portalPlacementBlocks
            for (var i=0;i<this.portalPlacementBlocks.length;i++) {
                this.portalPlacementBlocks[i].on('pointerdown', () => { 
                    this.clickHandler();
                    if (this.isDblClick==true) {
                        console.log('Double click on portal placement texture, placing portal');
                        this.placePortal();
                    }
                });
            }
            this.firstUpdate=false;
        }

        // Set placePortal function
        if (this.placePortal==undefined) {
            this.placePortal = () => {
                this.timerEnd();
                if (this.msecondsSinceLastPlacement>=0.600||this.startTime==undefined) {

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
                        this.portals[0].originX=pointer.x;
                        this.portals[0].originY=pointer.y;
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
                        this.portals[1].originX=pointer.x;
                        this.portals[1].originY=pointer.y;
                        this.portals[1].portalName='portal1';
                        this.portals[1].portalType=1
                        this.portals[1].initVars();
                        this.portals[1].portalSprite = this.add.sprite(this.portals[1].originX,this.portals[1].originY, this.portals[1].portalName).setScale(0.2);
                        this.lastPortalPlaced=1;
                        console.log('portal1 placed');
                    }

                    this.portalPlacementIncrement++;

                    this.dblClickThisLoop=true;
                    
                    this.timerStart();

                }
            }
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Click stuff CHANGE  **/

        /*
        To properly detect single and double clicks, we need to store clicks that have taken place within the double click time each update, then:
        1. check if there are any clicks to add to the list, 
        2. if there are 2 clicks within the double click time, do a double click, and 
        3. if there is one click and the double tap time has elapsed, do the single click action, 
        4. if there are then no clicks within the double click time, clear the clicks
        */

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
                // Do things on click
                
            }
            
            // Add event listener
            this.input.on('pointerdown', () => {
                this.clickHandler();
            });
            
        }


        ////////////////////////////////////////////////////////////////////////

        /**  Fox movement CHANGE, add to the one click function  **/

        ////////////////////////////////////////////////////////////////////////
        
        // Single click input for movement
        var pointer = this.input.activePointer;
        
        if (pointer.justDown==true) {
            this.singleClickStatus=true;
        }
        
        if ( this.player.x<pointer.x-10 || this.player.x>pointer.x+10 ) {
            if (this.singleClickStatus==true) {
                if ( ( (this.player.x<pointer.x-10)||(this.player.x>pointer.x+10) ) && this.player.x>pointer.x ) {

                    this.player.setVelocityX(-325);
                    this.player.anims.play('foxLeft', true);
    
                } else if ( ( (this.player.x<pointer.x-10) || (this.player.x>pointer.x+10) ) && this.player.x<pointer.x ) {
    
                    this.player.setVelocityX(325);
                    this.player.anims.play('foxRight', true);
    
                }
                
                if ( pointer.y<this.player.y-100 && this.player.body.touching.down ) {
                    this.player.setVelocityY(-600);
                }
            } else {
                this.player.setVelocityX(0);
                this.player.anims.play('foxTurn');
            }
        } else {
            this.singleClickStatus=false;
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
        if ((this.player.x > this.exit.minX && this.player.x < this.exit.maxX) && (this.player.y > this.exit.minY && this.player.y < this.exit.maxY)) {
            console.log('Exit touched');
            this.scene.start('C1A1Scene');
        }

        // Check for portal touched
        if (this.portals!=undefined) {
            if ( (this.portals[0]!=undefined && this.portals[0]!=undefined) && (this.portals[1]!=undefined && this.portals[1]!=undefined) ) {
                if ( (this.player.x>=this.portals[0].minX && this.player.x<=this.portals[0].maxX) && (this.player.y>=this.portals[0].minY && this.player.y<=this.portals[0].maxY) )  {
                    if (this.playerIsTouchingPortal==false) {
                        this.player.x=this.portals[1].originX;
                        this.player.y=this.portals[1].originY;
                    }
                    this.playerIsTouchingPortal=true;
                    console.log('Teleported');
                } else if ( (this.player.x>=this.portals[1].minX && this.player.x<=this.portals[1].maxX) && (this.player.y>=this.portals[1].minY && this.player.y<=this.portals[1].maxY) )  {
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

export class MainGameScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'MainGameScene'
        });
        Phaser.Scene.call(this, { key: 'MainGameScene' });
    }

    create() {
        console.log('MainGameScene create');
        (async () => {
            await Global.delay(1500);
            console.log('Starting C1A0Scene ...')
            this.scene.start('C1A0Scene');
        })();
    }
    
}
