import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("lesson navigation follows curriculum order and respects planned lessons", async () => {
  const server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });

  try {
    const registry = await server.ssrLoadModule("/lib/algorithms.ts");
    const navigation = registry.lessonNavigationFor("bubble-sort");

    assert.equal(navigation.current.name, "Bubble Sort");
    assert.equal(navigation.previous, null);
    assert.equal(navigation.next.name, "Selection Sort");
    assert.equal(navigation.next.status, "complete");
    assert.equal(navigation.next.href, "/sorting/selection-sort");

    const selectionNavigation = registry.lessonNavigationFor("selection-sort");
    assert.equal(selectionNavigation.previous.name, "Bubble Sort");
    assert.equal(selectionNavigation.previous.href, "/sorting/bubble-sort");
    assert.equal(selectionNavigation.next.name, "Insertion Sort");
    assert.equal(selectionNavigation.next.status, "complete");
    assert.equal(selectionNavigation.next.href, "/sorting/insertion-sort");

    const insertionNavigation = registry.lessonNavigationFor("insertion-sort");
    assert.equal(insertionNavigation.previous.name, "Selection Sort");
    assert.equal(insertionNavigation.previous.href, "/sorting/selection-sort");
    assert.equal(insertionNavigation.next.name, "Merge Sort");
    assert.equal(insertionNavigation.next.status, "planned");
    assert.equal(registry.lessonNavigationFor("missing-lesson"), null);
  } finally {
    await server.close();
  }
});
