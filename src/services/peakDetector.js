export function detectPeaks(signal, times) {
  const peaks = [];
  if (signal.length < 3) return peaks;

  const max = Math.max(...signal);
  const min = Math.min(...signal);
  const threshold = min + 0.6 * (max - min);

  for (let i = 1; i < signal.length - 1; i++) {
    if (
      signal[i] > threshold &&
      signal[i] > signal[i - 1] &&
      signal[i] > signal[i + 1]
    ) {
      if (
        peaks.length === 0 ||
        times[i] - peaks[peaks.length - 1] > 400
      ) {
        peaks.push(times[i]);
      }
    }
  }
  return peaks;
}


