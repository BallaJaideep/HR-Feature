export function validateHR(bpm, finger) {
  if (!finger) return "Place finger properly";
  if (!bpm) return "Measuring…";
  if (bpm < 40 || bpm > 180) return "Unstable signal";
  return "Stable reading";
}
