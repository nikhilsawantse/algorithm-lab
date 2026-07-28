"use client";

import { useEffect, useMemo, useState } from "react";
import type { LessonCompletionCriterion } from "../../lib/lesson-schema";
import {
  EMPTY_LESSON_PROGRESS,
  lessonProgressPercentage,
  lessonProgressStorageKey,
  normalizeLessonProgress,
  type LessonProgress,
} from "../../lib/lesson-progress";

type LessonCompletionProps = {
  lessonName: string;
  slug: string;
  criteria: readonly LessonCompletionCriterion[];
};

export function LessonCompletion({ lessonName, slug, criteria }: LessonCompletionProps) {
  const [progress, setProgress] = useState<LessonProgress>({ ...EMPTY_LESSON_PROGRESS });
  const [loaded, setLoaded] = useState(false);
  const validCriterionIds = useMemo(() => criteria.map((criterion) => criterion.id), [criteria]);
  const percentage = lessonProgressPercentage(progress, criteria.length);
  const allChecked = criteria.length > 0 && progress.checkedCriterionIds.length === criteria.length;
  const completed = Boolean(progress.completedAt);
  const completedDate = progress.completedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(progress.completedAt))
    : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(lessonProgressStorageKey(slug));
        if (stored) setProgress(normalizeLessonProgress(JSON.parse(stored), validCriterionIds));
      } catch {
        // Completion still works for the current session when storage is unavailable.
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [slug, validCriterionIds]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(lessonProgressStorageKey(slug), JSON.stringify(progress));
    } catch {
      // Keep the in-memory experience usable in restricted browser contexts.
    }
  }, [loaded, progress, slug]);

  function toggleCriterion(criterionId: string) {
    setProgress((current) => {
      const checked = current.checkedCriterionIds.includes(criterionId);
      return {
        checkedCriterionIds: checked
          ? current.checkedCriterionIds.filter((id) => id !== criterionId)
          : [...current.checkedCriterionIds, criterionId],
        completedAt: null,
      };
    });
  }

  function markComplete() {
    if (!allChecked) return;
    setProgress((current) => ({ ...current, completedAt: new Date().toISOString() }));
  }

  function resetProgress() {
    setProgress({ ...EMPTY_LESSON_PROGRESS });
  }

  return (
    <section className={completed ? "lesson-completion is-complete" : "lesson-completion"} aria-labelledby="lesson-completion-title">
      <div className="lesson-completion-inner">
        <div className="completion-intro">
          <p className="section-number">Lesson progress</p>
          <h2 id="lesson-completion-title">Finish this lesson with confidence</h2>
          <p>Use this private checklist to confirm what you learned. Progress stays only in this browser.</p>
          <div className="completion-meter" aria-label={`${percentage}% of the completion checklist finished`}>
            <span style={{ width: `${percentage}%` }} />
          </div>
          <div className="completion-meter-label"><span>{progress.checkedCriterionIds.length} of {criteria.length} complete</span><strong>{percentage}%</strong></div>
        </div>

        <div className="completion-checklist">
          {criteria.map((criterion) => (
            <label className="completion-criterion" key={criterion.id}>
              <input
                type="checkbox"
                checked={progress.checkedCriterionIds.includes(criterion.id)}
                disabled={completed}
                onChange={() => toggleCriterion(criterion.id)}
              />
              <span><strong>{criterion.label}</strong><small>{criterion.description}</small></span>
            </label>
          ))}
          <div className="completion-actions">
            {completed ? (
              <>
                <p className="completion-success" aria-live="polite"><span>✓</span><strong>{lessonName} complete</strong>{completedDate && <small>Completed {completedDate}</small>}</p>
                <button type="button" onClick={resetProgress}>Reset progress</button>
              </>
            ) : (
              <>
                <button className="button button-primary" type="button" disabled={!allChecked} onClick={markComplete}>Mark lesson complete <span aria-hidden="true">✓</span></button>
                <p aria-live="polite">{allChecked ? "Checklist finished. You can now mark the lesson complete." : "Complete every checklist item to finish the lesson."}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
