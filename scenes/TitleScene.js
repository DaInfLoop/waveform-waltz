import { drawButton, drawText } from "../utils/graphics.js"

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' })
    }

    preload() {}

    create() {
        const { width, height } = this.scale;

        const graphics = this.add.graphics();
    
        graphics.fillStyle(0xC57FF8, 1);
        graphics.fillRect(0, 0, width, height);

        const t1 = drawText(this, 0, (height / 2) - 120, "Waveform", "4rem");
        const t2 = drawText(this, 0, (height / 2) - 72, "Waltz", "4rem");

        const gradient = t1.context.createLinearGradient(
            0, 0,
            0, t1.height
        );
        gradient.addColorStop(0, "#3E236D");
        gradient.addColorStop(1, "#4470A4");

        t1.setFill(gradient);
        t1.setStroke("#FFFFFF", 16);
        t1.angle = -2.5
        t1.updateText();

        t1.setX((width - t1.width - 128) * (1/2));

        t2.setFill(gradient);
        t2.setStroke("#FFFFFF", 16);
        t2.angle = 2.5
        t2.updateText();

        t2.setX((width - t2.width + 128) * (1/2));        

        drawButton(this, width / 2, (height / 2) + 76.8, "start", () => {
            this.game.scene.switch(this, "GameScene")
        });
    }
}