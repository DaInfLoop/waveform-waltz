/** @import { AudioEvent } from '../utils/audio.js' */
import { analyseTrack } from "../utils/audio.js";

export default class GameScene extends Phaser.Scene {
    /** @type {boolean} Whether the track has started playing */
    playing = false;

    /** @type {AudioEvent[]} Obstacle events */
    eventData = [];

    constructor() {
        super({ key: 'GameScene' })
    }

    preload() {
        this.load.audio('audio1', './music/audio1.mp3')
    }

    async create() {
        // set up game objects here
        const raw = this.cache.audio.get('audio1');
        this.eventData = await analyseTrack(raw);
    }
    
    update() {
        // runs every frame — your game loop
        if (this.sound.context.state === 'running' && !this.playing) {
            this.playing = true;
            this.sound.play('audio1');
        }
    }
}