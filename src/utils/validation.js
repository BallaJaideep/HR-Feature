export function validateHeartRate(bpm, signalLength) {
  if (signalLength < 100) return { valid: false, message: "Measuring..." };

  if (bpm < 40 || bpm > 180) {
    return { valid: false, message: "Unstable reading, try again" };
  }

  return { valid: true, message: "Stable" };
}
