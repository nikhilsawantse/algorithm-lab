"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LessonFooter } from "../../../components/lesson/LessonFooter";
import { LessonCompletion } from "../../../components/lesson/LessonCompletion";
import { LessonFoundations } from "../../../components/lesson/LessonFoundations";
import { LessonHeader } from "../../../components/lesson/LessonHeader";
import { LessonMistakes } from "../../../components/lesson/LessonMistakes";
import { LessonNavigation } from "../../../components/lesson/LessonNavigation";
import { LessonQuiz } from "../../../components/lesson/LessonQuiz";
import { bubbleSortLesson } from "../../../lib/lessons/bubble-sort";

type SortStep = {
  values: number[];
  labels: string[];
  comparing: number[];
  swapped: number[];
  sortedFrom: number;
  message: string;
  pass: number;
  comparisons: number;
  swaps: number;
};

const DEFAULT_VALUES = [72, 34, 91, 18, 56, 43, 27];
const CHALLENGE_START = [...bubbleSortLesson.challenge.startValues];
const QUIZ_STORAGE_KEY = `algorithm-lab:${bubbleSortLesson.slug}:quiz`;
const EXAMPLES = bubbleSortLesson.examples;

const CODE_EXAMPLES = bubbleSortLesson.codeExamples;

type CodeLanguage = keyof typeof CODE_EXAMPLES;

function buildLabels(source: number[]) {
  const totals = new Map<number, number>();
  const seen = new Map<number, number>();
  source.forEach((value) => totals.set(value, (totals.get(value) ?? 0) + 1));

  return source.map((value) => {
    if ((totals.get(value) ?? 0) === 1) return String(value);
    const occurrence = seen.get(value) ?? 0;
    seen.set(value, occurrence + 1);
    return `${value}${String.fromCharCode(65 + occurrence)}`;
  });
}

function buildSortSteps(source: number[]): SortStep[] {
  const values = [...source];
  const labels = buildLabels(source);
  const steps: SortStep[] = [
    {
      values: [...values],
      labels: [...labels],
      comparing: [],
      swapped: [],
      sortedFrom: values.length,
      message: "Ready. Start the first left-to-right pass.",
      pass: 0,
      comparisons: 0,
      swaps: 0,
    },
  ];

  let comparisons = 0;
  let swaps = 0;

  for (let pass = 0; pass < values.length - 1; pass += 1) {
    let changed = false;

    for (let index = 0; index < values.length - pass - 1; index += 1) {
      comparisons += 1;
      steps.push({
        values: [...values],
        labels: [...labels],
        comparing: [index, index + 1],
        swapped: [],
        sortedFrom: values.length - pass,
        message: `Compare ${values[index]} and ${values[index + 1]}.`,
        pass: pass + 1,
        comparisons,
        swaps,
      });

      if (values[index] > values[index + 1]) {
        const left = values[index];
        values[index] = values[index + 1];
        values[index + 1] = left;
        [labels[index], labels[index + 1]] = [labels[index + 1], labels[index]];
        swaps += 1;
        changed = true;
        steps.push({
          values: [...values],
          labels: [...labels],
          comparing: [],
          swapped: [index, index + 1],
          sortedFrom: values.length - pass,
          message: `${left} is larger, so the pair swaps places.`,
          pass: pass + 1,
          comparisons,
          swaps,
        });
      }
    }

    steps.push({
      values: [...values],
      labels: [...labels],
      comparing: [],
      swapped: [],
      sortedFrom: values.length - pass - 1,
      message: changed
        ? `Pass ${pass + 1} complete. ${values[values.length - pass - 1]} is locked in place.`
        : "No swaps in this pass — the array is already sorted.",
      pass: pass + 1,
      comparisons,
      swaps,
    });

    if (!changed) break;
  }

  steps.push({
    values: [...values],
    labels: [...labels],
    comparing: [],
    swapped: [],
    sortedFrom: 0,
    message: "Sorted! Every value is now in ascending order.",
    pass: Math.max(1, steps.at(-1)?.pass ?? 1),
    comparisons,
    swaps,
  });

  return steps;
}

function isSorted(values: number[]) {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

export default function Home() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("javascript");
  const [challenge, setChallenge] = useState(CHALLENGE_START);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [showFullTrace, setShowFullTrace] = useState(false);

  const steps = useMemo(() => buildSortSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = isSorted(challenge);
  const activeCode = CODE_EXAMPLES[codeLanguage];
  const complexity = bubbleSortLesson.complexity;
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => {
    const pair = step.comparing.length
      ? step.comparing.map((position) => step.labels[position]).join(" and ")
      : step.swapped.length
        ? step.swapped.map((position) => step.labels[position]).join(" and ")
        : "—";
    const action = index === 0
      ? "Ready"
      : step.comparing.length
        ? "Compare"
        : step.swapped.length
          ? "Swap"
          : step.sortedFrom === 0
            ? "Complete"
            : "Pass complete";

    return { index, step, pair, action };
  });
  const visibleTraceRows = showFullTrace ? traceRows : traceRows.slice(-8);

  const nextStep = useCallback(() => {
    setCursor((position) => {
      if (position >= steps.length - 1) {
        setPlaying(false);
        return position;
      }
      return position + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(nextStep, speed);
    return () => window.clearInterval(timer);
  }, [nextStep, playing, speed]);

  function applyInput() {
    const parsed = input
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number);

    if (parsed.length < 3 || parsed.length > 10 || parsed.some((value) => !Number.isFinite(value) || value < 1 || value > 99)) {
      setInputError("Enter 3–10 numbers from 1 to 99.");
      return;
    }

    setSource(parsed);
    setCursor(0);
    setPlaying(false);
    setInputError("");
    setActiveExample(null);
  }

  function shuffleValues() {
    const shuffled = Array.from({ length: 7 }, () => Math.floor(Math.random() * 88) + 10);
    setSource(shuffled);
    setInput(shuffled.join(", "));
    setCursor(0);
    setPlaying(false);
    setInputError("");
    setActiveExample(null);
  }

  function loadExample(example: (typeof EXAMPLES)[number]) {
    const values = [...example.values];
    setSource(values);
    setInput(values.join(", "));
    setCursor(0);
    setPlaying(false);
    setInputError("");
    setActiveExample(example.id);
  }

  function resetVisualizer() {
    setCursor(0);
    setPlaying(false);
  }

  function chooseChallengeTile(index: number) {
    if (challengeWon) return;
    if (selected === null) {
      setSelected(index);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    if (Math.abs(selected - index) !== 1) {
      setSelected(index);
      return;
    }

    const from = selected;
    setChallenge((values) => {
      const next = [...values];
      [next[from], next[index]] = [next[index], next[from]];
      return next;
    });
    setMoves((count) => count + 1);
    setSelected(null);
  }

  function resetChallenge() {
    setChallenge(CHALLENGE_START);
    setSelected(null);
    setMoves(0);
  }

  const maxValue = Math.max(...current.values);
  const progress = Math.round((cursor / (steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#lesson-content">Skip to lesson content</a>
      <LessonHeader lessonNumber={bubbleSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {bubbleSortLesson.hero.eyebrow}</p>
          <h1>{bubbleSortLesson.hero.title}<br /><em>{bubbleSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{bubbleSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${bubbleSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 5, 2, 4 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b className="active">5</b><b className="active">2</b><b>4</b></div><small>compare</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b>2</b><b className="active">5</b><b className="active">4</b></div><small>swap</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>2</b><b>4</b><b>5</b></div><small>sorted</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {bubbleSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations
        objectives={bubbleSortLesson.studyGuide.objectives}
        prerequisites={bubbleSortLesson.studyGuide.prerequisites}
        sectionOrder={bubbleSortLesson.learningPath}
      />

      <section className="concept-section" id="learn">
        <div className="section-heading">
          <p className="section-number">01 — The idea</p>
          <h2>{bubbleSortLesson.mentalModel.title}</h2>
          <p>{bubbleSortLesson.mentalModel.question}</p>
        </div>
        <div className="concept-grid">
          <article className="concept-card">
            <span className="concept-step">1</span>
            <div className="concept-visual"><b>7</b><i>vs</i><b>3</b></div>
            <h3>{bubbleSortLesson.mentalModel.steps[0].title}</h3>
            <p>{bubbleSortLesson.mentalModel.steps[0].description}</p>
          </article>
          <article className="concept-card accent-card">
            <span className="concept-step">2</span>
            <div className="concept-visual"><b>3</b><span className="swap-arrow">⇄</span><b>7</b></div>
            <h3>{bubbleSortLesson.mentalModel.steps[1].title}</h3>
            <p>{bubbleSortLesson.mentalModel.steps[1].description}</p>
          </article>
          <article className="concept-card">
            <span className="concept-step">3</span>
            <div className="concept-visual pass-visual"><b>3</b><b>5</b><b className="locked">7</b></div>
            <h3>{bubbleSortLesson.mentalModel.steps[2].title}</h3>
            <p>{bubbleSortLesson.mentalModel.steps[2].description}</p>
          </article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading">
          <p className="section-number">02 — Try it yourself</p>
          <h2>Watch the algorithm work</h2>
          <p>Use your own numbers, then play the sort or move through one decision at a time.</p>
        </div>

        <div className="example-gallery" aria-label={`Curated ${bubbleSortLesson.name} examples`}>
          {EXAMPLES.map((example) => (
            <button
              className={activeExample === example.id ? "example-card is-active" : "example-card"}
              type="button"
              key={example.id}
              onClick={() => loadExample(example)}
              aria-pressed={activeExample === example.id}
            >
              <span className="example-type">{example.type}</span>
              <strong>{example.title}</strong>
              <code>[{example.values.join(", ")}]</code>
              <p>{example.description}</p>
              <small>{example.result}</small>
              <span className="example-action">Load example <i aria-hidden="true">-&gt;</i></span>
            </button>
          ))}
        </div>

        <div className="visualizer-shell">
          <div className="input-row">
            <label htmlFor="array-input">Your array</label>
            <div className="input-group">
              <input
                id="array-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && applyInput()}
                aria-describedby={inputError ? "input-error" : "input-help"}
              />
              <button className="button button-apply" type="button" onClick={applyInput}>Apply</button>
              <button className="icon-button" type="button" onClick={shuffleValues} aria-label="Generate a random array">↻</button>
            </div>
            <small id={inputError ? "input-error" : "input-help"} className={inputError ? "error-text" : "helper-text"}>
              {inputError || "3–10 values, each from 1 to 99"}
            </small>
          </div>

          <div className="visual-stage">
            <div className="stage-meta">
              <span>Pass <strong>{current.pass || "—"}</strong></span>
              <span className="status-dot"><i /> {cursor === steps.length - 1 ? "Complete" : playing ? "Running" : "Paused"}</span>
            </div>
            <div className="bars" role="img" aria-label={`Current array: ${current.values.join(", ")}`}>
              {current.values.map((value, index) => {
                const state = current.swapped.includes(index)
                  ? "swapped"
                  : current.comparing.includes(index)
                    ? "comparing"
                    : index >= current.sortedFrom
                      ? "sorted"
                      : "idle";
                return (
                  <div className={`bar-column ${state}`} key={`${index}-${value}`}>
                    <span className="bar-value">{current.labels[index]}</span>
                    <div className="bar" style={{ height: `${Math.max(20, (value / maxValue) * 100)}%` }} />
                    <span className="bar-index">{index}</span>
                  </div>
                );
              })}
            </div>
            <div className="step-message" aria-live="polite">
              <span>{cursor === steps.length - 1 ? "✓" : current.swapped.length ? "⇄" : current.comparing.length ? "?" : "→"}</span>
              <p>{current.message}</p>
            </div>
          </div>

          <div className="playback">
            <button className="play-button" type="button" onClick={() => cursor === steps.length - 1 ? resetVisualizer() : setPlaying((value) => !value)}>
              <span aria-hidden="true">{cursor === steps.length - 1 ? "↺" : playing ? "Ⅱ" : "▶"}</span>
              {cursor === steps.length - 1 ? "Replay" : playing ? "Pause" : "Play sort"}
            </button>
            <button className="step-button" type="button" onClick={nextStep} disabled={cursor === steps.length - 1}>Step →</button>
            <div className="speed-control">
              <label htmlFor="speed">Speed</label>
              <input id="speed" type="range" min="180" max="1100" step="10" value={1280 - speed} onChange={(event) => setSpeed(1280 - Number(event.target.value))} />
            </div>
          </div>

          <div className="progress-track" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>
          <div className="stats-row">
            <div><small>Comparisons</small><strong>{current.comparisons}</strong></div>
            <div><small>Swaps</small><strong>{current.swaps}</strong></div>
            <div><small>Progress</small><strong>{progress}%</strong></div>
            <div className="legend"><span><i className="legend-compare" /> Comparing</span><span><i className="legend-sorted" /> Sorted</span></div>
          </div>
          <div className="trace-panel">
            <div className="trace-heading">
              <div>
                <span className="foundation-label">Dry-run trace</span>
                <h3>Turn each animation into a written decision</h3>
              </div>
              {traceRows.length > 8 && (
                <button type="button" onClick={() => setShowFullTrace((visible) => !visible)} aria-expanded={showFullTrace}>
                  {showFullTrace ? "Show latest 8" : `Show all ${traceRows.length}`}
                </button>
              )}
            </div>
            <div className="trace-table-wrap">
              <table className="trace-table">
                <caption>{showFullTrace ? `Full ${bubbleSortLesson.name} trace` : `The latest eight ${bubbleSortLesson.name} decisions`}</caption>
                <thead>
                  <tr><th scope="col">Step</th><th scope="col">Pass</th><th scope="col">Action</th><th scope="col">Pair</th><th scope="col">Array after step</th><th scope="col">Swaps</th></tr>
                </thead>
                <tbody>
                  {visibleTraceRows.map(({ index, step, pair, action }) => (
                    <tr className={index === cursor ? "is-current" : ""} key={index}>
                      <td>{index}</td>
                      <td>{step.pass || "—"}</td>
                      <td>{action}</td>
                      <td>{pair}</td>
                      <td><code>[{step.labels.join(", ")}]</code></td>
                      <td>{step.swaps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="trace-note">The highlighted row always matches the bars above. Step forward to extend the trace.</p>
          </div>
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading">
          <p className="section-number">03 — Read the code</p>
          <h2>From idea to working code</h2>
          <p>Switch among JavaScript, Python, Java, and C++ to compare the same early-exit optimization.</p>
        </div>
        <div className="code-layout">
          <div className="code-window">
            <div className="code-language-tabs" role="tablist" aria-label="Code language">
              {(Object.keys(CODE_EXAMPLES) as CodeLanguage[]).map((language) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={codeLanguage === language}
                  className={codeLanguage === language ? "is-active" : ""}
                  key={language}
                  onClick={() => setCodeLanguage(language)}
                >
                  {CODE_EXAMPLES[language].label}
                </button>
              ))}
            </div>
            <div className="code-toolbar">
              <span><i /><i /><i /></span>
              <small>{activeCode.filename}</small>
              <button type="button" onClick={() => navigator.clipboard?.writeText(activeCode.code)}>Copy</button>
            </div>
            <pre aria-label={`${activeCode.label} ${bubbleSortLesson.name} implementation`}><code>
              {activeCode.code.split("\n").map((line, index) => (
                <span className={activeCode.highlight.some((lineNumber) => lineNumber === index + 1) ? "line highlight-line" : "line"} key={`${codeLanguage}-${index}`}>
                  <i>{String(index + 1).padStart(2, "0")}</i><span>{line || " "}</span>
                </span>
              ))}
            </code></pre>
          </div>
          <aside className="complexity-panel">
            <h3>Complexity at a glance</h3>
            {[complexity.best, complexity.average, complexity.worst, complexity.space].map((complexityCase) => (
              <div className="complexity-row" key={complexityCase.label}>
                <span>{complexityCase.label}{complexityCase.context && <small>{complexityCase.context}</small>}</span>
                <strong>{complexityCase.value}</strong>
              </div>
            ))}
            <div className="stable-note"><span>✓</span><p><strong>{complexity.property.label}</strong><br />{complexity.property.description}</p></div>
            <div className="stability-proof" aria-label="Stability example">
              <small>Stability proof</small>
              <div>{complexity.property.before.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>
              <i aria-hidden="true">↓</i>
              <div className="is-sorted">{complexity.property.after.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>
              <p>{complexity.property.proof}</p>
            </div>
          </aside>
        </div>
      </section>

      <LessonMistakes mistakes={bubbleSortLesson.studyGuide.mistakes} />

      <LessonQuiz questions={bubbleSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy">
          <p className="section-number">06 — Mini game</p>
          <h2>{bubbleSortLesson.challenge.title}</h2>
          <p>{bubbleSortLesson.challenge.description}</p>
          <div className="game-rule"><span>Rule</span> {bubbleSortLesson.challenge.rule}</div>
        </div>
        <div className="game-card">
          <div className="game-header"><span>{challengeWon ? "Challenge complete" : "Sort the conveyor"}</span><strong>{moves} moves</strong></div>
          <div className="conveyor" aria-label={`Challenge values: ${challenge.join(", ")}`}>
            {challenge.map((value, index) => (
              <button
                type="button"
                key={`${value}-${index}`}
                className={selected === index ? "package selected" : "package"}
                onClick={() => chooseChallengeTile(index)}
                aria-pressed={selected === index}
                aria-label={`Package ${value}, position ${index + 1}`}
              >
                <span>{value}</span><i aria-hidden="true">▦</i>
              </button>
            ))}
          </div>
          <div className="belt"><span /><span /><span /><span /><span /><span /></div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite">
            <span>{challengeWon ? "★" : "↔"}</span>
            <p>{challengeWon ? `Nicely done — sorted in ${moves} adjacent swaps.` : selected === null ? "Choose a package to begin." : "Now choose a package directly beside it."}</p>
            <button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="section-heading">
          <p className="section-number">07 — Use it wisely</p>
          <h2>Where {bubbleSortLesson.name} fits</h2>
        </div>
        <div className="use-grid">
          {bubbleSortLesson.useCases.map((useCase) => (
            <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}>
              <span className="use-icon">{useCase.icon}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
              <small>{useCase.recommendation}</small>
            </article>
          ))}
        </div>
      </section>

      <LessonCompletion
        lessonName={bubbleSortLesson.name}
        slug={bubbleSortLesson.slug}
        criteria={bubbleSortLesson.completionCriteria}
      />

      <LessonNavigation currentSlug={bubbleSortLesson.slug} />

      <LessonFooter lessonNumber={bubbleSortLesson.lessonNumber} track={bubbleSortLesson.track} />
    </main>
  );
}
