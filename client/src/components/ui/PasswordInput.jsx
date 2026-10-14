import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Input from './Input';

const PasswordInput = forwardRef(function PasswordInput(
  {
    icon = Lock,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      icon={icon}
      rightElement={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(prev => !prev)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
      {...props}
    />
  );
});

export default PasswordInput;
