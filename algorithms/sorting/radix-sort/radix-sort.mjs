export function radixSort(numbers) {
  if (numbers.some((value) => !Number.isSafeInteger(value))) {
    throw new TypeError("Radix Sort requires safe integer values");
  }
  if (numbers.length === 0) return [];

  const minimum = Math.min(...numbers);
  const offset = minimum < 0 ? -minimum : 0;
  let array = numbers.map((value) => value + offset);
  if (array.some((value) => !Number.isSafeInteger(value))) {
    throw new RangeError("Shifted keys must remain safe integers");
  }

  const maximum = Math.max(...array);
  for (let place = 1; Math.floor(maximum / place) > 0; place *= 10) {
    const counts = Array(10).fill(0);
    for (const value of array) counts[Math.floor(value / place) % 10] += 1;
    for (let digit = 1; digit < 10; digit += 1) counts[digit] += counts[digit - 1];

    const output = Array(array.length);
    for (let index = array.length - 1; index >= 0; index -= 1) {
      const digit = Math.floor(array[index] / place) % 10;
      counts[digit] -= 1;
      output[counts[digit]] = array[index];
    }
    array = output;
    if (place > Math.floor(maximum / 10)) break;
  }

  return array.map((value) => value - offset);
}
