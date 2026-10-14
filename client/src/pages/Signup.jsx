import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ThemeToggle from '../components/ui/ThemeToggle';
import { 
  TrendingUp, 
  Mail, 
  User, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Check,
  X
} from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (passwordCriteria.length) score += 1;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [password, passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: 'None', color: 'bg-slate-200 dark:bg-slate-700', textColor: 'text-slate-400' };
    if (passwordScore <= 1) return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500' };
    if (passwordScore === 2) return { text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' };
    if (passwordScore === 3) return { text: 'Good', color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  }, [password, passwordScore]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }
    if (!agreedTerms) {
      setError('Please agree to the Terms of Service to create your account.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signup(email.trim(), password);
      toast.success('Account created successfully! Please sign in with your credentials.', 'Account Ready');
      navigate('/login');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to create your account. Please check your details and try again.');
      setError(msg);
      toast.error(msg, 'Registration Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Column: SaaS Branding Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-950 p-12 xl:p-16 flex-col justify-between overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Branding header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              CareerCraft<span className="text-blue-300">AI</span>
            </span>
          </Link>
        </div>

        {/* Center hero content */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Join 10,000+ Modern Job Seekers</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Build your competitive advantage in tech.
          </h1>

          <p className="text-base xl:text-lg text-indigo-100/90 leading-relaxed font-normal">
            Get instant AI resume feedback, uncover verified high-growth roles, rehearse behavioral interviews, and unlock your true compensation ceiling.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">100% Free Candidate Tier</p>
                <p className="text-indigo-200">No credit card or payment commitment required</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Privacy First Resume Storage</p>
                <p className="text-indigo-200">Your documents and speech data remain private and secure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-indigo-200">
          <span>Enterprise-ready ML Models</span>
          <span>Zero Spam Guarantee</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-16">
        <div className="w-full max-w-md space-y-7 animate-fade-in">
          {/* Mobile branding header */}
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                CareerCraft<span className="text-blue-600">AI</span>
              </span>
            </Link>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Create your account
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Start your journey to higher compensation and targeted career growth.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm animate-fade-in flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Input
              label="Full Name (Optional)"
              type="text"
              icon={User}
              placeholder="Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="space-y-2">
              <PasswordInput
                label="Password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                    <span className={strengthLabel.textColor}>{strengthLabel.text}</span>
                  </div>
                  
                  {/* 4-segment progress bar */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-colors duration-200 ${
                          passwordScore >= step
                            ? strengthLabel.color
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements checklist chips */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                      {passwordCriteria.length ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                      8+ characters
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                      {passwordCriteria.hasUpper && passwordCriteria.hasLower ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                      Mixed case
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                      {passwordCriteria.hasNumber ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                      Number
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                      {passwordCriteria.hasSpecial ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                      Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <PasswordInput
                label="Confirm Password"
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              {passwordsMatch && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium pt-1 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match perfectly
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-xs text-rose-500 flex items-center gap-1 font-medium pt-1 animate-fade-in">
                  <X className="w-3.5 h-3.5" /> Passwords do not match yet
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 leading-relaxed select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 cursor-pointer"
                  required
                />
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                loadingText="Creating account..."
                disabled={!agreedTerms || (password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword)}
              >
                Create Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Footer link to Login */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="Terms of Service & Privacy Policy"
        description="Last updated October 2026"
        footer={
          <Button variant="primary" size="sm" onClick={() => { setAgreedTerms(true); setIsTermsModalOpen(false); }}>
            Accept & Continue
          </Button>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Welcome to CareerCraft AI. By accessing or using our career intelligence tools, mock interview simulators, and salary estimation pipelines, you agree to comply with our standards of honest representation and safe usage.
          </p>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">1. Data Privacy & Resume Security</h4>
          <p>
            Your uploaded resume documents and audio interview practice data are processed securely. We do not sell your personal resume information or audio recordings to third-party data brokers.
          </p>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">2. AI Recommendations</h4>
          <p>
            Career report rankings, interview evaluations, and salary estimate benchmarks are computed using AI models and verified market statistics. They represent informative guidance to assist your career decisions.
          </p>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">3. Account Responsibility</h4>
          <p>
            You are responsible for keeping your login credentials confidential.
          </p>
        </div>
      </Modal>
    </div>
  );
}
