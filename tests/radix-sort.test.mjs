import assert from "node:assert/strict";
import test from "node:test";
import { radixSort } from "../algorithms/sorting/radix-sort/radix-sort.mjs";

const cases = [
  { name: "empty input", input: [], expected: [] },
  { name: "single value", input: [7], expected: [7] },
  { name: "already sorted", input: [1, 2, 3, 4, 5], expected: [1, 2, 3, 4, 5] },
  { name: "reverse order", input: [500, 40, 3, 2, 1], expected: [1, 2, 3, 40, 500] },
  { name: "duplicates", input: [21, 11, 21, 12], expected: [11, 12, 21, 21] },
  { name: "negative values", input: [-12, 5, -8, 0], expected: [-12, -8, 0, 5] },
];

for (const { name, input, expected } of cases) {
  test(`Radix Sort handles ${name}`, () => {
    const original = [...input];
    assert.deepEqual(radixSort(input), expected);
    assert.deepEqual(input, original, "input should not be mutated");
  });
}

test("Radix Sort agrees with the platform sort oracle for deterministic random inputs", () => {
  let seed = 109;
  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return seed;
  };

  for (let round = 0; round < 30; round += 1) {
    const input = Array.from({ length: 12 }, () => (next() % 1001) - 500);
    assert.deepEqual(radixSort(input), [...input].sort((a, b) => a - b));
  }
});
