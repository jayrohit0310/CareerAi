import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import {
  TrendingUp,
  Briefcase,
  GraduationCap,
  MessageSquareText,
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  Mic,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutDashboard
} from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('resume');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-sky-500" />,
      title: "Smart Resume Analysis",
      description: "Upload your resume in PDF format. Our AI automatically extracts competencies, assesses strengths, and identifies missing requirements.",
      color: "bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40",
      accent: "group-hover:border-sky-400/60 dark:group-hover:border-sky-700/60"
    },
    {
      icon: <MessageSquareText className="w-6 h-6 text-sky-500" />,
      title: "24/7 AI Career Coach",
      description: "Engage in interactive conversations with our intelligent AI advisor for resume advice, career pivots, and personalized roadmap plans.",
      color: "bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40",
      accent: "group-hover:border-sky-400/60 dark:group-hover:border-sky-700/60"
    },
    {
      icon: <Mic className="w-6 h-6 text-sky-500" />,
      title: "Mock AI Voice Interviews",
      description: "Rehearse role-specific technical and behavioral questions in real-time, receiving instant qualitative scoring and STAR feedback.",
      color: "bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40",
      accent: "group-hover:border-sky-400/60 dark:group-hover:border-sky-700/60"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-sky-500" />,
      title: "Market Salary Benchmarking",
      description: "Uncover your true compensation potential. Calculate your market salary percentile based on experience, location, and verified skillset.",
      color: "bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40",
      accent: "group-hover:border-sky-400/60 dark:group-hover:border-sky-700/60"
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-sky-500" />,
      title: "Targeted Course Roadmaps",
      description: "Bridge critical skill gaps fast with hand-picked course recommendations tailored specifically to your chosen career path.",
      color: "bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40",
      accent: "group-hover:border-sky-400/60 dark:group-hover:border-sky-700/60"
    },
    {
      icon: <Briefcase className="w-6 h-6 text-sky-500" />,
      title: "Tailored Job Matches",
      description: "Explore curated job listings filtered according to your verified skills, experience level, and career trajectory goals.",
      color: "bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40",
      accent: "group-hover:border-sky-400/60 dark:group-hover:border-sky-700/60"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Your Resume",
      description: "Drop your PDF resume into CareerCraft AI. Our parser extracts and organizes your core skills and engineering competencies in seconds."
    },
    {
      step: "02",
      title: "Review AI Insights",
      description: "Receive an immediate career report highlighting your competitive advantages, market value percentile, and missing high-yield skills."
    },
    {
      step: "03",
      title: "Practice & Land The Role",
      description: "Practice with mock voice interviews, enroll in targeted courses, and connect directly with high-match job opportunities."
    }
  ];

  const faqs = [
    {
      q: "How does the AI Resume Parser work?",
      a: "Our parser uses advanced natural language processing and token extraction models to analyze your PDF resume, identifying verified technical skills, frameworks, and job titles without storing sensitive personal identifiers."
    },
    {
      q: "Can I use the voice interview simulator on mobile devices?",
      a: "Yes! The mock interview simulator supports both mobile and desktop browsers with Web Speech API real-time dictation as well as an automatic audio recording fallback for instant transcription."
    },
    {
      q: "How accurate is the Market Salary Estimator?",
      a: "Our salary models combine verified compensation surveys, high-cost vs. remote location indices, and role experience bands to provide realistic 25th, 50th, and 75th percentile benchmarks."
    },
    {
      q: "Is CareerCraft AI free to get started?",
      a: "Yes, candidates can create a free account, upload their resume, explore all career pathways, and rehearse mock interview questions without any credit card required."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-100 selection:text-blue-700 transition-colors">

      {/* Floating Pill Navigation Bar (Matching Image 1) */}
      <Navbar />

      {/* Hero Section with Architectural Grid Pattern (Matching Image 1) */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28 bg-grid-pattern">
        {/* Subtle light ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-sky-400/12 dark:bg-sky-500/8 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge with Arrow (Matching Image 1) */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium shadow-2xs hover:border-sky-300 dark:hover:border-sky-700 transition-colors cursor-pointer group">
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white uppercase tracking-wider">
                NEW
              </span>
              <span>Next-Generation Career Intelligence Platform</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-x-1" />
            </div>

            {/* Overline Subtitle */}
            <div className="text-xs sm:text-sm font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">
              YOUR AI CAREER &amp; JOB SEARCH COPILOT
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.12]">
              Accelerate your engineering career with <span className="text-sky-500 dark:text-sky-400">precision clarity</span>.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Extract core competencies instantly, uncover market-aligned compensation, practice real-time AI voice mock interviews, and land high-yield roles.
            </p>

            {/* Dark Pill CTA & Secondary Pill Button (Matching Image 1) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold px-9 py-3.5 rounded-full shadow-lg text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.98]"
              >
                {isAuthenticated ? "Go to Dashboard" : "TRY FOR FREE"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#preview"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-7 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs text-xs sm:text-sm transition-all active:scale-[0.98]"
              >
                View Live Preview
              </a>
            </div>

            {/* Microcopy below CTA (Matching Image 1) */}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Free to start. No initial payment or credit card required.
            </p>

            {/* Social Proof Row with Ratings (Matching Image 1) */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold border-t border-slate-200/80 dark:border-slate-800/80 mt-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-sm">★</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">4.9</span>
                <span className="text-slate-500 font-normal">Platform rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100">500K+</span>
                <span className="text-slate-500 font-normal">job seekers on CareerCraft</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span className="font-bold text-slate-900 dark:text-slate-100">AI Product</span>
                <span className="text-slate-500 font-normal">· Featured Platform</span>
              </div>
            </div>

            {/* Proof Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>Instant PDF Parsing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>Real-Time Voice Mock Interviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>

          {/* Interactive Platform Preview Showcase */}
          <div id="preview" className="mt-14 max-w-5xl mx-auto animate-fade-in">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
              {/* Browser Mockup Header */}
              <div className="bg-slate-100/80 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2 font-mono hidden sm:inline">
                    careercraft-ai.com/platform/demo
                  </span>
                </div>

                {/* Switchable Interactive Demo Tabs */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <button
                    onClick={() => setActivePreviewTab('resume')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${activePreviewTab === 'resume'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    Skills Parser
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('interview')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${activePreviewTab === 'interview'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    Mock Interview
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('salary')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${activePreviewTab === 'salary'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    Salary Insights
                  </button>
                </div>
              </div>

              {/* Mockup Tab Body Content */}
              <div className="p-6 sm:p-8 bg-slate-50/60 dark:bg-[#070b12]/60">
                {activePreviewTab === 'resume' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Resume Upload</h4>
                          <p className="text-[11px] text-slate-500">PDF successfully parsed</p>
                        </div>
                      </div>
                      <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-xl p-3 text-xs text-sky-900 dark:text-sky-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="truncate">Staff_Engineer_Resume.pdf</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Verified Skill Inventory</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['Python', 'React', 'FastAPI', 'Machine Learning', 'Docker', 'PostgreSQL', 'LangChain', 'Redis'].map((s, i) => (
                            <Badge key={i} variant="blue" size="sm">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">AI Career Matching</span>
                          <h4 className="text-lg sm:text-xl font-bold mt-1">Top Match: Senior Full-Stack AI Engineer</h4>
                          <p className="text-xs text-slate-300 mt-1">94% skill compatibility based on current tech openings</p>
                        </div>
                        <Link
                          to="/signup"
                          className="shrink-0 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs"
                        >
                          View Full Report
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <TrendingUp className="w-5 h-5 text-sky-500 mx-auto mb-1.5" />
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">₹18 LPA - ₹28 LPA</div>
                          <div className="text-[10px] text-slate-400">Market Baseline</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <Mic className="w-5 h-5 text-sky-500 mx-auto mb-1.5" />
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">88% Score</div>
                          <div className="text-[10px] text-slate-400">Interview Readiness</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <BookOpen className="w-5 h-5 text-sky-500 mx-auto mb-1.5" />
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">4 Modules</div>
                          <div className="text-[10px] text-slate-400">Targeted Courses</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <Briefcase className="w-5 h-5 text-sky-500 mx-auto mb-1.5" />
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">18 Positions</div>
                          <div className="text-[10px] text-slate-400">Matched Jobs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'interview' && (
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-600 dark:text-sky-400">Question 1 of 5</span>
                      <span className="font-mono text-slate-400">01:42</span>
                    </div>
                    <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60">
                      <p className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase mb-1">Interviewer Prompt</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        "Describe a high-stakes outage in production. How did you diagnose the root cause, mitigate the immediate downtime, and ensure resilience against repeat failures?"
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                        <span className="font-bold text-sky-700 dark:text-sky-300">Speech-To-Text Active:</span>
                        <span className="text-slate-600 dark:text-slate-300 italic truncate max-w-sm">"We noticed database connection pool exhaustion caused by unindexed queries..."</span>
                      </div>
                      <Badge variant="blue" size="sm">Score: 92/100</Badge>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'salary' && (
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in text-center">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      Median Annual Base Compensation
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100">
                      ₹24,00,000 <span className="text-sm font-normal text-slate-400">INR (24 LPA)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">25th %</div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">₹18,00,000</div>
                      </div>
                      <div className="p-3 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-xl text-center">
                        <div className="text-[10px] text-sky-700 dark:text-sky-300 font-bold uppercase">50th (Median)</div>
                        <div className="text-sm font-extrabold text-sky-700 dark:text-sky-300">₹24,00,000</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">75th %</div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">₹32,00,000</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              End-to-End Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Everything required to advance your tech career
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              From automated resume parsing to real-time interview simulations, our tools equip you for high-paying roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                hover
                className={`p-6 sm:p-7 flex flex-col group border border-slate-200 dark:border-slate-800 transition-all duration-200 ${feature.accent}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feature.color} shadow-2xs`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                  {feature.description}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-sky-600 dark:text-sky-400">
                  <span>Explore tool</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Streamlined Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              How CareerCraft AI Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Three straightforward steps designed to take you from uncertain candidate to confident, top-tier applicant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => (
              <Card key={idx} hover className="p-8 relative flex flex-col">
                <span className="text-4xl sm:text-5xl font-extrabold text-sky-100 dark:text-sky-950/80 mb-4 select-none">
                  {item.step}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-sky-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Impact CTA Banner */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 dark:bg-black border border-slate-800 rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Take control of your tech trajectory today.
              </h2>
              <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
                Join thousands of candidates who use CareerCraft AI to prepare for interviews, master in-demand skills, and command market compensation.
              </p>
              <div className="pt-2">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 text-sm sm:text-base transition-all active:scale-[0.98]"
                >
                  {isAuthenticated ? "Go to Your Dashboard" : "Get Started Now Free"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Modern Footer (Matching Image 2) */}
      <Footer />
    </div>
  );
}

