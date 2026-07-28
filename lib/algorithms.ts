export type AlgorithmStatus = "complete" | "planned";
export type AlgorithmDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type AlgorithmLesson = {
  name: string;
  slug: string;
  category: string;
  difficulty: AlgorithmDifficulty;
  description: string;
  status: AlgorithmStatus;
  href?: string;
  languages: string[];
  complexity?: string;
};

export const categories = [
  { id: "sorting", code: "SO", name: "Sorting", description: "Arrange data and compare different strategies for ordering it." },
  { id: "searching", code: "SE", name: "Searching", description: "Find values efficiently in lists, ranges, and structured data." },
  { id: "graphs", code: "GR", name: "Graphs", description: "Explore networks, paths, traversal, and shortest-route problems." },
  { id: "recursion", code: "RE", name: "Recursion", description: "Break problems into smaller versions of themselves." },
  { id: "dynamic-programming", code: "DP", name: "Dynamic programming", description: "Reuse solved subproblems to make difficult problems tractable." },
  { id: "greedy", code: "GE", name: "Greedy", description: "Build solutions through locally optimal choices." },
  { id: "strings", code: "ST", name: "Strings", description: "Match, search, transform, and reason about text efficiently." },
] as const;

export const algorithms: AlgorithmLesson[] = [
  {
    name: "Bubble Sort",
    slug: "bubble-sort",
    category: "sorting",
    difficulty: "Beginner",
    description: "Compare adjacent values and watch the largest unsorted item rise into place.",
    status: "complete",
    href: "/sorting/bubble-sort",
    languages: ["JavaScript", "Python"],
    complexity: "O(n²)",
  },
  { name: "Selection Sort", slug: "selection-sort", category: "sorting", difficulty: "Beginner", description: "Repeatedly select the smallest remaining value.", status: "planned", languages: ["JavaScript", "Python"] },
  { name: "Insertion Sort", slug: "insertion-sort", category: "sorting", difficulty: "Beginner", description: "Grow a sorted region one carefully placed value at a time.", status: "planned", languages: ["JavaScript", "Python"] },
  { name: "Merge Sort", slug: "merge-sort", category: "sorting", difficulty: "Intermediate", description: "Divide, sort, and merge smaller arrays.", status: "planned", languages: ["JavaScript", "Python"] },
  { name: "Quick Sort", slug: "quick-sort", category: "sorting", difficulty: "Intermediate", description: "Partition values around a pivot.", status: "planned", languages: ["JavaScript", "Python"] },
  { name: "Binary Search", slug: "binary-search", category: "searching", difficulty: "Beginner", description: "Halve a sorted search space with every decision.", status: "planned", languages: ["JavaScript", "Python"] },
  { name: "Breadth-first search", slug: "breadth-first-search", category: "graphs", difficulty: "Intermediate", description: "Explore a graph level by level.", status: "planned", languages: ["JavaScript", "Python"] },
  { name: "Dijkstra's algorithm", slug: "dijkstra", category: "graphs", difficulty: "Intermediate", description: "Find shortest paths through weighted graphs.", status: "planned", languages: ["JavaScript", "Python"] },
  { name: "Fibonacci memoization", slug: "fibonacci-memoization", category: "dynamic-programming", difficulty: "Beginner", description: "See how caching removes repeated recursive work.", status: "planned", languages: ["JavaScript", "Python"] },
];

export const availableLessons = algorithms.filter((algorithm) => algorithm.status === "complete");

export function lessonsForCategory(category: string) {
  return algorithms.filter((algorithm) => algorithm.category === category);
}
