import {GameScene} from "./scenes/game-scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Game Dev',
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    scene: [
        GameScene,
    ],
    scale: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      },
    },
    parent: 'game-container',
    backgroundColor: '#EBCAB3'
  };
