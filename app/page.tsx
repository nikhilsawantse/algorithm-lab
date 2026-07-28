import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { algorithms, availableLessons, categories, lessonsForCategory } from "../lib/algorithms";
import { sitePath } from "../lib/site-path";

const learningSteps = [
  { number: "01", title: "Understand", description: "Begin with a plain-language mental model and a concrete problem." },
  { number: "02", title: "Visualize", description: "Move through every comparison, choice, state change, and result." },
  { number: "03", title: "Implement", description: "Compare tested JavaScript and Python implementations." },
  { number: "04", title: "Practice", description: "Use examples, challenges, and games to make the idea stick." },
];

export default function AlgorithmLabHome() {
  return (
    <main className="platform-page">
      <SiteHeader />

      <section className="platform-hero">
        <div className="platform-hero-copy">
          <p className="eyebrow"><span /> Free and open learning</p>
          <h1>Algorithms should be <em>understood,</em> not memorized.</h1>
          <p>
            Explore algorithms through interactive visualizations, working code, guided examples, and small challenges—freely available to every learner.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={sitePath("/sorting/bubble-sort")}>Start with Bubble Sort <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#categories">Browse the roadmap ↓</a>
          </div>
        </div>
        <div className="platform-manifesto" aria-label="Algorithm Lab promise">
          <p className="manifesto-label">Our learning promise</p>
          <div><strong>₹0</strong><span>Cost to learn</span></div>
          <div><strong>No</strong><span>Account required</span></div>
          <div><strong>2</strong><span>Languages per lesson</span></div>
          <div><strong>Open</strong><span>To contributors</span></div>
          <p className="manifesto-note">Knowledge grows when it is shared.</p>
        </div>
      </section>

      <section className="platform-section" id="lessons">
        <div className="platform-section-heading">
          <div>
            <p className="section-number">Start learning</p>
            <h2>Available lessons</h2>
          </div>
          <p>{availableLessons.length} complete lesson · {algorithms.length - availableLessons.length} on the roadmap</p>
        </div>
        <div className="featured-lessons">
          {availableLessons.map((lesson, index) => (
            <a className="featured-lesson" href={sitePath(lesson.href)} key={lesson.slug}>
              <span className="lesson-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="lesson-main">
                <div className="lesson-badges"><span>{lesson.category}</span><span>{lesson.difficulty}</span></div>
                <h3>{lesson.name}</h3>
                <p>{lesson.description}</p>
                <div className="lesson-details"><span>{lesson.languages.join(" + ")}</span><span>{lesson.complexity} average</span><span>Visualizer + game</span></div>
              </div>
              <span className="lesson-open">Open lesson <i aria-hidden="true">→</i></span>
            </a>
          ))}
        </div>
      </section>

      <section className="learning-method">
        <div className="platform-section-heading light-platform-heading">
          <div>
            <p className="section-number">The method</p>
            <h2>Learn with four connected steps</h2>
          </div>
          <p>Every lesson follows the same path, so you can focus on the idea rather than relearning the interface.</p>
        </div>
        <div className="method-grid">
          {learningSteps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="platform-section" id="categories">
        <div className="platform-section-heading">
          <div>
            <p className="section-number">The roadmap</p>
            <h2>Explore by category</h2>
          </div>
          <p>One growing library, organized around the way algorithmic thinking develops.</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => {
            const lessons = lessonsForCategory(category.id);
            const complete = lessons.filter((lesson) => lesson.status === "complete").length;
            return (
              <article className={complete ? "category-card has-lessons" : "category-card"} key={category.id}>
                <span className="category-code">{category.code}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div><span>{lessons.length || "—"} planned</span><span>{complete ? `${complete} available` : "Coming soon"}</span></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="open-learning" id="contribute">
        <div>
          <p className="section-number">Built in the open</p>
          <h2>Free for learners.<br />Open to contributors.</h2>
        </div>
        <div className="open-learning-copy">
          <p>
            Algorithm Lab has no sign-in gate, paid tier, or locked lesson. The source code is open, the study material is reusable with attribution, and contributions are welcome.
          </p>
          <div className="open-actions">
            <a className="button button-primary" href={sitePath("/sorting/bubble-sort")}>Study the first lesson <span>→</span></a>
            <a className="text-link" href={sitePath("/glossary")}>Read the glossary</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
