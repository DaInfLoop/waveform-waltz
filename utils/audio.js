/**
  * @typedef {Object} BandData
  * @property {number} L   - Left channel amplitude (0–1)
  * @property {number} R   - Right channel amplitude (0–1)
  * @property {number} avg - Average amplitude
  */

/**
  * @typedef {Object} AudioEvent
  * @property {number}   time   - Timestamp in seconds
  * @property {BandData} amp    - Full-range amplitude
  * @property {BandData} bass   - Bass frequency
  * @property {BandData} mid    - Mid frequency
  * @property {BandData} treble - Treble frequency
  * @property {number}   pan    - Audio panning
  */


/**
  * Analyse an audio buffer.
  * @param {AudioBuffer} audioBuffer - Audio buffer to analyse
  * @returns {Promise<AudioEvent[]>} Array of audio events
  */
export async function analyseTrack(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    const rawL = audioBuffer.getChannelData(0);
    const rawR = audioBuffer.numberOfChannels > 1
        ? audioBuffer.getChannelData(1)
        : rawL;

    const [rawBassL, rawBassR] = await extractBand(audioBuffer, 'lowshelf', 200);
    const [rawMidL,  rawMidR] = await extractBand(audioBuffer, 'bandpass', 1000);
    const [rawTrebL, rawTrebR] = await extractBand(audioBuffer, 'highshelf', 4000);

    const HOP = 2048;
    const MIN_GAP = 0.4;

    const events = [];
    let lastTime = -MIN_GAP;

    for (let i = 0; i < length - HOP; i += HOP) {
        const time = i / sampleRate;
        if (time - lastTime < MIN_GAP) continue;

        const ampL = rms(rawL, i, HOP);
        const ampR = rms(rawR, i, HOP);

        const bassL = rms(rawBassL, i, HOP);
        const bassR = rms(rawBassR, i, HOP);

        const midL = rms(rawMidL, i, HOP);
        const midR = rms(rawMidR, i, HOP);

        const trebL = rms(rawTrebL, i, HOP);
        const trebR = rms(rawTrebR, i, HOP);

        events.push({
            time,
            amp: {
                L: ampL,
                R: ampR,
                avg: (ampL + ampR) / 2
            },
            bass: {
                L: bassL,
                R: bassR,
                avg: (bassL + bassR) / 2
            },
            mid: {
                L: midL,
                R: midR,
                avg: (midL + midR) / 2
            },
            treble: {
                L: trebL,
                R: trebR,
                avg: (trebL + trebR) / 2
            },            
            pan: ampL - ampR,
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

async function extractBand(audioBuffer, type, frequency) {
    const ctx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;

    source.connect(filter);
    filter.connect(ctx.destination);
    source.start(0);

    const rendered = await ctx.startRendering();
    const L = rendered.getChannelData(0);
    const R = rendered.numberOfChannels > 1
        ? rendered.getChannelData(1)
        : L;

    return [L, R];
}