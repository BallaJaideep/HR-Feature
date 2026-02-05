export function calculateBPM(beats, durationSeconds) {
  if (durationSeconds === 0) return 0;
  return Math.round((beats / durationSeconds) * 60);
}
