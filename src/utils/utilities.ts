export function arrayInsertsAt<T, K>(array: T[], positions: number, insertItems: K): Array<T | K>;
export function arrayInsertsAt<T, K>(array: T[], positions: number[], insertItems: K[]): Array<T | K>;
export function arrayInsertsAt<T, K>(array: T[], positions: number | number[], insertItems: K | K[]): Array<T | K> {
  const result: Array<T | K> = [];
  const isArray = Array.isArray(positions);

  if (isArray !== Array.isArray(insertItems)) {
    throw new Error("Positions and insertItems must be of the same type");
  }

  let posIndex = 0;
  let arrayIndex = 0;

  if (isArray) {
    const positionsArr = positions as number[];
    const itemsArr = insertItems as K[];

    for (let i = 0; i <= array.length; i++) {
      if (posIndex < positionsArr.length && i === positionsArr[posIndex]) {
        result.push(itemsArr[posIndex]);
        posIndex++;
      }
      if (arrayIndex < array.length) {
        result.push(array[arrayIndex]);
        arrayIndex++;
      }
    }
  } else {
    const pos = positions as number;
    const item = insertItems as K;

    for (let i = 0; i < array.length; i++) {
      if (i === pos) {
        result.push(item);
      }
      result.push(array[i]);
    }
    if (pos >= array.length) {
      result.push(item);
    }
  }

  return result;
}
