import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Algorithm Lab catalog", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Algorithm Lab/);
  assert.match(html, /Algorithms should be/);
  assert.match(html, /Free for learners/);
  assert.match(html, /Available lessons/);
  assert.match(html, /Bubble Sort/);
  assert.match(html, /Selection Sort/);
  assert.match(html, /Insertion Sort/);
  assert.match(html, /Merge Sort/);
  assert.match(html, /Quick Sort/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});

test("server-renders the complete Bubble Sort lesson", async () => {
  const response = await render("/sorting/bubble-sort");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /See every swap/);
  assert.match(html, /Watch the algorithm work/);
  assert.match(html, /Already sorted/);
  assert.match(html, /Reverse order/);
  assert.match(html, /Duplicate values/);
  assert.match(html, /Python/);
  assert.match(html, /Stability proof/);
  assert.match(html, /What you will learn/);
  assert.match(html, /JavaScript.*Python.*Java.*C\+\+/s);
  assert.match(html, /Dry-run trace/);
  assert.match(html, /Generate a random array/);
  assert.match(html, /Complexity at a glance/);
  assert.match(html, /Common mistakes/);
  assert.match(html, /Check your understanding/);
  assert.match(html, /Be the algorithm/);
  assert.match(html, /Continue learning/);
  assert.match(html, /Selection Sort/);
  assert.match(html, /sorting\/selection-sort/);
  assert.match(html, /Finish this lesson with confidence/);
  assert.match(html, /Progress stays only in this browser/);
  assert.match(html, /Mark lesson complete/);
  assert.doesNotMatch(html, /Your site is taking shape|\u00e2|\u00c2|\u00c3|\ufffd/u);
});

test("server-renders the complete Selection Sort lesson", async () => {
  const response = await render("/sorting/selection-sort");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Find the smallest/);
  assert.match(html, /Watch the minimum move into place/);
  assert.match(html, /Classic example/);
  assert.match(html, /Already sorted/);
  assert.match(html, /Reverse order/);
  assert.match(html, /Duplicate values/);
  assert.match(html, /JavaScript.*Python.*Java.*C\+\+/s);
  assert.match(html, /Dry-run trace/);
  assert.match(html, /Candidates \/ minimum/);
  assert.match(html, /Complexity at a glance/);
  assert.match(html, /Instability example/);
  assert.match(html, /Common mistakes/);
  assert.match(html, /Check your understanding/);
  assert.match(html, /Choose the minimum/);
  assert.match(html, /Bubble Sort/);
  assert.match(html, /Insertion Sort/);
  assert.match(html, /sorting\/insertion-sort/);
  assert.match(html, /Finish this lesson with confidence/);
  assert.doesNotMatch(html, /Your site is taking shape|\u00e2|\u00c2|\u00c3|\ufffd/u);
});

test("server-renders the complete Insertion Sort lesson", async () => {
  const response = await render("/sorting/insertion-sort");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Pick the next value/);
  assert.match(html, /Watch each key join the sorted region/);
  assert.match(html, /Classic example/);
  assert.match(html, /Already sorted/);
  assert.match(html, /Reverse order/);
  assert.match(html, /Duplicate values/);
  assert.match(html, /JavaScript.*Python.*Java.*C\+\+/s);
  assert.match(html, /Dry-run trace/);
  assert.match(html, /Key \/ neighbor/);
  assert.match(html, /Shifts/);
  assert.match(html, /Complexity at a glance/);
  assert.match(html, /Stability proof/);
  assert.match(html, /Common mistakes/);
  assert.match(html, /Check your understanding/);
  assert.match(html, /Insert the next card/);
  assert.match(html, /Selection Sort/);
  assert.match(html, /Merge Sort/);
  assert.match(html, /sorting\/merge-sort/);
  assert.match(html, /Finish this lesson with confidence/);
  assert.doesNotMatch(html, /Your site is taking shape|\u00e2|\u00c2|\u00c3|\ufffd/u);
});

test("server-renders the complete Merge Sort lesson", async () => {
  const response = await render("/sorting/merge-sort");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Split the problem/);
  assert.match(html, /Watch the recursion tree resolve/);
  assert.match(html, /Balanced recursion/);
  assert.match(html, /Already sorted/);
  assert.match(html, /Reverse order/);
  assert.match(html, /Duplicate values/);
  assert.match(html, /JavaScript.*Python.*Java.*C\+\+/s);
  assert.match(html, /Dry-run trace/);
  assert.match(html, /Current fronts/);
  assert.match(html, /Current output/);
  assert.match(html, /Writes/);
  assert.match(html, /Complexity at a glance/);
  assert.match(html, /Stability proof/);
  assert.match(html, /Common mistakes/);
  assert.match(html, /Check your understanding/);
  assert.match(html, /Merge two sorted queues/);
  assert.match(html, /Insertion Sort/);
  assert.match(html, /Quick Sort/);
  assert.match(html, /sorting\/quick-sort/);
  assert.match(html, /Finish this lesson with confidence/);
  assert.doesNotMatch(html, /Your site is taking shape|\u00e2|\u00c2|\u00c3|\ufffd/u);
});

test("server-renders the complete Quick Sort lesson", async () => {
  const response = await render("/sorting/quick-sort");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Choose a pivot/);
  assert.match(html, /Watch each pivot divide its range/);
  assert.match(html, /Classic partition/);
  assert.match(html, /Balanced pivots/);
  assert.match(html, /Already sorted/);
  assert.match(html, /Duplicate values/);
  assert.match(html, /JavaScript.*Python.*Java.*C\+\+/s);
  assert.match(html, /Dry-run trace/);
  assert.match(html, /Scan \/ pivot/);
  assert.match(html, /Partitions/);
  assert.match(html, /Complexity at a glance/);
  assert.match(html, /Instability example/);
  assert.match(html, /Common mistakes/);
  assert.match(html, /Check your understanding/);
  assert.match(html, /Build a pivot partition/);
  assert.match(html, /Merge Sort/);
  assert.match(html, /Heap Sort/);
  assert.match(html, /Coming next/);
  assert.match(html, /Finish this lesson with confidence/);
  assert.doesNotMatch(html, /Your site is taking shape|\u00e2|\u00c2|\u00c3|\ufffd/u);
});

test("server-renders the foundations glossary", async () => {
  const response = await render("/glossary");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /plain-language algorithm glossary/);
  assert.match(html, /Big O notation/);
  assert.match(html, /Stable sort/);
  assert.match(html, /Memoization/);
});
