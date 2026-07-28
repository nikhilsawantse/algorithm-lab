"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrayInputControls } from "../../../components/lesson/ArrayInputControls";
import { LessonCodeViewer } from "../../../components/lesson/LessonCodeViewer";
import { LessonCompletion } from "../../../components/lesson/LessonCompletion";
import { LessonComplexityPanel } from "../../../components/lesson/LessonComplexityPanel";
import { LessonFooter } from "../../../components/lesson/LessonFooter";
import { LessonFoundations } from "../../../components/lesson/LessonFoundations";
import { LessonHeader } from "../../../components/lesson/LessonHeader";
import { LessonMistakes } from "../../../components/lesson/LessonMistakes";
import { LessonNavigation } from "../../../components/lesson/LessonNavigation";
import { LessonQuiz } from "../../../components/lesson/LessonQuiz";
import { SortingTraceTable } from "../../../components/lesson/SortingTraceTable";
import { VisualizerPlayback } from "../../../components/lesson/VisualizerPlayback";
import { VisualizerStats } from "../../../components/lesson/VisualizerStats";
import { selectionSortLesson } from "../../../lib/lessons/selection-sort";

type SortStep = {
  values: number[];
  labels: string[];
  comparing: number[];
  swapped: number[];
  minimumIndex: number | null;
  sortedUntil: number;
  message: string;
  action: string;
  pass: number;
  comparisons: number;
  swaps: number;
};

const DEFAULT_VALUES = [64, 25, 12, 22, 11, 48, 36];
const CHALLENGE_START = [...selectionSortLesson.challenge.startValues];
const QUIZ_STORAGE_KEY = `algorithm-lab:${selectionSortLesson.slug}:quiz`;
const EXAMPLES = selectionSortLesson.examples;
const CODE_EXAMPLES = selectionSortLesson.codeExamples;

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
  const steps: SortStep[] = [{
    values: [...values],
    labels: [...labels],
    comparing: [],
    swapped: [],
    minimumIndex: null,
    sortedUntil: 0,
    message: "Ready. Begin at the first unsorted position.",
    action: "Ready",
    pass: 0,
    comparisons: 0,
    swaps: 0,
  }];

  let comparisons = 0;
  let swaps = 0;

  for (let boundary = 0; boundary < values.length - 1; boundary += 1) {
    let minimumIndex = boundary;
    const pass = boundary + 1;

    steps.push({
      values: [...values],
      labels: [...labels],
      comparing: [],
      swapped: [],
      minimumIndex,
      sortedUntil: boundary,
      message: `Pass ${pass}: treat ${labels[minimumIndex]} as the current minimum.`,
      action: "Choose minimum",
      pass,
      comparisons,
      swaps,
    });

    for (let index = boundary + 1; index < values.length; index += 1) {
      comparisons += 1;
      steps.push({
        values: [...values],
        labels: [...labels],
        comparing: [minimumIndex, index],
        swapped: [],
        minimumIndex,
        sortedUntil: boundary,
        message: `Compare candidate ${labels[index]} with minimum ${labels[minimumIndex]}.`,
        action: "Compare",
        pass,
        comparisons,
        swaps,
      });

      if (values[index] < values[minimumIndex]) {
        minimumIndex = index;
        steps.push({
          values: [...values],
          labels: [...labels],
          comparing: [],
          swapped: [],
          minimumIndex,
          sortedUntil: boundary,
          message: `${labels[minimumIndex]} is smaller, so it becomes the new minimum.`,
          action: "New minimum",
          pass,
          comparisons,
          swaps,
        });
      }
    }

    if (minimumIndex !== boundary) {
      const boundaryLabel = labels[boundary];
      const minimumLabel = labels[minimumIndex];
      [values[boundary], values[minimumIndex]] = [values[minimumIndex], values[boundary]];
      [labels[boundary], labels[minimumIndex]] = [labels[minimumIndex], labels[boundary]];
      swaps += 1;
      steps.push({
        values: [...values],
        labels: [...labels],
        comparing: [],
        swapped: [boundary, minimumIndex],
        minimumIndex: boundary,
        sortedUntil: boundary,
        message: `Swap ${minimumLabel} with ${boundaryLabel} to fill the boundary.`,
        action: "Swap",
        pass,
        comparisons,
        swaps,
      });
    }

    steps.push({
      values: [...values],
      labels: [...labels],
      comparing: [],
      swapped: [],
      minimumIndex: null,
      sortedUntil: boundary + 1,
      message: `Pass ${pass} complete. ${labels[boundary]} is locked at index ${boundary}.`,
      action: "Lock position",
      pass,
      comparisons,
      swaps,
    });
  }

  steps.push({
    values: [...values],
    labels: [...labels],
    comparing: [],
    swapped: [],
    minimumIndex: null,
    sortedUntil: values.length,
    message: "Sorted! The final value is in place automatically.",
    action: "Complete",
    pass: Math.max(1, values.length - 1),
    comparisons,
    swaps,
  });

  return steps;
}

export default function SelectionSortPage() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [challenge, setChallenge] = useState(CHALLENGE_START);
  const [challengeBoundary, setChallengeBoundary] = useState(0);
  const [challengeChoice, setChallengeChoice] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const steps = useMemo(() => buildSortSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = challengeBoundary >= challenge.length - 1;
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => {
    const pair = step.comparing.length
      ? step.comparing.map((position) => step.labels[position]).join(" and ")
      : step.swapped.length
        ? step.swapped.map((position) => step.labels[position]).join(" and ")
        : step.minimumIndex !== null
          ? step.labels[step.minimumIndex]
          : "—";
    return { index, pass: step.pass, pair, action: step.action, values: step.labels, swaps: step.swaps };
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
    const parsed = input.split(/[,\s]+/).filter(Boolean).map(Number);
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

  function chooseMinimum(index: number) {
    if (challengeWon || index < challengeBoundary) return;
    setAttempts((count) => count + 1);
    const minimum = Math.min(...challenge.slice(challengeBoundary));
    if (challenge[index] !== minimum) {
      setChallengeChoice(index);
      return;
    }

    setChallenge((values) => {
      const next = [...values];
      [next[challengeBoundary], next[index]] = [next[index], next[challengeBoundary]];
      return next;
    });
    setChallengeBoundary((boundary) => boundary + 1);
    setChallengeChoice(null);
  }

  function resetChallenge() {
    setChallenge(CHALLENGE_START);
    setChallengeBoundary(0);
    setChallengeChoice(null);
    setAttempts(0);
  }

  const maxValue = Math.max(...current.values);
  const progress = Math.round((cursor / (steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#lesson-content">Skip to lesson content</a>
      <LessonHeader lessonNumber={selectionSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {selectionSortLesson.hero.eyebrow}</p>
          <h1>{selectionSortLesson.hero.title}<br /><em>{selectionSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{selectionSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${selectionSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 5, 2, 4 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b className="active">5</b><b className="active">2</b><b className="active">4</b></div><small>find 2</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b className="active">2</b><b>5</b><b>4</b></div><small>place</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>2</b><b>4</b><b>5</b></div><small>sorted</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {selectionSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations objectives={selectionSortLesson.studyGuide.objectives} prerequisites={selectionSortLesson.studyGuide.prerequisites} sectionOrder={selectionSortLesson.learningPath} />

      <section className="concept-section" id="learn">
        <div className="section-heading">
          <p className="section-number">01 — The idea</p>
          <h2>{selectionSortLesson.mentalModel.title}</h2>
          <p>{selectionSortLesson.mentalModel.question}</p>
        </div>
        <div className="concept-grid">
          <article className="concept-card">
            <span className="concept-step">1</span>
            <div className="concept-visual pass-visual"><b className="locked">2</b><b>7</b><b>3</b></div>
            <h3>{selectionSortLesson.mentalModel.steps[0].title}</h3>
            <p>{selectionSortLesson.mentalModel.steps[0].description}</p>
          </article>
          <article className="concept-card accent-card">
            <span className="concept-step">2</span>
            <div className="concept-visual"><b>7</b><i>min?</i><b>3</b></div>
            <h3>{selectionSortLesson.mentalModel.steps[1].title}</h3>
            <p>{selectionSortLesson.mentalModel.steps[1].description}</p>
          </article>
          <article className="concept-card">
            <span className="concept-step">3</span>
            <div className="concept-visual"><b>3</b><span className="swap-arrow">⇄</span><b>7</b></div>
            <h3>{selectionSortLesson.mentalModel.steps[2].title}</h3>
            <p>{selectionSortLesson.mentalModel.steps[2].description}</p>
          </article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading">
          <p className="section-number">02 — Try it yourself</p>
          <h2>Watch the minimum move into place</h2>
          <p>Use your own numbers, then follow the boundary, candidate comparisons, and selected minimum.</p>
        </div>

        <div className="example-gallery" aria-label={`Curated ${selectionSortLesson.name} examples`}>
          {EXAMPLES.map((example) => (
            <button className={activeExample === example.id ? "example-card is-active" : "example-card"} type="button" key={example.id} onClick={() => loadExample(example)} aria-pressed={activeExample === example.id}>
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
          <ArrayInputControls input={input} error={inputError} helperText="3–10 values, each from 1 to 99" onInputChange={setInput} onApply={applyInput} onShuffle={shuffleValues} />

          <div className="visual-stage">
            <div className="stage-meta">
              <span>Pass <strong>{current.pass || "—"}</strong></span>
              <span className="status-dot"><i /> {cursor === steps.length - 1 ? "Complete" : playing ? "Running" : "Paused"}</span>
            </div>
            <div className="bars" role="img" aria-label={`Current array: ${current.values.join(", ")}. ${current.sortedUntil} values are locked.`}>
              {current.values.map((value, index) => {
                const state = current.swapped.includes(index)
                  ? "swapped"
                  : current.comparing.includes(index)
                    ? "comparing"
                    : current.minimumIndex === index
                      ? "minimum"
                      : index < current.sortedUntil
                        ? "sorted"
                        : "idle";
                return (
                  <div className={`bar-column ${state}`} key={`${current.labels[index]}-${index}`}>
                    <span className="bar-value">{current.labels[index]}</span>
                    <div className="bar" style={{ height: `${Math.max(20, (value / maxValue) * 100)}%` }} />
                    <span className="bar-index">{index}</span>
                  </div>
                );
              })}
            </div>
            <div className="step-message" aria-live="polite">
              <span>{cursor === steps.length - 1 ? "✓" : current.swapped.length ? "⇄" : current.comparing.length ? "?" : current.minimumIndex !== null ? "↓" : "→"}</span>
              <p>{current.message}</p>
            </div>
          </div>

          <VisualizerPlayback complete={cursor === steps.length - 1} playing={playing} delay={speed} progress={progress} onReplay={() => { setCursor(0); setPlaying(false); }} onTogglePlaying={() => setPlaying((value) => !value)} onStep={nextStep} onDelayChange={setSpeed} playLabel="Play sort" />
          <VisualizerStats
            metrics={[{ label: "Comparisons", value: current.comparisons }, { label: "Swaps", value: current.swaps }, { label: "Locked", value: `${current.sortedUntil}/${current.values.length}` }]}
            legend={[{ label: "Comparing", className: "legend-compare" }, { label: "Current minimum", className: "legend-minimum" }, { label: "Sorted", className: "legend-sorted" }]}
          />
          <SortingTraceTable algorithmName={selectionSortLesson.name} currentStep={cursor} rows={traceRows} pairColumnLabel="Candidates / minimum" />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading">
          <p className="section-number">03 — Read the code</p>
          <h2>From minimum scan to working code</h2>
          <p>Compare how all four languages remember one index during the scan and swap only after the pass.</p>
        </div>
        <div className="code-layout">
          <LessonCodeViewer algorithmName={selectionSortLesson.name} codeExamples={CODE_EXAMPLES} />
          <LessonComplexityPanel complexity={selectionSortLesson.complexity} />
        </div>
      </section>

      <LessonMistakes mistakes={selectionSortLesson.studyGuide.mistakes} />
      <LessonQuiz questions={selectionSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy">
          <p className="section-number">06 — Mini game</p>
          <h2>{selectionSortLesson.challenge.title}</h2>
          <p>{selectionSortLesson.challenge.description}</p>
          <div className="game-rule"><span>Rule</span> {selectionSortLesson.challenge.rule}</div>
        </div>
        <div className="game-card">
          <div className="game-header"><span>{challengeWon ? "Challenge complete" : `Pass ${challengeBoundary + 1}: find the minimum`}</span><strong>{attempts} picks</strong></div>
          <div className="conveyor" aria-label={`Challenge values: ${challenge.join(", ")}. ${challengeBoundary} positions locked.`}>
            {challenge.map((value, index) => (
              <button
                type="button"
                key={`${value}-${index}`}
                className={index < challengeBoundary ? "package locked" : challengeChoice === index ? "package selected" : "package"}
                onClick={() => chooseMinimum(index)}
                disabled={challengeWon || index < challengeBoundary}
                aria-label={`Package ${value}, position ${index + 1}${index < challengeBoundary ? ", locked" : ""}`}
              >
                <span>{value}</span><i aria-hidden="true">{index < challengeBoundary ? "✓" : "▦"}</i>
              </button>
            ))}
          </div>
          <div className="belt"><span /><span /><span /><span /><span /><span /></div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite">
            <span>{challengeWon ? "★" : challengeChoice === null ? "↓" : "?"}</span>
            <p>{challengeWon ? `Nicely done — sorted with ${attempts} picks.` : challengeChoice === null ? `Choose the smallest value from index ${challengeBoundary} onward.` : `${challenge[challengeChoice]} is not the smallest remaining value. Scan again.`}</p>
            <button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="section-heading">
          <p className="section-number">07 — Use it wisely</p>
          <h2>Where {selectionSortLesson.name} fits</h2>
        </div>
        <div className="use-grid">
          {selectionSortLesson.useCases.map((useCase) => (
            <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}>
              <span className="use-icon">{useCase.icon}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
              <small>{useCase.recommendation}</small>
            </article>
          ))}
        </div>
      </section>

      <LessonCompletion lessonName={selectionSortLesson.name} slug={selectionSortLesson.slug} criteria={selectionSortLesson.completionCriteria} />
      <LessonNavigation currentSlug={selectionSortLesson.slug} />
      <LessonFooter lessonNumber={selectionSortLesson.lessonNumber} track={selectionSortLesson.track} />
    </main>
  );
}
