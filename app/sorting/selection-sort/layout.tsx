import type { Metadata } from "next";
import { selectionSortLesson } from "../../../lib/lessons/selection-sort";

export const metadata: Metadata = {
  title: `${selectionSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: selectionSortLesson.metadataDescription,
};

export default function SelectionSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
