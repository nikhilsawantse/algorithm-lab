import type { Metadata } from "next";
import { bubbleSortLesson } from "../../../lib/lessons/bubble-sort";

export const metadata: Metadata = {
  title: `${bubbleSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: bubbleSortLesson.metadataDescription,
};

export default function BubbleSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
