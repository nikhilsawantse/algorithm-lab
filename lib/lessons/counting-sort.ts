import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const countingSortLesson = defineLesson({
  slug: "counting-sort",
  name: "Counting Sort",
  lessonNumber: 7,
  track: "Sorting track",
  category: "sorting",
  difficulty: "Intermediate",
  description: "Count bounded integer values instead of comparing pairs.",
  metadataDescription: "Learn Counting Sort with an interactive frequency and prefix-count visualizer, stable placement challenge, complexity analysis, and implementations in JavaScript, Python, Java, and C++.",
  hero: {
    eyebrow: "Sorting · Intermediate",
    title: "Count each key.",
    emphasis: "Place without comparing.",
    introduction: "Counting Sort replaces pairwise comparisons with a compact table of integer-key frequencies, then turns those counts into exact output positions.",
    keyIdea: "Its speed depends on both n values and k possible keys, so a small dense range is the superpower.",
  },
  mentalModel: {
    title: "Turn values into addresses",
    question: "What if each integer can point directly to the bucket that describes where it belongs?",
    steps: [
      {
        title: "Create one bucket per key",
        description: "Find the minimum and maximum, then offset each value so even negative integers map to indexes starting at zero.",
      },
      {
        title: "Count and accumulate",
        description: "Record every frequency, then add counts from left to right so each bucket knows how many values end at or before its key.",
      },
      {
        title: "Place from right to left",
        description: "Use each cumulative count as the next output position. Reverse scanning preserves the order of records with equal keys.",
      },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Explain why Counting Sort needs integer keys from a manageable range.",
      "Build a frequency table using a minimum-value offset.",
      "Transform frequencies into cumulative ending positions.",
      "Trace stable right-to-left placement into an output array.",
    ],
    prerequisites: [
      "Array indexing and integer arithmetic",
      "Frequency tables and prefix sums",
      "Big O notation with more than one input variable",
    ],
    mistakes: [
      {
        title: "Ignoring the key range",
        symptom: "Sorting a few widely separated values allocates a huge count array.",
        correction: "Check k = maximum - minimum + 1. Use a comparison sort when k is large relative to n.",
      },
      {
        title: "Using values directly as indexes",
        symptom: "Negative values create invalid indexes or end up in the wrong bucket.",
        correction: "Map value v to bucket v - minimum, then add minimum back only when interpreting the key.",
      },
      {
        title: "Placing equal records left to right",
        symptom: "Equal-key records appear in reverse relative order even though the counts are correct.",
        correction: "After cumulative counts, scan the original input from right to left for stable placement.",
      },
    ],
    quiz: [
      {
        id: "range",
        prompt: "What does k represent in Counting Sort's O(n + k) runtime?",
        options: ["The number of possible integer keys in the range", "The number of comparisons", "The recursion depth"],
        correctOption: 0,
        explanation: "k is maximum - minimum + 1, the number of buckets the algorithm must create and scan.",
      },
      {
        id: "prefix",
        prompt: "What does a cumulative count for key x tell us?",
        options: ["How many values are less than or equal to x", "Only how often x occurs", "The next key to compare"],
        correctOption: 0,
        explanation: "Adding frequencies left to right converts each bucket into the ending position for that key.",
      },
      {
        id: "negative",
        prompt: "How does this implementation support negative values?",
        options: ["It subtracts the minimum value to form bucket indexes", "It removes every negative value", "It creates negative array indexes"],
        correctOption: 0,
        explanation: "Subtracting the minimum shifts the smallest key to bucket zero without changing order.",
      },
      {
        id: "stability",
        prompt: "Why does stable placement scan the input from right to left?",
        options: ["Later equal records claim later output positions first", "It reduces k", "It avoids the frequency pass"],
        correctOption: 0,
        explanation: "Decrementing cumulative positions from the right keeps earlier equal records before later ones.",
      },
    ],
  },
  examples: [
    {
      id: "classic",
      type: "Walkthrough",
      title: "Classic frequencies",
      values: [4, 2, 2, 8, 3, 3, 1],
      description: "Count a compact range, accumulate positions, and place duplicates stably.",
      result: "n = 7 · k = 8",
    },
    {
      id: "dense",
      type: "Best fit",
      title: "Dense small keys",
      values: [2, 0, 1, 2, 1, 0],
      description: "Only three buckets are needed for six values, which is ideal for Counting Sort.",
      result: "n = 6 · k = 3",
    },
    {
      id: "negative",
      type: "Offset keys",
      title: "Negative values",
      values: [-2, 1, -1, -2, 0],
      description: "The minimum offset maps keys -2 through 1 onto buckets 0 through 3.",
      result: "minimum = -2 · k = 4",
    },
    {
      id: "range-cost",
      type: "Range tradeoff",
      title: "Sparse key range",
      values: [1, 12, 3, 12],
      description: "Twelve buckets are scanned for four values, making k's cost easy to see.",
      result: "n = 4 · k = 12",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "counting-sort.mjs",
      highlight: [2, 5, 7, 8, 11, 12, 13, 16, 17, 18, 19, 21],
      code: `export function countingSort(numbers) {
  if (numbers.some((value) => !Number.isInteger(value))) throw new TypeError("Integers required");
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
}`,
    },
    python: {
      label: "Python",
      filename: "counting_sort.py",
      highlight: [2, 5, 7, 8, 11, 12, 13, 16, 17, 18, 19],
      code: `def counting_sort(numbers):
    if any(not isinstance(value, int) for value in numbers):
        raise TypeError("Integers required")
    if not numbers:
        return []
    minimum = min(numbers)
    maximum = max(numbers)
    counts = [0] * (maximum - minimum + 1)

    for value in numbers:
        counts[value - minimum] += 1
    for index in range(1, len(counts)):
        counts[index] += counts[index - 1]

    output = [0] * len(numbers)
    for value in reversed(numbers):
        counts[value - minimum] -= 1
        output[counts[value - minimum]] = value
    return output`,
    },
    java: {
      label: "Java",
      filename: "CountingSort.java",
      highlight: [8, 10, 11, 12, 13, 17, 18, 19, 22, 23, 24, 25, 27],
      code: `import java.util.Arrays;

public final class CountingSort {
    private CountingSort() {}

    public static int[] countingSort(int[] numbers) {
        if (numbers.length == 0) return new int[] {};
        int minimum = numbers[0];
        int maximum = numbers[0];
        for (int value : numbers) {
            minimum = Math.min(minimum, value);
            maximum = Math.max(maximum, value);
        }

        int[] counts = new int[maximum - minimum + 1];
        for (int value : numbers) counts[value - minimum]++;
        for (int index = 1; index < counts.length; index++) {
            counts[index] += counts[index - 1];
        }

        int[] output = new int[numbers.length];
        for (int index = numbers.length - 1; index >= 0; index--) {
            int value = numbers[index];
            counts[value - minimum]--;
            output[counts[value - minimum]] = value;
        }
        return output;
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "counting_sort.cpp",
      highlight: [5, 7, 8, 9, 10, 12, 13, 14, 17, 18, 19, 20, 22],
      code: `#include <algorithm>
#include <vector>

std::vector<int> countingSort(const std::vector<int>& numbers) {
    if (numbers.empty()) return {};
    const auto [minimumIt, maximumIt] = std::minmax_element(numbers.begin(), numbers.end());
    const int minimum = *minimumIt;
    const int maximum = *maximumIt;
    std::vector<std::size_t> counts(maximum - minimum + 1, 0);

    for (const int value : numbers) ++counts[value - minimum];
    for (std::size_t index = 1; index < counts.size(); ++index) {
        counts[index] += counts[index - 1];
    }

    std::vector<int> output(numbers.size());
    for (auto iterator = numbers.rbegin(); iterator != numbers.rend(); ++iterator) {
        const std::size_t bucket = *iterator - minimum;
        --counts[bucket];
        output[counts[bucket]] = *iterator;
    }
    return output;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(n + k)", context: "Dense key range" },
    average: { label: "Average case", value: "O(n + k)" },
    worst: { label: "Worst case", value: "O(n + k)", context: "Range still scanned" },
    space: { label: "Extra space", value: "O(n + k)", context: "Output and counts" },
    property: {
      label: "Stable sort",
      description: "Reverse placement preserves equal-key order.",
      symbol: "✓",
      tone: "positive",
      proofLabel: "Stability proof",
      before: ["3A", "1", "3B", "2"],
      after: ["1", "2", "3A", "3B"],
      proof: "Scanning from right to left gives later 3B the later available slot, leaving earlier 3A before it.",
    },
  },
  challenge: {
    title: "Build the frequency table",
    description: "Read each incoming value and click the bucket whose key matches it.",
    rule: "Every value increments exactly one matching bucket. Finish with the correct frequency for every key.",
    startValues: [3, 1, 2, 3, 0, 2],
  },
  completionCriteria: [
    { id: "range", label: "Judge the key range", description: "I can explain when k makes Counting Sort efficient or wasteful." },
    { id: "trace", label: "Trace counts and prefixes", description: "I followed frequencies as they became cumulative positions." },
    { id: "implement", label: "Read an implementation", description: "I identified the offset, count, prefix, and placement phases in one language." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and frequency-table challenge." },
  ],
  useCases: [
    { icon: "#", title: "Scores and ratings", description: "Bounded integer scores such as 0–100 need only a small predictable bucket table.", recommendation: "Excellent fit" },
    { icon: "▦", title: "Category IDs", description: "Dense integer codes can be grouped or ordered without comparison-based sorting.", recommendation: "Strong fit" },
    { icon: "⇥", title: "Radix Sort passes", description: "Stable Counting Sort is commonly used to order one digit position at a time.", recommendation: "Core building block" },
    { icon: "×", title: "Wide or non-integer keys", description: "Sparse huge ranges, decimals, and arbitrary strings make direct bucket allocation impractical.", recommendation: "Use another strategy", avoid: true },
  ],
});
