import {UserState} from "./UserState";
import {getLobby} from '../modules/lobby';

const lobby = getLobby();

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameScene'
};

export class GameScene extends Phaser.Scene {
    controls = null;
    velocity = 0;
    sid = null
    car = null;
    cars = {}
    carsNet = {}
    forwardPressed = false;
    backPressed = false;
    coins = null;
    coinsSound = null;
    userState: UserState;
    muteFlag = false;
    muteButton = null;
    score = null;
  
    constructor() {
        super(sceneConfig);
    }
    public preload() {
        this.load.image('tileset', '/assets/tileMap/tilesheet.png');
        this.load.tilemapTiledJSON('map', '/assets/tileMap/MarsThePlanet.json');
        this.load.image('car','assets/rover.png');
        this.load.spritesheet('coin', 'assets/coins.png', { frameWidth: 32, frameHeight: 32 });
        this.load.audio('coin-sound', ['assets/audio/coin.wav', 'assets/audio/bg.ogg']);
        this.load.image('mute_button','assets/imgs/mute.png');
        this.load.image('unmute_button','assets/imgs/unmute.png');
        this.load.audio('background_music', ['assets/audio/bg.ogg', 'assets/audio/bg.ogg']);
    }
    public create() {
	lobby.start('dmitry')
	lobby.on('hi', sid => {
		console.log('my sid: ', sid)
		this.sid = sid
	})
	lobby.on('hello', user => {
		console.log('User come', user)
	})
	lobby.on('buy', user => {
		console.log('User gone', user)
		if (user.sid in this.cars) {
			this.cars[user.sid].destroy()
			delete this.cars[user.sid]
			delete this.carsNet[user.sid]
		}
	})
	lobby.on('msg', msg => {
		switch (msg.type) {
			case 'hello':
				break;
			case 'moved':
				this.carsNet[msg.sid] = msg
				break;
		}
	})
	lobby.on('users', users => {
	})

	setInterval(() => {
		lobby.send({
			type: 'moved',
			tint: this.car.tint,
			x: this.car.x,
			y: this.car.y,
			r: this.car.rotation,
			cx: this.car.body.velocity.x,
			cy: this.car.body.velocity.y,
		})
	}, 100)

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
        this.car.body.rotation = 0;
        this.car.setCollideWorldBounds(true);
        this.car.tint = Math.random() * 0xffffff;

        const camera = this.cameras.main;
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        camera.startFollow(this.car);
        camera.roundPixels = true;
        rocks.setCollisionBetween(1, 50);
        this.physics.add.collider(this.car, rocks);
        // Set up the arrows to control the camera
        this.controls = this.input.keyboard.createCursorKeys();

        //Fixed bar on display

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

        this.score = this.add.text(30, 40, `SCORE: 0`, { font: "22px Arial", fill: "#145887", align: "center"});
        this.score.setScrollFactor(0);      
      
        const music = this.sound.add('background_music');
        music.play();
        this.muteButton = this.add.image(25, 25, 'mute_button').setInteractive()
            .on('pointerdown', () => this.updateMuteFlag());
        this.muteButton.setScrollFactor(0);
    }

    updateMuteFlag() {
        if(this.muteFlag) {
            this.muteButton.setTexture('mute_button');
        } else {
            this.muteButton.setTexture('unmute_button');
        }
        this.muteFlag = !this.muteFlag;
        this.sound.mute = this.muteFlag;
    }

    hitTheCoin(player, coin) {
        this.coinsSound.play();
        this.userState.coins ++;
        
        coin.setPosition(coin.x + Math.floor(Math.random() * this.scale.gameSize.width - coin.x), coin.y + Math.floor(Math.random() * (this.scale.gameSize.height - coin.y) ));
        coin.body.stop();
    }
    calculateVelocity(direction) {
        return direction ? this.velocity * Math.cos((this.car.angle - 90) * 0.01745) : this.velocity * Math.sin((this.car.angle - 90) * 0.01745);
    }
    public update(time, delta) {
        this.score.setText(`SCORE: ${this.userState.coins}`);
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

	for (const sid of Object.keys(this.carsNet)) {
		const carNet = this.carsNet[sid]
		if ( ! (sid in this.cars)) {
			console.log('add car for sid: ', sid)
			const car = this.add.sprite(571,105,'car');
			//car.setCollideWorldBounds(true);
			car.tint = carNet.tint
			this.cars[sid] = car
		}
		const car = this.cars[sid]
		//this.physics.moveToObject(car, carNet, 500)
		car.x = carNet.x
		car.y = carNet.y
		car.rotation = carNet.r
	}
    }


}
