import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const paddingClass = size === 'sm' ? 'p-1.5 text-xs' : size === 'lg' ? 'p-2.5 text-base' : 'p-2 text-sm';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        ${paddingClass} rounded-xl border transition-all duration-150 relative text-slate-600 dark:text-slate-300
        hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700
        focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className={`${iconSize} text-amber-400 hover:rotate-45 transition-transform`} />
      ) : (
        <Moon className={`${iconSize} text-slate-700 hover:-rotate-12 transition-transform`} />
      )}
    </button>
  );
}
