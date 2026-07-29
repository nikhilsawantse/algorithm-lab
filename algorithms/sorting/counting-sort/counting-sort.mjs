export function countingSort(numbers) {
  if (numbers.some((value) => !Number.isInteger(value))) {
    throw new TypeError("Counting Sort requires integer values");
  }
  if (numbers.length === 0) return [];

  const minimum = Math.min(...numbers);
  const maximum = Math.max(...numbers);
  const counts = Array(maximum - minimum + 1).fill(0);

  for (const value of numbers) counts[value - minimum] += 1;
  for (let index = 1; index < counts.length; index += 1) {
    counts[index] += counts[index - 1];
  }

  const output = Array(numbers.length);
  for (let index = numbers.length - 1; index >= 0; index -= 1) {
    const value = numbers[index];
    counts[value - minimum] -= 1;
    output[counts[value - minimum]] = value;
  }
  return output;
}
