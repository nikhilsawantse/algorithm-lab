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
import { countingSortLesson } from "../../../lib/lessons/counting-sort";

type CountingStep = {
  sourceValues: number[];
  sourceLabels: string[];
  counts: number[];
  output: Array<string | null>;
  minimum: number;
  maximum: number;
  activeSource: number | null;
  activeBucket: number | null;
  activeOutput: number | null;
  phase: "Count" | "Prefix" | "Place" | "Complete";
  action: string;
  message: string;
  processed: number;
  writes: number;
  placements: number;
};

const DEFAULT_VALUES = [4, 2, 2, 8, 3, 3, 1];
const CHALLENGE_VALUES = [...countingSortLesson.challenge.startValues];
const CHALLENGE_MINIMUM = Math.min(...CHALLENGE_VALUES);
const CHALLENGE_MAXIMUM = Math.max(...CHALLENGE_VALUES);
const QUIZ_STORAGE_KEY = `algorithm-lab:${countingSortLesson.slug}:quiz`;
const EXAMPLES = countingSortLesson.examples;
const CODE_EXAMPLES = countingSortLesson.codeExamples;

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

function buildCountingSteps(source: number[]): CountingStep[] {
  const sourceValues = [...source];
  const sourceLabels = buildLabels(source);
  const minimum = source.length ? Math.min(...source) : 0;
  const maximum = source.length ? Math.max(...source) : 0;
  const counts = Array(maximum - minimum + 1).fill(0);
  const output: Array<string | null> = Array(source.length).fill(null);
  const steps: CountingStep[] = [];
  let processed = 0;
  let writes = 0;
  let placements = 0;

  function addStep(step: Omit<CountingStep, "sourceValues" | "sourceLabels" | "counts" | "output" | "minimum" | "maximum" | "processed" | "writes" | "placements">) {
    steps.push({
      ...step,
      sourceValues: [...sourceValues],
      sourceLabels: [...sourceLabels],
      counts: [...counts],
      output: [...output],
      minimum,
      maximum,
      processed,
      writes,
      placements,
    });
  }

  addStep({
    activeSource: null,
    activeBucket: null,
    activeOutput: null,
    phase: "Count",
    action: "Create buckets",
    message: `Create ${counts.length} buckets for keys ${minimum} through ${maximum}.`,
  });

  sourceValues.forEach((value, index) => {
    const bucket = value - minimum;
    counts[bucket] += 1;
    processed += 1;
    writes += 1;
    addStep({
      activeSource: index,
      activeBucket: bucket,
      activeOutput: null,
      phase: "Count",
      action: "Count value",
      message: `${sourceLabels[index]} maps to bucket ${bucket} because ${value} - (${minimum}) = ${bucket}. Increment its frequency.`,
    });
  });

  for (let bucket = 1; bucket < counts.length; bucket += 1) {
    const previous = counts[bucket - 1];
    counts[bucket] += previous;
    writes += 1;
    addStep({
      activeSource: null,
      activeBucket: bucket,
      activeOutput: null,
      phase: "Prefix",
      action: "Accumulate count",
      message: `Add the previous total ${previous}. Key ${minimum + bucket} now ends at position ${counts[bucket] - 1}.`,
    });
  }

  for (let index = sourceValues.length - 1; index >= 0; index -= 1) {
    const value = sourceValues[index];
    const bucket = value - minimum;
    counts[bucket] -= 1;
    const position = counts[bucket];
    output[position] = sourceLabels[index];
    writes += 1;
    placements += 1;
    addStep({
      activeSource: index,
      activeBucket: bucket,
      activeOutput: position,
      phase: "Place",
      action: "Place stably",
      message: `Scan from the right: place ${sourceLabels[index]} at output index ${position}, then move its bucket pointer left.`,
    });
  }

  addStep({
    activeSource: null,
    activeBucket: null,
    activeOutput: null,
    phase: "Complete",
    action: "Complete",
    message: "Sorted! Counts produced exact positions without comparing value pairs.",
  });

  return steps;
}

export default function CountingSortPage() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [challengeCursor, setChallengeCursor] = useState(0);
  const [challengeCounts, setChallengeCounts] = useState(Array(CHALLENGE_MAXIMUM - CHALLENGE_MINIMUM + 1).fill(0));
  const [wrongBucket, setWrongBucket] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const steps = useMemo(() => buildCountingSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = challengeCursor >= CHALLENGE_VALUES.length;
  const challengeValue = challengeWon ? null : CHALLENGE_VALUES[challengeCursor];
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => ({
    index,
    pass: step.phase,
    pair: step.activeBucket === null
      ? "—"
      : `${step.activeSource === null ? "Bucket" : step.sourceLabels[step.activeSource]} → key ${step.minimum + step.activeBucket}`,
    action: step.action,
    values: step.output.map((value) => value ?? "·"),
    swaps: step.writes,
  }));

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
    const allIntegers = parsed.every(Number.isInteger);
    const range = parsed.length ? Math.max(...parsed) - Math.min(...parsed) + 1 : 0;
    if (parsed.length < 3 || parsed.length > 10 || !allIntegers || parsed.some((value) => value < -9 || value > 12) || range > 20) {
      setInputError("Enter 3–10 integers from -9 to 12 with a key range no wider than 20.");
      return;
    }
    setSource(parsed);
    setCursor(0);
    setPlaying(false);
    setInputError("");
    setActiveExample(null);
  }

  function shuffleValues() {
    const shuffled = Array.from({ length: 8 }, () => Math.floor(Math.random() * 9));
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

  function chooseChallengeBucket(bucket: number) {
    if (challengeValue === null) return;
    setAttempts((count) => count + 1);
    const expected = challengeValue - CHALLENGE_MINIMUM;
    if (bucket !== expected) {
      setWrongBucket(bucket);
      return;
    }
    setChallengeCounts((counts) => counts.map((count, index) => index === bucket ? count + 1 : count));
    setChallengeCursor((position) => position + 1);
    setWrongBucket(null);
  }

  function resetChallenge() {
    setChallengeCursor(0);
    setChallengeCounts(Array(CHALLENGE_MAXIMUM - CHALLENGE_MINIMUM + 1).fill(0));
    setWrongBucket(null);
    setAttempts(0);
  }

  const progress = Math.round((cursor / Math.max(1, steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#learn">Skip to lesson content</a>
      <LessonHeader lessonNumber={countingSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {countingSortLesson.hero.eyebrow}</p>
          <h1>{countingSortLesson.hero.title}<br /><em>{countingSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{countingSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${countingSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 2, 0, 1, 2 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b>2</b><b>0</b><b>1</b><b>2</b></div><small>read keys</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b>1</b><b>1</b><b className="active">2</b></div><small>frequencies</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>0</b><b>1</b><b>2</b><b>2</b></div><small>placed</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {countingSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations objectives={countingSortLesson.studyGuide.objectives} prerequisites={countingSortLesson.studyGuide.prerequisites} sectionOrder={countingSortLesson.learningPath} />

      <section className="concept-section" id="learn">
        <div className="section-heading"><p className="section-number">01 — The idea</p><h2>{countingSortLesson.mentalModel.title}</h2><p>{countingSortLesson.mentalModel.question}</p></div>
        <div className="concept-grid">
          <article className="concept-card"><span className="concept-step">1</span><div className="concept-visual"><b>-2</b><i>v - min</i><b>0</b></div><h3>{countingSortLesson.mentalModel.steps[0].title}</h3><p>{countingSortLesson.mentalModel.steps[0].description}</p></article>
          <article className="concept-card accent-card"><span className="concept-step">2</span><div className="concept-visual"><b>1</b><b>2</b><b className="locked">4</b></div><h3>{countingSortLesson.mentalModel.steps[1].title}</h3><p>{countingSortLesson.mentalModel.steps[1].description}</p></article>
          <article className="concept-card"><span className="concept-step">3</span><div className="concept-visual pass-visual"><b>1</b><b>2A</b><b>2B</b></div><h3>{countingSortLesson.mentalModel.steps[2].title}</h3><p>{countingSortLesson.mentalModel.steps[2].description}</p></article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading"><p className="section-number">02 — Try it yourself</p><h2>Watch frequencies become positions</h2><p>Follow each value into a bucket, see prefix totals form, and place labeled duplicates into a stable output.</p></div>

        <div className="example-gallery" aria-label={`Curated ${countingSortLesson.name} examples`}>
          {EXAMPLES.map((example) => (
            <button className={activeExample === example.id ? "example-card is-active" : "example-card"} type="button" key={example.id} onClick={() => loadExample(example)} aria-pressed={activeExample === example.id}>
              <span className="example-type">{example.type}</span><strong>{example.title}</strong><code>[{example.values.join(", ")}]</code><p>{example.description}</p><small>{example.result}</small><span className="example-action">Load example <i aria-hidden="true">-&gt;</i></span>
            </button>
          ))}
        </div>

        <div className="visualizer-shell">
          <ArrayInputControls input={input} error={inputError} helperText="3–10 integers from -9 to 12; key range ≤ 20" onInputChange={setInput} onApply={applyInput} onShuffle={shuffleValues} />
          <div className="visual-stage counting-stage">
            <div className="stage-meta"><span>Phase <strong>{current.phase}</strong></span><span>Key range k <strong>{current.counts.length}</strong></span><span className="status-dot"><i /> {cursor === steps.length - 1 ? "Complete" : playing ? "Running" : "Paused"}</span></div>
            <div className="counting-workspace">
              <article className="counting-panel">
                <header><span>Input values</span><small>{current.phase === "Place" ? "scan right to left" : "scan left to right"}</small></header>
                <div className="counting-source-row">{current.sourceLabels.map((label, index) => <span className={current.activeSource === index ? "is-active" : ""} key={`${label}-${index}`}>{label}<small>{index}</small></span>)}</div>
              </article>
              <article className="counting-panel">
                <header><span>{current.phase === "Count" ? "Frequency buckets" : current.phase === "Prefix" ? "Cumulative positions" : "Next output positions"}</span><small>index = key - minimum</small></header>
                <div className="counting-buckets">{current.counts.map((count, bucket) => <div className={current.activeBucket === bucket ? "is-active" : ""} key={bucket}><small>key {current.minimum + bucket}</small><strong>{count}</strong><i>bucket {bucket}</i></div>)}</div>
              </article>
              <article className="counting-panel output-panel">
                <header><span>Stable output</span><small>{current.placements} of {current.output.length} placed</small></header>
                <div className="counting-output-row">{current.output.map((label, index) => <span className={current.activeOutput === index ? "is-active" : label ? "is-filled" : ""} key={index}>{label ?? "·"}<small>{index}</small></span>)}</div>
              </article>
            </div>
            <div className="counting-range"><span>Minimum: {current.minimum}</span><span>Maximum: {current.maximum}</span><span>Mapping: value - minimum</span></div>
            <div className="step-message" aria-live="polite"><span>{cursor === steps.length - 1 ? "✓" : current.phase === "Count" ? "#" : current.phase === "Prefix" ? "∑" : "→"}</span><p>{current.message}</p></div>
          </div>

          <VisualizerPlayback complete={cursor === steps.length - 1} playing={playing} delay={speed} progress={progress} onReplay={() => { setCursor(0); setPlaying(false); }} onTogglePlaying={() => setPlaying((value) => !value)} onStep={nextStep} onDelayChange={setSpeed} playLabel="Play sort" />
          <VisualizerStats metrics={[{ label: "Values counted", value: current.processed }, { label: "Writes", value: current.writes }, { label: "Placements", value: current.placements }]} legend={[{ label: "Active value", className: "legend-count-source" }, { label: "Active bucket", className: "legend-count-bucket" }, { label: "Output", className: "legend-sorted" }]} />
          <SortingTraceTable algorithmName={countingSortLesson.name} currentStep={cursor} rows={traceRows} pairColumnLabel="Value / bucket" valuesColumnLabel="Current output" operationColumnLabel="Writes" />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading"><p className="section-number">03 — Read the code</p><h2>From frequencies to stable code</h2><p>Compare the same minimum offset, prefix counts, and reverse placement across all four languages.</p></div>
        <div className="code-layout"><LessonCodeViewer algorithmName={countingSortLesson.name} codeExamples={CODE_EXAMPLES} /><LessonComplexityPanel complexity={countingSortLesson.complexity} /></div>
      </section>

      <LessonMistakes mistakes={countingSortLesson.studyGuide.mistakes} />
      <LessonQuiz questions={countingSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy"><p className="section-number">06 — Mini game</p><h2>{countingSortLesson.challenge.title}</h2><p>{countingSortLesson.challenge.description}</p><div className="game-rule"><span>Rule</span> {countingSortLesson.challenge.rule}</div></div>
        <div className="game-card counting-game">
          <div className="game-header"><span>{challengeWon ? "Table complete" : `Count value ${challengeValue}`}</span><strong>{attempts} picks</strong></div>
          <div className="counting-game-source"><small>Incoming values</small><div>{CHALLENGE_VALUES.map((value, index) => <span className={index < challengeCursor ? "is-used" : index === challengeCursor ? "is-active" : ""} key={index}>{value}</span>)}</div></div>
          <div className="counting-game-buckets">{challengeCounts.map((count, bucket) => <button className={wrongBucket === bucket ? "is-wrong" : ""} type="button" disabled={challengeWon} onClick={() => chooseChallengeBucket(bucket)} key={bucket}><small>key {CHALLENGE_MINIMUM + bucket}</small><strong>{count}</strong></button>)}</div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite"><span>{challengeWon ? "★" : wrongBucket === null ? "#" : "?"}</span><p>{challengeWon ? `All ${CHALLENGE_VALUES.length} values counted in ${attempts} picks.` : wrongBucket === null ? `Which bucket matches key ${challengeValue}?` : "That bucket has a different key. Match the incoming value exactly."}</p><button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button></div>
        </div>
      </section>

      <section className="use-cases"><div className="section-heading"><p className="section-number">07 — Use it wisely</p><h2>Where {countingSortLesson.name} fits</h2></div><div className="use-grid">{countingSortLesson.useCases.map((useCase) => <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}><span className="use-icon">{useCase.icon}</span><h3>{useCase.title}</h3><p>{useCase.description}</p><small>{useCase.recommendation}</small></article>)}</div></section>

      <LessonCompletion lessonName={countingSortLesson.name} slug={countingSortLesson.slug} criteria={countingSortLesson.completionCriteria} />
      <LessonNavigation currentSlug={countingSortLesson.slug} />
      <LessonFooter lessonNumber={countingSortLesson.lessonNumber} track={countingSortLesson.track} />
    </main>
  );
}
