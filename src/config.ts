import {GameScene} from "./scenes/game-scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Sample',
   
    type: Phaser.WEBGL,
   
    scene: GameScene,

    scale: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
   
    physics: {
      default: 'arcade',
      arcade: {
        debug: true,
      },
    },
   
    parent: 'game',
    backgroundColor: '#fff',
  };
