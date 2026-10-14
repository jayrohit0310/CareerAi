export function Skeleton({ className = '', rounded = 'rounded-xl', ...props }) {
  return (
    <div
      className={`skeleton-shimmer bg-slate-200 dark:bg-slate-800 ${rounded} ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 4, cols = 4, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
