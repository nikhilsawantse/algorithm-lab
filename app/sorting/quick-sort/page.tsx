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
import { quickSortLesson } from "../../../lib/lessons/quick-sort";

type SortStep = {
  values: number[];
  labels: string[];
  activeStart: number;
  activeEnd: number;
  pivotIndex: number | null;
  scanIndex: number | null;
  boundaryIndex: number | null;
  swapped: number[];
  fixed: number[];
  message: string;
  action: string;
  depth: number;
  comparisons: number;
  swaps: number;
  partitions: number;
};

const DEFAULT_VALUES = [10, 7, 8, 9, 1, 5, 6];
const CHALLENGE_VALUES = [...quickSortLesson.challenge.startValues];
const CHALLENGE_PIVOT = CHALLENGE_VALUES.at(-1) ?? 0;
const CHALLENGE_SCAN_VALUES = CHALLENGE_VALUES.slice(0, -1);
const QUIZ_STORAGE_KEY = `algorithm-lab:${quickSortLesson.slug}:quiz`;
const EXAMPLES = quickSortLesson.examples;
const CODE_EXAMPLES = quickSortLesson.codeExamples;

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
  const steps: SortStep[] = [];
  const fixed = new Set<number>();
  let comparisons = 0;
  let swaps = 0;
  let partitions = 0;

  function addStep(step: Omit<SortStep, "values" | "labels" | "fixed" | "comparisons" | "swaps" | "partitions">) {
    steps.push({
      ...step,
      values: [...values],
      labels: [...labels],
      fixed: [...fixed].sort((left, right) => left - right),
      comparisons,
      swaps,
      partitions,
    });
  }

  addStep({
    activeStart: 0,
    activeEnd: Math.max(0, values.length - 1),
    pivotIndex: values.length ? values.length - 1 : null,
    scanIndex: null,
    boundaryIndex: values.length ? 0 : null,
    swapped: [],
    message: "Ready. Use the last value in the full range as the first pivot.",
    action: "Ready",
    depth: 0,
  });

  function sortRange(start: number, end: number, depth: number) {
    if (start > end) return;
    if (start === end) {
      fixed.add(start);
      addStep({
        activeStart: start,
        activeEnd: end,
        pivotIndex: start,
        scanIndex: null,
        boundaryIndex: start,
        swapped: [],
        message: `${labels[start]} is alone, so this recursive range is complete.`,
        action: "Base case",
        depth,
      });
      return;
    }

    const pivotValue = values[end];
    const pivotLabel = labels[end];
    let boundary = start;
    addStep({
      activeStart: start,
      activeEnd: end,
      pivotIndex: end,
      scanIndex: null,
      boundaryIndex: boundary,
      swapped: [],
      message: `Choose ${pivotLabel} as pivot for indexes ${start} through ${end}.`,
      action: "Choose pivot",
      depth,
    });

    for (let scan = start; scan < end; scan += 1) {
      comparisons += 1;
      addStep({
        activeStart: start,
        activeEnd: end,
        pivotIndex: end,
        scanIndex: scan,
        boundaryIndex: boundary,
        swapped: [],
        message: `Compare ${labels[scan]} with pivot ${pivotLabel}.`,
        action: "Compare",
        depth,
      });

      if (values[scan] <= pivotValue) {
        if (boundary !== scan) {
          const destination = boundary;
          const scannedLabel = labels[scan];
          [values[boundary], values[scan]] = [values[scan], values[boundary]];
          [labels[boundary], labels[scan]] = [labels[scan], labels[boundary]];
          swaps += 1;
          boundary += 1;
          addStep({
            activeStart: start,
            activeEnd: end,
            pivotIndex: end,
            scanIndex: scan,
            boundaryIndex: boundary,
            swapped: [destination, scan],
            message: `${scannedLabel} belongs left of the pivot, so swap it into the boundary.`,
            action: "Move left",
            depth,
          });
        } else {
          boundary += 1;
          addStep({
            activeStart: start,
            activeEnd: end,
            pivotIndex: end,
            scanIndex: scan,
            boundaryIndex: boundary,
            swapped: [],
            message: `${labels[scan]} already belongs in the smaller-or-equal region.`,
            action: "Keep left",
            depth,
          });
        }
      } else {
        addStep({
          activeStart: start,
          activeEnd: end,
          pivotIndex: end,
          scanIndex: scan,
          boundaryIndex: boundary,
          swapped: [],
          message: `${labels[scan]} is larger, so leave it on the pivot's right side for now.`,
          action: "Keep right",
          depth,
        });
      }
    }

    if (boundary !== end) {
      [values[boundary], values[end]] = [values[end], values[boundary]];
      [labels[boundary], labels[end]] = [labels[end], labels[boundary]];
      swaps += 1;
    }
    partitions += 1;
    fixed.add(boundary);
    addStep({
      activeStart: start,
      activeEnd: end,
      pivotIndex: boundary,
      scanIndex: null,
      boundaryIndex: boundary,
      swapped: boundary === end ? [] : [boundary, end],
      message: `Place pivot ${pivotLabel} at index ${boundary}. Its position is now final.`,
      action: "Fix pivot",
      depth,
    });

    sortRange(start, boundary - 1, depth + 1);
    sortRange(boundary + 1, end, depth + 1);
  }

  sortRange(0, values.length - 1, 0);
  addStep({
    activeStart: 0,
    activeEnd: Math.max(0, values.length - 1),
    pivotIndex: null,
    scanIndex: null,
    boundaryIndex: null,
    swapped: [],
    message: "Sorted! Every pivot and base case is fixed in its final position.",
    action: "Complete",
    depth: 0,
  });
  return steps;
}

export default function QuickSortPage() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [challengeCursor, setChallengeCursor] = useState(0);
  const [challengeLeft, setChallengeLeft] = useState<number[]>([]);
  const [challengeRight, setChallengeRight] = useState<number[]>([]);
  const [challengeChoice, setChallengeChoice] = useState<"left" | "right" | null>(null);
  const [attempts, setAttempts] = useState(0);

  const steps = useMemo(() => buildSortSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = challengeCursor >= CHALLENGE_SCAN_VALUES.length;
  const challengeValue = challengeWon ? null : CHALLENGE_SCAN_VALUES[challengeCursor];
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => {
    const pair = step.scanIndex !== null && step.pivotIndex !== null
      ? `${step.labels[step.scanIndex]} and pivot ${step.labels[step.pivotIndex]}`
      : step.pivotIndex !== null
        ? `Pivot ${step.labels[step.pivotIndex]}`
        : "—";
    return { index, pass: step.depth, pair, action: step.action, values: step.labels, swaps: step.swaps };
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
    const shuffled = Array.from({ length: 8 }, () => Math.floor(Math.random() * 88) + 10);
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

  function classifyChallenge(side: "left" | "right") {
    if (challengeValue === null) return;
    setAttempts((count) => count + 1);
    const correctSide = challengeValue <= CHALLENGE_PIVOT ? "left" : "right";
    if (side !== correctSide) {
      setChallengeChoice(side);
      return;
    }
    if (side === "left") setChallengeLeft((values) => [...values, challengeValue]);
    else setChallengeRight((values) => [...values, challengeValue]);
    setChallengeCursor((position) => position + 1);
    setChallengeChoice(null);
  }

  function resetChallenge() {
    setChallengeCursor(0);
    setChallengeLeft([]);
    setChallengeRight([]);
    setChallengeChoice(null);
    setAttempts(0);
  }

  const maxValue = Math.max(...current.values);
  const progress = Math.round((cursor / (steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#lesson-content">Skip to lesson content</a>
      <LessonHeader lessonNumber={quickSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {quickSortLesson.hero.eyebrow}</p>
          <h1>{quickSortLesson.hero.title}<br /><em>{quickSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{quickSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${quickSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 7, 2, 5 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b>7</b><b>2</b><b className="active">5</b></div><small>pivot 5</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b className="active">2</b><b>7</b><b className="active">5</b></div><small>partition</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>2</b><b>5</b><b>7</b></div><small>pivot fixed</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {quickSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations objectives={quickSortLesson.studyGuide.objectives} prerequisites={quickSortLesson.studyGuide.prerequisites} sectionOrder={quickSortLesson.learningPath} />

      <section className="concept-section" id="learn">
        <div className="section-heading"><p className="section-number">01 — The idea</p><h2>{quickSortLesson.mentalModel.title}</h2><p>{quickSortLesson.mentalModel.question}</p></div>
        <div className="concept-grid">
          <article className="concept-card"><span className="concept-step">1</span><div className="concept-visual"><b>7</b><b>2</b><b className="locked">5</b></div><h3>{quickSortLesson.mentalModel.steps[0].title}</h3><p>{quickSortLesson.mentalModel.steps[0].description}</p></article>
          <article className="concept-card accent-card"><span className="concept-step">2</span><div className="concept-visual"><b>2</b><i>≤ 5 | &gt; 5</i><b>7</b></div><h3>{quickSortLesson.mentalModel.steps[1].title}</h3><p>{quickSortLesson.mentalModel.steps[1].description}</p></article>
          <article className="concept-card"><span className="concept-step">3</span><div className="concept-visual pass-visual"><b>2</b><b className="locked">5</b><b>7</b></div><h3>{quickSortLesson.mentalModel.steps[2].title}</h3><p>{quickSortLesson.mentalModel.steps[2].description}</p></article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading"><p className="section-number">02 — Try it yourself</p><h2>Watch each pivot divide its range</h2><p>Follow the active recursive range, scan pointer, smaller-value boundary, and pivots already fixed.</p></div>

        <div className="example-gallery" aria-label={`Curated ${quickSortLesson.name} examples`}>
          {EXAMPLES.map((example) => (
            <button className={activeExample === example.id ? "example-card is-active" : "example-card"} type="button" key={example.id} onClick={() => loadExample(example)} aria-pressed={activeExample === example.id}>
              <span className="example-type">{example.type}</span><strong>{example.title}</strong><code>[{example.values.join(", ")}]</code><p>{example.description}</p><small>{example.result}</small><span className="example-action">Load example <i aria-hidden="true">-&gt;</i></span>
            </button>
          ))}
        </div>

        <div className="visualizer-shell">
          <ArrayInputControls input={input} error={inputError} helperText="3–10 values, each from 1 to 99" onInputChange={setInput} onApply={applyInput} onShuffle={shuffleValues} />
          <div className="visual-stage">
            <div className="stage-meta"><span>Depth <strong>{current.depth}</strong></span><span>Range <strong>{current.activeStart}–{current.activeEnd}</strong></span><span className="status-dot"><i /> {cursor === steps.length - 1 ? "Complete" : playing ? "Running" : "Paused"}</span></div>
            <div className="bars" role="img" aria-label={`Current array: ${current.values.join(", ")}. Active range indexes ${current.activeStart} through ${current.activeEnd}.`}>
              {current.values.map((value, index) => {
                const inRange = index >= current.activeStart && index <= current.activeEnd;
                const state = current.pivotIndex === index
                  ? "pivot"
                  : current.fixed.includes(index)
                    ? "sorted"
                    : current.swapped.includes(index)
                      ? "swapped"
                      : current.scanIndex === index
                        ? "comparing"
                        : inRange && current.boundaryIndex !== null && index < current.boundaryIndex
                          ? "partition-left"
                          : inRange ? "idle" : "inactive";
                return <div className={`bar-column ${state}`} key={`${current.labels[index]}-${index}`}><span className="bar-value">{current.labels[index]}</span><div className="bar" style={{ height: `${Math.max(20, (value / maxValue) * 100)}%` }} /><span className="bar-index">{index}</span></div>;
              })}
            </div>
            <div className="partition-range"><span>Active range: {current.activeStart}–{current.activeEnd}</span><span>Boundary: {current.boundaryIndex ?? "—"}</span><span>Fixed pivots: {current.fixed.length}</span></div>
            <div className="step-message" aria-live="polite"><span>{cursor === steps.length - 1 ? "✓" : current.pivotIndex !== null ? "◆" : "→"}</span><p>{current.message}</p></div>
          </div>

          <VisualizerPlayback complete={cursor === steps.length - 1} playing={playing} delay={speed} progress={progress} onReplay={() => { setCursor(0); setPlaying(false); }} onTogglePlaying={() => setPlaying((value) => !value)} onStep={nextStep} onDelayChange={setSpeed} playLabel="Play sort" />
          <VisualizerStats metrics={[{ label: "Comparisons", value: current.comparisons }, { label: "Swaps", value: current.swaps }, { label: "Partitions", value: current.partitions }]} legend={[{ label: "Scanning", className: "legend-compare" }, { label: "Pivot", className: "legend-pivot" }, { label: "Fixed", className: "legend-sorted" }]} />
          <SortingTraceTable algorithmName={quickSortLesson.name} currentStep={cursor} rows={traceRows} pairColumnLabel="Scan / pivot" valuesColumnLabel="Current array" />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading"><p className="section-number">03 — Read the code</p><h2>From partition boundary to working code</h2><p>Compare the same Lomuto partition and shrinking recursive ranges across all four languages.</p></div>
        <div className="code-layout"><LessonCodeViewer algorithmName={quickSortLesson.name} codeExamples={CODE_EXAMPLES} /><LessonComplexityPanel complexity={quickSortLesson.complexity} /></div>
      </section>

      <LessonMistakes mistakes={quickSortLesson.studyGuide.mistakes} />
      <LessonQuiz questions={quickSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy"><p className="section-number">06 — Mini game</p><h2>{quickSortLesson.challenge.title}</h2><p>{quickSortLesson.challenge.description}</p><div className="game-rule"><span>Rule</span> {quickSortLesson.challenge.rule}</div></div>
        <div className="game-card partition-game">
          <div className="game-header"><span>{challengeWon ? "Partition complete" : `Classify ${challengeValue}`}</span><strong>{attempts} picks</strong></div>
          <div className="partition-source"><small>Pivot</small><span>{CHALLENGE_PIVOT}</span>{!challengeWon && <><small>Scanning</small><span className="is-scan">{challengeValue}</span></>}</div>
          {!challengeWon && (
            <div className="partition-actions">
              <button className={challengeChoice === "left" ? "is-wrong" : ""} type="button" onClick={() => classifyChallenge("left")}>Send left <small>≤ pivot</small></button>
              <button className={challengeChoice === "right" ? "is-wrong" : ""} type="button" onClick={() => classifyChallenge("right")}>Send right <small>&gt; pivot</small></button>
            </div>
          )}
          <div className="partition-bins" aria-label={`Left partition: ${challengeLeft.join(", ")}. Pivot: ${CHALLENGE_PIVOT}. Right partition: ${challengeRight.join(", ")}.`}>
            <article><small>≤ pivot</small><div>{challengeLeft.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div></article>
            <article className="pivot-bin"><small>pivot</small><div><span>{CHALLENGE_PIVOT}</span></div></article>
            <article><small>&gt; pivot</small><div>{challengeRight.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div></article>
          </div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite"><span>{challengeWon ? "★" : challengeChoice === null ? "◆" : "?"}</span><p>{challengeWon ? `Nicely done — valid partition built in ${attempts} picks.` : challengeChoice === null ? `Is ${challengeValue} no larger than pivot ${CHALLENGE_PIVOT}?` : "That side breaks the pivot rule. Compare the value with the pivot again."}</p><button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button></div>
        </div>
      </section>

      <section className="use-cases"><div className="section-heading"><p className="section-number">07 — Use it wisely</p><h2>Where {quickSortLesson.name} fits</h2></div><div className="use-grid">{quickSortLesson.useCases.map((useCase) => <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}><span className="use-icon">{useCase.icon}</span><h3>{useCase.title}</h3><p>{useCase.description}</p><small>{useCase.recommendation}</small></article>)}</div></section>

      <LessonCompletion lessonName={quickSortLesson.name} slug={quickSortLesson.slug} criteria={quickSortLesson.completionCriteria} />
      <LessonNavigation currentSlug={quickSortLesson.slug} />
      <LessonFooter lessonNumber={quickSortLesson.lessonNumber} track={quickSortLesson.track} />
    </main>
  );
}
