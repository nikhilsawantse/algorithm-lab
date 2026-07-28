import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bubble Sort — Interactive Lesson | Algorithm Lab",
  description: "Learn Bubble Sort with a step-by-step visualizer, curated examples, tested JavaScript, Python, Java, and C++ code, and an adjacent-swap challenge.",
};

export default function BubbleSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
