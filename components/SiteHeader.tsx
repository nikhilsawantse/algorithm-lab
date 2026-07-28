import { sitePath } from "../lib/site-path";

export function SiteHeader() {
  return (
    <header className="platform-header">
      <a className="brand" href={sitePath("/")} aria-label="Algorithm Lab home">
        <span className="brand-mark">A</span>
        <span>Algorithm Lab</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href={sitePath("/#lessons")}>Lessons</a>
        <a href={sitePath("/#categories")}>Categories</a>
        <a href={sitePath("/glossary")}>Glossary</a>
        <a href={sitePath("/#contribute")}>Contribute</a>
      </nav>
      <span className="free-pill">Free forever</span>
    </header>
  );
}
