import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const mergeSortLesson = defineLesson({
  slug: "merge-sort",
  name: "Merge Sort",
  lessonNumber: 4,
  track: "Sorting",
  category: "sorting",
  difficulty: "Intermediate",
  description: "Divide values into smaller arrays, sort them, and merge the ordered results.",
  metadataDescription: "Learn Merge Sort with an interactive recursion-tree and merge visualizer, dry-run trace, tested JavaScript, Python, Java, and C++ code, quiz, and merge challenge.",
  hero: {
    eyebrow: "Divide and conquer, made visible",
    title: "Split the problem.",
    emphasis: "Merge the answers.",
    introduction: "Merge Sort keeps dividing an array until every piece is trivial, then combines those pieces in sorted order.",
    keyIdea: "Two sorted halves can be merged in one linear scan by comparing only their front values.",
  },
  mentalModel: {
    title: "How Merge Sort thinks",
    question: "Instead of sorting one large array directly, what if we solve two smaller versions and combine them?",
    steps: [
      { title: "Divide in half", description: "Split each array near its midpoint until only single values remain." },
      { title: "Trust the small answers", description: "A one-value array is already sorted, so recursion has a base case." },
      { title: "Merge in order", description: "Compare the fronts of two sorted halves and take the smaller value." },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Explain the divide, base-case, and merge phases of the recursion tree.",
      "Trace two sorted halves as they become one sorted output.",
      "Implement Merge Sort in JavaScript, Python, Java, or C++.",
      "Recognize its stable O(n log n) guarantee and O(n) auxiliary-space cost.",
    ],
    prerequisites: [
      "Arrays, slices, and indexes",
      "Functions and recursion basics",
      "Big O and logarithms from the glossary",
    ],
    mistakes: [
      {
        title: "Missing the base case",
        symptom: "The recursive calls continue forever or fail on empty arrays.",
        correction: "Return a copy immediately when the array has zero or one value.",
      },
      {
        title: "Dropping remaining values",
        symptom: "The merged output is shorter than the two inputs combined.",
        correction: "After one half is exhausted, append every value still waiting in the other half.",
      },
      {
        title: "Taking from the right on ties",
        symptom: "Equal values reverse their original order.",
        correction: "Use ≤ and take the left value first when both fronts are equal.",
      },
      {
        title: "Re-sorting during merge",
        symptom: "The merge step uses another sorting function or scans the full output repeatedly.",
        correction: "Rely on both halves already being sorted and advance one front pointer at a time.",
      },
    ],
    quiz: [
      {
        id: "base-case",
        prompt: "Why does recursion stop at an array of length one?",
        options: ["It is already sorted", "It always contains the minimum", "It cannot be copied"],
        correctOption: 0,
        explanation: "A single value has no pair that can be out of order, so it is a complete sorted result.",
      },
      {
        id: "merge-choice",
        prompt: "When merging [2, 6] and [3, 5], which value is taken first?",
        options: ["2", "3", "5"],
        correctOption: 0,
        explanation: "Only the front values 2 and 3 need comparison; 2 is smaller and enters the output first.",
      },
      {
        id: "complexity",
        prompt: "What is Merge Sort's worst-case time complexity?",
        options: ["O(n)", "O(n log n)", "O(n²)"],
        correctOption: 1,
        explanation: "There are logarithmically many split levels, and every level processes all n values while merging.",
      },
      {
        id: "stability",
        prompt: "How does the merge step preserve stability when front values are equal?",
        options: ["Take from the left first", "Take from the right first", "Discard one duplicate"],
        correctOption: 0,
        explanation: "Choosing the left equal value first preserves the order established in the original array.",
      },
    ],
  },
  examples: [
    {
      id: "classic",
      type: "Walkthrough",
      title: "Balanced recursion",
      values: [38, 27, 43, 3, 9, 82, 10, 15],
      description: "Follow three split levels and seven merges from leaves to root.",
      result: "3 split levels | 7 merges | 24 writes",
    },
    {
      id: "sorted",
      type: "Best case",
      title: "Already sorted",
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      description: "The same split-and-merge structure runs even when order is perfect.",
      result: "O(n log n) | 7 merges | 24 writes",
    },
    {
      id: "reverse",
      type: "Worst case",
      title: "Reverse order",
      values: [8, 7, 6, 5, 4, 3, 2, 1],
      description: "Every half is solved independently before the final merge.",
      result: "O(n log n) | 7 merges | 24 writes",
    },
    {
      id: "duplicates",
      type: "Stability case",
      title: "Duplicate values",
      values: [4, 2, 4, 1, 3, 4],
      description: "Left-first tie handling keeps 4A, 4B, and 4C ordered.",
      result: "Stable duplicate order | O(n log n)",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "merge-sort.mjs",
      highlight: [3, 4, 5, 13, 14, 15, 16, 17],
      code: `function mergeSort(numbers) {
  if (numbers.length <= 1) return [...numbers];
  const middle = Math.floor(numbers.length / 2);
  const left = mergeSort(numbers.slice(0, middle));
  const right = mergeSort(numbers.slice(middle));
  return merge(left, right);
}

function merge(left, right) {
  const output = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      output.push(left[leftIndex++]);
    } else {
      output.push(right[rightIndex++]);
    }
  }
  return output.concat(left.slice(leftIndex), right.slice(rightIndex));
}`,
    },
    python: {
      label: "Python",
      filename: "merge_sort.py",
      highlight: [4, 5, 6, 15, 16, 17, 18, 19],
      code: `def merge_sort(numbers):
    if len(numbers) <= 1:
        return numbers.copy()
    middle = len(numbers) // 2
    left = merge_sort(numbers[:middle])
    right = merge_sort(numbers[middle:])
    return merge(left, right)


def merge(left, right):
    output = []
    left_index = 0
    right_index = 0
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            output.append(left[left_index])
            left_index += 1
        else:
            output.append(right[right_index])
            right_index += 1
    return output + left[left_index:] + right[right_index:]`,
    },
    java: {
      label: "Java",
      filename: "MergeSort.java",
      highlight: [10, 11, 12, 13, 23, 24, 25, 26, 27],
      code: `import java.util.Arrays;

public final class MergeSort {
    private MergeSort() {
    }

    public static int[] mergeSort(int[] numbers) {
        if (numbers.length <= 1) return Arrays.copyOf(numbers, numbers.length);
        int middle = numbers.length / 2;
        int[] left = mergeSort(Arrays.copyOfRange(numbers, 0, middle));
        int[] right = mergeSort(Arrays.copyOfRange(numbers, middle, numbers.length));
        return merge(left, right);
    }

    private static int[] merge(int[] left, int[] right) {
        int[] output = new int[left.length + right.length];
        int leftIndex = 0;
        int rightIndex = 0;
        int outputIndex = 0;
        while (leftIndex < left.length && rightIndex < right.length) {
            if (left[leftIndex] <= right[rightIndex]) {
                output[outputIndex++] = left[leftIndex++];
            } else {
                output[outputIndex++] = right[rightIndex++];
            }
        }
        while (leftIndex < left.length) output[outputIndex++] = left[leftIndex++];
        while (rightIndex < right.length) output[outputIndex++] = right[rightIndex++];
        return output;
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "merge_sort.cpp",
      highlight: [6, 7, 8, 9, 10, 11, 12, 19, 20, 21, 22, 23],
      code: `#include <vector>

std::vector<int> merge(const std::vector<int>& left, const std::vector<int>& right);

std::vector<int> mergeSort(const std::vector<int>& numbers) {
    if (numbers.size() <= 1) return numbers;
    const std::size_t middle = numbers.size() / 2;
    const std::vector<int> leftInput(numbers.begin(), numbers.begin() + middle);
    const std::vector<int> rightInput(numbers.begin() + middle, numbers.end());
    const std::vector<int> left = mergeSort(leftInput);
    const std::vector<int> right = mergeSort(rightInput);
    return merge(left, right);
}

std::vector<int> merge(const std::vector<int>& left, const std::vector<int>& right) {
    std::vector<int> output;
    std::size_t leftIndex = 0;
    std::size_t rightIndex = 0;
    while (leftIndex < left.size() && rightIndex < right.size()) {
        if (left[leftIndex] <= right[rightIndex]) {
            output.push_back(left[leftIndex++]);
        } else {
            output.push_back(right[rightIndex++]);
        }
    }
    output.insert(output.end(), left.begin() + leftIndex, left.end());
    output.insert(output.end(), right.begin() + rightIndex, right.end());
    return output;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(n log n)", context: "Already sorted" },
    average: { label: "Average case", value: "O(n log n)" },
    worst: { label: "Worst case", value: "O(n log n)", context: "Any order" },
    space: { label: "Extra space", value: "O(n)", context: "Merge buffer" },
    property: {
      label: "Stable sort",
      description: "Equal values keep their original relative order.",
      symbol: "✓",
      tone: "positive",
      proofLabel: "Stability proof",
      before: ["4A", "2", "4B", "1"],
      after: ["1", "2", "4A", "4B"],
      proof: "When equal fronts meet, taking from the left half first keeps 4A before 4B.",
    },
  },
  challenge: {
    title: "Merge two sorted queues",
    description: "Build one sorted output by repeatedly choosing the smaller front value.",
    rule: "Only the front card of each queue is available. On equal values, choose the left queue first.",
    startValues: [2, 5, 8, 1, 3, 7],
  },
  completionCriteria: [
    { id: "explain", label: "Explain divide and conquer", description: "I can explain the split, base-case, and merge phases." },
    { id: "trace", label: "Trace one merge", description: "I followed both front pointers and the temporary output through a complete merge." },
    { id: "implement", label: "Read an implementation", description: "I identified the recursive calls and left-first merge condition in one language." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and two-queue merge challenge." },
  ],
  useCases: [
    { icon: "∞", title: "Predictable performance", description: "O(n log n) time is guaranteed regardless of the input's original order.", recommendation: "Great fit" },
    { icon: "≡", title: "External sorting", description: "Sequential merging works well when large datasets live on disk instead of memory.", recommendation: "Excellent fit" },
    { icon: "⑂", title: "Linked lists and parallel work", description: "Halves can be processed independently, and linked lists merge without shifting values.", recommendation: "Good fit" },
    { icon: "×", title: "Tiny memory-limited arrays", description: "Temporary merge storage and recursive overhead may outweigh its benefits.", recommendation: "Consider another sort", avoid: true },
  ],
});
