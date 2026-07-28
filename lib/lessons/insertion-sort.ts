import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const insertionSortLesson = defineLesson({
  slug: "insertion-sort",
  name: "Insertion Sort",
  lessonNumber: 3,
  track: "Sorting",
  category: "sorting",
  difficulty: "Beginner",
  description: "Take the next value and shift larger sorted values right until it fits.",
  metadataDescription: "Learn Insertion Sort with an interactive key-and-shift visualizer, dry-run trace, tested JavaScript, Python, Java, and C++ code, quiz, and insertion challenge.",
  hero: {
    eyebrow: "Sorting one value into place",
    title: "Pick the next value.",
    emphasis: "Slide it into place.",
    introduction: "Insertion Sort grows a sorted region by taking one new value—the key—and moving it left past every larger neighbor.",
    keyIdea: "Before each pass the left region is sorted; inserting one key grows that region by one.",
  },
  mentalModel: {
    title: "How Insertion Sort thinks",
    question: "Imagine sorting cards in your hand: where does the next card belong among the cards already ordered?",
    steps: [
      { title: "Pick up the key", description: "Take the first value just outside the sorted region." },
      { title: "Shift larger values", description: "Move each larger sorted value one position to the right." },
      { title: "Insert into the gap", description: "Place the key in the opening and grow the sorted region." },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Explain why the left prefix remains sorted after every insertion.",
      "Trace the key, comparisons, and right shifts through a complete example.",
      "Implement Insertion Sort in JavaScript, Python, Java, or C++.",
      "Recognize why it is stable, adaptive, and useful for small or nearly sorted data.",
    ],
    prerequisites: [
      "Arrays and zero-based indexes",
      "Loops and value assignment",
      "Big O basics from the glossary",
    ],
    mistakes: [
      {
        title: "Overwriting the key",
        symptom: "A value disappears when larger values shift right.",
        correction: "Save the key before shifting anything, then write it into the final gap.",
      },
      {
        title: "Stopping one position too early",
        symptom: "A new smallest value never reaches index 0.",
        correction: "Continue while the position is above 0 and the left neighbor is larger.",
      },
      {
        title: "Moving equal values",
        symptom: "Duplicate values reverse their original order.",
        correction: "Shift only values strictly greater than the key, not values equal to it.",
      },
      {
        title: "Starting at index 0",
        symptom: "The code looks left of the array on its first pass.",
        correction: "Treat the first value as an already sorted region and begin with index 1.",
      },
    ],
    quiz: [
      {
        id: "sorted-prefix",
        prompt: "What is guaranteed before each new pass?",
        options: ["The left prefix is sorted", "The right suffix is sorted", "The smallest value is always the key"],
        correctOption: 0,
        explanation: "Every previous key was inserted into its correct place, so the prefix before the next key is ordered.",
      },
      {
        id: "best-case",
        prompt: "What is the best-case time complexity on already sorted input?",
        options: ["O(1)", "O(n)", "O(n²)"],
        correctOption: 1,
        explanation: "Each key needs only one comparison with its left neighbor and no shifts.",
      },
      {
        id: "stability",
        prompt: "Which shift condition preserves the order of equal values?",
        options: ["left > key", "left ≥ key", "left ≠ key"],
        correctOption: 0,
        explanation: "A strict greater-than condition leaves equal values in their original relative order.",
      },
      {
        id: "insert-position",
        prompt: "Where should key 3 be inserted into the sorted region [1, 4, 6]?",
        options: ["Before 1", "Between 1 and 4", "After 6"],
        correctOption: 1,
        explanation: "Values 4 and 6 shift right, leaving the gap immediately after 1.",
      },
    ],
  },
  examples: [
    {
      id: "classic",
      type: "Walkthrough",
      title: "Classic example",
      values: [5, 2, 4, 6, 1, 3],
      description: "Watch each key travel through a growing sorted prefix.",
      result: "5 passes | 12 comparisons | 9 shifts",
    },
    {
      id: "sorted",
      type: "Best case",
      title: "Already sorted",
      values: [1, 2, 3, 4, 5],
      description: "Every key stays put after a single comparison.",
      result: "4 passes | 4 comparisons | 0 shifts",
    },
    {
      id: "reverse",
      type: "Worst case",
      title: "Reverse order",
      values: [5, 4, 3, 2, 1],
      description: "Every key moves across the entire sorted prefix.",
      result: "4 passes | 10 comparisons | 10 shifts",
    },
    {
      id: "duplicates",
      type: "Stability case",
      title: "Duplicate values",
      values: [3, 1, 3, 2],
      description: "Watch 3A remain before 3B after both insertions.",
      result: "3 passes | 5 comparisons | 3 shifts",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "insertion-sort.mjs",
      highlight: [8, 9, 10, 13],
      code: `function insertionSort(numbers) {
  const array = [...numbers];

  for (let index = 1; index < array.length; index++) {
    const key = array[index];
    let position = index;

    while (position > 0 && array[position - 1] > key) {
      array[position] = array[position - 1];
      position--;
    }

    array[position] = key;
  }

  return array;
}`,
    },
    python: {
      label: "Python",
      filename: "insertion_sort.py",
      highlight: [8, 9, 10, 12],
      code: `def insertion_sort(numbers):
    array = numbers.copy()

    for index in range(1, len(array)):
        key = array[index]
        position = index

        while position > 0 and array[position - 1] > key:
            array[position] = array[position - 1]
            position -= 1

        array[position] = key

    return array`,
    },
    java: {
      label: "Java",
      filename: "InsertionSort.java",
      highlight: [14, 15, 16, 19],
      code: `import java.util.Arrays;

public final class InsertionSort {
    private InsertionSort() {
    }

    public static int[] insertionSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int index = 1; index < array.length; index++) {
            int key = array[index];
            int position = index;

            while (position > 0 && array[position - 1] > key) {
                array[position] = array[position - 1];
                position--;
            }

            array[position] = key;
        }

        return array;
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "insertion_sort.cpp",
      highlight: [8, 9, 10, 11, 14],
      code: `#include <vector>

std::vector<int> insertionSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;

    for (std::size_t index = 1; index < array.size(); ++index) {
        const int key = array[index];
        std::size_t position = index;

        while (position > 0 && array[position - 1] > key) {
            array[position] = array[position - 1];
            --position;
        }

        array[position] = key;
    }

    return array;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(n)", context: "Already sorted" },
    average: { label: "Average case", value: "O(n²)" },
    worst: { label: "Worst case", value: "O(n²)", context: "Reverse order" },
    space: { label: "Extra space", value: "O(1)", context: "In-place form" },
    property: {
      label: "Stable sort",
      description: "Equal values keep their original relative order.",
      symbol: "✓",
      tone: "positive",
      proofLabel: "Stability proof",
      before: ["3A", "1", "3B", "2"],
      after: ["1", "2", "3A", "3B"],
      proof: "The strict greater-than check never shifts 3A past the equal key 3B.",
    },
  },
  challenge: {
    title: "Insert the next card",
    description: "Grow a sorted hand by choosing the correct gap for each new key.",
    rule: "Select the gap after all smaller or equal cards and before the first larger card.",
    startValues: [2, 5, 4, 1, 6, 3, 7],
  },
  completionCriteria: [
    { id: "explain", label: "Explain the idea", description: "I can explain how one key grows the sorted prefix after each pass." },
    { id: "trace", label: "Trace the shifts", description: "I followed a key through comparisons and shifts in a complete example." },
    { id: "implement", label: "Read an implementation", description: "I identified where the key is saved, shifted, and inserted in one language." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and insertion-gap challenge." },
  ],
  useCases: [
    { icon: "↗", title: "Nearly sorted data", description: "Few out-of-order values mean very few shifts, approaching linear time.", recommendation: "Great fit" },
    { icon: "+", title: "Incremental input", description: "New values can be inserted into an already sorted collection as they arrive.", recommendation: "Good fit" },
    { icon: "▦", title: "Small datasets", description: "Low overhead makes it useful inside hybrid sorts for small partitions.", recommendation: "Common fit" },
    { icon: "×", title: "Large random datasets", description: "Quadratic comparisons and shifts become expensive as input grows.", recommendation: "Avoid", avoid: true },
  ],
});
