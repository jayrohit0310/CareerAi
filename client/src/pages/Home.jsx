import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  UserRoundCheck, 
  MessageSquareText, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  Mic, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Star,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "Smart Resume Analysis",
      description: "Upload your resume in PDF format. Our AI automatically extracts skills, assesses strengths, and identifies missing requirements.",
      color: "bg-blue-50"
    },
    {
      icon: <MessageSquareText className="w-6 h-6 text-indigo-600" />,
      title: "24/7 AI Career Coach",
      description: "Engage in interactive conversations with our intelligent AI advisor for resume advice, career pivots, and personalized roadmap plans.",
      color: "bg-indigo-50"
    },
    {
      icon: <Mic className="w-6 h-6 text-purple-600" />,
      title: "Mock AI Interviews",
      description: "Rehearse role-specific technical and behavioral questions in real-time, receiving instant evaluation and confidence feedback.",
      color: "bg-purple-50"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: "Salary Estimator",
      description: "Uncover your real compensation potential. Calculate your market salary benchmark based on your current skillset and industry standards.",
      color: "bg-emerald-50"
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-amber-600" />,
      title: "Targeted Course Finder",
      description: "Bridge critical skill gaps fast with hand-picked course recommendations tailored specifically to your chosen career path.",
      color: "bg-amber-50"
    },
    {
      icon: <Briefcase className="w-6 h-6 text-rose-600" />,
      title: "Tailored Job Matches",
      description: "Explore curated job listings filtered according to your verified skills, experience, and career trajectory goals.",
      color: "bg-rose-50"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Your Resume",
      description: "Drop your PDF resume into CareerCraftAI. Our parser breaks down your skills and experience in seconds."
    },
    {
      step: "02",
      title: "Review AI Insights",
      description: "Receive an immediate career report highlighting your competitive advantages, market value, and skill gaps."
    },
    {
      step: "03",
      title: "Prepare & Land The Job",
      description: "Practice with mock interviews, enroll in targeted courses, and connect with optimal job opportunities."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-700">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              CareerCraft<span className="text-blue-600">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-blue-600 transition-colors">Platform Preview</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="btn-primary flex items-center gap-2 py-2 px-4 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary py-2 px-4 shadow-sm flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Next-Generation Career Intelligence Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Accelerate Your Career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI-Powered</span> Guidance
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Upload your resume to extract core competencies, uncover market-aligned salaries, practice AI voice interviews, and receive tailored course & job recommendations.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to={isAuthenticated ? "/dashboard" : "/signup"} 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 text-base transition-all"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3.5 rounded-xl border border-slate-300 shadow-sm text-base transition-all"
              >
                Explore Features
              </a>
            </div>

            {/* Micro proof badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Instant Resume Parsing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Real-Time AI Mock Interviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>

          {/* Interactive Preview Mockup */}
          <div id="preview" className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs text-slate-500 ml-2 font-mono">careercraft-ai.platform/dashboard</span>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Mock Box */}
                  <div className="card-base p-5 bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Resume Upload</h4>
                        <p className="text-xs text-slate-500">PDF processed</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Software_Engineer_Resume.pdf</span>
                    </div>
                    <div className="mt-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Extracted Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Python', 'React', 'FastAPI', 'Machine Learning', 'Docker', 'PostgreSQL'].map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Mock Boxes */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider text-blue-200">AI Career Matching</span>
                        <h4 className="text-lg font-bold mt-0.5">Top Match: Senior Full-Stack AI Engineer</h4>
                        <p className="text-xs text-blue-100 mt-1">94% skill compatibility based on market trends</p>
                      </div>
                      <Link 
                        to="/signup" 
                        className="self-start sm:self-auto shrink-0 bg-white text-blue-600 font-semibold text-xs px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                      >
                        View Full Report
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                        <div className="text-xs font-semibold text-slate-900">$125k - $160k</div>
                        <div className="text-[10px] text-slate-500">Market Estimate</div>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                        <Mic className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
                        <div className="text-xs font-semibold text-slate-900">88% Score</div>
                        <div className="text-[10px] text-slate-500">Interview Ready</div>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                        <BookOpen className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                        <div className="text-xs font-semibold text-slate-900">4 Recommended</div>
                        <div className="text-[10px] text-slate-500">Upskill Courses</div>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                        <Briefcase className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
                        <div className="text-xs font-semibold text-slate-900">18 Openings</div>
                        <div className="text-[10px] text-slate-500">Matched Jobs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 mb-2">Comprehensive Toolkit</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Power Your Career Forward
            </p>
            <p className="mt-4 text-base text-slate-600">
              From raw resume parsing to real-time interview simulations, our tools equip you for every phase of career growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="card-base p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {feature.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 mb-2">Step-by-Step</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How CareerCraftAI Works
            </p>
            <p className="mt-4 text-base text-slate-600">
              Three straightforward steps designed to take you from uncertain job seeker to confident, highly-sought candidate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => (
              <div key={idx} className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <span className="text-4xl font-extrabold text-blue-100 mb-4">{item.step}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Take Control of Your Career Path Today
              </h2>
              <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
                Join our platform to analyze your skills, prepare for high-stakes interviews, and land your ideal position with AI clarity.
              </p>
              <div className="pt-2">
                <Link 
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3.5 rounded-xl shadow-lg text-base transition-all"
                >
                  {isAuthenticated ? "Go to Your Dashboard" : "Get Started Now"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">CareerCraft<span className="text-blue-600">AI</span></span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-blue-600 transition-colors">Sign Up</Link>
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CareerCraftAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
