export default class LoaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoaderScene' })
    }

    preload() {
        this.load.font("Jua", "assets/fonts/Jua.ttf")
        this.load.audio('audio1', 'music/audio1.mp3')
    }

    create() {
        this.game.scene.switch(this, "TitleScene")
    }
}