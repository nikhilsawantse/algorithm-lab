import { sitePath } from "../lib/site-path";

export function SiteFooter() {
  return (
    <footer className="platform-footer">
      <div>
        <span className="brand-mark">A</span>
        <p><strong>Algorithm Lab</strong><br /><small>Learn by seeing, doing, and experimenting.</small></p>
      </div>
      <p>Free educational material. No account. No paywall.</p>
      <a href={sitePath("/glossary")}>Open the glossary →</a>
    </footer>
  );
}
