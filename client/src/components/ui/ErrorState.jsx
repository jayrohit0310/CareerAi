import { useState } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't complete your request. Please try again or check your network connection.",
  onRetry,
  errorDetails,
  className = '',
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-xs text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="primary" icon={RefreshCw} size="md">
          Try Again
        </Button>
      )}

      {errorDetails && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full max-w-md text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span>Technical details</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto border border-slate-200 dark:border-slate-800">
              {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
