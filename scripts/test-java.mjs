import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "algorithms", "sorting", "bubble-sort");
const outputDirectory = mkdtempSync(path.join(tmpdir(), "algorithm-lab-java-"));

function run(command, arguments_) {
  const result = spawnSync(command, arguments_, { encoding: "utf8", stdio: "pipe" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed\n${result.stdout}${result.stderr}`);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

try {
  run("javac", [
    "-d",
    outputDirectory,
    path.join(sourceDirectory, "BubbleSort.java"),
    path.join(sourceDirectory, "BubbleSortTest.java"),
  ]);
  run("java", ["-cp", outputDirectory, "BubbleSortTest"]);
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
