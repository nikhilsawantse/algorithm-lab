import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = mkdtempSync(path.join(tmpdir(), "algorithm-lab-java-"));
const suites = [
  { directory: "bubble-sort", source: "BubbleSort.java", test: "BubbleSortTest.java", className: "BubbleSortTest" },
  { directory: "selection-sort", source: "SelectionSort.java", test: "SelectionSortTest.java", className: "SelectionSortTest" },
  { directory: "insertion-sort", source: "InsertionSort.java", test: "InsertionSortTest.java", className: "InsertionSortTest" },
];

function run(command, arguments_) {
  const result = spawnSync(command, arguments_, { encoding: "utf8", stdio: "pipe" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed\n${result.stdout}${result.stderr}`);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

try {
  for (const suite of suites) {
    const sourceDirectory = path.join(root, "algorithms", "sorting", suite.directory);
    run("javac", ["-d", outputDirectory, path.join(sourceDirectory, suite.source), path.join(sourceDirectory, suite.test)]);
    run("java", ["-cp", outputDirectory, suite.className]);
  }
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
