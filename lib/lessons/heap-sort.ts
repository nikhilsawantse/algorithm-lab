import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const heapSortLesson = defineLesson({
  slug: "heap-sort",
  name: "Heap Sort",
  lessonNumber: 6,
  track: "Sorting track",
  category: "sorting",
  difficulty: "Intermediate",
  description: "Build a max heap and repeatedly extract its largest value.",
  metadataDescription: "Learn Heap Sort with an interactive max-heap visualizer, array-to-tree trace, practice challenge, complexity analysis, and implementations in JavaScript, Python, Java, and C++.",
  hero: {
    eyebrow: "Sorting · Intermediate",
    title: "Build a max heap.",
    emphasis: "Extract the maximum.",
    introduction: "Heap Sort turns an array into a complete binary tree, keeps the largest remaining value at the root, and moves that root into the final sorted suffix.",
    keyIdea: "The tree is only a way to read the array: children of index i live at 2i + 1 and 2i + 2.",
  },
  mentalModel: {
    title: "Think tree, store array",
    question: "How can one array behave like a priority structure without allocating tree nodes?",
    steps: [
      {
        title: "Read parent and children",
        description: "Treat index 0 as the root. For index i, its children are at 2i + 1 and 2i + 2 when those indexes exist.",
      },
      {
        title: "Build a max heap",
        description: "Starting at the last parent, sift values downward until every parent is at least as large as both children.",
      },
      {
        title: "Extract and repair",
        description: "Swap the root maximum with the heap's final item, shrink the heap, then sift the new root down again.",
      },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Translate between an array index and its parent or child positions.",
      "Explain why bottom-up heap construction starts at the last parent.",
      "Trace a root extraction and the sift-down repair that follows it.",
      "Compare Heap Sort's guaranteed runtime and memory use with Merge Sort and Quick Sort.",
    ],
    prerequisites: [
      "Array indexes and swapping values",
      "Complete binary-tree levels",
      "Big O time and auxiliary-space notation",
    ],
    mistakes: [
      {
        title: "Mixing heap size with array length",
        symptom: "A value already placed in the sorted suffix gets pulled back into the heap.",
        correction: "Pass the shrinking heap size into sift-down and ignore every index at or beyond it.",
      },
      {
        title: "Swapping with the left child automatically",
        symptom: "The parent can remain smaller than its right child, so the max-heap rule is still broken.",
        correction: "Compare both children first, then swap with the larger valid child.",
      },
      {
        title: "Starting heap construction at the last element",
        symptom: "Extra calls inspect leaves that already satisfy the heap rule.",
        correction: "Start at floor(n / 2) - 1, the final index that can have a child.",
      },
    ],
    quiz: [
      {
        id: "children",
        prompt: "Where are the children of array index i in a zero-based heap?",
        options: ["2i + 1 and 2i + 2", "i - 1 and i + 1", "i / 2 and i / 2 + 1"],
        correctOption: 0,
        explanation: "A complete binary tree maps the left child to 2i + 1 and the right child to 2i + 2.",
      },
      {
        id: "extraction",
        prompt: "After swapping the root with the heap's final value, what happens next?",
        options: ["Shrink the heap and sift the new root down", "Rebuild the entire array from scratch", "Sift the sorted suffix upward"],
        correctOption: 0,
        explanation: "The maximum is final, so it leaves the heap. Only the replacement root may violate the heap rule.",
      },
      {
        id: "runtime",
        prompt: "What is Heap Sort's worst-case runtime?",
        options: ["O(n log n)", "O(n²)", "O(log n)"],
        correctOption: 0,
        explanation: "There are O(n) extractions and each repair takes at most the heap height, O(log n).",
      },
      {
        id: "stability",
        prompt: "Why is standard in-place Heap Sort unstable?",
        options: ["Long-distance root swaps can reverse equal values", "Heaps cannot contain duplicates", "The tree must be perfectly balanced"],
        correctOption: 0,
        explanation: "Moving the root to the far end can carry one equal record past another equal record.",
      },
    ],
  },
  examples: [
    {
      id: "classic",
      type: "Walkthrough",
      title: "Classic heap build",
      values: [4, 10, 3, 5, 1],
      description: "Build a max heap bottom-up, then watch 10 become the first extracted maximum.",
      result: "Build heap · extract roots",
    },
    {
      id: "already-heap",
      type: "Structure",
      title: "Already a max heap",
      values: [10, 7, 9, 3, 2, 4],
      description: "The build phase needs no swaps, but every extraction still repairs the root.",
      result: "Valid heap · O(n log n) sort",
    },
    {
      id: "ascending",
      type: "Heapify work",
      title: "Ascending input",
      values: [1, 2, 3, 4, 5, 6, 7],
      description: "Large leaves rise during bottom-up construction before extraction begins.",
      result: "Several build-phase sifts",
    },
    {
      id: "duplicates",
      type: "Stability case",
      title: "Duplicate values",
      values: [3, 3, 2, 1],
      description: "Root-to-end swaps can change the relative order of the equal 3 values.",
      result: "Correct values · unstable records",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "heap-sort.mjs",
      highlight: [4, 5, 8, 9, 10, 16, 20, 21, 22, 23],
      code: `export function heapSort(numbers) {
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
}`,
    },
    python: {
      label: "Python",
      filename: "heap_sort.py",
      highlight: [4, 5, 7, 8, 9, 14, 18, 20, 22, 23],
      code: `def heap_sort(numbers):
    array = numbers.copy()

    for root in range(len(array) // 2 - 1, -1, -1):
        sift_down(array, root, len(array))

    for end in range(len(array) - 1, 0, -1):
        array[0], array[end] = array[end], array[0]
        sift_down(array, 0, end)
    return array


def sift_down(array, root, size):
    while 2 * root + 1 < size:
        left = 2 * root + 1
        right = left + 1
        largest = left
        if right < size and array[right] > array[left]:
            largest = right
        if array[root] >= array[largest]:
            return
        array[root], array[largest] = array[largest], array[root]
        root = largest`,
    },
    java: {
      label: "Java",
      filename: "HeapSort.java",
      highlight: [9, 10, 13, 14, 15, 17, 23, 27, 28, 29, 31, 34],
      code: `import java.util.Arrays;

public final class HeapSort {
    private HeapSort() {}

    public static int[] heapSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int root = array.length / 2 - 1; root >= 0; root--) {
            siftDown(array, root, array.length);
        }

        for (int end = array.length - 1; end > 0; end--) {
            int temporary = array[0];
            array[0] = array[end];
            array[end] = temporary;
            siftDown(array, 0, end);
        }
        return array;
    }

    private static void siftDown(int[] array, int root, int size) {
        while (2 * root + 1 < size) {
            int left = 2 * root + 1;
            int right = left + 1;
            int largest = left;
            if (right < size && array[right] > array[left]) largest = right;
            if (array[root] >= array[largest]) return;
            int temporary = array[root];
            array[root] = array[largest];
            array[largest] = temporary;
            root = largest;
        }
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "heap_sort.cpp",
      highlight: [4, 5, 8, 9, 10, 11, 17, 19, 21, 22, 23, 25],
      code: `#include <utility>
#include <vector>

void siftDown(std::vector<int>& array, std::size_t root, std::size_t size) {
    while (2 * root + 1 < size) {
        const std::size_t left = 2 * root + 1;
        const std::size_t right = left + 1;
        std::size_t largest = left;
        if (right < size && array[right] > array[left]) largest = right;
        if (array[root] >= array[largest]) return;
        std::swap(array[root], array[largest]);
        root = largest;
    }
}

std::vector<int> heapSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;
    for (std::size_t root = array.size() / 2; root > 0; --root) {
        siftDown(array, root - 1, array.size());
    }
    for (std::size_t end = array.size(); end > 1; --end) {
        std::swap(array[0], array[end - 1]);
        siftDown(array, 0, end - 1);
    }
    return array;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(n log n)", context: "Extraction still required" },
    average: { label: "Average case", value: "O(n log n)" },
    worst: { label: "Worst case", value: "O(n log n)", context: "Guaranteed bound" },
    space: { label: "Extra space", value: "O(1)", context: "In-place array" },
    property: {
      label: "Unstable sort",
      description: "Root-to-end swaps can reverse equal records.",
      symbol: "!",
      tone: "caution",
      proofLabel: "Instability example",
      before: ["3A", "3B", "2"],
      after: ["2", "3B", "3A"],
      proof: "Extracting root 3A to the far end lets equal value 3B finish before it, reversing their original order.",
    },
  },
  challenge: {
    title: "Repair the max heap",
    description: "A small value is sitting at the root. Choose the correct child at each level to sift it into place.",
    rule: "Swap with the larger child whenever that child is greater than the current parent.",
    startValues: [4, 10, 7, 2, 5, 3],
  },
  completionCriteria: [
    { id: "map", label: "Map array to tree", description: "I can find the children of any heap index." },
    { id: "trace", label: "Trace sift-down", description: "I followed one parent as it swapped with larger children." },
    { id: "implement", label: "Read an implementation", description: "I identified the build and extraction loops in one language." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and heap-repair challenge." },
  ],
  useCases: [
    { icon: "⌁", title: "Predictable sorting", description: "Heap Sort keeps O(n log n) time even when the input order is adversarial.", recommendation: "Guaranteed bound" },
    { icon: "□", title: "Tight memory", description: "The array representation and iterative sift-down use constant auxiliary space.", recommendation: "Excellent fit" },
    { icon: "⇅", title: "Priority structures", description: "The same heap mechanics power priority queues and top-k selection workflows.", recommendation: "Transferable skill" },
    { icon: "×", title: "Stable record sorting", description: "Long-distance swaps do not preserve the original order of equal records.", recommendation: "Choose a stable sort", avoid: true },
  ],
});
