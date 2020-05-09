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
    constructor() {
        super(sceneConfig);
    }
    public preload() {
        this.load.image('tileset', '/assets/tileMap/tilesheet.png');
        this.load.tilemapTiledJSON('map', '/assets/tileMap/MarsThePlanet.json');
        this.load.image('car','assets/car.png');
    }
    public create() {
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('tileset', 'tileset');
        const ground = map.createStaticLayer('ground', tileset, 0, 0);
        const rocks = map.createStaticLayer('rocks', tileset, 0, 0);
        rocks.setCollisionByExclusion([-1]);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.car = this.physics.add.sprite(570,100,'car');
        this.car.body.rotation = 1;

        const camera = this.cameras.main;
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        camera.startFollow(this.car);
        camera.roundPixels = true;
        rocks.setCollisionBetween(1, 50);
        this.physics.add.collider(this.car, rocks);
        // Set up the arrows to control the camera
        this.controls = this.input.keyboard.createCursorKeys();
    }

    public update(time, delta) {
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
        this.car.body.velocity.x = this.velocity * Math.cos((this.car.angle - 90) * 0.01745);
        this.car.body.velocity.y = this.velocity * Math.sin((this.car.angle - 90) * 0.01745);
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
