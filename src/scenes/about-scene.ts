
const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'AboutScene'
};

export class AboutScene extends Phaser.Scene {
    title = null;
    constructor() {
        super(sceneConfig);
    }
    public preload() {
    }
    public create() {
        this.scene.setVisible(false);

        this.createTitle();
    }
    private createTitle() {
        const title = this.make.text({
            x: this.cameras.main.centerX,
            y: 100,
            text: 'About',
            style: {
                font: 'bold 60pt Curier',
                fill: '#FDFFB5',
            },
        });
        title.setShadow(3, 3, 'rgba(0, 0, 0, 0.5)', 5);
        title.setOrigin(0.5, 0.5)
    }
}

