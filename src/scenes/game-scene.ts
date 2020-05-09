const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Game',
    physics: {
        matter: {
            debug: true
        }
    }
    };
  
export class GameScene extends Phaser.Scene {
    controls;
    constructor() {
        super(sceneConfig);
    }
    public preload() {
        console.log('preloading');
        this.load.image('tileset', '/assets/tileMap/tilesheet.png');
        this.load.tilemapTiledJSON('map', '/assets/tileMap/MarsThePlanet.json');
        // this.load.audio('background_music', ['assets/audio/bg.ogg', 'assets/audio/bg.ogg']);
    }
    public create() {
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('tileset', 'tileset');
        const ground = map.createStaticLayer('ground', tileset, 0, 0);
        const rocks = map.createStaticLayer('rocks', tileset, 0, 0);
        const camera = this.cameras.main;

        // const music = this.sound.add('background_music');
        // music.play();

        // Set up the arrows to control the camera
        const cursors = this.input.keyboard.createCursorKeys();
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: camera,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.5
        });
    }

    public update(time, delta) {
        // TODO
        this.controls.update(delta);
    }
}
