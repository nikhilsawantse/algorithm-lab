/**
 * Return a sorted copy of the input using Insertion Sort.
 * The original array is never mutated.
 */
export function insertionSort(numbers) {
  const array = [...numbers];

  for (let index = 1; index < array.length; index += 1) {
    const key = array[index];
    let position = index;

    while (position > 0 && array[position - 1] > key) {
      array[position] = array[position - 1];
      position -= 1;
    }

    array[position] = key;
  }

  return array;
}
