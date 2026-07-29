import type { Metadata } from "next";
import { heapSortLesson } from "../../../lib/lessons/heap-sort";

export const metadata: Metadata = {
  title: `${heapSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: heapSortLesson.metadataDescription,
};

export default function HeapSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
