import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("lesson progress keeps only valid criteria and trustworthy completion data", async () => {
  const server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });

  try {
    const progressModule = await server.ssrLoadModule("/lib/lesson-progress.ts");
    const validIds = ["explain", "trace", "practice"];
    const partial = progressModule.normalizeLessonProgress({
      checkedCriterionIds: ["trace", "unknown", "trace"],
      completedAt: "2026-07-28T10:00:00.000Z",
    }, validIds);

    assert.deepEqual(partial, { checkedCriterionIds: ["trace"], completedAt: null });
    assert.equal(progressModule.lessonProgressPercentage(partial, validIds.length), 33);
    assert.equal(progressModule.lessonProgressPercentage(partial, 0), 0);

    const complete = progressModule.normalizeLessonProgress({
      checkedCriterionIds: validIds,
      completedAt: "2026-07-28T10:00:00.000Z",
    }, validIds);
    assert.equal(complete.completedAt, "2026-07-28T10:00:00.000Z");
    assert.equal(progressModule.lessonProgressPercentage(complete, validIds.length), 100);
    assert.match(progressModule.lessonProgressStorageKey("bubble-sort"), /bubble-sort$/);
  } finally {
    await server.close();
  }
});
