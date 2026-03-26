import { analyseTrack } from "../utils/audio.js";

export default class GameScene extends Phaser.Scene {
    /** @type {boolean} */
    playing = false;

    /** @type {AudioEvent[]} */
    eventData = [];

    constructor() {
        super({ key: 'GameScene' })
    }

    preload() {}

    async create() {
        // set up game objects here
        const raw = this.cache.audio.get('audio1');
        this.eventData = await analyseTrack(raw);
    }
    
    update() {
        // runs every frame — your game loop
        const sound = /** @type {Phaser.Sound.WebAudioSoundManager} */ (this.sound);

        if (sound.context.state === 'running' && !this.playing) {
            this.playing = true;
            sound.play('audio1');
        }
    }
}