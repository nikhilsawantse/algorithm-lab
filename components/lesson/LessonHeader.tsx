import { sitePath } from "../../lib/site-path";

type LessonHeaderProps = {
  lessonNumber: number;
};

export function LessonHeader({ lessonNumber }: LessonHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href={sitePath("/")} aria-label="Algorithm Lab home">
        <span className="brand-mark">A</span>
        <span>Algorithm Lab</span>
      </a>
      <nav aria-label="Lesson navigation">
        <a href={sitePath("/")}>Explore</a>
        <a href="#learn">Learn</a>
        <a href="#visualizer">Visualizer</a>
        <a href="#quiz">Quiz</a>
        <a href="#challenge">Challenge</a>
      </nav>
      <span className="lesson-pill">Lesson {String(lessonNumber).padStart(2, "0")}</span>
    </header>
  );
}
