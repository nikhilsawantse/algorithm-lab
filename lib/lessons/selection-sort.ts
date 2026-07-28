import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const selectionSortLesson = defineLesson({
  slug: "selection-sort",
  name: "Selection Sort",
  lessonNumber: 2,
  track: "Sorting",
  category: "sorting",
  difficulty: "Beginner",
  description: "Find the smallest remaining value and place it at the next sorted position.",
  metadataDescription: "Learn Selection Sort with an interactive minimum-finding visualizer, dry-run trace, tested JavaScript, Python, Java, and C++ code, quiz, and selection challenge.",
  hero: {
    eyebrow: "Sorting by deliberate selection",
    title: "Find the smallest.",
    emphasis: "Place it next.",
    introduction: "Selection Sort scans the unsorted region, remembers its smallest value, and moves that value to the next open position.",
    keyIdea: "After each pass, the sorted region grows by exactly one value from left to right.",
  },
  mentalModel: {
    title: "How Selection Sort thinks",
    question: "It repeats one task: “Which value is smallest in the part I have not sorted yet?”",
    steps: [
      { title: "Mark the boundary", description: "The first unsorted position is where the next smallest value belongs." },
      { title: "Find the minimum", description: "Scan every remaining value and remember the smallest one seen." },
      { title: "Place and repeat", description: "Swap the minimum into the boundary, then move the boundary one step right." },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Explain how the sorted and unsorted regions change after each pass.",
      "Trace the current minimum while scanning an array.",
      "Implement Selection Sort in JavaScript, Python, Java, or C++.",
      "Recognize its fixed comparison cost, low swap count, and lack of stability.",
    ],
    prerequisites: [
      "Arrays and zero-based indexes",
      "Nested loops and simple conditions",
      "Big O basics from the glossary",
    ],
    mistakes: [
      {
        title: "Swapping during the scan",
        symptom: "Values move every time a smaller candidate appears.",
        correction: "Remember the minimum index and perform at most one swap after the scan.",
      },
      {
        title: "Resetting the minimum incorrectly",
        symptom: "A pass compares against an old minimum from the previous pass.",
        correction: "Initialize the minimum index to the current boundary at the start of every pass.",
      },
      {
        title: "Skipping the last candidate",
        symptom: "The smallest value at the right edge is never selected.",
        correction: "Scan from boundary + 1 through the final array index.",
      },
      {
        title: "Assuming sorted input is faster",
        symptom: "The best case is reported as linear time.",
        correction: "Selection Sort still scans the full unsorted region on every pass, even when no swaps occur.",
      },
    ],
    quiz: [
      {
        id: "pass-result",
        prompt: "What is guaranteed after the first pass?",
        options: [
          "The largest value is at the end",
          "The smallest value is at index 0",
          "The entire array is sorted",
        ],
        correctOption: 1,
        explanation: "The first scan finds the minimum of the full array and places it at the left boundary.",
      },
      {
        id: "best-case",
        prompt: "What is the best-case time complexity for standard Selection Sort?",
        options: ["O(n)", "O(n log n)", "O(n²)"],
        correctOption: 2,
        explanation: "Even sorted input requires every remaining candidate to be checked on every pass.",
      },
      {
        id: "swap-count",
        prompt: "How many swaps can Selection Sort perform at most for n values?",
        options: ["n − 1", "n²", "Exactly one"],
        correctOption: 0,
        explanation: "Each pass performs zero or one swap, and there are n − 1 passes.",
      },
      {
        id: "first-pass",
        prompt: "After the first pass on [4, 2, 3, 1], what is the array?",
        options: ["[2, 4, 3, 1]", "[1, 4, 2, 3]", "[1, 2, 3, 4] after swapping 4 and 1"],
        correctOption: 2,
        explanation: "The scan finds 1 at index 3 and swaps it with the boundary value 4. This particular array happens to become fully sorted after that swap.",
      },
    ],
  },
  examples: [
    {
      id: "classic",
      type: "Walkthrough",
      title: "Classic example",
      values: [64, 25, 12, 22, 11],
      description: "Follow each new minimum through four complete passes.",
      result: "4 passes | 10 comparisons | 3 swaps",
    },
    {
      id: "sorted",
      type: "Best case",
      title: "Already sorted",
      values: [1, 2, 3, 4, 5],
      description: "No swaps are needed, but every comparison still happens.",
      result: "4 passes | 10 comparisons | 0 swaps",
    },
    {
      id: "reverse",
      type: "Worst case",
      title: "Reverse order",
      values: [5, 4, 3, 2, 1],
      description: "Small values begin far from the boundary where they belong.",
      result: "4 passes | 10 comparisons | 2 swaps",
    },
    {
      id: "duplicates",
      type: "Stability case",
      title: "Duplicate values",
      values: [4, 2, 4, 1],
      description: "Watch 4B cross ahead of 4A after the first swap.",
      result: "3 passes | 6 comparisons | 1 swap",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "selection-sort.mjs",
      highlight: [7, 8, 9, 13, 14],
      code: `function selectionSort(numbers) {
  const array = [...numbers];

  for (let boundary = 0; boundary < array.length - 1; boundary++) {
    let minIndex = boundary;

    for (let i = boundary + 1; i < array.length; i++) {
      if (array[i] < array[minIndex]) {
        minIndex = i;
      }
    }

    if (minIndex !== boundary) {
      [array[boundary], array[minIndex]] = [array[minIndex], array[boundary]];
    }
  }

  return array;
}`,
    },
    python: {
      label: "Python",
      filename: "selection_sort.py",
      highlight: [7, 8, 9, 11, 12],
      code: `def selection_sort(numbers):
    array = numbers.copy()

    for boundary in range(len(array) - 1):
        min_index = boundary

        for index in range(boundary + 1, len(array)):
            if array[index] < array[min_index]:
                min_index = index

        if min_index != boundary:
            array[boundary], array[min_index] = array[min_index], array[boundary]

    return array`,
    },
    java: {
      label: "Java",
      filename: "SelectionSort.java",
      highlight: [12, 13, 14, 15, 19, 20, 21, 22],
      code: `import java.util.Arrays;

public final class SelectionSort {
    private SelectionSort() {
    }

    public static int[] selectionSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int boundary = 0; boundary < array.length - 1; boundary++) {
            int minIndex = boundary;

            for (int index = boundary + 1; index < array.length; index++) {
                if (array[index] < array[minIndex]) {
                    minIndex = index;
                }
            }

            if (minIndex != boundary) {
                int temporary = array[boundary];
                array[boundary] = array[minIndex];
                array[minIndex] = temporary;
            }
        }

        return array;
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "selection_sort.cpp",
      highlight: [9, 10, 11, 12, 16, 17],
      code: `#include <vector>

std::vector<int> selectionSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;

    for (std::size_t boundary = 0; boundary + 1 < array.size(); ++boundary) {
        std::size_t minIndex = boundary;

        for (std::size_t index = boundary + 1; index < array.size(); ++index) {
            if (array[index] < array[minIndex]) {
                minIndex = index;
            }
        }

        if (minIndex != boundary) {
            const int temporary = array[boundary];
            array[boundary] = array[minIndex];
            array[minIndex] = temporary;
        }
    }

    return array;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(n²)", context: "Already sorted" },
    average: { label: "Average case", value: "O(n²)" },
    worst: { label: "Worst case", value: "O(n²)", context: "Any order" },
    space: { label: "Extra space", value: "O(1)", context: "In-place form" },
    property: {
      label: "Unstable sort",
      description: "A long-distance swap can reverse equal values.",
      symbol: "!",
      tone: "caution",
      proofLabel: "Instability example",
      before: ["4A", "2", "4B", "1"],
      after: ["1", "2", "4B", "4A"],
      proof: "Swapping 1 with 4A moves 4A behind 4B, so their original order changes.",
    },
  },
  challenge: {
    title: "Choose the minimum",
    description: "Build the sorted region exactly as Selection Sort does by choosing the smallest package still available.",
    rule: "At each boundary, select the smallest package in the unsorted region. A correct choice moves into place automatically.",
    startValues: [7, 3, 5, 1, 6, 2, 4],
  },
  completionCriteria: [
    { id: "explain", label: "Explain the idea", description: "I can explain how the sorted boundary grows after every pass." },
    { id: "trace", label: "Trace the minimum", description: "I followed the current minimum through at least one complete visualizer example." },
    { id: "implement", label: "Read an implementation", description: "I compared the nested scan and final swap in at least one supported language." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and minimum-selection challenge." },
  ],
  useCases: [
    { icon: "◎", title: "Learning", description: "Its boundary and minimum pointer make loop invariants concrete and visible.", recommendation: "Great fit" },
    { icon: "⇄", title: "Few writes", description: "It performs at most n − 1 swaps, useful when writes cost more than comparisons.", recommendation: "Useful property" },
    { icon: "▦", title: "Tiny datasets", description: "For a handful of values, its simple in-place structure may be sufficient.", recommendation: "Reasonable fit" },
    { icon: "×", title: "Large or nearly sorted data", description: "It always performs quadratic comparisons and does not benefit from existing order.", recommendation: "Avoid", avoid: true },
  ],
});
