import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ui/ThemeToggle';
import {
  TrendingUp,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  MessageSquareText,
  Mic,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFeaturesOpen(false);
      }
    }
    function handleScroll() {
      setIsFeaturesOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const featureItems = [
    {
      name: 'Smart Resume Analysis',
      desc: 'Instant PDF competency & gap parsing',
      icon: FileText,
      href: '#features'
    },
    {
      name: '24/7 AI Career Coach',
      desc: 'Interactive guidance & roadmap planning',
      icon: MessageSquareText,
      href: '#features'
    },
    {
      name: 'Mock AI Voice Interviews',
      desc: 'Real-time practice with instant STAR scoring',
      icon: Mic,
      href: '#features'
    },
    {
      name: 'Market Salary Benchmarking',
      desc: 'Percentile benchmarks by role & skills',
      icon: TrendingUp,
      href: '#features'
    },
    {
      name: 'Targeted Course Roadmaps',
      desc: 'Bridge skill gaps with curated modules',
      icon: GraduationCap,
      href: '#features'
    },
    {
      name: 'Tailored Job Matches',
      desc: 'Curated roles matching verified skills',
      icon: Briefcase,
      href: '#features'
    }
  ];

  const handleNavClick = (href) => {
    setIsFeaturesOpen(false);
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 w-full pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto relative">
        {/* Floating Pill Container */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-200/90 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-4 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-200">
          
          {/* Logo (Left) */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-sky-600 to-sky-500 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform text-white">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              CareerCraft<span className="text-sky-500">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            {/* Features Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 cursor-pointer"
                aria-expanded={isFeaturesOpen}
              >
                <span>Features</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFeaturesOpen ? 'rotate-180 text-sky-500' : 'text-slate-400'}`} />
              </button>

              {/* Dropdown Menu Card */}
              {isFeaturesOpen && (
                <div className="absolute top-full left-0 mt-3.5 w-80 sm:w-96 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl animate-fade-in z-50">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Platform Features</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {featureItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={idx}
                          href={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.desc}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-500" /> Powered by AI</span>
                    <a href="#preview" onClick={() => handleNavClick('#preview')} className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                      See Live Demo &rarr;
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#preview"
              onClick={() => handleNavClick('#preview')}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Interactive Demo
            </a>
            <a
              href="#how-it-works"
              onClick={() => handleNavClick('#how-it-works')}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={() => handleNavClick('#faq')}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle size="sm" />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-full shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-full shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0"
                >
                  JOIN NOW
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Dropdown Card */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 p-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl animate-fade-in space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <a
                href="#features"
                onClick={() => handleNavClick('#features')}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between"
              >
                <span>Features</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#preview"
                onClick={() => handleNavClick('#preview')}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                Interactive Demo
              </a>
              <a
                href="#how-it-works"
                onClick={() => handleNavClick('#how-it-works')}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#faq"
                onClick={() => handleNavClick('#faq')}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-slate-900 text-white font-bold text-sm shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-sm uppercase tracking-wider shadow-sm"
                  >
                    JOIN NOW <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 hover:text-sky-600 transition-colors"
                  >
                    SIGN IN
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
