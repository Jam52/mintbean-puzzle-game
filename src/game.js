import Phaser from 'phaser';
import MainScene from './MainScene';

let config = {
  type: Phaser.AUTO, // Phaser will use WebGL if available, if not then will use Canvas
  width: 640,
  height: 360,
  parent: 'game',
  scene: [MainScene],
  disableContextMenu: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
};

// create a new game, pass the configuration
let game = new Phaser.Game(config);
