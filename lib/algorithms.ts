import { bubbleSortLesson } from "./lessons/bubble-sort";
import { insertionSortLesson } from "./lessons/insertion-sort";
import { selectionSortLesson } from "./lessons/selection-sort";
import { supportedLanguages } from "./lesson-schema";
import type { AlgorithmDifficulty, SupportedLanguage } from "./lesson-schema";

export type AlgorithmStatus = "complete" | "planned";
export { supportedLanguages } from "./lesson-schema";
export type { AlgorithmDifficulty, SupportedLanguage } from "./lesson-schema";

export type AlgorithmLesson = {
  name: string;
  slug: string;
  category: string;
  difficulty: AlgorithmDifficulty;
  description: string;
  status: AlgorithmStatus;
  href?: string;
  languages: readonly SupportedLanguage[];
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
    name: bubbleSortLesson.name,
    slug: bubbleSortLesson.slug,
    category: bubbleSortLesson.category,
    difficulty: bubbleSortLesson.difficulty,
    description: bubbleSortLesson.description,
    status: "complete",
    href: "/sorting/bubble-sort",
    languages: supportedLanguages,
    complexity: bubbleSortLesson.complexity.average.value,
  },
  {
    name: selectionSortLesson.name,
    slug: selectionSortLesson.slug,
    category: selectionSortLesson.category,
    difficulty: selectionSortLesson.difficulty,
    description: selectionSortLesson.description,
    status: "complete",
    href: "/sorting/selection-sort",
    languages: supportedLanguages,
    complexity: selectionSortLesson.complexity.average.value,
  },
  {
    name: insertionSortLesson.name,
    slug: insertionSortLesson.slug,
    category: insertionSortLesson.category,
    difficulty: insertionSortLesson.difficulty,
    description: insertionSortLesson.description,
    status: "complete",
    href: "/sorting/insertion-sort",
    languages: supportedLanguages,
    complexity: insertionSortLesson.complexity.average.value,
  },
  { name: "Merge Sort", slug: "merge-sort", category: "sorting", difficulty: "Intermediate", description: "Divide, sort, and merge smaller arrays.", status: "planned", languages: supportedLanguages },
  { name: "Quick Sort", slug: "quick-sort", category: "sorting", difficulty: "Intermediate", description: "Partition values around a pivot.", status: "planned", languages: supportedLanguages },
  { name: "Binary Search", slug: "binary-search", category: "searching", difficulty: "Beginner", description: "Halve a sorted search space with every decision.", status: "planned", languages: supportedLanguages },
  { name: "Breadth-first search", slug: "breadth-first-search", category: "graphs", difficulty: "Intermediate", description: "Explore a graph level by level.", status: "planned", languages: supportedLanguages },
  { name: "Dijkstra's algorithm", slug: "dijkstra", category: "graphs", difficulty: "Intermediate", description: "Find shortest paths through weighted graphs.", status: "planned", languages: supportedLanguages },
  { name: "Fibonacci memoization", slug: "fibonacci-memoization", category: "dynamic-programming", difficulty: "Beginner", description: "See how caching removes repeated recursive work.", status: "planned", languages: supportedLanguages },
];

export const availableLessons = algorithms.filter((algorithm) => algorithm.status === "complete");

export function lessonsForCategory(category: string) {
  return algorithms.filter((algorithm) => algorithm.category === category);
}

export function lessonNavigationFor(slug: string) {
  const current = algorithms.find((algorithm) => algorithm.slug === slug);
  if (!current) return null;

  const trackLessons = lessonsForCategory(current.category);
  const currentIndex = trackLessons.findIndex((algorithm) => algorithm.slug === slug);

  return {
    current,
    previous: currentIndex > 0 ? trackLessons[currentIndex - 1] : null,
    next: currentIndex < trackLessons.length - 1 ? trackLessons[currentIndex + 1] : null,
  };
}
