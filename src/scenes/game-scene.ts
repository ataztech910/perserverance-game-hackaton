import {UserState} from "./UserState";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameScene'
};
  
export class GameScene extends Phaser.Scene {
    controls = null;
    velocity = 0;
    car = null;
    forwardPressed = false;
    backPressed = false;
    coins = null;
    coinsSound = null;
    userState: UserState;

    constructor() {
        super(sceneConfig);
    }
    public preload() {
        this.load.image('tileset', '/assets/tileMap/tilesheet.png');
        this.load.tilemapTiledJSON('map', '/assets/tileMap/MarsThePlanet.json');
        this.load.image('car','assets/rover.png');
        this.load.spritesheet('coin', 'assets/coins.png', { frameWidth: 32, frameHeight: 32 });
        this.load.audio('coin-sound', ['assets/audio/coin.wav', 'assets/audio/bg.ogg']);
    }
    public create() {
        this.userState = {
            coins: 0,
            health: 100,
            signalStatus: 30
        }
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('tileset', 'tileset');
        const ground = map.createStaticLayer('ground', tileset, 0, 0);
        const rocks = map.createStaticLayer('rocks', tileset, 0, 0);
        const road = map.createStaticLayer('road', tileset, 0, 0);
        rocks.setCollisionByExclusion([-1]);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;

        this.car = this.physics.add.sprite(571,105,'car');
        this.car.body.rotation = 1;
        this.car.setCollideWorldBounds(true);

        const camera = this.cameras.main;
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        camera.startFollow(this.car);
        camera.roundPixels = true;
        rocks.setCollisionBetween(1, 50);
        this.physics.add.collider(this.car, rocks);
        // Set up the arrows to control the camera
        this.controls = this.input.keyboard.createCursorKeys();

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 6 }),
            frameRate: 16,
            repeat: -1
        });

        this.coins = map.createFromObjects('coin-object-layer', 1961, { key: 'coin' }, this);
        this.anims.play('spin', this.coins);
        this.coins.forEach(coin => {
            this.physics.world.enable(coin);
        })
       this.coinsSound = this.sound.add('coin-sound');
    }

    hitTheCoin(player, coin) {
        this.coinsSound.play();
        this.userState.coins ++;
        coin.destroy();
    }
    calculateVelocity(direction) {
        return direction ? this.velocity * Math.cos((this.car.angle - 90) * 0.01745) : this.velocity * Math.sin((this.car.angle - 90) * 0.01745);
    }
    public update(time, delta) {
        this.physics.collide(this.car, this.coins, this.hitTheCoin, null, this);
        /*Update Velocity*/
        if(this.velocity <= 0) {
            this.forwardPressed = false;
        }
        if (this.controls.up.isUp && this.forwardPressed && this.velocity > 0) {
            this.velocity -= 5;
        }
        if (this.controls.down.isUp && this.backPressed && this.velocity <= -1) {
            this.velocity += 5;
        }
        if (this.controls.up.isDown && this.velocity <= 400) {
            this.velocity += 5;
            this.forwardPressed = true;
        }
        else if (this.controls.down.isDown && this.velocity <= 0 && this.velocity >= -400) {
            this.velocity -= 5;
            this.backPressed = true;
        }
        /*Set X and Y Speed of Velocity*/
        this.car.body.velocity.x = this.calculateVelocity(true);
        this.car.body.velocity.y = this.calculateVelocity(false);

        /*Rotation of Car*/
        if (this.controls.left.isDown) {
            this.car.body.angularVelocity = -5 * (this.velocity / 10);
        }
        else if (this.controls.right.isDown) {
            this.car.body.angularVelocity = 5 * (this.velocity / 10);
        }
        else{
            this.car.body.angularVelocity = 0;
        }

    }


}
