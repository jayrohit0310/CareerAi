export default function Badge({
  children,
  variant = 'blue',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const variantStyles = {
    blue: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
    sky: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
    emerald: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
    amber: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
    purple: 'bg-sky-100/70 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800',
    indigo: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    black: 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white font-bold',
    white: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800',
  };

  const dotColors = {
    blue: 'bg-sky-500',
    sky: 'bg-sky-400',
    emerald: 'bg-sky-500',
    amber: 'bg-slate-400',
    rose: 'bg-rose-500',
    purple: 'bg-sky-500',
    indigo: 'bg-slate-500',
    slate: 'bg-slate-400',
    black: 'bg-sky-400',
    white: 'bg-sky-600',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold',
  };

  return (
    <span
      className={`
        inline-flex items-center border select-none leading-none
        ${variantStyles[variant] || variantStyles.blue}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'}`} />
      )}
      {children}
    </span>
  );
}
