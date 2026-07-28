"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrayInputControls } from "../../../components/lesson/ArrayInputControls";
import { LessonCodeViewer } from "../../../components/lesson/LessonCodeViewer";
import { LessonComplexityPanel } from "../../../components/lesson/LessonComplexityPanel";
import { LessonFooter } from "../../../components/lesson/LessonFooter";
import { LessonCompletion } from "../../../components/lesson/LessonCompletion";
import { LessonFoundations } from "../../../components/lesson/LessonFoundations";
import { LessonHeader } from "../../../components/lesson/LessonHeader";
import { LessonMistakes } from "../../../components/lesson/LessonMistakes";
import { LessonNavigation } from "../../../components/lesson/LessonNavigation";
import { LessonQuiz } from "../../../components/lesson/LessonQuiz";
import { SortingTraceTable } from "../../../components/lesson/SortingTraceTable";
import { VisualizerPlayback } from "../../../components/lesson/VisualizerPlayback";
import { VisualizerStats } from "../../../components/lesson/VisualizerStats";
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
  const [challenge, setChallenge] = useState(CHALLENGE_START);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const steps = useMemo(() => buildSortSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = isSorted(challenge);
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

    return { index, pass: step.pass, pair, action, values: step.labels, swaps: step.swaps };
  });

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
          <ArrayInputControls
            input={input}
            error={inputError}
            helperText="3–10 values, each from 1 to 99"
            onInputChange={setInput}
            onApply={applyInput}
            onShuffle={shuffleValues}
          />

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

          <VisualizerPlayback
            complete={cursor === steps.length - 1}
            playing={playing}
            delay={speed}
            progress={progress}
            onReplay={resetVisualizer}
            onTogglePlaying={() => setPlaying((value) => !value)}
            onStep={nextStep}
            onDelayChange={setSpeed}
            playLabel="Play sort"
          />
          <VisualizerStats
            metrics={[
              { label: "Comparisons", value: current.comparisons },
              { label: "Swaps", value: current.swaps },
              { label: "Progress", value: `${progress}%` },
            ]}
            legend={[
              { label: "Comparing", className: "legend-compare" },
              { label: "Sorted", className: "legend-sorted" },
            ]}
          />
          <SortingTraceTable algorithmName={bubbleSortLesson.name} currentStep={cursor} rows={traceRows} />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading">
          <p className="section-number">03 — Read the code</p>
          <h2>From idea to working code</h2>
          <p>Switch among JavaScript, Python, Java, and C++ to compare the same early-exit optimization.</p>
        </div>
        <div className="code-layout">
          <LessonCodeViewer algorithmName={bubbleSortLesson.name} codeExamples={CODE_EXAMPLES} />
          <LessonComplexityPanel complexity={bubbleSortLesson.complexity} />
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
