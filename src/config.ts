import {RexUIPlugin} from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import {MenuScene} from "./scenes/menu-scene";
import {LobbyScene} from "./scenes/lobby-scene";
import {AboutScene} from "./scenes/about-scene";
import {GameScene} from "./scenes/game-scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Game Dev',
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    scene: [
        GameScene,
        LobbyScene,
        AboutScene,
        MenuScene,
    ],
    plugins: {
        scene: [
            {
                key: 'rexUI',
                plugin: RexUIPlugin,
                mapping: 'rexUI'
            },
        ],
    },
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
