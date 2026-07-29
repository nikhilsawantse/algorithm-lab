import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const python = process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");
const tests = [
  path.join(root, "algorithms", "sorting", "bubble-sort", "test_bubble_sort.py"),
  path.join(root, "algorithms", "sorting", "selection-sort", "test_selection_sort.py"),
  path.join(root, "algorithms", "sorting", "insertion-sort", "test_insertion_sort.py"),
  path.join(root, "algorithms", "sorting", "merge-sort", "test_merge_sort.py"),
  path.join(root, "algorithms", "sorting", "quick-sort", "test_quick_sort.py"),
  path.join(root, "algorithms", "sorting", "heap-sort", "test_heap_sort.py"),
  path.join(root, "algorithms", "sorting", "counting-sort", "test_counting_sort.py"),
];

for (const test of tests) {
  const result = spawnSync(python, [test], { encoding: "utf8", stdio: "pipe", cwd: path.dirname(test) });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${python} failed\n${result.stdout}${result.stderr}`);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}
