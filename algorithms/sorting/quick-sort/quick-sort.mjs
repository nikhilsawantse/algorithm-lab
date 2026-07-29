function partition(array, start, end) {
  const pivot = array[end];
  let boundary = start;

  for (let scan = start; scan < end; scan += 1) {
    if (array[scan] <= pivot) {
      [array[boundary], array[scan]] = [array[scan], array[boundary]];
      boundary += 1;
    }
  }

  [array[boundary], array[end]] = [array[end], array[boundary]];
  return boundary;
}

function sortRange(array, start, end) {
  if (start >= end) return;
  const pivotIndex = partition(array, start, end);
  sortRange(array, start, pivotIndex - 1);
  sortRange(array, pivotIndex + 1, end);
}

/** Return a sorted copy of the input using Quick Sort. */
export function quickSort(numbers) {
  const array = [...numbers];
  sortRange(array, 0, array.length - 1);
  return array;
}
