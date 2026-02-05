export function detectPeaks(signal) {
  let peaks = 0;

  for (let i = 1; i < signal.length - 1; i++) {
    if (
      signal[i] > signal[i - 1] &&
      signal[i] > signal[i + 1] &&
      signal[i] > 150   // threshold to ignore noise
    ) {
      peaks++;
    }
  }

  return peaks;
}
