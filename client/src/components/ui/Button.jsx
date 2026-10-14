import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    fullWidth = false,
    className = '',
    onClick,
    ...props
  },
  ref
) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs focus-visible:ring-blue-600 dark:focus-visible:ring-offset-slate-900',
    secondary: 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 shadow-2xs focus-visible:ring-slate-400',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 focus-visible:ring-blue-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs focus-visible:ring-rose-600',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-slate-400',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs focus-visible:ring-emerald-600',
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    sm: 'px-3 py-1.5 text-xs sm:text-sm gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-5 py-3 text-base gap-2.5 rounded-xl',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {IconRight && <IconRight className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
});

export default Button;
