export function calculateBPM(peakTimes) {
  if (peakTimes.length < 15) return null;

  const intervals = [];
  for (let i = 1; i < peakTimes.length; i++) {
    intervals.push((peakTimes[i] - peakTimes[i - 1]) / 1000);
  }

  const first10 = intervals.slice(0, 10);
  const last5 = intervals.slice(-5);

  const avg1 = first10.reduce((a, b) => a + b, 0) / first10.length;
  const avg2 = last5.reduce((a, b) => a + b, 0) / last5.length;

  const ibi = (avg1 + avg2) / 2;
  return Math.round(60 / ibi);
}
