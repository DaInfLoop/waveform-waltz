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

    const [rawBassL, rawBassR] = await extractBand(audioBuffer, 'lowpass', 200);
    const [rawMidL,  rawMidR] = await extractBand(audioBuffer, 'bandpass', 1000);
    const [rawTrebL, rawTrebR] = await extractBand(audioBuffer, 'highpass', 3000);

    const HOP = 512;

    const events = [];
    for (let i = 0; i < length - HOP; i += HOP) {
        const time = i / sampleRate;

        const ampL = rms(rawL, i, HOP);
        const ampR = rms(rawR, i, HOP);
        const ampAvg = (ampL + ampR)/2;

        const bassL = rms(rawBassL, i, HOP);
        const bassR = rms(rawBassR, i, HOP);
        const bassAvg = (bassL + bassR)/2;

        const midL = rms(rawMidL, i, HOP);
        const midR = rms(rawMidR, i, HOP);
        const midAvg = (midL + midR)/2;

        const trebL = rms(rawTrebL, i, HOP);
        const trebR = rms(rawTrebR, i, HOP);
        const trebAvg = (trebL + trebR)/2;

        const prev = events[events.length - 1];

        const deltaBass = prev ? Math.max(0, bassAvg - prev.bass.avg) : 0;
        const deltaMid = prev ? Math.max(0, midAvg - prev.mid.avg) : 0;
        const deltaTreb = prev ? Math.max(0, trebAvg - prev.treble.avg) : 0;

        const isBassPeak = deltaBass > 0.01;
        const isMidPeak  = deltaMid  > 0.008;
        const isTrebPeak = deltaTreb > 0.005;

        events.push({
            time,
            amp: {
                L: ampL,
                R: ampR,
                avg: ampAvg
            },
            bass: {
                L: bassL,
                R: bassR,
                avg: bassAvg
            },
            mid: {
                L: midL,
                R: midR,
                avg: midAvg
            },
            treble: {
                L: trebL,
                R: trebR,
                avg: trebAvg
            },
            delta: {
                bass: deltaBass,
                mid: deltaMid,
                treble: deltaTreb
            },
            peaks: {
                bass: isBassPeak,
                mid: isMidPeak,
                treble: isTrebPeak
            },
            pan: ampL - ampR,
        });
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

/**
 * Estimate the BPM of a track from analysed events.
 * **This function was generated with AI help.**
 * @param {AudioEvent[]} events - The array of analysed events
 * @returns {number} Estimated BPM
 */
export function estimateBPM(events) {
    if (events.length < 2) return 0;

    // Step 1: Compute a simple onset signal (weighted deltas)
    const onsetSignal = events.map(e =>
        e.delta.bass * 1.5 + e.delta.mid * 1.0 + e.delta.treble * 0.7
    );

    const smoothed = [];
    const w = 3; // simple moving average window
    for (let i = 0; i < onsetSignal.length; i++) {
        let sum = 0, count = 0;
        for (let j = -w; j <= w; j++) {
            if (i + j >= 0 && i + j < onsetSignal.length) {
                sum += onsetSignal[i+j];
                count++;
            }
        }
        smoothed.push(sum / count);
    }

    // Step 2: Detect peaks in the onset signal
    const threshold = 0.05; // tweak if too many/few peaks
    const peaks = [];
    for (let i = 1; i < smoothed.length - 1; i++) {
        if (
            smoothed[i] > threshold &&
            smoothed[i] > smoothed[i - 1] &&
            smoothed[i] > smoothed[i + 1]
        ) {
            peaks.push(events[i].time);
        }
    }

    if (peaks.length < 2) return 0;

    // Step 3: Compute intervals between consecutive peaks
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
        const interval = peaks[i] - peaks[i-1];
        if (interval >= 0.25) { // ignore anything faster than 240ms (~250 BPM)
            intervals.push(interval);
        }
    }

    // Step 4: Find the most common interval (dominant beat)
    const mostCommonInterval = (() => {
        const binSize = 0.01; // 10ms bins
        const counts = {};
        intervals.forEach(v => {
            const key = Math.round(v / binSize) * binSize;
            counts[key] = (counts[key] || 0) + 1;
        });
        return Number(
            Object.entries(counts)
                .sort((a, b) => b[1] - a[1])[0][0]
        );
    })();

    // Step 5: Convert interval to BPM
    let bpm = 60 / mostCommonInterval;

    // // Optional adjustment: sometimes BPM is double/half
    if (bpm < 60) bpm *= 2;
    else if (bpm > 200) bpm /= 2;

    return Math.round(bpm);
}