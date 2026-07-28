type VisualizerMetric = {
  label: string;
  value: string | number;
};

type VisualizerLegend = {
  label: string;
  className: string;
};

type VisualizerStatsProps = {
  metrics: readonly [VisualizerMetric, VisualizerMetric, VisualizerMetric];
  legend: readonly VisualizerLegend[];
};

export function VisualizerStats({ metrics, legend }: VisualizerStatsProps) {
  return (
    <div className="stats-row">
      {metrics.map((metric) => <div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></div>)}
      <div className="legend">
        {legend.map((item) => <span key={item.label}><i className={item.className} /> {item.label}</span>)}
      </div>
    </div>
  );
}
