import { defineLesson, lessonSectionOrder } from "../lesson-schema";

export const radixSortLesson = defineLesson({
  slug: "radix-sort",
  name: "Radix Sort",
  lessonNumber: 8,
  track: "Sorting track",
  category: "sorting",
  difficulty: "Intermediate",
  description: "Order integer keys one digit position at a time.",
  metadataDescription: "Learn Radix Sort with an interactive digit-pass and bucket visualizer, signed-key offset, routing challenge, complexity analysis, and implementations in JavaScript, Python, Java, and C++.",
  hero: {
    eyebrow: "Sorting · Intermediate",
    title: "Sort one digit.",
    emphasis: "Keep every prior decision.",
    introduction: "Radix Sort repeatedly groups integer keys by ones, tens, hundreds, and higher places. Stable passes let each new digit refine the order without losing earlier work.",
    keyIdea: "A digit pass must be stable: values sharing today's digit keep the order produced by all earlier passes.",
  },
  mentalModel: {
    title: "Build order from right to left",
    question: "How can sorting by the least important digit eventually produce complete numeric order?",
    steps: [
      {
        title: "Read one digit place",
        description: "Start with ones. Missing higher digits behave like leading zeros, so 5 has tens digit 0 and hundreds digit 0.",
      },
      {
        title: "Distribute stably",
        description: "Route values into buckets 0 through 9 while preserving their left-to-right arrival order inside each bucket.",
      },
      {
        title: "Collect and move left",
        description: "Join buckets from 0 to 9, multiply the place by ten, and repeat until the largest shifted key has no digit left.",
      },
    ],
  },
  learningPath: lessonSectionOrder,
  studyGuide: {
    objectives: [
      "Extract the digit at any decimal place using division and modulo.",
      "Explain why every digit pass must be stable.",
      "Trace bucket distribution and collection across multiple places.",
      "Relate d digit passes, n values, and b buckets to O(d(n + b)).",
    ],
    prerequisites: [
      "Integer division, modulo, and powers of ten",
      "Stable Counting Sort and frequency buckets",
      "Big O notation with multiple variables",
    ],
    mistakes: [
      {
        title: "Collecting a bucket out of order",
        symptom: "The ones pass looks correct, but later passes scramble values that share the same digit.",
        correction: "Treat every bucket as a queue. Preserve arrival order during both distribution and collection.",
      },
      {
        title: "Ignoring leading zeros",
        symptom: "Short values such as 5 disappear or move after 50 during the hundreds pass.",
        correction: "Missing digits are zero. The expression floor(value / place) % 10 handles them automatically.",
      },
      {
        title: "Applying decimal digits directly to negatives",
        symptom: "Modulo produces negative bucket indexes or an incorrect signed order.",
        correction: "This implementation adds one order-preserving offset so every working key is nonnegative, then removes it afterward.",
      },
    ],
    quiz: [
      {
        id: "digit",
        prompt: "What is the tens digit of 407?",
        options: ["0", "4", "7"],
        correctOption: 0,
        explanation: "floor(407 / 10) % 10 equals 40 % 10, which is 0.",
      },
      {
        id: "stability",
        prompt: "Why must each least-significant-digit pass be stable?",
        options: ["It preserves the ordering established by lower digits", "It reduces the number of digits", "It removes duplicate values"],
        correctOption: 0,
        explanation: "When two keys share the current digit, their lower-digit order must remain intact.",
      },
      {
        id: "passes",
        prompt: "How many decimal passes are needed for shifted maximum 802?",
        options: ["3", "8", "10"],
        correctOption: 0,
        explanation: "The algorithm processes ones, tens, and hundreds: three digit places.",
      },
      {
        id: "signed",
        prompt: "Why does adding the same offset support signed integers?",
        options: ["It makes keys nonnegative without changing their relative order", "It removes the sign bit permanently", "It sorts negatives in a separate unstable pass"],
        correctOption: 0,
        explanation: "If a < b, then a + offset < b + offset. Subtracting the offset restores the original values afterward.",
      },
    ],
  },
  examples: [
    {
      id: "classic",
      type: "Walkthrough",
      title: "Classic digit passes",
      values: [170, 45, 75, 90, 802, 24, 2, 66],
      description: "Follow eight values through ones, tens, and hundreds buckets.",
      result: "3 passes · base 10",
    },
    {
      id: "leading-zeros",
      type: "Place value",
      title: "Leading zeros",
      values: [5, 50, 500, 15, 105],
      description: "Shorter numbers use zero for missing tens and hundreds digits.",
      result: "005 · 050 · 500",
    },
    {
      id: "duplicates",
      type: "Stability case",
      title: "Duplicate keys",
      values: [21, 11, 21, 12],
      description: "Labeled 21A and 21B keep their relative order through every stable pass.",
      result: "Stable equal-key order",
    },
    {
      id: "signed",
      type: "Offset keys",
      title: "Signed integers",
      values: [-12, 3, -1, 20, 0],
      description: "Adding 12 creates nonnegative working keys while preserving numeric order.",
      result: "Offset +12 · restore after sort",
    },
  ],
  codeExamples: {
    javascript: {
      label: "JavaScript",
      filename: "radix-sort.mjs",
      highlight: [2, 5, 7, 8, 10, 12, 13, 16, 17, 18, 19, 21, 22, 24],
      code: `export function radixSort(numbers) {
  if (numbers.some((value) => !Number.isSafeInteger(value))) throw new TypeError("Integers required");
  if (numbers.length === 0) return [];

  const minimum = Math.min(...numbers);
  const offset = minimum < 0 ? -minimum : 0;
  let array = numbers.map((value) => value + offset);
  const maximum = Math.max(...array);

  for (let place = 1; Math.floor(maximum / place) > 0; place *= 10) {
    const counts = Array(10).fill(0);
    for (const value of array) counts[Math.floor(value / place) % 10] += 1;
    for (let digit = 1; digit < 10; digit += 1) counts[digit] += counts[digit - 1];

    const output = Array(array.length);
    for (let index = array.length - 1; index >= 0; index -= 1) {
      const digit = Math.floor(array[index] / place) % 10;
      counts[digit] -= 1;
      output[counts[digit]] = array[index];
    }
    array = output;
    if (place > Math.floor(maximum / 10)) break;
  }
  return array.map((value) => value - offset);
}`,
    },
    python: {
      label: "Python",
      filename: "radix_sort.py",
      highlight: [2, 5, 7, 8, 12, 13, 14, 15, 17, 18, 19, 20, 22, 25],
      code: `def radix_sort(numbers):
    if any(not isinstance(value, int) for value in numbers):
        raise TypeError("Integers required")
    if not numbers:
        return []
    minimum = min(numbers)
    offset = -minimum if minimum < 0 else 0
    array = [value + offset for value in numbers]
    maximum = max(array)
    place = 1

    while maximum // place > 0:
        counts = [0] * 10
        for value in array:
            counts[(value // place) % 10] += 1
        for digit in range(1, 10):
            counts[digit] += counts[digit - 1]
        output = [0] * len(array)
        for value in reversed(array):
            digit = (value // place) % 10
            counts[digit] -= 1
            output[counts[digit]] = value
        array = output
        place *= 10
    return [value - offset for value in array]`,
    },
    java: {
      label: "Java",
      filename: "RadixSort.java",
      highlight: [6, 8, 10, 11, 13, 14, 15, 18, 19, 20, 22, 23, 24, 25, 27, 31],
      code: `public final class RadixSort {
    private RadixSort() {}

    public static int[] radixSort(int[] numbers) {
        if (numbers.length == 0) return new int[] {};
        int minimum = numbers[0];
        for (int value : numbers) minimum = Math.min(minimum, value);
        long offset = minimum < 0 ? -(long) minimum : 0;
        long[] array = new long[numbers.length];
        long maximum = 0;
        for (int index = 0; index < numbers.length; index++) {
            array[index] = numbers[index] + offset;
            maximum = Math.max(maximum, array[index]);
        }

        for (long place = 1; maximum / place > 0; place *= 10) {
            int[] counts = new int[10];
            for (long value : array) counts[(int) ((value / place) % 10)]++;
            for (int digit = 1; digit < 10; digit++) counts[digit] += counts[digit - 1];
            long[] output = new long[array.length];
            for (int index = array.length - 1; index >= 0; index--) {
                int digit = (int) ((array[index] / place) % 10);
                counts[digit]--;
                output[counts[digit]] = array[index];
            }
            array = output;
            if (place > maximum / 10) break;
        }
        int[] result = new int[array.length];
        for (int index = 0; index < array.length; index++) result[index] = (int) (array[index] - offset);
        return result;
    }
}`,
    },
    cpp: {
      label: "C++",
      filename: "radix_sort.cpp",
      highlight: [5, 7, 8, 9, 10, 12, 14, 15, 16, 18, 19, 20, 21, 23, 27, 30],
      code: `#include <algorithm>
#include <vector>

std::vector<int> radixSort(const std::vector<int>& numbers) {
    if (numbers.empty()) return {};
    const int minimum = *std::min_element(numbers.begin(), numbers.end());
    const long long offset = minimum < 0 ? -static_cast<long long>(minimum) : 0;
    std::vector<long long> array(numbers.begin(), numbers.end());
    for (long long& value : array) value += offset;
    const long long maximum = *std::max_element(array.begin(), array.end());

    for (long long place = 1; maximum / place > 0; place *= 10) {
        std::vector<std::size_t> counts(10, 0);
        for (const long long value : array) ++counts[(value / place) % 10];
        for (std::size_t digit = 1; digit < counts.size(); ++digit) counts[digit] += counts[digit - 1];
        std::vector<long long> output(array.size());
        for (auto iterator = array.rbegin(); iterator != array.rend(); ++iterator) {
            const std::size_t digit = (*iterator / place) % 10;
            --counts[digit];
            output[counts[digit]] = *iterator;
        }
        array = std::move(output);
        if (place > maximum / 10) break;
    }
    std::vector<int> result(array.size());
    std::transform(array.begin(), array.end(), result.begin(), [offset](long long value) {
        return static_cast<int>(value - offset);
    });
    return result;
}`,
    },
  },
  complexity: {
    best: { label: "Best case", value: "O(d(n + b))", context: "d digit places" },
    average: { label: "Average case", value: "O(d(n + b))" },
    worst: { label: "Worst case", value: "O(d(n + b))", context: "b = 10 buckets" },
    space: { label: "Extra space", value: "O(n + b)", context: "Output and buckets" },
    property: {
      label: "Stable sort",
      description: "Queue-like buckets preserve equal-key order.",
      symbol: "✓",
      tone: "positive",
      proofLabel: "Stability proof",
      before: ["21A", "11", "21B", "12"],
      after: ["11", "12", "21A", "21B"],
      proof: "Both 21 records visit the same buckets in the same arrival order, so 21A remains before 21B.",
    },
  },
  challenge: {
    title: "Route the tens digit",
    description: "Send each incoming value to the bucket matching its tens digit, including zero for missing tens.",
    rule: "Use floor(value / 10) % 10. Keep values in arrival order inside each bucket.",
    startValues: [170, 45, 75, 90, 2, 24],
  },
  completionCriteria: [
    { id: "digit", label: "Extract a digit", description: "I can calculate ones, tens, or hundreds with division and modulo." },
    { id: "trace", label: "Trace stable passes", description: "I followed distribution and collection across multiple digit places." },
    { id: "implement", label: "Read an implementation", description: "I identified the offset, digit loop, and stable bucket operation in one language." },
    { id: "practice", label: "Practice the mechanics", description: "I completed the knowledge check and tens-digit routing challenge." },
  ],
  useCases: [
    { icon: "123", title: "Fixed-width IDs", description: "Large collections of bounded numeric identifiers can be ordered in predictable digit passes.", recommendation: "Strong fit" },
    { icon: "⌚", title: "Times and dates", description: "Normalized timestamps and date fields naturally decompose into bounded numeric positions.", recommendation: "Good fit" },
    { icon: "⇥", title: "String and byte keys", description: "The same stable positional idea extends to fixed-width characters or bytes with a larger base.", recommendation: "Transferable pattern" },
    { icon: "×", title: "Custom comparisons", description: "Arbitrary objects, locale-aware text, and complex ordering rules do not map directly to digit buckets.", recommendation: "Use a comparison sort", avoid: true },
  ],
});
