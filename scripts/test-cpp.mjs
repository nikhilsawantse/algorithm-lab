import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "algorithms", "sorting", "bubble-sort");
const outputDirectory = mkdtempSync(path.join(tmpdir(), "algorithm-lab-cpp-"));
const executable = path.join(outputDirectory, process.platform === "win32" ? "bubble-sort-tests.exe" : "bubble-sort-tests");

function run(command, arguments_) {
  const result = spawnSync(command, arguments_, { encoding: "utf8", stdio: "pipe" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed\n${result.stdout}${result.stderr}`);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

try {
  run("g++", [
    "-std=c++17",
    "-Wall",
    "-Wextra",
    "-pedantic",
    path.join(sourceDirectory, "bubble_sort.cpp"),
    path.join(sourceDirectory, "test_bubble_sort.cpp"),
    "-o",
    executable,
  ]);
  run(executable, []);
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
