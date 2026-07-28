import { lessonNavigationFor } from "../../lib/algorithms";
import { sitePath } from "../../lib/site-path";

type LessonNavigationProps = {
  currentSlug: string;
};

function DirectionLabel({ direction }: { direction: "Previous" | "Next" }) {
  return <span className="lesson-nav-direction">{direction === "Previous" ? "← Previous" : "Next →"}</span>;
}

export function LessonNavigation({ currentSlug }: LessonNavigationProps) {
  const navigation = lessonNavigationFor(currentSlug);
  if (!navigation) return null;

  const { current, previous, next } = navigation;

  return (
    <nav className="lesson-navigation" aria-labelledby="lesson-navigation-title">
      <div className="lesson-navigation-inner">
        <div className="lesson-navigation-heading">
          <div>
            <p className="section-number">Continue learning</p>
            <h2 id="lesson-navigation-title">Move through the {current.category} track</h2>
          </div>
          <p>Lessons follow a deliberate sequence, so each new idea builds on the one before it.</p>
        </div>
        <div className="lesson-navigation-grid">
          {previous?.href ? (
            <a className="lesson-nav-card is-link" href={sitePath(previous.href)}>
              <DirectionLabel direction="Previous" />
              <strong>{previous.name}</strong>
              <p>{previous.description}</p>
              <small>{previous.difficulty} lesson</small>
            </a>
          ) : (
            <a className="lesson-nav-card is-link" href={sitePath("/#lessons")}>
              <DirectionLabel direction="Previous" />
              <strong>All lessons</strong>
              <p>Return to the catalog and explore every Algorithm Lab track.</p>
              <small>Lesson catalog</small>
            </a>
          )}

          {next?.status === "complete" && next.href ? (
            <a className="lesson-nav-card is-link is-next" href={sitePath(next.href)}>
              <DirectionLabel direction="Next" />
              <strong>{next.name}</strong>
              <p>{next.description}</p>
              <small>{next.difficulty} lesson</small>
            </a>
          ) : next ? (
            <article className="lesson-nav-card is-next is-planned">
              <DirectionLabel direction="Next" />
              <strong>{next.name}</strong>
              <p>{next.description}</p>
              <small>Coming next · {next.difficulty}</small>
            </article>
          ) : (
            <article className="lesson-nav-card is-next is-planned">
              <DirectionLabel direction="Next" />
              <strong>Track complete</strong>
              <p>You have reached the end of the currently planned lessons in this track.</p>
              <small>More lessons will be added</small>
            </article>
          )}
        </div>
      </div>
    </nav>
  );
}
