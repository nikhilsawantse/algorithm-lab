import type { Metadata } from "next";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { sitePath } from "../../lib/site-path";

export const metadata: Metadata = {
  title: "Algorithm Glossary | Algorithm Lab",
  description: "Plain-language definitions for Big O, complexity, stability, recursion, memoization, graphs, and other algorithm foundations.",
};

const terms = [
  { term: "Algorithm", meaning: "A finite sequence of steps used to solve a problem or complete a computation.", example: "Bubble Sort is an algorithm for ordering values." },
  { term: "Big O notation", meaning: "A way to describe how an algorithm's resource use grows as its input grows.", example: "O(n²) means the work can grow roughly with the square of the input size." },
  { term: "Time complexity", meaning: "How the number of operations grows as the input becomes larger.", example: "Binary Search has O(log n) time complexity." },
  { term: "Space complexity", meaning: "How much additional memory an algorithm needs as the input grows.", example: "An in-place swap can use O(1) extra space." },
  { term: "Stable sort", meaning: "A sorting algorithm that preserves the original order of items with equal keys.", example: "If 4A appears before 4B, a stable sort keeps 4A first." },
  { term: "In-place", meaning: "An algorithm that transforms its input using only a small, constant amount of extra memory.", example: "Bubble Sort swaps values inside the same array." },
  { term: "Recursion", meaning: "A technique where a function solves a problem by calling itself on a smaller version of that problem.", example: "Tree traversal is often expressed recursively." },
  { term: "Memoization", meaning: "Saving previously computed answers so repeated subproblems do not need to be solved again.", example: "Memoization turns naive recursive Fibonacci into a linear-time solution." },
  { term: "Vertex and edge", meaning: "A vertex is a point in a graph; an edge represents a connection between two points.", example: "Cities can be vertices and roads can be edges." },
  { term: "Greedy choice", meaning: "A locally optimal decision made without revisiting earlier choices.", example: "Kruskal's algorithm repeatedly chooses the cheapest safe edge." },
];

export default function GlossaryPage() {
  return (
    <main className="platform-page glossary-page">
      <SiteHeader />
      <section className="glossary-hero">
        <p className="eyebrow"><span /> Foundations</p>
        <h1>A plain-language algorithm glossary.</h1>
        <p>Keep this reference nearby while you learn. Every definition includes a concrete example, without assuming a computer-science background.</p>
      </section>
      <section className="glossary-list" aria-label="Algorithm glossary terms">
        {terms.map((item, index) => (
          <article key={item.term}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{item.term}</h2>
              <p>{item.meaning}</p>
              <small><strong>Example:</strong> {item.example}</small>
            </div>
          </article>
        ))}
      </section>
      <section className="glossary-next">
        <p>Ready to see these ideas in motion?</p>
        <a className="button button-primary" href={sitePath("/sorting/bubble-sort")}>Open Bubble Sort <span>→</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
