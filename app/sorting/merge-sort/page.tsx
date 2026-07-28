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
import { mergeSortLesson } from "../../../lib/lessons/merge-sort";

type SortItem = { value: number; label: string };
type TreeNode = { path: string; depth: number; items: SortItem[] };
type MergePhase = "ready" | "split" | "base" | "prepare" | "compare" | "take" | "merged" | "complete";
type MergeStep = {
  phase: MergePhase;
  activePath: string;
  activeItems: SortItem[];
  left: SortItem[];
  right: SortItem[];
  output: SortItem[];
  leftIndex: number;
  rightIndex: number;
  completed: Record<string, SortItem[]>;
  message: string;
  action: string;
  depth: number;
  comparisons: number;
  writes: number;
  merges: number;
};

const DEFAULT_VALUES = [38, 27, 43, 3, 9, 82, 10, 15];
const CHALLENGE_VALUES = [...mergeSortLesson.challenge.startValues];
const CHALLENGE_MIDDLE = Math.floor(CHALLENGE_VALUES.length / 2);
const QUIZ_STORAGE_KEY = `algorithm-lab:${mergeSortLesson.slug}:quiz`;
const EXAMPLES = mergeSortLesson.examples;
const CODE_EXAMPLES = mergeSortLesson.codeExamples;

function buildItems(source: number[]) {
  const totals = new Map<number, number>();
  const seen = new Map<number, number>();
  source.forEach((value) => totals.set(value, (totals.get(value) ?? 0) + 1));
  return source.map((value) => {
    if ((totals.get(value) ?? 0) === 1) return { value, label: String(value) };
    const occurrence = seen.get(value) ?? 0;
    seen.set(value, occurrence + 1);
    return { value, label: `${value}${String.fromCharCode(65 + occurrence)}` };
  });
}

function buildTreeLevels(items: SortItem[]) {
  const levels: TreeNode[][] = [];
  function visit(segment: SortItem[], path: string, depth: number) {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push({ path, depth, items: [...segment] });
    if (segment.length <= 1) return;
    const middle = Math.floor(segment.length / 2);
    visit(segment.slice(0, middle), `${path}L`, depth + 1);
    visit(segment.slice(middle), `${path}R`, depth + 1);
  }
  visit(items, "root", 0);
  return levels;
}

function buildMergeSteps(source: number[]): MergeStep[] {
  const rootItems = buildItems(source);
  const steps: MergeStep[] = [];
  const completed: Record<string, SortItem[]> = {};
  let comparisons = 0;
  let writes = 0;
  let merges = 0;

  function addStep(step: Omit<MergeStep, "comparisons" | "writes" | "merges" | "completed">) {
    steps.push({
      ...step,
      activeItems: [...step.activeItems],
      left: [...step.left],
      right: [...step.right],
      output: [...step.output],
      completed: Object.fromEntries(Object.entries(completed).map(([path, items]) => [path, [...items]])),
      comparisons,
      writes,
      merges,
    });
  }

  addStep({
    phase: "ready",
    activePath: "root",
    activeItems: rootItems,
    left: [],
    right: [],
    output: [],
    leftIndex: 0,
    rightIndex: 0,
    message: "Ready. Begin by dividing the full array near its midpoint.",
    action: "Ready",
    depth: 0,
  });

  function sort(items: SortItem[], path: string, depth: number): SortItem[] {
    if (items.length <= 1) {
      completed[path] = [...items];
      addStep({
        phase: "base",
        activePath: path,
        activeItems: items,
        left: [],
        right: [],
        output: items,
        leftIndex: 0,
        rightIndex: 0,
        message: `${items[0]?.label ?? "Empty"} is a base case and is already sorted.`,
        action: "Base case",
        depth,
      });
      return [...items];
    }

    const middle = Math.floor(items.length / 2);
    const leftItems = items.slice(0, middle);
    const rightItems = items.slice(middle);
    addStep({
      phase: "split",
      activePath: path,
      activeItems: items,
      left: leftItems,
      right: rightItems,
      output: [],
      leftIndex: 0,
      rightIndex: 0,
      message: `Split [${items.map((item) => item.label).join(", ")}] into two smaller arrays.`,
      action: "Split",
      depth,
    });

    const left = sort(leftItems, `${path}L`, depth + 1);
    const right = sort(rightItems, `${path}R`, depth + 1);
    const output: SortItem[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    addStep({
      phase: "prepare",
      activePath: path,
      activeItems: items,
      left,
      right,
      output,
      leftIndex,
      rightIndex,
      message: "Both halves are sorted. Merge them by comparing their front values.",
      action: "Prepare merge",
      depth,
    });

    while (leftIndex < left.length && rightIndex < right.length) {
      comparisons += 1;
      addStep({
        phase: "compare",
        activePath: path,
        activeItems: items,
        left,
        right,
        output,
        leftIndex,
        rightIndex,
        message: `Compare left ${left[leftIndex].label} with right ${right[rightIndex].label}.`,
        action: "Compare fronts",
        depth,
      });

      const takeLeft = left[leftIndex].value <= right[rightIndex].value;
      const chosen = takeLeft ? left[leftIndex++] : right[rightIndex++];
      output.push(chosen);
      writes += 1;
      addStep({
        phase: "take",
        activePath: path,
        activeItems: items,
        left,
        right,
        output,
        leftIndex,
        rightIndex,
        message: `${chosen.label} is smaller${takeLeft ? " or tied on the left" : ""}, so write it next.`,
        action: takeLeft ? "Take left" : "Take right",
        depth,
      });
    }

    while (leftIndex < left.length || rightIndex < right.length) {
      const takeLeft = leftIndex < left.length;
      const chosen = takeLeft ? left[leftIndex++] : right[rightIndex++];
      output.push(chosen);
      writes += 1;
      addStep({
        phase: "take",
        activePath: path,
        activeItems: items,
        left,
        right,
        output,
        leftIndex,
        rightIndex,
        message: `The other half is empty, so append remaining value ${chosen.label}.`,
        action: "Take remainder",
        depth,
      });
    }

    merges += 1;
    completed[path] = [...output];
    addStep({
      phase: "merged",
      activePath: path,
      activeItems: items,
      left,
      right,
      output,
      leftIndex,
      rightIndex,
      message: `Merge complete: [${output.map((item) => item.label).join(", ")}].`,
      action: "Merge complete",
      depth,
    });
    return [...output];
  }

  const sorted = sort(rootItems, "root", 0);
  addStep({
    phase: "complete",
    activePath: "root",
    activeItems: rootItems,
    left: [],
    right: [],
    output: sorted,
    leftIndex: 0,
    rightIndex: 0,
    message: "Sorted! The root now contains the fully merged result.",
    action: "Complete",
    depth: 0,
  });
  return steps;
}

function ItemRow({ items, pointer, showPointer = false }: { items: SortItem[]; pointer: number; showPointer?: boolean }) {
  return (
    <div className="merge-item-row">
      {items.length ? items.map((item, index) => (
        <span className={showPointer && index === pointer ? "is-front" : index < pointer ? "is-used" : ""} key={`${item.label}-${index}`}>{item.label}</span>
      )) : <small>Empty</small>}
    </div>
  );
}

export default function MergeSortPage() {
  const [source, setSource] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState(DEFAULT_VALUES.join(", "));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [inputError, setInputError] = useState("");
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [leftQueue, setLeftQueue] = useState(CHALLENGE_VALUES.slice(0, CHALLENGE_MIDDLE));
  const [rightQueue, setRightQueue] = useState(CHALLENGE_VALUES.slice(CHALLENGE_MIDDLE));
  const [challengeOutput, setChallengeOutput] = useState<number[]>([]);
  const [challengeChoice, setChallengeChoice] = useState<"left" | "right" | null>(null);
  const [attempts, setAttempts] = useState(0);

  const items = useMemo(() => buildItems(source), [source]);
  const treeLevels = useMemo(() => buildTreeLevels(items), [items]);
  const steps = useMemo(() => buildMergeSteps(source), [source]);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const challengeWon = leftQueue.length === 0 && rightQueue.length === 0;
  const showPointers = current.phase === "compare" || current.phase === "take";
  const traceRows = steps.slice(0, cursor + 1).map((step, index) => {
    const pair = step.left[step.leftIndex] && step.right[step.rightIndex]
      ? `${step.left[step.leftIndex].label} and ${step.right[step.rightIndex].label}`
      : step.phase === "split"
        ? `${step.left.length} + ${step.right.length} values`
        : "—";
    const visibleValues = step.output.length ? step.output : step.activeItems;
    return { index, pass: step.depth, pair, action: step.action, values: visibleValues.map((item) => item.label), swaps: step.writes };
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
    if (parsed.length < 3 || parsed.length > 8 || parsed.some((value) => !Number.isFinite(value) || value < 1 || value > 99)) {
      setInputError("Enter 3–8 numbers from 1 to 99.");
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

  function chooseQueue(side: "left" | "right") {
    if (challengeWon) return;
    setAttempts((count) => count + 1);
    const correctSide = leftQueue.length === 0 ? "right" : rightQueue.length === 0 || leftQueue[0] <= rightQueue[0] ? "left" : "right";
    if (side !== correctSide) {
      setChallengeChoice(side);
      return;
    }

    const chosen = side === "left" ? leftQueue[0] : rightQueue[0];
    if (side === "left") setLeftQueue((queue) => queue.slice(1));
    else setRightQueue((queue) => queue.slice(1));
    setChallengeOutput((output) => [...output, chosen]);
    setChallengeChoice(null);
  }

  function resetChallenge() {
    setLeftQueue(CHALLENGE_VALUES.slice(0, CHALLENGE_MIDDLE));
    setRightQueue(CHALLENGE_VALUES.slice(CHALLENGE_MIDDLE));
    setChallengeOutput([]);
    setChallengeChoice(null);
    setAttempts(0);
  }

  const progress = Math.round((cursor / (steps.length - 1)) * 100);

  return (
    <main>
      <a className="skip-link" href="#lesson-content">Skip to lesson content</a>
      <LessonHeader lessonNumber={mergeSortLesson.lessonNumber} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {mergeSortLesson.hero.eyebrow}</p>
          <h1>{mergeSortLesson.hero.title}<br /><em>{mergeSortLesson.hero.emphasis}</em></h1>
          <p className="hero-intro">{mergeSortLesson.hero.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#visualizer">Start visualizing <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#learn">How it works <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="hero-demo" aria-label={`A small ${mergeSortLesson.name} example`}>
          <div className="demo-caption"><span>Mini example</span><strong>[ 8, 3, 6, 2 ]</strong></div>
          <div className="mini-flow">
            <div className="mini-row"><span className="mini-index">01</span><div className="mini-cells"><b>8</b><b>3</b><b>6</b><b>2</b></div><small>split</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row"><span className="mini-index">02</span><div className="mini-cells"><b className="active">3</b><b className="active">8</b><b className="active">2</b><b className="active">6</b></div><small>halves</small></div>
            <div className="flow-arrow" aria-hidden="true">↓</div>
            <div className="mini-row complete"><span className="mini-index">03</span><div className="mini-cells"><b>2</b><b>3</b><b>6</b><b>8</b></div><small>merge</small></div>
          </div>
          <p className="demo-note"><span>Key idea</span> {mergeSortLesson.hero.keyIdea}</p>
        </div>
      </section>

      <LessonFoundations objectives={mergeSortLesson.studyGuide.objectives} prerequisites={mergeSortLesson.studyGuide.prerequisites} sectionOrder={mergeSortLesson.learningPath} />

      <section className="concept-section" id="learn">
        <div className="section-heading">
          <p className="section-number">01 — The idea</p>
          <h2>{mergeSortLesson.mentalModel.title}</h2>
          <p>{mergeSortLesson.mentalModel.question}</p>
        </div>
        <div className="concept-grid">
          <article className="concept-card">
            <span className="concept-step">1</span>
            <div className="concept-visual"><b>8 3</b><i>|</i><b>6 2</b></div>
            <h3>{mergeSortLesson.mentalModel.steps[0].title}</h3>
            <p>{mergeSortLesson.mentalModel.steps[0].description}</p>
          </article>
          <article className="concept-card accent-card">
            <span className="concept-step">2</span>
            <div className="concept-visual"><b>3</b><b>8</b><b>2</b><b>6</b></div>
            <h3>{mergeSortLesson.mentalModel.steps[1].title}</h3>
            <p>{mergeSortLesson.mentalModel.steps[1].description}</p>
          </article>
          <article className="concept-card">
            <span className="concept-step">3</span>
            <div className="concept-visual pass-visual"><b className="locked">2</b><b className="locked">3</b><b className="locked">6</b></div>
            <h3>{mergeSortLesson.mentalModel.steps[2].title}</h3>
            <p>{mergeSortLesson.mentalModel.steps[2].description}</p>
          </article>
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="section-heading light-heading">
          <p className="section-number">02 — Try it yourself</p>
          <h2>Watch the recursion tree resolve</h2>
          <p>Follow each split from root to base case, then compare both fronts as sorted halves merge upward.</p>
        </div>

        <div className="example-gallery" aria-label={`Curated ${mergeSortLesson.name} examples`}>
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
          <ArrayInputControls input={input} error={inputError} helperText="3–8 values, each from 1 to 99" onInputChange={setInput} onApply={applyInput} onShuffle={shuffleValues} />

          <div className="visual-stage merge-visual-stage">
            <div className="stage-meta">
              <span>Depth <strong>{current.depth}</strong></span>
              <span className="status-dot"><i /> {cursor === steps.length - 1 ? "Complete" : playing ? "Running" : "Paused"}</span>
            </div>
            <div className="merge-tree-scroll">
              <div className="merge-tree" role="img" aria-label={`Merge recursion tree. Active segment: ${current.activeItems.map((item) => item.label).join(", ")}`}>
                {treeLevels.map((level, depth) => (
                  <div className="merge-tree-level" key={depth}>
                    <small>Depth {depth}</small>
                    <div className="merge-tree-nodes">
                      {level.map((node) => {
                        const resolved = current.completed[node.path];
                        const nodeItems = resolved ?? node.items;
                        const state = node.path === current.activePath ? "is-active" : resolved ? "is-done" : node.items.length === 1 ? "is-base" : "";
                        return <div className={`merge-node ${state}`} key={node.path}>{nodeItems.map((item) => <span key={item.label}>{item.label}</span>)}</div>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="merge-workspace" aria-label="Current merge workspace">
              <article><small>Left half</small><ItemRow items={current.left} pointer={current.leftIndex} showPointer={showPointers} /></article>
              <article><small>Right half</small><ItemRow items={current.right} pointer={current.rightIndex} showPointer={showPointers} /></article>
              <article className="merge-output"><small>Temporary output</small><ItemRow items={current.output} pointer={current.output.length} /></article>
            </div>
            <div className="step-message" aria-live="polite"><span>{current.phase === "complete" ? "✓" : current.phase === "split" ? "⑂" : current.phase === "compare" ? "?" : "→"}</span><p>{current.message}</p></div>
          </div>

          <VisualizerPlayback complete={cursor === steps.length - 1} playing={playing} delay={speed} progress={progress} onReplay={() => { setCursor(0); setPlaying(false); }} onTogglePlaying={() => setPlaying((value) => !value)} onStep={nextStep} onDelayChange={setSpeed} playLabel="Play sort" />
          <VisualizerStats
            metrics={[{ label: "Comparisons", value: current.comparisons }, { label: "Writes", value: current.writes }, { label: "Merges", value: current.merges }]}
            legend={[{ label: "Active call", className: "legend-compare" }, { label: "Current fronts", className: "legend-key" }, { label: "Resolved", className: "legend-sorted" }]}
          />
          <SortingTraceTable algorithmName={mergeSortLesson.name} currentStep={cursor} rows={traceRows} pairColumnLabel="Current fronts" valuesColumnLabel="Current output" operationColumnLabel="Writes" />
        </div>
      </section>

      <section className="code-section">
        <div className="section-heading">
          <p className="section-number">03 — Read the code</p>
          <h2>From recursive halves to working code</h2>
          <p>Compare the same base case, recursive split, and stable left-first merge across all four languages.</p>
        </div>
        <div className="code-layout">
          <LessonCodeViewer algorithmName={mergeSortLesson.name} codeExamples={CODE_EXAMPLES} />
          <LessonComplexityPanel complexity={mergeSortLesson.complexity} />
        </div>
      </section>

      <LessonMistakes mistakes={mergeSortLesson.studyGuide.mistakes} />
      <LessonQuiz questions={mergeSortLesson.studyGuide.quiz} storageKey={QUIZ_STORAGE_KEY} />

      <section className="challenge-section" id="challenge">
        <div className="challenge-copy">
          <p className="section-number">06 — Mini game</p>
          <h2>{mergeSortLesson.challenge.title}</h2>
          <p>{mergeSortLesson.challenge.description}</p>
          <div className="game-rule"><span>Rule</span> {mergeSortLesson.challenge.rule}</div>
        </div>
        <div className="game-card merge-game">
          <div className="game-header"><span>{challengeWon ? "Challenge complete" : "Choose the smaller front"}</span><strong>{attempts} picks</strong></div>
          <div className="merge-queues">
            {(["left", "right"] as const).map((side) => {
              const queue = side === "left" ? leftQueue : rightQueue;
              return (
                <article className={`merge-queue ${challengeChoice === side ? "is-wrong" : ""}`} key={side}>
                  <small>{side} queue</small>
                  <div>{queue.length ? queue.map((value, index) => <button className="package" type="button" disabled={index !== 0 || challengeWon} onClick={() => chooseQueue(side)} key={`${side}-${value}-${index}`} aria-label={`${side} queue value ${value}${index === 0 ? ", available front" : ""}`}><span>{value}</span><i aria-hidden="true">{index === 0 ? "↓" : "▦"}</i></button>) : <span className="empty-queue">Empty</span>}</div>
                </article>
              );
            })}
          </div>
          <div className="merge-challenge-output"><small>Merged output</small><div>{challengeOutput.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div></div>
          <div className={challengeWon ? "game-feedback won" : "game-feedback"} aria-live="polite">
            <span>{challengeWon ? "★" : challengeChoice === null ? "↓" : "?"}</span>
            <p>{challengeWon ? `Nicely done — merged in ${attempts} picks.` : challengeChoice === null ? "Compare only the two available front cards." : "That front is larger. Choose the smaller available value."}</p>
            <button type="button" onClick={resetChallenge}>{challengeWon ? "Play again" : "Reset"}</button>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="section-heading"><p className="section-number">07 — Use it wisely</p><h2>Where {mergeSortLesson.name} fits</h2></div>
        <div className="use-grid">
          {mergeSortLesson.useCases.map((useCase) => (
            <article className={useCase.avoid ? "avoid" : undefined} key={useCase.title}><span className="use-icon">{useCase.icon}</span><h3>{useCase.title}</h3><p>{useCase.description}</p><small>{useCase.recommendation}</small></article>
          ))}
        </div>
      </section>

      <LessonCompletion lessonName={mergeSortLesson.name} slug={mergeSortLesson.slug} criteria={mergeSortLesson.completionCriteria} />
      <LessonNavigation currentSlug={mergeSortLesson.slug} />
      <LessonFooter lessonNumber={mergeSortLesson.lessonNumber} track={mergeSortLesson.track} />
    </main>
  );
}
