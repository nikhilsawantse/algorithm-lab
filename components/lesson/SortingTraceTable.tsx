"use client";

import { useState } from "react";

export type SortingTraceRow = {
  index: number;
  pass: number | string;
  action: string;
  pair: string;
  values: readonly string[];
  swaps: number;
};

type SortingTraceTableProps = {
  algorithmName: string;
  currentStep: number;
  rows: readonly SortingTraceRow[];
};

export function SortingTraceTable({ algorithmName, currentStep, rows }: SortingTraceTableProps) {
  const [showFullTrace, setShowFullTrace] = useState(false);
  const visibleRows = showFullTrace ? rows : rows.slice(-8);

  return (
    <div className="trace-panel">
      <div className="trace-heading">
        <div>
          <span className="foundation-label">Dry-run trace</span>
          <h3>Turn each animation into a written decision</h3>
        </div>
        {rows.length > 8 && (
          <button type="button" onClick={() => setShowFullTrace((visible) => !visible)} aria-expanded={showFullTrace}>
            {showFullTrace ? "Show latest 8" : `Show all ${rows.length}`}
          </button>
        )}
      </div>
      <div className="trace-table-wrap">
        <table className="trace-table">
          <caption>{showFullTrace ? `Full ${algorithmName} trace` : `The latest eight ${algorithmName} decisions`}</caption>
          <thead>
            <tr><th scope="col">Step</th><th scope="col">Pass</th><th scope="col">Action</th><th scope="col">Pair</th><th scope="col">Array after step</th><th scope="col">Swaps</th></tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr className={row.index === currentStep ? "is-current" : ""} key={row.index}>
                <td>{row.index}</td>
                <td>{row.pass || "—"}</td>
                <td>{row.action}</td>
                <td>{row.pair}</td>
                <td><code>[{row.values.join(", ")}]</code></td>
                <td>{row.swaps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="trace-note">The highlighted row always matches the visualization above. Step forward to extend the trace.</p>
    </div>
  );
}
