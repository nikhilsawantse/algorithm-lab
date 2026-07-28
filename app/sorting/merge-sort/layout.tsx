import type { Metadata } from "next";
import { mergeSortLesson } from "../../../lib/lessons/merge-sort";

export const metadata: Metadata = {
  title: `${mergeSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: mergeSortLesson.metadataDescription,
};

export default function MergeSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
