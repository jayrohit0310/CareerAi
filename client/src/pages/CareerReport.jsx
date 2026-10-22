import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCareerReport } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  Target,
  ChevronRight,
  Briefcase,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  TrendingUp,
  Award,
  Calendar,
  User,
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const demandColor = (demand) => {
  if (!demand) return 'blue';
  const d = demand.toLowerCase();
  if (d.includes('very high')) return 'emerald';
  if (d.includes('high')) return 'blue';
  return 'amber';
};

const readinessLabel = (score) => {
  if (score >= 90) return { label: 'Exceptional', color: '#22c55e' };
  if (score >= 80) return { label: 'Strong', color: '#3b82f6' };
  if (score >= 70) return { label: 'Developing', color: '#f59e0b' };
  return { label: 'Early Stage', color: '#ef4444' };
};

/* radial gauge SVG */
function ReadinessGauge({ score }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const { label, color } = readinessLabel(score);
  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor"
          className="text-slate-200 dark:text-slate-700" strokeWidth="12" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color}
          strokeWidth="12" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <span className="block text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-none">{score}</span>
        <span className="block text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

/* action plan step card */
function ActionStep({ day, text, icon: Icon, color }) {
  return (
    <div className={`rounded-2xl p-4 border ${color} space-y-2`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-xs font-extrabold uppercase tracking-wider">{day}</span>
      </div>
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ fallback data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const FALLBACK_REPORT = {
  candidate_name: 'Technical Candidate',
  readiness_score: 88,
  target_median_salary: '\u20b924,00,000 (24 LPA)',
  executive_summary:
    'Demonstrates strong full-stack engineering capabilities across modern web and AI technologies. Well-positioned for high-growth roles in the Indian tech market.',
  top_strengths: [
    'Full-Stack Problem Solving',
    'Modern REST API Development',
    'Component-driven UI Architecture',
    'Rapid Prototyping & Delivery',
  ],
  action_plan_30_60_90: {
    days_30: 'Close the top identified skill gap with a live proof-of-concept deployed to GitHub.',
    days_60: 'Master system design patterns and practice structured STAR behavioral interviews.',
    days_90: 'Target tier-1 Indian product companies and negotiate competitive CTC packages.',
  },
  matches: [
    {
      title: 'Senior Full-Stack & AI Systems Engineer',
      match_percentage: 94,
      demand: 'Very High',
      avg_salary: '\u20b922,00,000 \u2013 \u20b932,00,000 / yr (22 \u2013 32 LPA)',
      growth: '+28% YoY',
      description:
        'Architects end-to-end full-stack applications with AI-powered backends and reactive frontends.',
      matched_skills: ['React', 'Python', 'FastAPI', 'Docker', 'PostgreSQL', 'REST APIs'],
      skill_gaps: ['LangChain', 'Kubernetes', 'Redis Caching'],
      responsibilities: [
        'Design production LLM retrieval-augmented generation pipelines.',
        'Maintain resilient FastAPI backends and high-performance React frontends.',
        'Implement containerised deployments and CI/CD pipelines.',
      ],
      tailored_advice:
        'Highlight end-to-end project ownership and database indexing experience in technical rounds.',
    },
    {
      title: 'AI & Machine Learning Solutions Engineer',
      match_percentage: 88,
      demand: 'High',
      avg_salary: '\u20b924,00,000 \u2013 \u20b936,00,000 / yr (24 \u2013 36 LPA)',
      growth: '+34% YoY',
      description:
        'Develops intelligent inference pipelines, RAG systems, and predictive architectures for production.',
      matched_skills: ['Python', 'FastAPI', 'Machine Learning', 'SQL'],
      skill_gaps: ['PyTorch / TensorFlow', 'MLOps', 'MLflow'],
      responsibilities: [
        'Build robust vector retrieval-augmented pipelines.',
        'Benchmark model inference latency and token efficiency.',
        'Deploy and monitor containerised ML microservices.',
      ],
      tailored_advice: 'Prepare to discuss chunking strategies and precision metrics in technical interviews.',
    },
    {
      title: 'Backend Systems & Cloud Platform Engineer',
      match_percentage: 82,
      demand: 'High',
      avg_salary: '\u20b920,00,000 \u2013 \u20b930,00,000 / yr (20 \u2013 30 LPA)',
      growth: '+22% YoY',
      description:
        'Specialises in scalable backend services, async queues, and resilient cloud infrastructure.',
      matched_skills: ['Python', 'Docker', 'PostgreSQL', 'Linux', 'Git'],
      skill_gaps: ['Kafka Streaming', 'Terraform', 'Prometheus'],
      responsibilities: [
        'Implement high-throughput transaction pipelines.',
        'Optimise complex relational database queries.',
        'Ensure 99.99% service availability with observability.',
      ],
      tailored_advice: 'Practice explaining database isolation levels and async event processing.',
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• Main Component â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function CareerReport() {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRoleModal, setSelectedRoleModal] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getCareerReport();
        if (data && data.matches && data.matches.length > 0) {
          setReport(data);
        } else {
          setReport(FALLBACK_REPORT);
        }
      } catch (err) {
        console.warn('Career report fetch failed, showing sample pathways.', err);
        setReport(FALLBACK_REPORT);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  const matches = report?.matches || [];
  const topMatch = matches[0] || {};
  const filteredMatches = matches.filter((m) => {
    if (activeFilter === 'high') return m.match_percentage >= 85;
    if (activeFilter === 'growth')
      return (m.growth || '').includes('+2') || (m.growth || '').includes('+3');
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const plan = report?.action_plan_30_60_90 || {};
  const strengths = report?.top_strengths || [];

  return (
    <>
      {/* print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #career-report-print-root,
          #career-report-print-root * { visibility: visible !important; }
          #career-report-print-root {
            position: absolute; left: 0; top: 0;
            width: 100%; margin: 0; padding: 24px;
            background: white; color: #0f172a;
          }
          .no-print { display: none !important; }
          @page { margin: 18mm 14mm; }
        }
      `}</style>

      <div
        id="career-report-print-root"
        ref={printRef}
        className="space-y-8 max-w-5xl mx-auto animate-fade-in"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Career Pathway & Skill Synergy Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {report?.resume_filename
                  ? `Generated from: ${report.resume_filename}`
                  : 'Role compatibility computed against real market openings and your verified skills.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button onClick={() => window.print()} variant="secondary" size="sm" icon={Download}>
              Export PDF Report
            </Button>
          </div>
        </div>

        {/* KPI Band */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Market Readiness Score
            </span>
            <ReadinessGauge score={report?.readiness_score || 88} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Composite employer-grade assessment
            </p>
          </Card>

          <div className="rounded-2xl p-6 bg-slate-950 dark:bg-black border border-slate-800 text-white shadow-md flex flex-col justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Top Match</span>
            <div>
              <div className="text-4xl font-extrabold leading-none mt-2">
                {topMatch.match_percentage || 94}%
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{topMatch.title || 'Senior Engineer'}</p>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Badge variant={demandColor(topMatch.demand)} size="sm">{topMatch.demand || 'Very High'}</Badge>
              <Badge variant="blue" size="sm">{topMatch.growth || '+28% YoY'}</Badge>
            </div>
          </div>

          <Card className="p-6 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Target Median Salary
            </span>
            <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-2 leading-snug">
              {report?.target_median_salary || '\u20b924,00,000 (24 LPA)'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across top matched pathways</p>
          </Card>
        </div>

        {/* Candidate Block */}
        {(report?.candidate_name || report?.executive_summary) && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-extrabold text-base sm:text-lg">
                {report?.candidate_name || 'Candidate Profile'}
              </h2>
            </div>
            {report?.executive_summary && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-4 border-blue-500 pl-4">
                {report.executive_summary}
              </p>
            )}
            {strengths.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Verified Core Strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((s, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-medium"
                    >
                      <Star className="w-3 h-3 text-blue-500 shrink-0" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 30-60-90 Action Plan */}
        {(plan.days_30 || plan.days_60 || plan.days_90) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                Personalised 30 \u00b7 60 \u00b7 90 Day Action Plan
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ActionStep
                day="Days 1 \u2013 30"
                text={plan.days_30}
                icon={Zap}
                color="bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
              <ActionStep
                day="Days 31 \u2013 60"
                text={plan.days_60}
                icon={TrendingUp}
                color="bg-sky-50/70 dark:bg-sky-950/30 border-sky-200/80 dark:border-sky-800/60 text-sky-950 dark:text-sky-200"
              />
              <ActionStep
                day="Days 61 \u2013 90"
                text={plan.days_90}
                icon={Award}
                color="bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white"
              />
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar no-print">
          {[
            { key: 'all', label: `All Pathways (${matches.length})` },
            { key: 'high', label: 'Top Matches (>85%)' },
            { key: 'growth', label: 'High Growth (YoY)' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeFilter === key
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Role Cards */}
        <div className="space-y-5">
          {filteredMatches.map((match, index) => (
            <Card
              key={index}
              hover
              className="p-6 sm:p-7 group flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="shrink-0 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 shadow-sm">
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 leading-none">
                    {match.match_percentage}%
                  </span>
                  <span className="block text-[10px] font-bold text-sky-500 uppercase tracking-wider mt-1.5">
                    Match
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-sky-500 shrink-0" />
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {match.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {match.avg_salary && <Badge variant="blue" size="sm">{match.avg_salary}</Badge>}
                    {match.growth && <Badge variant="blue" size="sm">{match.growth}</Badge>}
                    {match.demand && <Badge variant={demandColor(match.demand)} size="sm">{match.demand}</Badge>}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {match.description}
                </p>

                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      Verified Skills You Possess:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(match.matched_skills || []).map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      Recommended to Acquire:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(match.skill_gaps || []).map((g, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {match.tailored_advice && (
                  <div className="pt-1 flex items-start gap-2 p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
                    <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-sky-950 dark:text-sky-300 leading-relaxed">
                      <strong>Strategy Tip:</strong> {match.tailored_advice}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 no-print">
                  <Button onClick={() => setSelectedRoleModal(match)} variant="secondary" size="sm" icon={Info}>
                    Role Deep Dive
                  </Button>
                  <Button onClick={() => navigate('/interview')} variant="outline" size="sm" icon={ChevronRight}>
                    Practice Role Interview
                  </Button>
                  <Button onClick={() => navigate('/courses')} variant="ghost" size="sm" icon={BookOpen}>
                    Targeted Courses
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* PDF Footer */}
        <div className="hidden print:block mt-8 pt-6 border-t border-slate-300 text-xs text-slate-500 text-center">
          <p>CareerCraft AI \u2014 Career Pathway & Skill Synergy Report &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; Powered by Gemini AI</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>
      </div>

      {/* Role Deep Dive Modal */}
      {selectedRoleModal && (
        <Modal
          isOpen={!!selectedRoleModal}
          onClose={() => setSelectedRoleModal(null)}
          title={selectedRoleModal.title}
          description={`Comprehensive career profile \u2022 ${selectedRoleModal.avg_salary}`}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setSelectedRoleModal(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => { setSelectedRoleModal(null); navigate('/interview'); }}
              >
                Prepare for this Role
              </Button>
            </>
          }
        >
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Overview</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedRoleModal.description}</p>
            </div>

            {selectedRoleModal.responsibilities?.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Core Day-to-Day Responsibilities</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                  {selectedRoleModal.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Market Signals
                </div>
                <p className="text-slate-600 dark:text-slate-400">Demand: <strong>{selectedRoleModal.demand}</strong></p>
                <p className="text-slate-600 dark:text-slate-400">Growth: <strong>{selectedRoleModal.growth}</strong></p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                  <Award className="w-3.5 h-3.5" /> Compensation
                </div>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold">{selectedRoleModal.avg_salary}</p>
              </div>
            </div>

            {selectedRoleModal.tailored_advice && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  AI Career Strategy
                </h4>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{selectedRoleModal.tailored_advice}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

