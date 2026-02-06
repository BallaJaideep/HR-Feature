export function extractSignal(frame) {
  const d = frame.data;
  let r = 0, g = 0, b = 0, c = 0;

  for (let i = 0; i < d.length; i += 4) {
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
    c++;
  }

  const avgR = r / c;
  const avgG = g / c;
  const avgB = b / c;

  const redDominance = avgR - (avgG + avgB) / 2;

  const fingerPresent = avgR > 150 && redDominance > 20;

  return { value: redDominance, fingerPresent };
}
