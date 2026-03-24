const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
    // load assets here
}

function create() {
    // set up game objects here    
}

function update() {
    // runs every frame — your game loop
}