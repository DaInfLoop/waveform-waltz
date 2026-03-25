/**
  * @typedef {Object} AudioEvent
  * @property {number}   time    - Timestamp in seconds
  * @property {number}   ampL    - Amplitude for the left channel
  * @property {number}   ampR    - Amplitude for the left channel
  * @property {number}   ampMean - Amplitude for the left channel
  * @property {number}   pan     - Audio panning
  */

/**
  * Analyse an audio buffer.
  * @param {AudioBuffer} audioBuffer - Audio buffer to analyse
  * @returns {Promise<AudioEvent[]>} Array of audio events
  */
export async function analyseTrack(audioBuffer) {
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