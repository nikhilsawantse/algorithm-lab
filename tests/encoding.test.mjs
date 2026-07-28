import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const roots = ["algorithms", "app", "components", "docs", "lib", "scripts", "tests"];
const textExtensions = new Set([".cpp", ".css", ".java", ".js", ".md", ".mjs", ".py", ".ts", ".tsx"]);
const corruptedCharacters = /\u00e2|\u00c2|\u00c3|\ufffd/u;

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectTextFiles(entryPath));
    else if (textExtensions.has(path.extname(entry.name))) files.push(entryPath);
  }

  return files;
}

test("source files do not contain common UTF-8 decoding artifacts", async () => {
  const files = (await Promise.all(roots.map(collectTextFiles))).flat();
  const affected = [];

  for (const file of files) {
    if (corruptedCharacters.test(await readFile(file, "utf8"))) affected.push(file);
  }

  assert.deepEqual(affected, [], `Encoding artifacts found in: ${affected.join(", ")}`);
});
