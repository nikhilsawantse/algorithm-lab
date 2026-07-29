export function heapSort(numbers) {
  const array = [...numbers];

  for (let root = Math.floor(array.length / 2) - 1; root >= 0; root -= 1) {
    siftDown(array, root, array.length);
  }

  for (let end = array.length - 1; end > 0; end -= 1) {
    [array[0], array[end]] = [array[end], array[0]];
    siftDown(array, 0, end);
  }

  return array;
}

function siftDown(array, root, size) {
  while (2 * root + 1 < size) {
    const left = 2 * root + 1;
    const right = left + 1;
    let largest = left;

    if (right < size && array[right] > array[left]) largest = right;
    if (array[root] >= array[largest]) return;

    [array[root], array[largest]] = [array[largest], array[root]];
    root = largest;
  }
}
