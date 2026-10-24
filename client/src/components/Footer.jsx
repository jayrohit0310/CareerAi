import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles, X, ShieldCheck, FileText } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

  const handleScrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-auto bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 transition-colors pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Brand Info (Left) & Circular Social Icons (Right) */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-14">
          {/* Brand Info */}
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-sky-600 to-sky-500 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform text-white">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                CareerCraft<span className="text-sky-500">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              CareerCraft AI is an AI career copilot. Upload your resume once and it scores it against verified role requirements, benchmarks your market compensation, tailors targeted skill roadmaps, and prepares you with real-time AI mock voice interviews.
            </p>
          </div>

          {/* Social Icons (Circular Dark Buttons like Image 2) */}
          <div className="flex items-center gap-3">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full bg-slate-950 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-sky-500 text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-slate-950 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-sky-500 text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Twitter / X */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="w-10 h-10 rounded-full bg-slate-950 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-sky-500 text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 rounded-full bg-slate-950 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-sky-500 text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 4 Navigation Columns (Matching Image 2) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 pb-14">
          
          {/* Column 1: FEATURES */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              FEATURES
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="#features" onClick={() => handleScrollTo('#features')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Resume AI
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => handleScrollTo('#features')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  AI Job Match
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Super Apply
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => handleScrollTo('#features')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Find HR
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  AI Autofill
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Insider Referrals
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Job Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: JOBS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              JOBS
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Browse all jobs
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Software Engineer · India
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Remote jobs
                </a>
              </li>
              <li>
                <Link to="/signup" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Job alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: FREE TOOLS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              FREE TOOLS
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  ATS score checker
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Resume keyword scanner
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => handleScrollTo('#features')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Job-tailored resumes
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Resume builder
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => handleScrollTo('#features')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  HR email finder
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => handleScrollTo('#features')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  All free tools
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: INFORMATION */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              INFORMATION
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="#how-it-works" onClick={() => handleScrollTo('#how-it-works')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  About us
                </a>
              </li>
              <li>
                <a href="#faq" onClick={() => handleScrollTo('#faq')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" onClick={() => handleScrollTo('#faq')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#faq" onClick={() => handleScrollTo('#faq')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Affiliate program, earn 30%
                </a>
              </li>
              <li>
                <a href="#faq" onClick={() => handleScrollTo('#faq')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Help center
                </a>
              </li>
              <li>
                <a href="#faq" onClick={() => handleScrollTo('#faq')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#preview" onClick={() => handleScrollTo('#preview')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Chrome Web Store
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Tagline (Matching Image 2) */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>&copy; {new Date().getFullYear()} ThreeDots Inc.</span>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors underline cursor-pointer"
            >
              Privacy
            </button>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors underline cursor-pointer"
            >
              Terms
            </button>
          </div>

          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Made in India. For Job Hunters Across the Globe
          </div>
        </div>

      </div>

      {/* Privacy Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        description="How CareerCraft AI respects and protects your candidate data."
        footer={
          <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
            Understood
          </Button>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
          <p>
            Your privacy is paramount. At CareerCraft AI, your uploaded resumes and interview audio recordings are processed securely using encrypted communication channels.
          </p>
          <p>
            We do not sell your personal data or resume contents to third-party ad networks. Extracted skills and competencies are analyzed solely to deliver personalized career insights, compensation benchmarks, and mock interview scoring.
          </p>
          <p>
            You retain complete ownership of your data and can request deletion of your profile and uploaded artifacts at any time from your account settings.
          </p>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
        description="Terms and conditions for utilizing CareerCraft AI platform services."
        footer={
          <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
            I Agree
          </Button>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
          <p>
            By accessing or using CareerCraft AI, you agree to comply with our fair-use standards and guidelines.
          </p>
          <p>
            Salary estimates, interview feedback scores, and career predictions are AI-assisted insights designed for informational, preparation, and benchmarking purposes.
          </p>
          <p>
            Users are responsible for ensuring that all information provided during resume uploads and account creation accurately represents their verified background and credentials.
          </p>
        </div>
      </Modal>

    </footer>
  );
}
