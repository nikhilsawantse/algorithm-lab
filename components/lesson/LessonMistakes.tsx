import type { LessonMistake } from "../../lib/lesson-schema";

type LessonMistakesProps = {
  mistakes: readonly LessonMistake[];
  sectionLabel?: string;
};

export function LessonMistakes({ mistakes, sectionLabel = "04 — Avoid the traps" }: LessonMistakesProps) {
  return (
    <section className="mistakes-section" aria-labelledby="mistakes-title">
      <div className="section-heading">
        <p className="section-number">{sectionLabel}</p>
        <h2 id="mistakes-title">Common mistakes</h2>
        <p>These bugs often produce an answer that looks almost right. Learn the symptom and the correction together.</p>
      </div>
      <div className="mistakes-grid">
        {mistakes.map((mistake, index) => (
          <article key={mistake.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{mistake.title}</h3>
            <p><strong>Symptom:</strong> {mistake.symptom}</p>
            <p><strong>Correction:</strong> {mistake.correction}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
