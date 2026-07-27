# Bubble Lab

An interactive, visual introduction to Bubble Sort. This is lesson 01 in a planned series of standalone sorting-algorithm repositories.

## What you can do

- Watch every comparison, swap, pass, and sorted value.
- Enter a custom array or generate a random example.
- Play the animation or move one decision at a time.
- Read an optimized JavaScript implementation with early exit.
- Learn time/space complexity and practical use cases.
- Play an adjacent-swap conveyor challenge to think like the algorithm.

## Run locally

You need Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify the project

```bash
pnpm build
pnpm test
```

## Bubble Sort in JavaScript

```js
function bubbleSort(numbers) {
  const array = [...numbers];

  for (let pass = 0; pass < array.length - 1; pass++) {
    let swapped = false;

    for (let i = 0; i < array.length - pass - 1; i++) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return array;
}
```

## Learning path

1. Bubble Sort — this repository
2. Selection Sort
3. Insertion Sort
4. Merge Sort
5. Quick Sort
6. Heap Sort
7. Counting and Radix Sort

Each lesson will have its own visualizer, examples, complexity guide, practical use cases, and a mechanic-driven mini game.
