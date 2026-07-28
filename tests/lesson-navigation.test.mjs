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
    assert.equal(navigation.next.status, "planned");
    assert.equal(navigation.next.href, undefined);
    assert.equal(registry.lessonNavigationFor("missing-lesson"), null);
  } finally {
    await server.close();
  }
});
