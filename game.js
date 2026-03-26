import LoaderScene from './scenes/LoaderScene.js';
import GameScene from './scenes/GameScene.js';

/** @type {Phaser.Types.Core.GameConfig} */
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [LoaderScene, GameScene]
};

const game = new Phaser.Game(config);