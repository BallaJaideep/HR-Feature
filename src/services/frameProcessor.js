export function getAverageRed(frameData) {
  const data = frameData.data;
  let redSum = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    redSum += data[i]; // red channel
    count++;
  }

  return redSum / count;
}
