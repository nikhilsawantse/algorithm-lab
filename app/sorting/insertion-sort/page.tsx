"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
import { insertionSortLesson } from "../../../lib/lessons/insertion-sort";

type SortStep = {
  values: number[];
  labels: string[];
  comparing: number[];
  shifted: number[];
  keyIndex: number | null;
  sortedUntil: number;
  message: string;
  action: string;
  pass: number;
  comparisons: number;
  shifts: number;
};

const DEFAULT_VALUES = [48, 22, 35, 11, 64, 28, 17];
const CHALLENGE_VALUES = [...insertionSortLesson.challenge.startValues];
const CHALLENGE_SEED_SIZE = 2;
const QUIZ_STORAGE_KEY = `algorithm-lab:${insertionSortLesson.slug}:quiz`;
const EXAMPLES = insertionSortLesson.examples;
const CODE_EXAMPLES = insertionSortLesson.codeExamples;

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
    shifted: [],
    keyIndex: null,
    sortedUntil: Math.min(1, values.length),
    message: "Ready. The first value starts the sorted region.",
    action: "Ready",
    pass: 0,
    comparisons: 0,
    shifts: 0,
  }];

  let comparisons = 0;
  let shifts = 0;

  for (let boundary = 1; boundary < values.length; boundary += 1) {
    let keyIndex = boundary;
    const pass = boundary;

    steps.push({
      values: [...values],
      labels: [...labels],
      comparing: [],
      shifted: [],
      keyIndex,
      sortedUntil: boundary,
      message: `Pass ${pass}: pick up ${labels[keyIndex]} as the key.`,
      action: "Pick key",
      pass,
      comparisons,
      shifts,
    });

    while (keyIndex > 0) {
      comparisons += 1;
      steps.push({
        values: [...values],
        labels: [...labels],
        comparing: [keyIndex - 1],
        shifted: [],
        keyIndex,
        sortedUntil: boundary,
        message: `Compare key ${labels[keyIndex]} with left neighbor ${labels[keyIndex - 1]}.`,
        action: "Compare",
        pass,
        comparisons,
        shifts,
      });

      if (values[keyIndex - 1] <= values[keyIndex]) break;

      const keyLabel = labels[keyIndex];
      const shiftedLabel = labels[keyIndex - 1];
      [values[keyIndex - 1], values[keyIndex]] = [values[keyIndex], values[keyIndex - 1]];
      [labels[keyIndex - 1], labels[keyIndex]] = [labels[keyIndex], labels[keyIndex - 1]];
      keyIndex -= 1;
      shifts += 1;
      steps.push({
        values: [...values],
        labels: [...labels],
        comparing: [],
        shifted: [keyIndex, keyIndex + 1],
        keyIndex,
        sortedUntil: boundary,
        message: `${shiftedLabel} shifts right, moving key ${keyLabel} one place left.`,
        action: "Shift right",
        pass,
        comparisons,
        shifts,
      });
    }

    steps.push({
      values: [...values],
      labels: [...labels],
      comparing: [],
      shifted: [],
      keyIndex: null,
      sortedUntil: boundary + 1,
      message: `${labels[keyIndex]} is inserted. The first ${boundary + 1} values are sorted.`,
      action: "Insert key",
      pass,
      comparisons,
      shifts,
    });
  }

  steps.push({
    values: [...values],
    labels: [...labels],
    comparing: [],
    shifted: [],
    keyIndex: null,
    sortedUntil: values.length,
    message: "Sorted! Every key has joined the ordered region.",
    action: "Complete",
    pass: Math.max(1, values.length - 1),
    comparisons,
    shifts,
  });

  return steps;
}

export default function InsertionSortPage() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [challengeHand, setChallengeHand] = useState(CHALLENGE_VALUES.slice(0, CHALLENGE_SEED_SIZE));
  const [challengeKeyIndex, setChallengeKeyIndex] = useState(CHALLENGE_SEED_SIZE);
  const [challengeChoice, setChallengeChoice] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const steps = useMemo(() => buildSortSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = challengeKeyIndex >= CHALLENGE_VALUES.length;
  const currentChallengeKey = challengeWon ? null : CHALLENGE_VALUES[challengeKeyIndex];
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => {
    const pair = step.keyIndex !== null && step.comparing.length
      ? `${step.labels[step.keyIndex]} and ${step.labels[step.comparing[0]]}`
      : step.shifted.length
        ? step.shifted.map((position) => step.labels[position]).join(" and ")
        : step.keyIndex !== null
          ? step.labels[step.keyIndex]
          : "—";
    return { index, pass: step.pass, pair, action: step.action, values: step.labels, swaps: step.shifts };
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

  function chooseInsertionGap(slot: number) {
    if (currentChallengeKey === null) return;
    setAttempts((count) => count + 1);
    const firstLarger = challengeHand.findIndex((value) => value > currentChallengeKey);
    const correctSlot = firstLarger === -1 ? challengeHand.length : firstLarger;
    if (slot !== correctSlot) {
      setChallengeChoice(slot);
      return;
    }

    setChallengeHand((hand) => [...hand.slice(0, slot), currentChallengeKey, ...hand.slice(slot)]);
    setChallengeKeyIndex((index) => index + 1);
    setChallengeChoice(null);
  }

  function resetChallenge() {
    setChallengeHand(CHALLENGE_VALUES.slice(0, CHALLENGE_SEED_SIZE));
    setChallengeKeyIndex(CHALLENGE_SEED_SIZE);
    setChallengeChoice(null);
    setAttempts(0);
  }

  const maxValue = Math.max(...current.values);
  const progress = Math.round((cursor / (steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#lesson-content">Skip to lesson content</a>
      <LessonHeader lessonNumber={insertionSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {insertionSortLesson.hero.eyebrow}</p>
          <h1>{insertionSortLesson.hero.title}<br /><em>{insertionSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{insertionSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${insertionSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 5, 2, 4 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b>5</b><b className="active">2</b><b>4</b></div><small>pick key</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b className="active">2</b><b>5</b><b>4</b></div><small>insert</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>2</b><b>4</b><b>5</b></div><small>sorted</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {insertionSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations objectives={insertionSortLesson.studyGuide.objectives} prerequisites={insertionSortLesson.studyGuide.prerequisites} sectionOrder={insertionSortLesson.learningPath} />

      <section className="concept-section" id="learn">
        <div className="section-heading">
          <p className="section-number">01 — The idea</p>
          <h2>{insertionSortLesson.mentalModel.title}</h2>
          <p>{insertionSortLesson.mentalModel.question}</p>
        </div>
        <div className="concept-grid">
          <article className="concept-card">
            <span className="concept-step">1</span>
            <div className="concept-visual pass-visual"><b className="locked">2</b><b className="locked">5</b><b>4</b></div>
            <h3>{insertionSortLesson.mentalModel.steps[0].title}</h3>
            <p>{insertionSortLesson.mentalModel.steps[0].description}</p>
          </article>
          <article className="concept-card accent-card">
            <span className="concept-step">2</span>
            <div className="concept-visual"><b>5</b><span className="swap-arrow">→</span><b>4</b></div>
            <h3>{insertionSortLesson.mentalModel.steps[1].title}</h3>
            <p>{insertionSortLesson.mentalModel.steps[1].description}</p>
          </article>
          <article className="concept-card">
            <span className="concept-step">3</span>
            <div className="concept-visual pass-visual"><b className="locked">2</b><b className="locked">4</b><b className="locked">5</b></div>
            <h3>{insertionSortLesson.mentalModel.steps[2].title}</h3>
            <p>{insertionSortLesson.mentalModel.steps[2].description}</p>
          </article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading">
          <p className="section-number">02 — Try it yourself</p>
          <h2>Watch each key join the sorted region</h2>
          <p>Use your own numbers, then follow the key as larger neighbors shift right to open a gap.</p>
        </div>

        <div className="example-gallery" aria-label={`Curated ${insertionSortLesson.name} examples`}>
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
            <div className="bars" role="img" aria-label={`Current array: ${current.values.join(", ")}. ${current.sortedUntil} values are in the sorted region.`}>
              {current.values.map((value, index) => {
                const state = current.shifted.includes(index)
                  ? "swapped"
                  : current.keyIndex === index
                    ? "key"
                    : current.comparing.includes(index)
                      ? "comparing"
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
              <span>{cursor === steps.length - 1 ? "✓" : current.shifted.length ? "→" : current.keyIndex !== null ? "↓" : "✓"}</span>
              <p>{current.message}</p>
            </div>
          </div>

          <VisualizerPlayback complete={cursor === steps.length - 1} playing={playing} delay={speed} progress={progress} onReplay={() => { setCursor(0); setPlaying(false); }} onTogglePlaying={() => setPlaying((value) => !value)} onStep={nextStep} onDelayChange={setSpeed} playLabel="Play sort" />
          <VisualizerStats
            metrics={[{ label: "Comparisons", value: current.comparisons }, { label: "Shifts", value: current.shifts }, { label: "Sorted region", value: `${current.sortedUntil}/${current.values.length}` }]}
            legend={[{ label: "Comparing", className: "legend-compare" }, { label: "Active key", className: "legend-key" }, { label: "Sorted region", className: "legend-sorted" }]}
          />
          <SortingTraceTable algorithmName={insertionSortLesson.name} currentStep={cursor} rows={traceRows} pairColumnLabel="Key / neighbor" operationColumnLabel="Shifts" />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading">
          <p className="section-number">03 — Read the code</p>
          <h2>From shifting values to working code</h2>
          <p>Compare how all four languages save the key, shift larger values, and write the key into its gap.</p>
        </div>
        <div className="code-layout">
          <LessonCodeViewer algorithmName={insertionSortLesson.name} codeExamples={CODE_EXAMPLES} />
          <LessonComplexityPanel complexity={insertionSortLesson.complexity} />
        </div>
      </section>

      <LessonMistakes mistakes={insertionSortLesson.studyGuide.mistakes} />
      <LessonQuiz questions={insertionSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy">
          <p className="section-number">06 — Mini game</p>
          <h2>{insertionSortLesson.challenge.title}</h2>
          <p>{insertionSortLesson.challenge.description}</p>
          <div className="game-rule"><span>Rule</span> {insertionSortLesson.challenge.rule}</div>
        </div>
        <div className="game-card insertion-game">
          <div className="game-header"><span>{challengeWon ? "Challenge complete" : `Insert key ${currentChallengeKey}`}</span><strong>{attempts} picks</strong></div>
          {!challengeWon && currentChallengeKey !== null && (
            <div className="insertion-key" aria-label={`Current key is ${currentChallengeKey}`}><small>Next key</small><span>{currentChallengeKey}</span></div>
          )}
          <div className="insertion-hand" aria-label={`Sorted hand: ${challengeHand.join(", ")}`}>
            {challengeHand.map((value, index) => (
              <Fragment key={`${value}-${index}`}>
                <button className={challengeChoice === index ? "insertion-slot selected" : "insertion-slot"} type="button" disabled={challengeWon} onClick={() => chooseInsertionGap(index)} aria-label={`Insert before ${value}`}><span>+</span></button>
                <span className="package insertion-card"><span>{value}</span><i aria-hidden="true">✓</i></span>
              </Fragment>
            ))}
            <button className={challengeChoice === challengeHand.length ? "insertion-slot selected" : "insertion-slot"} type="button" disabled={challengeWon} onClick={() => chooseInsertionGap(challengeHand.length)} aria-label="Insert at the end"><span>+</span></button>
          </div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite">
            <span>{challengeWon ? "★" : challengeChoice === null ? "↓" : "?"}</span>
            <p>{challengeWon ? `Nicely done — every key was inserted in ${attempts} picks.` : challengeChoice === null ? `Choose the gap where ${currentChallengeKey} belongs in the sorted hand.` : `That gap would break the sorted order. Compare ${currentChallengeKey} with the surrounding cards.`}</p>
            <button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="section-heading">
          <p className="section-number">07 — Use it wisely</p>
          <h2>Where {insertionSortLesson.name} fits</h2>
        </div>
        <div className="use-grid">
          {insertionSortLesson.useCases.map((useCase) => (
            <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}>
              <span className="use-icon">{useCase.icon}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
              <small>{useCase.recommendation}</small>
            </article>
          ))}
        </div>
      </section>

      <LessonCompletion lessonName={insertionSortLesson.name} slug={insertionSortLesson.slug} criteria={insertionSortLesson.completionCriteria} />
      <LessonNavigation currentSlug={insertionSortLesson.slug} />
      <LessonFooter lessonNumber={insertionSortLesson.lessonNumber} track={insertionSortLesson.track} />
    </main>
  );
}
