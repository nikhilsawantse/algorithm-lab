import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = mkdtempSync(path.join(tmpdir(), "algorithm-lab-cpp-"));
const suites = [
  { directory: "bubble-sort", source: "bubble_sort.cpp", test: "test_bubble_sort.cpp", executable: "bubble-sort-tests" },
  { directory: "selection-sort", source: "selection_sort.cpp", test: "test_selection_sort.cpp", executable: "selection-sort-tests" },
  { directory: "insertion-sort", source: "insertion_sort.cpp", test: "test_insertion_sort.cpp", executable: "insertion-sort-tests" },
  { directory: "merge-sort", source: "merge_sort.cpp", test: "test_merge_sort.cpp", executable: "merge-sort-tests" },
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
    const executableName = process.platform === "win32" ? `${suite.executable}.exe` : suite.executable;
    const executable = path.join(outputDirectory, executableName);
    run("g++", [
      "-std=c++17",
      "-Wall",
      "-Wextra",
      "-pedantic",
      path.join(sourceDirectory, suite.source),
      path.join(sourceDirectory, suite.test),
      "-o",
      executable,
    ]);
    run(executable, []);
  }
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
