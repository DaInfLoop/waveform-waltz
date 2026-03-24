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
    this.load.audio('audio1', './music/audio1.mp3')
}

async function analyseTrack(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate;

    const L = audioBuffer.getChannelData(0);
    const R = audioBuffer.numberOfChannels > 1
        ? audioBuffer.getChannelData(1)
        : L;

    const HOP = 2048;
    const MIN_GAP = 0.4;

    const events = [];
    let lastTime = -MIN_GAP;

    for (let i = 0; i < L.length - HOP; i += HOP) {
        const time = i / sampleRate;
        if (time - lastTime < MIN_GAP) continue;

        const ampL = rms(L, i, HOP);
        const ampR = rms(R, i, HOP);

        events.push({
            time,
            ampL,
            ampR,
            ampMean:  (ampL + ampR) / 2,
            pan:  ampL - ampR,
        });

        lastTime = time;
    }

    return events;
}

function rms(pcm, offset, length) {
    let sum = 0;
    for (let i = offset; i < offset + length; i++) sum += pcm[i] * pcm[i];
    return Math.sqrt(sum / length);
}

async function create() {
    // set up game objects here
}

let playing;
async function update() {
    // runs every frame — your game loop
    const scene = this;

    if (scene.sound.context.state === "running") {
        if (!playing) {
            playing = true;
            scene.sound.play('audio1');

            const raw = this.cache.audio.get('audio1');
            scene.eventData = await analyseTrack(raw);
        }
    } 
}