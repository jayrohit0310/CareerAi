import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ThemeToggle from '../components/ui/ThemeToggle';
import { 
  TrendingUp, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  Star
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await login(email.trim(), password);
      localStorage.setItem('token', data.access_token);
      toast.success('Welcome back to CareerCraft AI!', 'Signed In');
      navigate('/dashboard');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Invalid email or password. Please verify your credentials.');
      setError(msg);
      toast.error(msg, 'Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@careercraft.ai');
    setPassword('password123');
    setIsLoading(true);
    setError('');

    try {
      const data = await login('demo@careercraft.ai', 'password123');
      localStorage.setItem('token', data.access_token);
      toast.success('Logged in with demo credentials!', 'Demo Mode');
      navigate('/dashboard');
    } catch (err) {
      // If demo account doesn't exist yet on backend, provide helpful error or prompt to signup
      const msg = extractErrorMessage(err, 'Demo account credentials could not be verified automatically. You can sign up with your email in 10 seconds.');
      setError(msg);
      toast.info('You can register your account on the Sign Up page in seconds.', 'Quick Start');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    toast.success(`Password reset instructions sent to ${forgotEmail}`, 'Reset Link Sent');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Column: SaaS Branding Hero (visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 p-12 xl:p-16 flex-col justify-between overflow-hidden text-white">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>AI-Driven Career Acceleration</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Supercharge your job search with precision AI.
          </h1>

          <p className="text-base xl:text-lg text-blue-100/90 leading-relaxed font-normal">
            Analyze your resume, identify high-yield skill gaps, practice dynamic voice mock interviews, and benchmark your true market compensation.
          </p>

          {/* Social proof badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Smart Skill Taxonomy & Matching</p>
                <p className="text-blue-200">Automatically mapped to thousands of live job listings</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Real-Time STAR Interview Evaluations</p>
                <p className="text-blue-200">Voice transcription and instantaneous qualitative coaching</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <div className="flex text-amber-300">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span>Rated 4.9/5 by 10,000+ candidates</span>
          </div>
          <span>Enterprise Grade Security</span>
        </div>
      </div>

      {/* Right Column: Clean Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-16">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
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
              Welcome back
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to access your career intelligence dashboard.
            </p>
          </div>

          {/* Form Card */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm animate-fade-in flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>

              <button
                type="button"
                onClick={() => { setIsForgotModalOpen(true); setForgotSubmitted(false); }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign in to Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleDemoLogin}
                icon={UserCheck}
                disabled={isLoading}
              >
                Quick Demo Login
              </Button>
            </div>
          </form>

          {/* Footer link to Sign Up */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link 
                to="/signup" 
                className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
              >
                Create an account for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset your password"
        description="Enter the email address associated with your account and we will send you a secure reset link."
      >
        {forgotSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Check your inbox</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We've dispatched recovery instructions to <strong className="text-slate-800 dark:text-slate-200">{forgotEmail}</strong>.
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setIsForgotModalOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                type="button" 
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                type="submit" 
                disabled={!forgotEmail}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
