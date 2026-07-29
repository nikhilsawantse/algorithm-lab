import type { Metadata } from "next";
import { radixSortLesson } from "../../../lib/lessons/radix-sort";

export const metadata: Metadata = {
  title: `${radixSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: radixSortLesson.metadataDescription,
};

export default function RadixSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
