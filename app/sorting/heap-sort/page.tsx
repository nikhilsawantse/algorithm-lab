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
import { heapSortLesson } from "../../../lib/lessons/heap-sort";

type HeapStep = {
  values: number[];
  labels: string[];
  heapSize: number;
  rootIndex: number | null;
  childIndices: number[];
  candidateIndex: number | null;
  swapped: number[];
  sorted: number[];
  message: string;
  action: string;
  phase: "Build" | "Extract" | "Repair" | "Complete";
  comparisons: number;
  swaps: number;
  extractions: number;
};

const DEFAULT_VALUES = [4, 10, 3, 5, 1, 8, 2];
const CHALLENGE_START = [...heapSortLesson.challenge.startValues];
const QUIZ_STORAGE_KEY = `algorithm-lab:${heapSortLesson.slug}:quiz`;
const EXAMPLES = heapSortLesson.examples;
const CODE_EXAMPLES = heapSortLesson.codeExamples;

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

function childIndexes(root: number, size: number) {
  const left = 2 * root + 1;
  if (left >= size) return [];
  const right = left + 1;
  return right < size ? [left, right] : [left];
}

function buildHeapSteps(source: number[]): HeapStep[] {
  const values = [...source];
  const labels = buildLabels(source);
  const sorted = new Set<number>();
  const steps: HeapStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let extractions = 0;

  function addStep(step: Omit<HeapStep, "values" | "labels" | "sorted" | "comparisons" | "swaps" | "extractions">) {
    steps.push({
      ...step,
      values: [...values],
      labels: [...labels],
      sorted: [...sorted].sort((left, right) => left - right),
      comparisons,
      swaps,
      extractions,
    });
  }

  addStep({
    heapSize: values.length,
    rootIndex: null,
    childIndices: [],
    candidateIndex: null,
    swapped: [],
    message: "Read the array as a complete binary tree. Build the max heap from the last parent upward.",
    action: "Ready",
    phase: "Build",
  });

  function siftDown(startRoot: number, size: number, phase: "Build" | "Repair") {
    let root = startRoot;
    while (true) {
      const children = childIndexes(root, size);
      if (children.length === 0) {
        addStep({
          heapSize: size,
          rootIndex: root,
          childIndices: [],
          candidateIndex: null,
          swapped: [],
          message: `${labels[root]} has no child inside the heap, so this sift-down stops.`,
          action: "Leaf reached",
          phase,
        });
        return;
      }

      comparisons += children.length;
      const candidate = children.reduce((largest, index) => values[index] > values[largest] ? index : largest);
      addStep({
        heapSize: size,
        rootIndex: root,
        childIndices: children,
        candidateIndex: candidate,
        swapped: [],
        message: `Compare parent ${labels[root]} with ${children.length === 2 ? `children ${labels[children[0]]} and ${labels[children[1]]}` : `child ${labels[children[0]]}`}.`,
        action: "Choose larger child",
        phase,
      });

      if (values[root] >= values[candidate]) {
        addStep({
          heapSize: size,
          rootIndex: root,
          childIndices: children,
          candidateIndex: candidate,
          swapped: [],
          message: `${labels[root]} is at least as large as its children. The heap rule holds here.`,
          action: "Heap rule holds",
          phase,
        });
        return;
      }

      const oldRoot = root;
      [values[root], values[candidate]] = [values[candidate], values[root]];
      [labels[root], labels[candidate]] = [labels[candidate], labels[root]];
      swaps += 1;
      root = candidate;
      addStep({
        heapSize: size,
        rootIndex: root,
        childIndices: childIndexes(root, size),
        candidateIndex: null,
        swapped: [oldRoot, root],
        message: `Swap the parent with the larger child, then continue sifting from index ${root}.`,
        action: "Sift down",
        phase,
      });
    }
  }

  for (let root = Math.floor(values.length / 2) - 1; root >= 0; root -= 1) {
    addStep({
      heapSize: values.length,
      rootIndex: root,
      childIndices: childIndexes(root, values.length),
      candidateIndex: null,
      swapped: [],
      message: `Build phase: restore the heap rooted at index ${root}.`,
      action: "Heapify subtree",
      phase: "Build",
    });
    siftDown(root, values.length, "Build");
  }

  addStep({
    heapSize: values.length,
    rootIndex: 0,
    childIndices: childIndexes(0, values.length),
    candidateIndex: null,
    swapped: [],
    message: "Max heap complete. The largest remaining value is now at the root.",
    action: "Max heap built",
    phase: "Build",
  });

  for (let end = values.length - 1; end > 0; end -= 1) {
    const maximum = labels[0];
    [values[0], values[end]] = [values[end], values[0]];
    [labels[0], labels[end]] = [labels[end], labels[0]];
    swaps += 1;
    extractions += 1;
    sorted.add(end);
    addStep({
      heapSize: end,
      rootIndex: 0,
      childIndices: childIndexes(0, end),
      candidateIndex: null,
      swapped: [0, end],
      message: `Move maximum ${maximum} to index ${end}. That position is now final.`,
      action: "Extract maximum",
      phase: "Extract",
    });
    siftDown(0, end, "Repair");
  }

  if (values.length) sorted.add(0);
  addStep({
    heapSize: 0,
    rootIndex: null,
    childIndices: [],
    candidateIndex: null,
    swapped: [],
    message: "Sorted! Every extracted maximum is in its final position.",
    action: "Complete",
    phase: "Complete",
  });

  return steps;
}

function heapLevels(length: number) {
  const levels: number[][] = [];
  let start = 0;
  let width = 1;
  while (start < length) {
    levels.push(Array.from({ length: Math.min(width, length - start) }, (_, offset) => start + offset));
    start += width;
    width *= 2;
  }
  return levels;
}

export default function HeapSortPage() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [challengeValues, setChallengeValues] = useState(CHALLENGE_START);
  const [challengeRoot, setChallengeRoot] = useState(0);
  const [wrongChild, setWrongChild] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const steps = useMemo(() => buildHeapSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const levels = useMemo(() => heapLevels(current.values.length), [current.values.length]);
  const challengeChildren = childIndexes(challengeRoot, challengeValues.length);
  const challengeLargest = challengeChildren.length
    ? challengeChildren.reduce((largest, index) => challengeValues[index] > challengeValues[largest] ? index : largest)
    : null;
  const challengeWon = challengeLargest === null || challengeValues[challengeRoot] >= challengeValues[challengeLargest];
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => ({
    index,
    pass: step.phase,
    pair: step.rootIndex === null
      ? "—"
      : `Parent ${step.labels[step.rootIndex]}${step.childIndices.length ? ` / ${step.childIndices.map((child) => step.labels[child]).join(", ")}` : ""}`,
    action: step.action,
    values: step.labels,
    swaps: step.swaps,
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

  function chooseChallengeChild(index: number) {
    if (challengeWon || challengeLargest === null) return;
    setAttempts((count) => count + 1);
    if (index !== challengeLargest) {
      setWrongChild(index);
      return;
    }
    setChallengeValues((values) => {
      const next = [...values];
      [next[challengeRoot], next[index]] = [next[index], next[challengeRoot]];
      return next;
    });
    setChallengeRoot(index);
    setWrongChild(null);
  }

  function resetChallenge() {
    setChallengeValues([...CHALLENGE_START]);
    setChallengeRoot(0);
    setWrongChild(null);
    setAttempts(0);
  }

  const maxValue = Math.max(1, ...current.values);
  const progress = Math.round((cursor / Math.max(1, steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#learn">Skip to lesson content</a>
      <LessonHeader lessonNumber={heapSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {heapSortLesson.hero.eyebrow}</p>
          <h1>{heapSortLesson.hero.title}<br /><em>{heapSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{heapSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${heapSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 4, 10, 3 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b>4</b><b>10</b><b>3</b></div><small>array tree</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b className="active">10</b><b>4</b><b>3</b></div><small>max heap</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>3</b><b>4</b><b>10</b></div><small>extract</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {heapSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations objectives={heapSortLesson.studyGuide.objectives} prerequisites={heapSortLesson.studyGuide.prerequisites} sectionOrder={heapSortLesson.learningPath} />

      <section className="concept-section" id="learn">
        <div className="section-heading"><p className="section-number">01 — The idea</p><h2>{heapSortLesson.mentalModel.title}</h2><p>{heapSortLesson.mentalModel.question}</p></div>
        <div className="concept-grid">
          <article className="concept-card"><span className="concept-step">1</span><div className="concept-visual"><b>i</b><b>2i+1</b><b>2i+2</b></div><h3>{heapSortLesson.mentalModel.steps[0].title}</h3><p>{heapSortLesson.mentalModel.steps[0].description}</p></article>
          <article className="concept-card accent-card"><span className="concept-step">2</span><div className="concept-visual"><b className="locked">10</b><i>≥</i><b>7</b><b>9</b></div><h3>{heapSortLesson.mentalModel.steps[1].title}</h3><p>{heapSortLesson.mentalModel.steps[1].description}</p></article>
          <article className="concept-card"><span className="concept-step">3</span><div className="concept-visual pass-visual"><b>3</b><b>4</b><b className="locked">10</b></div><h3>{heapSortLesson.mentalModel.steps[2].title}</h3><p>{heapSortLesson.mentalModel.steps[2].description}</p></article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading"><p className="section-number">02 — Try it yourself</p><h2>Watch the heap grow, shrink, and repair</h2><p>See the same values as a tree and an array while the active heap shrinks and the sorted suffix grows.</p></div>

        <div className="example-gallery" aria-label={`Curated ${heapSortLesson.name} examples`}>
          {EXAMPLES.map((example) => (
            <button className={activeExample === example.id ? "example-card is-active" : "example-card"} type="button" key={example.id} onClick={() => loadExample(example)} aria-pressed={activeExample === example.id}>
              <span className="example-type">{example.type}</span><strong>{example.title}</strong><code>[{example.values.join(", ")}]</code><p>{example.description}</p><small>{example.result}</small><span className="example-action">Load example <i aria-hidden="true">-&gt;</i></span>
            </button>
          ))}
        </div>

        <div className="visualizer-shell">
          <ArrayInputControls input={input} error={inputError} helperText="3–10 values, each from 1 to 99" onInputChange={setInput} onApply={applyInput} onShuffle={shuffleValues} />
          <div className="visual-stage heap-visual-stage">
            <div className="stage-meta"><span>Phase <strong>{current.phase}</strong></span><span>Heap size <strong>{current.heapSize}</strong></span><span className="status-dot"><i /> {cursor === steps.length - 1 ? "Complete" : playing ? "Running" : "Paused"}</span></div>
            <div className="heap-tree" role="img" aria-label={`Heap tree for ${current.values.join(", ")}. Active heap size ${current.heapSize}.`}>
              {levels.map((level, levelIndex) => (
                <div className="heap-tree-level" key={levelIndex}>
                  {level.map((index) => {
                    const state = index >= current.heapSize
                      ? "is-sorted"
                      : current.swapped.includes(index)
                        ? "is-swapped"
                        : current.rootIndex === index
                          ? "is-root"
                          : current.candidateIndex === index
                            ? "is-candidate"
                            : current.childIndices.includes(index) ? "is-child" : "";
                    return <div className={`heap-node ${state}`} key={index}><strong>{current.labels[index]}</strong><small>index {index}</small></div>;
                  })}
                </div>
              ))}
            </div>
            <div className="heap-array-label"><span>Same data in array storage</span><small>sorted suffix is outside the heap</small></div>
            <div className="bars heap-bars" role="img" aria-label={`Current array: ${current.values.join(", ")}`}>
              {current.values.map((value, index) => {
                const state = index >= current.heapSize
                  ? "sorted"
                  : current.swapped.includes(index)
                    ? "swapped"
                    : current.rootIndex === index
                      ? "heap-root"
                      : current.candidateIndex === index
                        ? "heap-candidate"
                        : current.childIndices.includes(index) ? "heap-child" : "idle";
                return <div className={`bar-column ${state}`} key={`${current.labels[index]}-${index}`}><span className="bar-value">{current.labels[index]}</span><div className="bar" style={{ height: `${Math.max(20, (value / maxValue) * 100)}%` }} /><span className="bar-index">{index}</span></div>;
              })}
            </div>
            <div className="heap-range"><span>Active heap: indexes 0–{Math.max(0, current.heapSize - 1)}</span><span>Sorted: {current.sorted.length}</span><span>Root: {current.rootIndex === null ? "—" : current.labels[current.rootIndex]}</span></div>
            <div className="step-message" aria-live="polite"><span>{cursor === steps.length - 1 ? "✓" : current.phase === "Extract" ? "↑" : "↧"}</span><p>{current.message}</p></div>
          </div>

          <VisualizerPlayback complete={cursor === steps.length - 1} playing={playing} delay={speed} progress={progress} onReplay={() => { setCursor(0); setPlaying(false); }} onTogglePlaying={() => setPlaying((value) => !value)} onStep={nextStep} onDelayChange={setSpeed} playLabel="Play sort" />
          <VisualizerStats metrics={[{ label: "Comparisons", value: current.comparisons }, { label: "Swaps", value: current.swaps }, { label: "Extractions", value: current.extractions }]} legend={[{ label: "Parent", className: "legend-heap-root" }, { label: "Larger child", className: "legend-heap-candidate" }, { label: "Sorted", className: "legend-sorted" }]} />
          <SortingTraceTable algorithmName={heapSortLesson.name} currentStep={cursor} rows={traceRows} pairColumnLabel="Parent / children" valuesColumnLabel="Heap array" />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading"><p className="section-number">03 — Read the code</p><h2>From child indexes to working code</h2><p>Compare the same bottom-up build, root extraction, and iterative sift-down across all four languages.</p></div>
        <div className="code-layout"><LessonCodeViewer algorithmName={heapSortLesson.name} codeExamples={CODE_EXAMPLES} /><LessonComplexityPanel complexity={heapSortLesson.complexity} /></div>
      </section>

      <LessonMistakes mistakes={heapSortLesson.studyGuide.mistakes} />
      <LessonQuiz questions={heapSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy"><p className="section-number">06 — Mini game</p><h2>{heapSortLesson.challenge.title}</h2><p>{heapSortLesson.challenge.description}</p><div className="game-rule"><span>Rule</span> {heapSortLesson.challenge.rule}</div></div>
        <div className="game-card heap-game">
          <div className="game-header"><span>{challengeWon ? "Heap repaired" : `Repair index ${challengeRoot}`}</span><strong>{attempts} picks</strong></div>
          <div className="heap-game-tree">
            {heapLevels(challengeValues.length).map((level, levelIndex) => (
              <div className="heap-tree-level" key={levelIndex}>
                {level.map((index) => <div className={`heap-node ${index === challengeRoot ? "is-root" : challengeChildren.includes(index) ? "is-child" : ""}`} key={index}><strong>{challengeValues[index]}</strong><small>index {index}</small></div>)}
              </div>
            ))}
          </div>
          {!challengeWon && (
            <div className="heap-game-actions">
              <small>Which child should swap with {challengeValues[challengeRoot]}?</small>
              <div>{challengeChildren.map((index) => <button className={wrongChild === index ? "is-wrong" : ""} type="button" key={index} onClick={() => chooseChallengeChild(index)}>{challengeValues[index]} <small>index {index}</small></button>)}</div>
            </div>
          )}
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite"><span>{challengeWon ? "★" : wrongChild === null ? "↧" : "?"}</span><p>{challengeWon ? `Max heap restored in ${attempts} picks.` : wrongChild === null ? "Compare both children and choose the larger one." : "That child is not the larger choice. Compare the siblings again."}</p><button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button></div>
        </div>
      </section>

      <section className="use-cases"><div className="section-heading"><p className="section-number">07 — Use it wisely</p><h2>Where {heapSortLesson.name} fits</h2></div><div className="use-grid">{heapSortLesson.useCases.map((useCase) => <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}><span className="use-icon">{useCase.icon}</span><h3>{useCase.title}</h3><p>{useCase.description}</p><small>{useCase.recommendation}</small></article>)}</div></section>

      <LessonCompletion lessonName={heapSortLesson.name} slug={heapSortLesson.slug} criteria={heapSortLesson.completionCriteria} />
      <LessonNavigation currentSlug={heapSortLesson.slug} />
      <LessonFooter lessonNumber={heapSortLesson.lessonNumber} track={heapSortLesson.track} />
    </main>
  );
}
