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
import { radixSortLesson } from "../../../lib/lessons/radix-sort";

type RadixStep = {
  values: number[];
  labels: string[];
  buckets: string[][];
  output: string[];
  offset: number;
  place: number;
  pass: number;
  activeIndex: number | null;
  activeBucket: number | null;
  activeOutput: number | null;
  phase: "Distribute" | "Collect" | "Complete";
  action: string;
  message: string;
  digitReads: number;
  writes: number;
  completedPasses: number;
};

type BucketItem = { value: number; key: number; label: string };

const DEFAULT_VALUES = [170, 45, 75, 90, 802, 24, 2, 66];
const CHALLENGE_VALUES = [...radixSortLesson.challenge.startValues];
const CHALLENGE_PLACE = 10;
const QUIZ_STORAGE_KEY = `algorithm-lab:${radixSortLesson.slug}:quiz`;
const EXAMPLES = radixSortLesson.examples;
const CODE_EXAMPLES = radixSortLesson.codeExamples;

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

function placeName(place: number) {
  if (place === 1) return "ones";
  if (place === 10) return "tens";
  if (place === 100) return "hundreds";
  if (place === 1000) return "thousands";
  return `place ${place}`;
}

function digitAt(value: number, offset: number, place: number) {
  return Math.floor((value + offset) / place) % 10;
}

function buildRadixSteps(source: number[]): RadixStep[] {
  let values = [...source];
  let labels = buildLabels(source);
  let keys = [...source];
  const minimum = source.length ? Math.min(...source) : 0;
  const offset = minimum < 0 ? -minimum : 0;
  keys = keys.map((value) => value + offset);
  const maximum = keys.length ? Math.max(...keys) : 0;
  const steps: RadixStep[] = [];
  let digitReads = 0;
  let writes = 0;
  let completedPasses = 0;

  function addStep(step: Omit<RadixStep, "values" | "labels" | "offset" | "digitReads" | "writes" | "completedPasses">) {
    steps.push({
      ...step,
      values: [...values],
      labels: [...labels],
      buckets: step.buckets.map((bucket) => [...bucket]),
      output: [...step.output],
      offset,
      digitReads,
      writes,
      completedPasses,
    });
  }

  let pass = 1;
  for (let place = 1; Math.floor(maximum / place) > 0; place *= 10) {
    const bucketItems: BucketItem[][] = Array.from({ length: 10 }, () => []);
    const buckets: string[][] = Array.from({ length: 10 }, () => []);
    const output: string[] = [];
    addStep({
      buckets,
      output,
      place,
      pass,
      activeIndex: null,
      activeBucket: null,
      activeOutput: null,
      phase: "Distribute",
      action: "Start digit pass",
      message: `Pass ${pass}: distribute by the ${placeName(place)} digit${offset ? ` of each key after adding offset ${offset}` : ""}.`,
    });

    values.forEach((value, index) => {
      const digit = Math.floor(keys[index] / place) % 10;
      bucketItems[digit].push({ value, key: keys[index], label: labels[index] });
      buckets[digit].push(labels[index]);
      digitReads += 1;
      addStep({
        buckets,
        output,
        place,
        pass,
        activeIndex: index,
        activeBucket: digit,
        activeOutput: null,
        phase: "Distribute",
        action: "Route by digit",
        message: `${labels[index]} has ${placeName(place)} digit ${digit}, so append it to bucket ${digit}.`,
      });
    });

    const nextValues: number[] = [];
    const nextKeys: number[] = [];
    const nextLabels: string[] = [];
    bucketItems.forEach((bucket, digit) => {
      bucket.forEach((item) => {
        const outputIndex = nextValues.length;
        nextValues.push(item.value);
        nextKeys.push(item.key);
        nextLabels.push(item.label);
        output.push(item.label);
        writes += 1;
        addStep({
          buckets,
          output,
          place,
          pass,
          activeIndex: null,
          activeBucket: digit,
          activeOutput: outputIndex,
          phase: "Collect",
          action: "Collect stably",
          message: `Collect ${item.label} from bucket ${digit} at output index ${outputIndex}, preserving arrival order.`,
        });
      });
    });

    values = nextValues;
    keys = nextKeys;
    labels = nextLabels;
    completedPasses += 1;
    addStep({
      buckets,
      output,
      place,
      pass,
      activeIndex: null,
      activeBucket: null,
      activeOutput: null,
      phase: "Collect",
      action: "Pass complete",
      message: `${placeName(place)[0].toUpperCase()}${placeName(place).slice(1)} pass complete. This order carries into the next digit.`,
    });

    pass += 1;
    if (place > Math.floor(maximum / 10)) break;
  }

  addStep({
    buckets: Array.from({ length: 10 }, () => []),
    output: [...labels],
    place: Math.max(1, 10 ** Math.max(0, completedPasses - 1)),
    pass: Math.max(1, completedPasses),
    activeIndex: null,
    activeBucket: null,
    activeOutput: null,
    phase: "Complete",
    action: "Complete",
    message: offset ? `Sorted! Remove offset ${offset} from the working keys to restore the signed values.` : "Sorted! Every required digit place has been processed stably.",
  });

  return steps;
}

export default function RadixSortPage() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [challengeCursor, setChallengeCursor] = useState(0);
  const [challengeBuckets, setChallengeBuckets] = useState<number[][]>(Array.from({ length: 10 }, () => []));
  const [wrongBucket, setWrongBucket] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const steps = useMemo(() => buildRadixSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = challengeCursor >= CHALLENGE_VALUES.length;
  const challengeValue = challengeWon ? null : CHALLENGE_VALUES[challengeCursor];
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => ({
    index,
    pass: `${step.pass} · ${placeName(step.place)}`,
    pair: step.activeBucket === null
      ? "—"
      : `${step.activeIndex === null ? "Collect" : step.labels[step.activeIndex]} → bucket ${step.activeBucket}`,
    action: step.action,
    values: step.output.length ? step.output : step.labels,
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
    if (parsed.length < 3 || parsed.length > 10 || parsed.some((value) => !Number.isInteger(value) || value < -99 || value > 999)) {
      setInputError("Enter 3–10 integers from -99 to 999.");
      return;
    }
    setSource(parsed);
    setCursor(0);
    setPlaying(false);
    setInputError("");
    setActiveExample(null);
  }

  function shuffleValues() {
    const shuffled = Array.from({ length: 8 }, () => Math.floor(Math.random() * 900));
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
    const digit = Math.floor(challengeValue / CHALLENGE_PLACE) % 10;
    if (bucket !== digit) {
      setWrongBucket(bucket);
      return;
    }
    setChallengeBuckets((buckets) => buckets.map((values, index) => index === bucket ? [...values, challengeValue] : values));
    setChallengeCursor((position) => position + 1);
    setWrongBucket(null);
  }

  function resetChallenge() {
    setChallengeCursor(0);
    setChallengeBuckets(Array.from({ length: 10 }, () => []));
    setWrongBucket(null);
    setAttempts(0);
  }

  const progress = Math.round((cursor / Math.max(1, steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#learn">Skip to lesson content</a>
      <LessonHeader lessonNumber={radixSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {radixSortLesson.hero.eyebrow}</p>
          <h1>{radixSortLesson.hero.title}<br /><em>{radixSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{radixSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${radixSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 21, 11, 12 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b>21</b><b>11</b><b className="active">12</b></div><small>ones</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b className="active">11</b><b>21</b><b>12</b></div><small>tens</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>11</b><b>12</b><b>21</b></div><small>sorted</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {radixSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations objectives={radixSortLesson.studyGuide.objectives} prerequisites={radixSortLesson.studyGuide.prerequisites} sectionOrder={radixSortLesson.learningPath} />

      <section className="concept-section" id="learn">
        <div className="section-heading"><p className="section-number">01 — The idea</p><h2>{radixSortLesson.mentalModel.title}</h2><p>{radixSortLesson.mentalModel.question}</p></div>
        <div className="concept-grid">
          <article className="concept-card"><span className="concept-step">1</span><div className="concept-visual"><b>4</b><b>0</b><b className="locked">7</b></div><h3>{radixSortLesson.mentalModel.steps[0].title}</h3><p>{radixSortLesson.mentalModel.steps[0].description}</p></article>
          <article className="concept-card accent-card"><span className="concept-step">2</span><div className="concept-visual"><b>21A</b><i>→ 1 →</i><b>21B</b></div><h3>{radixSortLesson.mentalModel.steps[1].title}</h3><p>{radixSortLesson.mentalModel.steps[1].description}</p></article>
          <article className="concept-card"><span className="concept-step">3</span><div className="concept-visual pass-visual"><b>1s</b><b>10s</b><b>100s</b></div><h3>{radixSortLesson.mentalModel.steps[2].title}</h3><p>{radixSortLesson.mentalModel.steps[2].description}</p></article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading"><p className="section-number">02 — Try it yourself</p><h2>Watch stable digit passes build the order</h2><p>Route each value into a digit bucket, collect buckets in order, and carry the stable result into the next place.</p></div>

        <div className="example-gallery" aria-label={`Curated ${radixSortLesson.name} examples`}>
          {EXAMPLES.map((example) => (
            <button className={activeExample === example.id ? "example-card is-active" : "example-card"} type="button" key={example.id} onClick={() => loadExample(example)} aria-pressed={activeExample === example.id}>
              <span className="example-type">{example.type}</span><strong>{example.title}</strong><code>[{example.values.join(", ")}]</code><p>{example.description}</p><small>{example.result}</small><span className="example-action">Load example <i aria-hidden="true">-&gt;</i></span>
            </button>
          ))}
        </div>

        <div className="visualizer-shell">
          <ArrayInputControls input={input} error={inputError} helperText="3–10 integers from -99 to 999" onInputChange={setInput} onApply={applyInput} onShuffle={shuffleValues} />
          <div className="visual-stage radix-stage">
            <div className="stage-meta"><span>Pass <strong>{current.pass}</strong></span><span>Digit place <strong>{placeName(current.place)}</strong></span><span className="status-dot"><i /> {cursor === steps.length - 1 ? "Complete" : playing ? "Running" : "Paused"}</span></div>
            <div className="radix-workspace">
              <article className="radix-panel">
                <header><span>Current order</span><small>{current.offset ? `working offset +${current.offset}` : "no offset needed"}</small></header>
                <div className="radix-source-row">{current.labels.map((label, index) => <span className={current.activeIndex === index ? "is-active" : ""} key={`${label}-${index}`}><strong>{label}</strong><small>{placeName(current.place)} digit {digitAt(current.values[index], current.offset, current.place)}</small></span>)}</div>
              </article>
              <article className="radix-panel">
                <header><span>Digit buckets 0–9</span><small>append like queues</small></header>
                <div className="radix-buckets">{current.buckets.map((bucket, digit) => <div className={current.activeBucket === digit ? "is-active" : ""} key={digit}><strong>{digit}</strong><div>{bucket.length ? bucket.map((label, index) => <span key={`${label}-${index}`}>{label}</span>) : <i>empty</i>}</div></div>)}</div>
              </article>
              <article className="radix-panel output-panel">
                <header><span>Collected order</span><small>bucket 0 through bucket 9</small></header>
                <div className="radix-output-row">{current.labels.map((_, index) => <span className={current.activeOutput === index ? "is-active" : current.output[index] ? "is-filled" : ""} key={index}>{current.output[index] ?? "·"}<small>{index}</small></span>)}</div>
              </article>
            </div>
            <div className="radix-range"><span>Formula: floor(key / {current.place}) % 10</span><span>Offset: {current.offset}</span><span>Stable passes complete: {current.completedPasses}</span></div>
            <div className="step-message" aria-live="polite"><span>{cursor === steps.length - 1 ? "✓" : current.phase === "Distribute" ? "↓" : "→"}</span><p>{current.message}</p></div>
          </div>

          <VisualizerPlayback complete={cursor === steps.length - 1} playing={playing} delay={speed} progress={progress} onReplay={() => { setCursor(0); setPlaying(false); }} onTogglePlaying={() => setPlaying((value) => !value)} onStep={nextStep} onDelayChange={setSpeed} playLabel="Play sort" />
          <VisualizerStats metrics={[{ label: "Digit reads", value: current.digitReads }, { label: "Writes", value: current.writes }, { label: "Passes", value: current.completedPasses }]} legend={[{ label: "Active value", className: "legend-radix-source" }, { label: "Active bucket", className: "legend-radix-bucket" }, { label: "Collected", className: "legend-sorted" }]} />
          <SortingTraceTable algorithmName={radixSortLesson.name} currentStep={cursor} rows={traceRows} pairColumnLabel="Value / digit bucket" valuesColumnLabel="Pass output" operationColumnLabel="Writes" />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading"><p className="section-number">03 — Read the code</p><h2>From digit buckets to working code</h2><p>Compare the same signed-key offset, stable base-10 pass, and growing place value across all four languages.</p></div>
        <div className="code-layout"><LessonCodeViewer algorithmName={radixSortLesson.name} codeExamples={CODE_EXAMPLES} /><LessonComplexityPanel complexity={radixSortLesson.complexity} /></div>
      </section>

      <LessonMistakes mistakes={radixSortLesson.studyGuide.mistakes} />
      <LessonQuiz questions={radixSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy"><p className="section-number">06 — Mini game</p><h2>{radixSortLesson.challenge.title}</h2><p>{radixSortLesson.challenge.description}</p><div className="game-rule"><span>Rule</span> {radixSortLesson.challenge.rule}</div></div>
        <div className="game-card radix-game">
          <div className="game-header"><span>{challengeWon ? "Tens pass complete" : `Route ${challengeValue}`}</span><strong>{attempts} picks</strong></div>
          <div className="radix-game-source"><small>Incoming values · tens digit</small><div>{CHALLENGE_VALUES.map((value, index) => <span className={index < challengeCursor ? "is-used" : index === challengeCursor ? "is-active" : ""} key={index}>{value}</span>)}</div></div>
          <div className="radix-game-buckets">{challengeBuckets.map((values, digit) => <button className={wrongBucket === digit ? "is-wrong" : ""} type="button" disabled={challengeWon} onClick={() => chooseChallengeBucket(digit)} key={digit}><strong>{digit}</strong><small>{values.length ? values.join(", ") : "empty"}</small></button>)}</div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite"><span>{challengeWon ? "★" : wrongBucket === null ? "↓" : "?"}</span><p>{challengeWon ? `Stable tens buckets built in ${attempts} picks.` : wrongBucket === null ? `What is the tens digit of ${challengeValue}?` : "That digit does not match. Divide by 10, take the floor, then use modulo 10."}</p><button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button></div>
        </div>
      </section>

      <section className="use-cases"><div className="section-heading"><p className="section-number">07 — Use it wisely</p><h2>Where {radixSortLesson.name} fits</h2></div><div className="use-grid">{radixSortLesson.useCases.map((useCase) => <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}><span className="use-icon">{useCase.icon}</span><h3>{useCase.title}</h3><p>{useCase.description}</p><small>{useCase.recommendation}</small></article>)}</div></section>

      <LessonCompletion lessonName={radixSortLesson.name} slug={radixSortLesson.slug} criteria={radixSortLesson.completionCriteria} />
      <LessonNavigation currentSlug={radixSortLesson.slug} />
      <LessonFooter lessonNumber={radixSortLesson.lessonNumber} track={radixSortLesson.track} />
    </main>
  );
}
