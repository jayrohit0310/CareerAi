import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    id,
    type = 'text',
    className = '',
    required,
    disabled,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-2xs">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          className={`
            block w-full rounded-xl border text-sm transition-all duration-150 py-2.5
            bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${rightElement ? 'pr-11' : 'pr-3.5'}
            ${
              error
                ? 'border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15'
            }
            disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
            focus:outline-hidden
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium pt-0.5 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
