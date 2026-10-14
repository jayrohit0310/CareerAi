import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
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
      icon: <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "Smart Resume Analysis",
      description: "Upload your resume in PDF format. Our AI automatically extracts competencies, assesses strengths, and identifies missing requirements.",
      color: "bg-blue-50 dark:bg-blue-950/60",
      accent: "group-hover:border-blue-500"
    },
    {
      icon: <MessageSquareText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "24/7 AI Career Coach",
      description: "Engage in interactive conversations with our intelligent AI advisor for resume advice, career pivots, and personalized roadmap plans.",
      color: "bg-indigo-50 dark:bg-indigo-950/60",
      accent: "group-hover:border-indigo-500"
    },
    {
      icon: <Mic className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "Mock AI Voice Interviews",
      description: "Rehearse role-specific technical and behavioral questions in real-time, receiving instant qualitative scoring and STAR feedback.",
      color: "bg-purple-50 dark:bg-purple-950/60",
      accent: "group-hover:border-purple-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Market Salary Benchmarking",
      description: "Uncover your true compensation potential. Calculate your market salary percentile based on experience, location, and verified skillset.",
      color: "bg-emerald-50 dark:bg-emerald-950/60",
      accent: "group-hover:border-emerald-500"
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "Targeted Course Roadmaps",
      description: "Bridge critical skill gaps fast with hand-picked course recommendations tailored specifically to your chosen career path.",
      color: "bg-amber-50 dark:bg-amber-950/60",
      accent: "group-hover:border-amber-500"
    },
    {
      icon: <Briefcase className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      title: "Tailored Job Matches",
      description: "Explore curated job listings filtered according to your verified skills, experience level, and career trajectory goals.",
      color: "bg-rose-50 dark:bg-rose-950/60",
      accent: "group-hover:border-rose-500"
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
      
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              CareerCraft<span className="text-blue-600">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#preview" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Interactive Demo</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="primary"
                size="sm"
                icon={LayoutDashboard}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-all active:scale-[0.98]"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/15 to-purple-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold animate-fade-in shadow-2xs">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Next-Generation Career Intelligence Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.12]">
              Accelerate your engineering career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">AI-powered</span> clarity.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Extract core competencies instantly, uncover market-aligned compensation, practice real-time AI voice mock interviews, and land high-yield roles.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link 
                to={isAuthenticated ? "/dashboard" : "/signup"} 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 text-sm sm:text-base transition-all active:scale-[0.98]"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#preview" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-7 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xs text-sm sm:text-base transition-all active:scale-[0.98]"
              >
                View Live Preview
              </a>
            </div>

            {/* Proof Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant PDF Parsing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-Time Voice Mock Interviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      activePreviewTab === 'resume'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Skills Parser
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('interview')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      activePreviewTab === 'interview'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Mock Interview
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('salary')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      activePreviewTab === 'salary'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Salary Insights
                  </button>
                </div>
              </div>

              {/* Mockup Tab Body Content */}
              <div className="p-6 sm:p-8 bg-slate-50/60 dark:bg-slate-950/60">
                {activePreviewTab === 'resume' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Resume Upload</h4>
                          <p className="text-[11px] text-slate-500">PDF successfully parsed</p>
                        </div>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">AI Career Matching</span>
                          <h4 className="text-lg sm:text-xl font-bold mt-1">Top Match: Senior Full-Stack AI Engineer</h4>
                          <p className="text-xs text-blue-100 mt-1">94% skill compatibility based on current tech openings</p>
                        </div>
                        <Link 
                          to="/signup" 
                          className="shrink-0 bg-white text-blue-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-xs"
                        >
                          View Full Report
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">₹18 LPA - ₹28 LPA</div>
                          <div className="text-[10px] text-slate-400">Market Baseline</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <Mic className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">88% Score</div>
                          <div className="text-[10px] text-slate-400">Interview Readiness</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <BookOpen className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">4 Modules</div>
                          <div className="text-[10px] text-slate-400">Targeted Courses</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                          <Briefcase className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
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
                      <span className="font-bold text-purple-600">Question 1 of 5</span>
                      <span className="font-mono text-slate-400">01:42</span>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1">Interviewer Prompt</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        "Describe a high-stakes outage in production. How did you diagnose the root cause, mitigate the immediate downtime, and ensure resilience against repeat failures?"
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="font-bold text-rose-600 dark:text-rose-400">Speech-To-Text Active:</span>
                        <span className="text-slate-600 dark:text-slate-300 italic truncate max-w-sm">"We noticed database connection pool exhaustion caused by unindexed queries..."</span>
                      </div>
                      <Badge variant="purple" size="sm">Score: 92/100</Badge>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'salary' && (
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in text-center">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
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
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">50th (Median)</div>
                        <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">₹24,00,000</div>
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
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                  {feature.description}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
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
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
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
                <span className="text-4xl sm:text-5xl font-extrabold text-blue-100 dark:text-blue-950/80 mb-4 select-none">
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
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
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
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors"
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
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-950 rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Take control of your tech trajectory today.
              </h2>
              <p className="text-xs sm:text-base text-blue-100/90 leading-relaxed font-normal">
                Join thousands of candidates who use CareerCraft AI to prepare for interviews, master in-demand skills, and command market compensation.
              </p>
              <div className="pt-2">
                <Link 
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-3.5 rounded-2xl shadow-lg text-sm sm:text-base transition-all active:scale-[0.98]"
                >
                  {isAuthenticated ? "Go to Your Dashboard" : "Get Started Now Free"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">CareerCraft<span className="text-blue-600">AI</span></span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-blue-600 transition-colors">Sign Up</Link>
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CareerCraft AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
