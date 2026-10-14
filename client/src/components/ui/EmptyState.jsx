import { FolderSearch } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'Nothing here yet',
  description = 'Start by exploring recommendations or updating your skills profile.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div className={`p-10 sm:p-14 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button onClick={onAction} variant="primary" size="md">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button onClick={onSecondaryAction} variant="secondary" size="md">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
