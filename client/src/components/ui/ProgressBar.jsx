export default function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  valueLabel = '',
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'purple' | 'rose'
  height = 'h-2.5',
  className = '',
  showLabel = true,
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorStyles = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    emerald: 'bg-emerald-500 dark:bg-emerald-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    purple: 'bg-purple-600 dark:bg-purple-500',
    rose: 'bg-rose-500 dark:bg-rose-400',
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && (label || valueLabel) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#172033] dark:text-slate-200">{label}</span>
          <span className="text-slate-500 dark:text-slate-400">{valueLabel || `${percentage}%`}</span>
        </div>
      )}
      <div className={`w-full bg-[#E5EAF1] dark:bg-slate-800 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${colorStyles[color] || colorStyles.blue} ${height} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function SegmentedProgressBar({
  segments = [], // [{ label: 'Substance', value: 35, color: 'bg-blue-600', dotColor: 'bg-blue-600' }]
  totalScore = 100,
  scoreLabel = '',
  className = '',
}) {
  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5EAF1] dark:border-slate-800 shadow-xs space-y-3 ${className}`}>
      {scoreLabel && (
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-[#172033] dark:text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            {scoreLabel}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Score Analysis
          </span>
        </div>
      )}

      {/* Segmented Bar */}
      <div className="h-3 w-full bg-[#E5EAF1] dark:bg-slate-800 rounded-full flex overflow-hidden p-0.5 gap-0.5">
        {segments.map((seg, idx) => {
          const widthPct = Math.max(0, Math.min(100, (seg.value / totalScore) * 100));
          return (
            <div
              key={idx}
              className={`h-full rounded-full transition-all duration-700 ${seg.color || 'bg-blue-600'}`}
              style={{ width: `${widthPct}%` }}
              title={`${seg.label}: ${seg.value}`}
            />
          );
        })}
      </div>

      {/* Segment Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 dark:text-slate-300">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${seg.dotColor || seg.color || 'bg-blue-600'}`} />
            <span className="font-medium text-slate-700 dark:text-slate-300">{seg.label}</span>
            <span className="font-bold text-[#172033] dark:text-slate-100">{seg.displayValue || `${seg.value}%`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

