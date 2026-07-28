import type { Metadata } from "next";
import { insertionSortLesson } from "../../../lib/lessons/insertion-sort";

export const metadata: Metadata = {
  title: `${insertionSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: insertionSortLesson.metadataDescription,
};

export default function InsertionSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
