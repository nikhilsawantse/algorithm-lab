import type { AlgorithmLessonDefinition } from "../../lib/lesson-schema";

type LessonComplexityPanelProps = {
  complexity: AlgorithmLessonDefinition["complexity"];
};

export function LessonComplexityPanel({ complexity }: LessonComplexityPanelProps) {
  return (
    <aside className="complexity-panel">
      <h3>Complexity at a glance</h3>
      {[complexity.best, complexity.average, complexity.worst, complexity.space].map((complexityCase) => (
        <div className="complexity-row" key={complexityCase.label}>
          <span>{complexityCase.label}{complexityCase.context && <small>{complexityCase.context}</small>}</span>
          <strong>{complexityCase.value}</strong>
        </div>
      ))}
      <div className={`stable-note is-${complexity.property.tone}`}><span>{complexity.property.symbol}</span><p><strong>{complexity.property.label}</strong><br />{complexity.property.description}</p></div>
      <div className="stability-proof" aria-label={`${complexity.property.label} example`}>
        <small>{complexity.property.proofLabel}</small>
        <div>{complexity.property.before.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>
        <i aria-hidden="true">↓</i>
        <div className="is-sorted">{complexity.property.after.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>
        <p>{complexity.property.proof}</p>
      </div>
    </aside>
  );
}
