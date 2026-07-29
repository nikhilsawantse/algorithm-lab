import type { Metadata } from "next";
import { quickSortLesson } from "../../../lib/lessons/quick-sort";

export const metadata: Metadata = {
  title: `${quickSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: quickSortLesson.metadataDescription,
};

export default function QuickSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
