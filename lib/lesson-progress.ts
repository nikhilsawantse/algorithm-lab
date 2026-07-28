export type LessonProgress = {
  checkedCriterionIds: string[];
  completedAt: string | null;
};

export const EMPTY_LESSON_PROGRESS: LessonProgress = {
  checkedCriterionIds: [],
  completedAt: null,
};

export function lessonProgressStorageKey(slug: string) {
  return `algorithm-lab:lesson-progress:v1:${slug}`;
}

export function normalizeLessonProgress(value: unknown, validCriterionIds: readonly string[]): LessonProgress {
  if (!value || typeof value !== "object") return { ...EMPTY_LESSON_PROGRESS };

  const candidate = value as { checkedCriterionIds?: unknown; completedAt?: unknown };
  const checkedCriterionIds = Array.isArray(candidate.checkedCriterionIds)
    ? [...new Set(candidate.checkedCriterionIds.filter((id): id is string => (
        typeof id === "string" && validCriterionIds.includes(id)
      )))]
    : [];
  const allCriteriaChecked = validCriterionIds.length > 0 && checkedCriterionIds.length === validCriterionIds.length;
  const completedAt = allCriteriaChecked
    && typeof candidate.completedAt === "string"
    && Number.isFinite(Date.parse(candidate.completedAt))
      ? candidate.completedAt
      : null;

  return { checkedCriterionIds, completedAt };
}

export function lessonProgressPercentage(progress: LessonProgress, criterionCount: number) {
  if (criterionCount <= 0) return 0;
  return Math.round((progress.checkedCriterionIds.length / criterionCount) * 100);
}
