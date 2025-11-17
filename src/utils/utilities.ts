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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function empty(value: number | string | object | any[] | null | undefined): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === "number") {
    return isNaN(value) || !isFinite(value);
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}
