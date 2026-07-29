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
    assert.equal(insertionNavigation.next.status, "complete");
    assert.equal(insertionNavigation.next.href, "/sorting/merge-sort");

    const mergeNavigation = registry.lessonNavigationFor("merge-sort");
    assert.equal(mergeNavigation.previous.name, "Insertion Sort");
    assert.equal(mergeNavigation.previous.href, "/sorting/insertion-sort");
    assert.equal(mergeNavigation.next.name, "Quick Sort");
    assert.equal(mergeNavigation.next.status, "complete");
    assert.equal(mergeNavigation.next.href, "/sorting/quick-sort");

    const quickNavigation = registry.lessonNavigationFor("quick-sort");
    assert.equal(quickNavigation.previous.name, "Merge Sort");
    assert.equal(quickNavigation.previous.href, "/sorting/merge-sort");
    assert.equal(quickNavigation.next.name, "Heap Sort");
    assert.equal(quickNavigation.next.status, "complete");
    assert.equal(quickNavigation.next.href, "/sorting/heap-sort");

    const heapNavigation = registry.lessonNavigationFor("heap-sort");
    assert.equal(heapNavigation.previous.name, "Quick Sort");
    assert.equal(heapNavigation.previous.href, "/sorting/quick-sort");
    assert.equal(heapNavigation.next.name, "Counting Sort");
    assert.equal(heapNavigation.next.status, "complete");
    assert.equal(heapNavigation.next.href, "/sorting/counting-sort");

    const countingNavigation = registry.lessonNavigationFor("counting-sort");
    assert.equal(countingNavigation.previous.name, "Heap Sort");
    assert.equal(countingNavigation.previous.href, "/sorting/heap-sort");
    assert.equal(countingNavigation.next.name, "Radix Sort");
    assert.equal(countingNavigation.next.status, "complete");
    assert.equal(countingNavigation.next.href, "/sorting/radix-sort");

    const radixNavigation = registry.lessonNavigationFor("radix-sort");
    assert.equal(radixNavigation.previous.name, "Counting Sort");
    assert.equal(radixNavigation.previous.href, "/sorting/counting-sort");
    assert.equal(radixNavigation.next, null);
    assert.equal(registry.lessonNavigationFor("missing-lesson"), null);
  } finally {
    await server.close();
  }
});
