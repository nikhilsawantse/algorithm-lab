import { sitePath } from "../../lib/site-path";

type LessonFoundationsProps = {
  objectives: readonly string[];
  prerequisites: readonly string[];
  sectionOrder: readonly string[];
};

export function LessonFoundations({ objectives, prerequisites, sectionOrder }: LessonFoundationsProps) {
  return (
    <section className="lesson-foundations" id="lesson-content" aria-labelledby="lesson-foundations-title">
      <div className="lesson-foundations-heading">
        <p className="section-number">Before you start</p>
        <h2 id="lesson-foundations-title">What you will learn</h2>
        <p>A clear finish line for the lesson, plus the small amount of knowledge you need before beginning.</p>
      </div>
      <div className="lesson-foundations-grid">
        <article>
          <span className="foundation-label">Learning objectives</span>
          <ol>
            {objectives.map((objective) => <li key={objective}>{objective}</li>)}
          </ol>
        </article>
        <article>
          <span className="foundation-label">Prerequisites</span>
          <ul>
            {prerequisites.map((prerequisite) => <li key={prerequisite}>{prerequisite}</li>)}
          </ul>
          <a href={sitePath("/glossary")}>Review the foundations glossary →</a>
        </article>
      </div>
      <div className="lesson-path" aria-label="Lesson learning path">
        {sectionOrder.map((section, index) => (
          <span key={section}><i>{String(index + 1).padStart(2, "0")}</i>{section}</span>
        ))}
      </div>
    </section>
  );
}
