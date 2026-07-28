import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const bubbleSortLesson = defineLesson({
  slug: "bubble-sort",
  name: "Bubble Sort",
  lessonNumber: 1,
  track: "Sorting",
  category: "sorting",
  difficulty: "Beginner",
  description: "Compare adjacent values and watch the largest unsorted item rise into place.",
  metadataDescription: "Learn Bubble Sort with a step-by-step visualizer, curated examples, tested JavaScript, Python, Java, and C++ code, and an adjacent-swap challenge.",
  hero: {
    eyebrow: "Sorting algorithms, made visible",
    title: "See every swap.",
    emphasis: "Understand every pass.",
    introduction: "Bubble Sort repeatedly compares neighbors and moves the larger value right — like a bubble rising to the surface.",
    keyIdea: "After one full pass, the largest unsorted value reaches its final position.",
  },
  mentalModel: {
    title: "How Bubble Sort thinks",
    question: "It only needs one question: “Are these two neighbors in the right order?”",
    steps: [
      { title: "Compare neighbors", description: "Start on the left and inspect two adjacent values." },
      { title: "Swap when needed", description: "If the left value is larger, exchange their positions." },
      { title: "Repeat each pass", description: "Continue until a whole pass finishes with no swaps." },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Explain why each pass places one value in its final position.",
      "Trace comparisons and swaps without running the code.",
      "Implement the optimized algorithm in JavaScript, Python, Java, or C++.",
      "Recognize when Bubble Sort is stable, useful, or too slow.",
    ],
    prerequisites: [
      "Arrays and zero-based indexes",
      "Loops and simple conditions",
      "Big O basics from the glossary",
    ],
    mistakes: [
      {
        title: "Comparing beyond the unsorted region",
        symptom: "Every pass scans the entire array again.",
        correction: "Stop before the values already locked at the right edge.",
      },
      {
        title: "Using ≥ instead of >",
        symptom: "Equal values can cross and stability is lost.",
        correction: "Swap only when the left value is strictly greater.",
      },
      {
        title: "Forgetting the early exit",
        symptom: "An already sorted array still takes quadratic time.",
        correction: "Track whether a pass swapped anything and stop when it did not.",
      },
      {
        title: "Returning the wrong array",
        symptom: "The function unexpectedly mutates the caller's input.",
        correction: "Copy the input first when the function promises a new sorted array.",
      },
    ],
    quiz: [
      {
        id: "pass-result",
        prompt: "What is guaranteed after one complete left-to-right pass?",
        options: [
          "The whole array is sorted",
          "The largest unsorted value reaches its final position",
          "The smallest value reaches index 0",
        ],
        correctOption: 1,
        explanation: "Neighbor swaps move the largest unsorted value right until nothing larger remains after it.",
      },
      {
        id: "best-case",
        prompt: "With the early-exit flag, what is the best-case time complexity?",
        options: ["O(1)", "O(n)", "O(n²)"],
        correctOption: 1,
        explanation: "One pass checks n − 1 neighbor pairs, sees no swaps, and exits.",
      },
      {
        id: "stability",
        prompt: "Which comparison preserves the order of equal values?",
        options: ["Swap when left > right", "Swap when left ≥ right", "Always swap equal values"],
        correctOption: 0,
        explanation: "Using a strict greater-than comparison prevents equal values from crossing.",
      },
      {
        id: "first-swap",
        prompt: "Starting with [3, 1, 2], what follows the first comparison?",
        options: ["[1, 3, 2]", "[3, 2, 1]", "[1, 2, 3]"],
        correctOption: 0,
        explanation: "The first neighbors are 3 and 1, so they swap before the algorithm moves right.",
      },
    ],
  },
  examples: [
    {
      id: "sorted",
      type: "Best case",
      title: "Already sorted",
      values: [1, 2, 3, 4, 5],
      description: "One clean pass triggers the early exit.",
      result: "1 pass | 4 comparisons | 0 swaps",
    },
    {
      id: "reverse",
      type: "Worst case",
      title: "Reverse order",
      values: [5, 4, 3, 2, 1],
      description: "Every neighbor begins in the wrong order.",
      result: "4 passes | 10 comparisons | 10 swaps",
    },
    {
      id: "nearly",
      type: "Practical case",
      title: "Nearly sorted",
      values: [1, 2, 4, 3, 5],
      description: "A single misplaced pair is repaired quickly.",
      result: "2 passes | 7 comparisons | 1 swap",
    },
    {
      id: "duplicates",
      type: "Stability case",
      title: "Duplicate values",
      values: [4, 2, 4, 1],
      description: "Watch 4A remain before 4B after sorting.",
      result: "3 passes | 6 comparisons | 4 swaps",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "bubble-sort.mjs",
      highlight: [7, 8, 9],
      code: `function bubbleSort(numbers) {
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
}`,
    },
    python: {
      label: "Python",
      filename: "bubble_sort.py",
      highlight: [6, 7, 8],
      code: `def bubble_sort(numbers):
    array = numbers.copy()

    for last in range(len(array) - 1, 0, -1):
        swapped = False

        for index in range(last):
            if array[index] > array[index + 1]:
                array[index], array[index + 1] = array[index + 1], array[index]
                swapped = True

        if not swapped:
            break

    return array`,
    },
    java: {
      label: "Java",
      filename: "BubbleSort.java",
      highlight: [13, 14, 15, 16, 17, 18],
      code: `import java.util.Arrays;

public final class BubbleSort {
    private BubbleSort() {
    }

    public static int[] bubbleSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int pass = 0; pass < array.length - 1; pass++) {
            boolean swapped = false;

            for (int i = 0; i < array.length - pass - 1; i++) {
                if (array[i] > array[i + 1]) {
                    int temporary = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temporary;
                    swapped = true;
                }
            }

            if (!swapped) break;
        }

        return array;
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "bubble_sort.cpp",
      highlight: [10, 11, 12, 13, 14],
      code: `#include <vector>

std::vector<int> bubbleSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;

    for (std::size_t pass = 0; pass + 1 < array.size(); ++pass) {
        bool swapped = false;

        for (std::size_t i = 0; i + pass + 1 < array.size(); ++i) {
            if (array[i] > array[i + 1]) {
                const int temporary = array[i];
                array[i] = array[i + 1];
                array[i + 1] = temporary;
                swapped = true;
            }
        }

        if (!swapped) break;
    }

    return array;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(n)", context: "Already sorted" },
    average: { label: "Average case", value: "O(n²)" },
    worst: { label: "Worst case", value: "O(n²)", context: "Reverse order" },
    space: { label: "Extra space", value: "O(1)" },
    property: {
      label: "Stable sort",
      description: "Equal values keep their original relative order.",
      symbol: "✓",
      tone: "positive",
      proofLabel: "Stability proof",
      before: ["4A", "2", "4B", "1"],
      after: ["1", "2", "4A", "4B"],
      proof: "The equal fours never cross, so A remains before B.",
    },
  },
  challenge: {
    title: "Be the algorithm",
    description: "Sort the packages from smallest to largest. Just like Bubble Sort, you may only swap adjacent neighbors.",
    rule: "Select one package, then select a neighbor to swap them.",
    startValues: [7, 3, 5, 1, 6, 2, 4],
  },
  completionCriteria: [
    { id: "explain", label: "Explain the idea", description: "I can explain why one value reaches its final position after each pass." },
    { id: "trace", label: "Trace the steps", description: "I followed the visualizer or dry-run table through at least one complete example." },
    { id: "implement", label: "Read an implementation", description: "I compared the early-exit logic in at least one of the four supported languages." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and tried the adjacent-swap challenge." },
  ],
  useCases: [
    { icon: "◉", title: "Learning", description: "Its neighbor-by-neighbor logic makes sorting fundamentals easy to see and debug.", recommendation: "Great fit" },
    { icon: "≋", title: "Tiny datasets", description: "For a handful of values, clarity can matter more than performance.", recommendation: "Reasonable fit" },
    { icon: "↻", title: "Nearly sorted data", description: "With the early-exit flag, one clean pass can finish in linear time.", recommendation: "Good special case" },
    { icon: "×", title: "Large datasets", description: "Quadratic growth becomes expensive quickly. Prefer Merge Sort or Quick Sort.", recommendation: "Avoid", avoid: true },
  ],
});
