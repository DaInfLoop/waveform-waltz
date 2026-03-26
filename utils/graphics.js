/**
 * @typedef {Object} ButtonTweenData
 * @property {number} y
 * @property {number} w
 */

/**
  * Draw text to the screen. Why does this need to be a
  * util function? Because you can't set defaults :p
  * @param {Phaser.Scene} scene     - The current Phaser scene
  * @param {number}       x         - x-coordinate of text origin
  * @param {number}       y         - y-coordinate of text origin
  * @param {string}       text      - the actual text to draw
  * @param {string?}      fontSize  - font size to draw at (default: 16px)
  * @param {string?}      textColor - the colour to draw the text (default: #FFFFFF)
  * @param {Phaser.Types.GameObjects.Text.TextStyle?} opts - Other text options
  * @returns {Phaser.GameObjects.Text} The text object
  */
export function drawText(scene, x, y, text, fontSize = "16px", textColor = "#FFFFFF", opts = {}) {
    return scene.add.text(x, y, text, {
        fontFamily: `Jua`,
        fontSize,
        color: textColor,
        ...opts
    })
}

/**
  * Draw a button to the screen.
  * @param {Phaser.Scene} scene     - The current Phaser scene
  * @param {number}       x         - x-coordinate of button origin
  * @param {number}       y         - y-coordinate of button origin
  * @param {string}       label      - button label
  * @param {Function}     onClick   - click handler
  * @returns {Phaser.GameObjects.Container} The container with all the button elements
  */
export function drawButton(scene, x, y, label, onClick) {
    const paddingX = 64;
    const paddingY = 16;
    const cornerRadius = 12;

    const text = drawText(scene, 0, 0, label, "2rem");

    text.setOrigin(0.5);

    const textOutlineGrad = text.context.createLinearGradient(
        0, 0,
        text.width, 0
    );
    textOutlineGrad.addColorStop(0, "#6EF5FB");
    textOutlineGrad.addColorStop(1, "#938BEC");

    const textFillGrad = text.context.createLinearGradient(
        0, 0,
        0, text.height
    );
    textFillGrad.addColorStop(0, "#3E236D");
    textFillGrad.addColorStop(1, "#42518E");

    text.setFill(textFillGrad);
    text.setStroke(textOutlineGrad, 4);
    text.updateText();

    // outline = linear-gradient(to right in oklab, rgb(112, 255, 255) 0%, rgb(84, 193, 215) 100%)

    const width = text.width + paddingX * 2;
    const height = text.height + paddingY * 2;

    const bg = scene.add.graphics();

    bg.fillStyle(0x1B2A42, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    bg.lineStyle(8, 0x70FFFF);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);

    bg.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains,
    );
    bg.setData('width', width);
    bg.setData('height', height);

    bg.input.cursor = "pointer";

    const container = scene.add.container(x, y, [bg, text]);

    container.angle = -1.5;


    const TWEEN_TIME_MS = 75

    bg.on("pointerover", () => {
        scene.tweens.add({
            targets: container,
            y: y - 8,
            angle: 0,
            duration: TWEEN_TIME_MS,
            ease: 'Sine.easeOut',         
        });
    });
    
    bg.on("pointerout", () => {
        if (container.scale == 0.95) container.setScale(1);
        scene.tweens.add({
            targets: container,
            y,
            angle: -1.5,
            duration: TWEEN_TIME_MS,
            ease: 'Sine.easeIn'        
        });
    });

    bg.on("pointerdown", () => {
        container.setScale(0.95);
    });

    bg.on("pointerup", () => {
        container.setScale(1);
        onClick();
    });

    return container;    
}