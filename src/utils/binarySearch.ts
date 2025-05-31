export function binarySearch<T>(array: T[], compareFn: (element: T) => number) {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compareFn(array[mid]);

    if (comparison === 0) {
      return array[mid]; // Found the target
    } else if (comparison < 0) {
      left = mid + 1; // Target is in the right half
    } else {
      right = mid - 1; // Target is in the left half
    }
  }

  return undefined; // Target not found
}
