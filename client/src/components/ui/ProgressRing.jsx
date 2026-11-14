export default function ProgressRing({
  value = 0,
  max = 100,
  size = 110,
  strokeWidth = 10,
  color = '#2563EB',
  trackColor = '#E5EAF1',
  label = '',
  sublabel = '',
  className = '',
  children
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="dark:stroke-slate-800 transition-colors"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {children ? (
          children
        ) : (
          <>
            <span className="text-xl font-extrabold text-[#172033] dark:text-slate-100 leading-none">
              {percentage}%
            </span>
            {label && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 truncate max-w-[80px]">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

