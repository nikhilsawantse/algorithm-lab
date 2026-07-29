import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("complete lessons satisfy the standard lesson definition", async () => {
  const server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });

  try {
    const schema = await server.ssrLoadModule("/lib/lesson-schema.ts");
    const bubbleModule = await server.ssrLoadModule("/lib/lessons/bubble-sort.ts");
    const insertionModule = await server.ssrLoadModule("/lib/lessons/insertion-sort.ts");
    const mergeModule = await server.ssrLoadModule("/lib/lessons/merge-sort.ts");
    const quickModule = await server.ssrLoadModule("/lib/lessons/quick-sort.ts");
    const heapModule = await server.ssrLoadModule("/lib/lessons/heap-sort.ts");
    const selectionModule = await server.ssrLoadModule("/lib/lessons/selection-sort.ts");
    const lessons = [bubbleModule.bubbleSortLesson, selectionModule.selectionSortLesson, insertionModule.insertionSortLesson, mergeModule.mergeSortLesson, quickModule.quickSortLesson, heapModule.heapSortLesson];

    for (const lesson of lessons) {
      assert.deepEqual(Object.keys(lesson.codeExamples), schema.supportedLanguageIds);
      assert.deepEqual(
        Object.values(lesson.codeExamples).map((example) => example.label),
        schema.supportedLanguages,
      );
      await Promise.all(Object.values(lesson.codeExamples).map((example) => (
        access(path.join(root, "algorithms", "sorting", lesson.slug, example.filename))
      )));
      assert.equal(lesson.learningPath.length, 8);
      assert.equal(lesson.studyGuide.quiz.length, 4);
      assert.equal(lesson.completionCriteria.length, 4);
      assert.ok(lesson.examples.length >= 3);
      assert.ok(lesson.useCases.some((useCase) => useCase.avoid));
    }

    const lesson = lessons[0];

    const invalidLesson = structuredClone(lesson);
    invalidLesson.studyGuide.quiz[0].correctOption = 99;
    assert.throws(() => schema.defineLesson(invalidLesson), /invalid correctOption/);

    const duplicateCompletion = structuredClone(lesson);
    duplicateCompletion.completionCriteria[1].id = duplicateCompletion.completionCriteria[0].id;
    assert.throws(() => schema.defineLesson(duplicateCompletion), /duplicate completion ids/);

    const invalidPropertyTone = structuredClone(lesson);
    invalidPropertyTone.complexity.property.tone = "unknown";
    assert.throws(() => schema.defineLesson(invalidPropertyTone), /property tone/);
  } finally {
    await server.close();
  }
});
