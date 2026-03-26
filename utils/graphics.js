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