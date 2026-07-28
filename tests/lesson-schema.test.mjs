import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Bubble Sort satisfies the standard lesson definition", async () => {
  const server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });

  try {
    const schema = await server.ssrLoadModule("/lib/lesson-schema.ts");
    const lessons = await server.ssrLoadModule("/lib/lessons/bubble-sort.ts");
    const lesson = lessons.bubbleSortLesson;

    assert.equal(lesson.slug, "bubble-sort");
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
    assert.ok(lesson.examples.length >= 3);
    assert.ok(lesson.useCases.some((useCase) => useCase.avoid));

    const invalidLesson = structuredClone(lesson);
    invalidLesson.studyGuide.quiz[0].correctOption = 99;
    assert.throws(() => schema.defineLesson(invalidLesson), /invalid correctOption/);
  } finally {
    await server.close();
  }
});
