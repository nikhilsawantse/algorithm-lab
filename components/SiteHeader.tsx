export function SiteHeader() {
  return (
    <header className="platform-header">
      <a className="brand" href="/" aria-label="Algorithm Lab home">
        <span className="brand-mark">A</span>
        <span>Algorithm Lab</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/#lessons">Lessons</a>
        <a href="/#categories">Categories</a>
        <a href="/glossary">Glossary</a>
        <a href="/#contribute">Contribute</a>
      </nav>
      <span className="free-pill">Free forever</span>
    </header>
  );
}
