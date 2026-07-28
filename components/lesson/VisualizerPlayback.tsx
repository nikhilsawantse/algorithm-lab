"use client";

type VisualizerPlaybackProps = {
  complete: boolean;
  playing: boolean;
  delay: number;
  progress: number;
  onReplay: () => void;
  onTogglePlaying: () => void;
  onStep: () => void;
  onDelayChange: (delay: number) => void;
  playLabel?: string;
};

const MIN_DELAY = 180;
const MAX_DELAY = 1100;

export function VisualizerPlayback({
  complete,
  playing,
  delay,
  progress,
  onReplay,
  onTogglePlaying,
  onStep,
  onDelayChange,
  playLabel = "Play",
}: VisualizerPlaybackProps) {
  return (
    <>
      <div className="playback">
        <button className="play-button" type="button" onClick={complete ? onReplay : onTogglePlaying}>
          <span aria-hidden="true">{complete ? "↺" : playing ? "Ⅱ" : "▶"}</span>
          {complete ? "Replay" : playing ? "Pause" : playLabel}
        </button>
        <button className="step-button" type="button" onClick={onStep} disabled={complete}>Step →</button>
        <div className="speed-control">
          <label htmlFor="speed">Speed</label>
          <input
            id="speed"
            type="range"
            min={MIN_DELAY}
            max={MAX_DELAY}
            step="10"
            value={MIN_DELAY + MAX_DELAY - delay}
            onChange={(event) => onDelayChange(MIN_DELAY + MAX_DELAY - Number(event.target.value))}
          />
        </div>
      </div>
      <div className="progress-track" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>
    </>
  );
}
