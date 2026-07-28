function merge(left, right) {
  const output = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) output.push(left[leftIndex++]);
    else output.push(right[rightIndex++]);
  }

  return output.concat(left.slice(leftIndex), right.slice(rightIndex));
}

/** Return a stable sorted copy of the input using Merge Sort. */
export function mergeSort(numbers) {
  if (numbers.length <= 1) return [...numbers];
  const middle = Math.floor(numbers.length / 2);
  const left = mergeSort(numbers.slice(0, middle));
  const right = mergeSort(numbers.slice(middle));
  return merge(left, right);
}
