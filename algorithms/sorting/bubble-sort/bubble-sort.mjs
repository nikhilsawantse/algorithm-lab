/**
 * Return a sorted copy of the input using optimized Bubble Sort.
 * The original array is never mutated.
 */
export function bubbleSort(numbers) {
  const array = [...numbers];

  for (let pass = 0; pass < array.length - 1; pass += 1) {
    let swapped = false;

    for (let index = 0; index < array.length - pass - 1; index += 1) {
      if (array[index] > array[index + 1]) {
        [array[index], array[index + 1]] = [array[index + 1], array[index]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return array;
}
