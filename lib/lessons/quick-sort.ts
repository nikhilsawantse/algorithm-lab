import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const quickSortLesson = defineLesson({
  slug: "quick-sort",
  name: "Quick Sort",
  lessonNumber: 5,
  track: "Sorting",
  category: "sorting",
  difficulty: "Intermediate",
  description: "Partition values around a pivot, then recursively sort the two resulting ranges.",
  metadataDescription: "Learn Quick Sort with an interactive pivot-and-partition visualizer, dry-run trace, tested JavaScript, Python, Java, and C++ code, quiz, and partition challenge.",
  hero: {
    eyebrow: "Partitioning, made visible",
    title: "Choose a pivot.",
    emphasis: "Partition the rest.",
    introduction: "Quick Sort places one pivot in its final position, then repeats the same idea independently on the ranges to its left and right.",
    keyIdea: "A completed partition guarantees that every value left of the pivot is no larger and every value right is larger.",
  },
  mentalModel: {
    title: "How Quick Sort thinks",
    question: "Can one chosen value divide the current range into two smaller sorting problems?",
    steps: [
      { title: "Choose the pivot", description: "This lesson uses the final value in the active range as the pivot." },
      { title: "Move the boundary", description: "Scan left to right and grow a region containing values no larger than the pivot." },
      { title: "Fix and recurse", description: "Place the pivot after that region, then sort the ranges on both sides." },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Explain the pivot, scan pointer, partition boundary, and active range.",
      "Trace a Lomuto partition until the pivot reaches its final position.",
      "Implement Quick Sort in JavaScript, Python, Java, or C++.",
      "Recognize how pivot quality changes recursion depth from O(log n) to O(n).",
    ],
    prerequisites: [
      "Arrays, indexes, and swaps",
      "Functions and recursion basics",
      "Big O and logarithms from the glossary",
    ],
    mistakes: [
      {
        title: "Including the pivot in the scan",
        symptom: "The pivot moves before all other values have been classified.",
        correction: "Scan only through end − 1, then place the pivot after the loop.",
      },
      {
        title: "Recursing over the pivot again",
        symptom: "Ranges fail to shrink and recursion may never finish.",
        correction: "Recurse on start through pivotIndex − 1 and pivotIndex + 1 through end.",
      },
      {
        title: "Moving the boundary for large values",
        symptom: "Values greater than the pivot leak into the left partition.",
        correction: "Advance the boundary only when the scanned value belongs on the pivot's left side.",
      },
      {
        title: "Assuming every pivot is balanced",
        symptom: "Worst-case time is incorrectly reported as O(n log n).",
        correction: "An extreme pivot can leave one empty side and create O(n) recursion depth.",
      },
    ],
    quiz: [
      {
        id: "partition-guarantee",
        prompt: "What is guaranteed immediately after partitioning?",
        options: ["The entire array is sorted", "The pivot is in its final position", "Both sides have equal length"],
        correctOption: 1,
        explanation: "The partition places every smaller-or-equal value before the pivot and every larger value after it.",
      },
      {
        id: "boundary",
        prompt: "When does the partition boundary advance?",
        options: ["For every scanned value", "Only when scan ≤ pivot", "Only after recursion"],
        correctOption: 1,
        explanation: "The boundary marks the next opening in the smaller-or-equal region.",
      },
      {
        id: "worst-case",
        prompt: "With the final value as pivot, which input can produce O(n²) time?",
        options: ["Already sorted input", "Only duplicate-free random input", "An empty array"],
        correctOption: 0,
        explanation: "The largest value becomes pivot repeatedly, leaving an n − 1 range and an empty range at each level.",
      },
      {
        id: "stability",
        prompt: "Why is this in-place Quick Sort not stable?",
        options: ["Long-distance swaps can reorder equal values", "It rejects duplicates", "It always takes the left value first"],
        correctOption: 0,
        explanation: "Partition swaps can move one equal item past another even though their values compare equally.",
      },
    ],
  },
  examples: [
    {
      id: "classic",
      type: "Walkthrough",
      title: "Classic partition",
      values: [10, 7, 8, 9, 1, 5],
      description: "Use 5 as the first pivot and watch the boundary collect 1.",
      result: "Last-value pivot | recursive partitions",
    },
    {
      id: "balanced",
      type: "Average case",
      title: "Balanced pivots",
      values: [7, 2, 1, 6, 8, 5, 3, 4],
      description: "Several pivots divide their active ranges into useful subproblems.",
      result: "Expected O(n log n) behavior",
    },
    {
      id: "sorted",
      type: "Worst case",
      title: "Already sorted",
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      description: "Each final-value pivot is the range maximum, producing one long side.",
      result: "Depth n − 1 | O(n²)",
    },
    {
      id: "duplicates",
      type: "Stability case",
      title: "Duplicate values",
      values: [4, 2, 4, 1],
      description: "The first pivot swap moves 4A behind 4B.",
      result: "Correct order | unstable duplicates",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "quick-sort.mjs",
      highlight: [10, 11, 12, 18, 19, 20, 21, 25],
      code: `function quickSort(numbers) {
  const array = [...numbers];
  sortRange(array, 0, array.length - 1);
  return array;
}

function sortRange(array, start, end) {
  if (start >= end) return;
  const pivotIndex = partition(array, start, end);
  sortRange(array, start, pivotIndex - 1);
  sortRange(array, pivotIndex + 1, end);
}

function partition(array, start, end) {
  const pivot = array[end];
  let boundary = start;
  for (let scan = start; scan < end; scan++) {
    if (array[scan] <= pivot) {
      [array[boundary], array[scan]] = [array[scan], array[boundary]];
      boundary++;
    }
  }
  [array[boundary], array[end]] = [array[end], array[boundary]];
  return boundary;
}`,
    },
    python: {
      label: "Python",
      filename: "quick_sort.py",
      highlight: [9, 10, 11, 17, 18, 19, 20, 23],
      code: `def quick_sort(numbers):
    array = numbers.copy()
    sort_range(array, 0, len(array) - 1)
    return array


def sort_range(array, start, end):
    if start >= end:
        return
    pivot_index = partition(array, start, end)
    sort_range(array, start, pivot_index - 1)
    sort_range(array, pivot_index + 1, end)


def partition(array, start, end):
    pivot = array[end]
    boundary = start
    for scan in range(start, end):
        if array[scan] <= pivot:
            array[boundary], array[scan] = array[scan], array[boundary]
            boundary += 1
    array[boundary], array[end] = array[end], array[boundary]
    return boundary`,
    },
    java: {
      label: "Java",
      filename: "QuickSort.java",
      highlight: [13, 14, 15, 16, 23, 24, 25, 26, 31],
      code: `import java.util.Arrays;

public final class QuickSort {
    private QuickSort() {
    }

    public static int[] quickSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);
        sortRange(array, 0, array.length - 1);
        return array;
    }

    private static void sortRange(int[] array, int start, int end) {
        if (start >= end) return;
        int pivotIndex = partition(array, start, end);
        sortRange(array, start, pivotIndex - 1);
        sortRange(array, pivotIndex + 1, end);
    }

    private static int partition(int[] array, int start, int end) {
        int pivot = array[end];
        int boundary = start;
        for (int scan = start; scan < end; scan++) {
            if (array[scan] <= pivot) {
                int temporary = array[boundary];
                array[boundary] = array[scan];
                array[scan] = temporary;
                boundary++;
            }
        }
        int temporary = array[boundary];
        array[boundary] = array[end];
        array[end] = temporary;
        return boundary;
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "quick_sort.cpp",
      highlight: [10, 11, 12, 13, 20, 21, 22, 23, 28],
      code: `#include <utility>
#include <vector>

std::size_t partition(std::vector<int>& array, std::size_t start, std::size_t end);

void sortRange(std::vector<int>& array, std::size_t start, std::size_t end) {
    if (start >= end) return;
    const std::size_t pivotIndex = partition(array, start, end);
    if (pivotIndex > 0) sortRange(array, start, pivotIndex - 1);
    sortRange(array, pivotIndex + 1, end);
}

std::size_t partition(std::vector<int>& array, std::size_t start, std::size_t end) {
    const int pivot = array[end];
    std::size_t boundary = start;
    for (std::size_t scan = start; scan < end; ++scan) {
        if (array[scan] <= pivot) {
            std::swap(array[boundary], array[scan]);
            ++boundary;
        }
    }
    std::swap(array[boundary], array[end]);
    return boundary;
}

std::vector<int> quickSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;
    if (!array.empty()) sortRange(array, 0, array.size() - 1);
    return array;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(n log n)", context: "Balanced pivots" },
    average: { label: "Average case", value: "O(n log n)" },
    worst: { label: "Worst case", value: "O(n²)", context: "Extreme pivots" },
    space: { label: "Call stack", value: "O(log n)", context: "Average case" },
    property: {
      label: "Unstable sort",
      description: "Partition swaps can reverse equal values.",
      symbol: "!",
      tone: "caution",
      proofLabel: "Instability example",
      before: ["4A", "2", "4B", "1"],
      after: ["1", "2", "4B", "4A"],
      proof: "Placing pivot 1 swaps it with 4A, moving 4A behind the equal value 4B.",
    },
  },
  challenge: {
    title: "Build a pivot partition",
    description: "Classify every scanned value around the final pivot, just as the partition loop does.",
    rule: "Send values ≤ pivot left and values > pivot right. The pivot remains between both groups.",
    startValues: [7, 2, 9, 4, 6],
  },
  completionCriteria: [
    { id: "explain", label: "Explain partitioning", description: "I can explain the pivot, scan pointer, boundary, and final pivot swap." },
    { id: "trace", label: "Trace a partition", description: "I followed one active range until its pivot reached the final position." },
    { id: "implement", label: "Read an implementation", description: "I identified the partition function and shrinking recursive ranges in one language." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and pivot-partition challenge." },
  ],
  useCases: [
    { icon: "⚡", title: "In-memory arrays", description: "Good cache behavior and small constants make it fast for many practical array workloads.", recommendation: "Great average case" },
    { icon: "↯", title: "Low extra memory", description: "In-place partitioning needs no O(n) merge buffer, only recursive stack space.", recommendation: "Good fit" },
    { icon: "⌁", title: "Hybrid library sorts", description: "Randomized pivots and fallback strategies can control its worst-case behavior.", recommendation: "Common building block" },
    { icon: "×", title: "Stable or adversarial sorting", description: "This version is unstable, and predictable extreme pivots can cause quadratic time.", recommendation: "Use safeguards", avoid: true },
  ],
});
