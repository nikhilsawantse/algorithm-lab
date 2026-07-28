"use client";

type ArrayInputControlsProps = {
  input: string;
  error: string;
  helperText: string;
  onInputChange: (value: string) => void;
  onApply: () => void;
  onShuffle: () => void;
};

export function ArrayInputControls({ input, error, helperText, onInputChange, onApply, onShuffle }: ArrayInputControlsProps) {
  return (
    <div className="input-row">
      <label htmlFor="array-input">Your array</label>
      <div className="input-group">
        <input
          id="array-input"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onApply()}
          aria-describedby={error ? "input-error" : "input-help"}
        />
        <button className="button button-apply" type="button" onClick={onApply}>Apply</button>
        <button className="icon-button" type="button" onClick={onShuffle} aria-label="Generate a random array">↻</button>
      </div>
      <small id={error ? "input-error" : "input-help"} className={error ? "error-text" : "helper-text"}>
        {error || helperText}
      </small>
    </div>
  );
}
