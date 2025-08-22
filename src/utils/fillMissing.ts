const fillMissing = (arr: any[], targetSize: number) => {
  if (arr.length === 0 || targetSize <= 0) return [];
  if (arr.length >= targetSize) return arr.slice(0, targetSize);

  const result = [];
  for (let i = 0; i < targetSize; i++) {
    result.push(arr[i % arr.length]);
  }

  return result;
};

export default fillMissing;
