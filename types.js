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