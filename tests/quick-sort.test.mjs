import assert from "node:assert/strict";
import test from "node:test";
import { quickSort } from "../algorithms/sorting/quick-sort/quick-sort.mjs";

const cases = [
  { name: "empty input", input: [], expected: [] },
  { name: "single value", input: [7], expected: [7] },
  { name: "already sorted", input: [1, 2, 3, 4, 5], expected: [1, 2, 3, 4, 5] },
  { name: "reverse order", input: [5, 4, 3, 2, 1], expected: [1, 2, 3, 4, 5] },
  { name: "duplicates", input: [4, 2, 4, 1], expected: [1, 2, 4, 4] },
  { name: "negative values", input: [-2, 5, -8, 0], expected: [-8, -2, 0, 5] },
];

for (const { name, input, expected } of cases) {
  test(`Quick Sort handles ${name}`, () => {
    const original = [...input];
    assert.deepEqual(quickSort(input), expected);
    assert.deepEqual(input, original, "input should not be mutated");
  });
}

test("Quick Sort agrees with the platform sort oracle for deterministic random inputs", () => {
  let seed = 71;
  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return seed;
  };

  for (let round = 0; round < 30; round += 1) {
    const input = Array.from({ length: 12 }, () => (next() % 101) - 50);
    assert.deepEqual(quickSort(input), [...input].sort((a, b) => a - b));
  }
});
