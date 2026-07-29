import type { Metadata } from "next";
import { countingSortLesson } from "../../../lib/lessons/counting-sort";

export const metadata: Metadata = {
  title: `${countingSortLesson.name} — Interactive Lesson | Algorithm Lab`,
  description: countingSortLesson.metadataDescription,
};

export default function CountingSortLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
