"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
const CHALLENGE_START = [7, 3, 5, 1, 6, 2, 4];

const EXAMPLES = [
  {
    id: "sorted",
    type: "Best case",
    title: "Already sorted",
    values: [1, 2, 3, 4, 5],
    description: "One clean pass triggers the early exit.",
    result: "1 pass | 4 comparisons | 0 swaps",
  },
  {
    id: "reverse",
    type: "Worst case",
    title: "Reverse order",
    values: [5, 4, 3, 2, 1],
    description: "Every neighbor begins in the wrong order.",
    result: "4 passes | 10 comparisons | 10 swaps",
  },
  {
    id: "nearly",
    type: "Practical case",
    title: "Nearly sorted",
    values: [1, 2, 4, 3, 5],
    description: "A single misplaced pair is repaired quickly.",
    result: "2 passes | 7 comparisons | 1 swap",
  },
  {
    id: "duplicates",
    type: "Stability case",
    title: "Duplicate values",
    values: [4, 2, 4, 1],
    description: "Watch 4A remain before 4B after sorting.",
    result: "3 passes | 6 comparisons | 4 swaps",
  },
] as const;

const CODE_EXAMPLES = {
  javascript: {
    label: "JavaScript",
    filename: "bubble-sort.js",
    highlight: [7, 8, 9],
    code: `function bubbleSort(numbers) {
  const array = [...numbers];

  for (let pass = 0; pass < array.length - 1; pass++) {
    let swapped = false;

    for (let i = 0; i < array.length - pass - 1; i++) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return array;
}`,
  },
  python: {
    label: "Python",
    filename: "bubble_sort.py",
    highlight: [6, 7, 8],
    code: `def bubble_sort(numbers):
    array = numbers.copy()

    for last in range(len(array) - 1, 0, -1):
        swapped = False

        for index in range(last):
            if array[index] > array[index + 1]:
                array[index], array[index + 1] = array[index + 1], array[index]
                swapped = True

        if not swapped:
            break

    return array`,
  },
} as const;

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
        : "No swaps in this pass â€” the array is already sorted.",
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

  const steps = useMemo(() => buildSortSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = isSorted(challenge);
  const activeCode = CODE_EXAMPLES[codeLanguage];

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
      setInputError("Enter 3â€“10 numbers from 1 to 99.");
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
      <header className="site-header">
        <a className="brand" href="/" aria-label="Algorithm Lab home">
          <span className="brand-mark">A</span>
          <span>Algorithm Lab</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="/">Explore</a>
          <a href="#learn">Learn</a>
          <a href="#visualizer">Visualizer</a>
          <a href="#challenge">Challenge</a>
        </nav>
        <span className="lesson-pill">Lesson 01</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Sorting algorithms, made visible</p>
          <h1>See every swap.<br /><em>Understand every pass.</em></h1>
          <p className="hero-intro">
            Bubble Sort repeatedly compares neighbors and moves the larger value right â€” like a bubble rising to the surface.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">â†“</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">â†’</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label="A small Bubble Sort example">
          <div className="demo-caption"><span>Mini example</span><strong>[ 5, 2, 4 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b className="active">5</b><b className="active">2</b><b>4</b></div><small>compare</small></div>
            <div className="flow-arrow" aria-hidden="true">â†“</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b>2</b><b className="active">5</b><b className="active">4</b></div><small>swap</small></div>
            <div className="flow-arrow" aria-hidden="true">â†“</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>2</b><b>4</b><b>5</b></div><small>sorted</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> After one full pass, the largest unsorted value reaches its final position.</p>
        </div>
      </section>

      <section className="concept-section" id="learn">
        <div className="section-heading">
          <p className="section-number">01 â€” The idea</p>
          <h2>How Bubble Sort thinks</h2>
          <p>It only needs one question: â€œAre these two neighbors in the right order?â€</p>
        </div>
        <div className="concept-grid">
          <article className="concept-card">
            <span className="concept-step">1</span>
            <div className="concept-visual"><b>7</b><i>vs</i><b>3</b></div>
            <h3>Compare neighbors</h3>
            <p>Start on the left and inspect two adjacent values.</p>
          </article>
          <article className="concept-card accent-card">
            <span className="concept-step">2</span>
            <div className="concept-visual"><b>3</b><span className="swap-arrow">â‡„</span><b>7</b></div>
            <h3>Swap when needed</h3>
            <p>If the left value is larger, exchange their positions.</p>
          </article>
          <article className="concept-card">
            <span className="concept-step">3</span>
            <div className="concept-visual pass-visual"><b>3</b><b>5</b><b className="locked">7</b></div>
            <h3>Repeat each pass</h3>
            <p>Continue until a whole pass finishes with no swaps.</p>
          </article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading">
          <p className="section-number">02 â€” Try it yourself</p>
          <h2>Watch the algorithm work</h2>
          <p>Use your own numbers, then play the sort or move through one decision at a time.</p>
        </div>

        <div className="example-gallery" aria-label="Curated Bubble Sort examples">
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
              <button className="icon-button" type="button" onClick={shuffleValues} aria-label="Generate a random array">â†»</button>
            </div>
            <small id={inputError ? "input-error" : "input-help"} className={inputError ? "error-text" : "helper-text"}>
              {inputError || "3â€“10 values, each from 1 to 99"}
            </small>
          </div>

          <div className="visual-stage">
            <div className="stage-meta">
              <span>Pass <strong>{current.pass || "â€”"}</strong></span>
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
              <span>{cursor === steps.length - 1 ? "âœ“" : current.swapped.length ? "â‡„" : current.comparing.length ? "?" : "â†’"}</span>
              <p>{current.message}</p>
            </div>
          </div>

          <div className="playback">
            <button className="play-button" type="button" onClick={() => cursor === steps.length - 1 ? resetVisualizer() : setPlaying((value) => !value)}>
              <span aria-hidden="true">{cursor === steps.length - 1 ? "â†º" : playing ? "â…¡" : "â–¶"}</span>
              {cursor === steps.length - 1 ? "Replay" : playing ? "Pause" : "Play sort"}
            </button>
            <button className="step-button" type="button" onClick={nextStep} disabled={cursor === steps.length - 1}>Step â†’</button>
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
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading">
          <p className="section-number">03 â€” Read the code</p>
          <h2>From idea to working code</h2>
          <p>Switch languages and compare the same early-exit optimization in JavaScript and Python.</p>
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
            <pre aria-label={`${activeCode.label} Bubble Sort implementation`}><code>
              {activeCode.code.split("\n").map((line, index) => (
                <span className={activeCode.highlight.some((lineNumber) => lineNumber === index + 1) ? "line highlight-line" : "line"} key={`${codeLanguage}-${index}`}>
                  <i>{String(index + 1).padStart(2, "0")}</i><span>{line || " "}</span>
                </span>
              ))}
            </code></pre>
          </div>
          <aside className="complexity-panel">
            <h3>Complexity at a glance</h3>
            <div className="complexity-row"><span>Best case <small>Already sorted</small></span><strong>O(n)</strong></div>
            <div className="complexity-row"><span>Average case</span><strong>O(nÂ²)</strong></div>
            <div className="complexity-row"><span>Worst case <small>Reverse order</small></span><strong>O(nÂ²)</strong></div>
            <div className="complexity-row"><span>Extra space</span><strong>O(1)</strong></div>
            <div className="stable-note"><span>âœ“</span><p><strong>Stable sort</strong><br />Equal values keep their original relative order.</p></div>
            <div className="stability-proof" aria-label="Stability example">
              <small>Stability proof</small>
              <div><span>4A</span><span>2</span><span>4B</span><span>1</span></div>
              <i aria-hidden="true">â†“</i>
              <div className="is-sorted"><span>1</span><span>2</span><span>4A</span><span>4B</span></div>
              <p>The equal fours never cross, so A remains before B.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy">
          <p className="section-number">04 â€” Mini game</p>
          <h2>Be the algorithm</h2>
          <p>Sort the packages from smallest to largest. Just like Bubble Sort, you may only swap adjacent neighbors.</p>
          <div className="game-rule"><span>Rule</span> Select one package, then select a neighbor to swap them.</div>
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
                <span>{value}</span><i aria-hidden="true">â–¦</i>
              </button>
            ))}
          </div>
          <div className="belt"><span /><span /><span /><span /><span /><span /></div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite">
            <span>{challengeWon ? "â˜…" : "â†”"}</span>
            <p>{challengeWon ? `Nicely done â€” sorted in ${moves} adjacent swaps.` : selected === null ? "Choose a package to begin." : "Now choose a package directly beside it."}</p>
            <button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="section-heading">
          <p className="section-number">05 â€” Use it wisely</p>
          <h2>Where Bubble Sort fits</h2>
        </div>
        <div className="use-grid">
          <article><span className="use-icon">â—Ž</span><h3>Learning</h3><p>Its neighbor-by-neighbor logic makes sorting fundamentals easy to see and debug.</p><small>Great fit</small></article>
          <article><span className="use-icon">â‰‹</span><h3>Tiny datasets</h3><p>For a handful of values, clarity can matter more than performance.</p><small>Reasonable fit</small></article>
          <article><span className="use-icon">â†»</span><h3>Nearly sorted data</h3><p>With the early-exit flag, one clean pass can finish in linear time.</p><small>Good special case</small></article>
          <article className="avoid"><span className="use-icon">Ã—</span><h3>Large datasets</h3><p>Quadratic growth becomes expensive quickly. Prefer Merge Sort or Quick Sort.</p><small>Avoid</small></article>
        </div>
      </section>

      <footer>
        <div><span className="brand-mark">A</span><p><strong>Algorithm Lab</strong><br /><small>Interactive algorithms, free for everyone.</small></p></div>
        <p>Lesson 01 of the Sorting track</p>
        <a href="#top">Back to top â†‘</a>
      </footer>
    </main>
  );
}

