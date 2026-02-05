import { movingAverage } from "../utils/filters";

export function processSignal(rawSignal) {
  return movingAverage(rawSignal, 8);
}
