export function smoothSignal(signal, window = 5) {
  return signal.map((_, i) => {
    const start = Math.max(0, i - window);
    const slice = signal.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

