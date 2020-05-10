import { GridTable } from 'phaser3-rex-plugins/templates/ui/ui-components.js';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'MenuScene'
};

export class MenuScene extends Phaser.Scene {
    title = null;
    table = null;
    constructor() {
        super(sceneConfig);
    }
    public preload() {
    }
    public create() {
        this.createTitle();
        this.addMenuItems({
            'Lobby': (target) => {
                this.scene.setVisible(false, 'MenuScene');
                this.scene.setVisible(true, 'LobbyScene');
            },
            'About': (target) => {
                this.scene.setVisible(false, 'MenuScene');
                this.scene.setVisible(true, 'AboutSceene');
            },
        });
    }
    private createTitle() {
        this.make.text({
            x: this.cameras.main.centerX,
            y: 100,
            text: 'Menu',
            style: {
                font: 'bold 60pt Curier',
                fill: '#FDFFB5',
            },
        })
        .setShadow(3, 3, 'rgba(0, 0, 0, 0.5)', 5)
        .setOrigin(0.5, 0.5)
        ;
    }
    private addMenuItems(items) {
        var idx = 0;
        for (const [text, callback] of Object.entries(items)) {
            this.addMenuItem(idx, text, callback)
            ++idx;
        }
    }
    private addMenuItem(idx, text, callback) {
        const txt = this.make.text({
            x: this.cameras.main.centerX,
            y: (idx * 80) + 200,
            text: text,
            style: {
                font: '30pt TheMinion',
                fill: 'white',
                align: 'left',
                stroke: 'rgba(0,0,0,0)',
                srokeThickness: 4,
            },
        });
        const onOver = (target) => {
            txt.setFill("#FEFFD5");
            txt.setStroke("rgba(200,200,200,0.5)", 4);
        };
        const onOut = (target) => {
            txt.setFill("white");
            txt.setStroke("rgba(0,0,0,0)", 4);
        };
        txt.setStroke("rgba(0,0,0,0)", 4);
        txt.setShadow(3, 3, 'rgba(0, 0, 0, 0.5)', 5);
        txt.setOrigin(0.5, 0.5)

        txt
        .setInteractive()
        .on('pointerover', onOver)
        .on('pointerout', onOut)
        .on('pointerup', () => callback(txt))
    }
}
