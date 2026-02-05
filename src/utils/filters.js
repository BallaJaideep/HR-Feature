export function movingAverage(signal, windowSize = 5) {
  if (signal.length < windowSize) return signal;

  let smoothed = [];

  for (let i = 0; i < signal.length; i++) {
    let start = Math.max(0, i - windowSize);
    let subset = signal.slice(start, i);
    let avg = subset.reduce((a, b) => a + b, 0) / subset.length;
    smoothed.push(avg);
  }

  return smoothed;
}

