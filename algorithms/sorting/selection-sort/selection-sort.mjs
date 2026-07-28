/**
 * Return a sorted copy of the input using Selection Sort.
 * The original array is never mutated.
 */
export function selectionSort(numbers) {
  const array = [...numbers];

  for (let boundary = 0; boundary < array.length - 1; boundary += 1) {
    let minIndex = boundary;

    for (let index = boundary + 1; index < array.length; index += 1) {
      if (array[index] < array[minIndex]) minIndex = index;
    }

    if (minIndex !== boundary) {
      [array[boundary], array[minIndex]] = [array[minIndex], array[boundary]];
    }
  }

  return array;
}
