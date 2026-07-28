export type LessonQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
};

export type LessonMistake = {
  title: string;
  symptom: string;
  correction: string;
};

export type LessonStudyGuide = {
  objectives: string[];
  prerequisites: string[];
  quiz: LessonQuizQuestion[];
  mistakes: LessonMistake[];
};

export const lessonSectionOrder = [
  "Understand",
  "Visualize",
  "Trace",
  "Code",
  "Complexity",
  "Quiz",
  "Challenge",
  "Use cases",
] as const;

export const bubbleSortStudyGuide: LessonStudyGuide = {
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
};
