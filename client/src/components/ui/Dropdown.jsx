import { useState, useRef, useEffect } from 'react';

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignStyles = {
    right: 'right-0',
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(prev => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
            shadow-xl z-50 p-1.5 focus:outline-hidden animate-scale-up
            ${alignStyles[align] || alignStyles.right}
          `}
          role="menu"
          aria-orientation="vertical"
        >
          <div onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, icon: Icon, danger = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left
        ${
          danger
            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }
        ${className}
      `}
      role="menuitem"
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 opacity-70" />}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" role="separator" />;
}
