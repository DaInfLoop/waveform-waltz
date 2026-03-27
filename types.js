/**
  * @typedef {Object} BandData
  * @property {number} L   - Left channel amplitude (0–1)
  * @property {number} R   - Right channel amplitude (0–1)
  * @property {number} avg - Average amplitude
  */

/**
 * @typedef {Object} BandDeltas
 * @property {number} bass
 * @property {number} mid
 * @property {number} treble
 */

/**
 * @typedef {Object} BandPeaks
 * @property {boolean} bass
 * @property {boolean} mid
 * @property {boolean} treble
 */

/**
  * @typedef {Object} AudioEvent
  * @property {number}     time   - Timestamp in seconds
  * @property {BandData}   amp    - Full-range amplitude
  * @property {BandData}   bass   - Bass frequency
  * @property {BandData}   mid    - Mid frequency
  * @property {BandData}   treble - Treble frequency
  * @property {BandDeltas} delta  - Changes since last event
  * @property {BandPeaks}  peaks  - Where a peak in amplitude is detected
  * @property {number}     pan    - Audio panning
  */