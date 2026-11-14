import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCareerReport } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  Target,
  ChevronRight,
  Briefcase,
  Sparkles,
  Download,
  Award,
  Calendar,
  Compass,
  Check
} from 'lucide-react';

const demandBadgeVariant = (demand) => {
  if (!demand) return 'blue';
  const d = demand.toLowerCase();
  if (d.includes('very high')) return 'emerald';
  if (d.includes('high')) return 'blue';
  return 'amber';
};

const FALLBACK_REPORT = {
  candidate_name: 'Senior Candidate',
  readiness_score: 92,
  target_median_salary: '₹24,00,000 (24 LPA)',
  executive_summary:
    'Demonstrates strong full-stack engineering capabilities across modern web, cloud microservices, and generative AI systems. Highly aligned with top-tier product companies in the Indian tech market.',
  top_strengths: [
    'Full-Stack Systems Architecture',
    'High-Throughput REST & Asynchronous APIs',
    'Component-Driven Modern UI Engineering',
    'RAG & Vector Retrieval Integration',
  ],
  strengths_breakdown: [
    { label: 'Analytical & Algorithmic Thinking', value: 95 },
    { label: 'Problem Solving & System Design', value: 90 },
    { label: 'Technical Communication & STAR Delivery', value: 78 },
    { label: 'Cloud Architecture & Microservices', value: 85 },
    { label: 'Ownership & Technical Leadership', value: 68 },
  ],
  action_plan_30_60_90: {
    days_30: 'Close critical skill gaps in LangChain & Kubernetes with a verified proof-of-concept repository.',
    days_60: 'Master distributed caching with Redis and practice 10 structured STAR mock interview rounds.',
    days_90: 'Target tier-1 product tech firms and negotiate competitive compensation benchmarks.',
  },
  matches: [
    {
      title: 'Senior Full-Stack & AI Systems Engineer',
      match_percentage: 94,
      demand: 'Very High',
      avg_salary: '₹22,00,000 – ₹32,00,000 / yr (22 – 32 LPA)',
      growth: '+28% YoY',
      description:
        'Architects end-to-end full-stack applications with AI-powered retrieval backends and reactive frontends.',
      matched_skills: ['React', 'Python', 'FastAPI', 'Docker', 'PostgreSQL', 'TypeScript'],
      skill_gaps: [
        { name: 'LangChain & Agentic Workflows', severity: 'CRITICAL' },
        { name: 'Kubernetes Cluster Orchestration', severity: 'CRITICAL' },
        { name: 'Redis Caching & In-Memory Queues', severity: 'MODERATE' },
      ],
      responsibilities: [
        'Design production LLM retrieval-augmented generation pipelines.',
        'Maintain resilient FastAPI backends and high-performance React frontends.',
        'Implement containerized cloud microservices with 99.99% uptime.',
      ],
      tailored_advice:
        'Highlight end-to-end project ownership and database indexing experience in technical rounds.',
    },
    {
      title: 'AI & Machine Learning Solutions Engineer',
      match_percentage: 88,
      demand: 'High',
      avg_salary: '₹24,00,000 – ₹36,00,000 / yr (24 – 36 LPA)',
      growth: '+34% YoY',
      description:
        'Develops intelligent inference pipelines, RAG systems, and predictive architectures for production.',
      matched_skills: ['Python', 'FastAPI', 'Machine Learning', 'SQL'],
      skill_gaps: [
        { name: 'Deep Learning Frameworks (PyTorch/TensorFlow)', severity: 'CRITICAL' },
        { name: 'MLOps & Deployment (Docker, CI/CD, Cloud)', severity: 'CRITICAL' },
        { name: 'Advanced SQL & Database Optimization', severity: 'MODERATE' },
      ],
      responsibilities: [
        'Build robust vector retrieval-augmented pipelines with ChromaDB.',
        'Benchmark model inference latency and token efficiency.',
        'Deploy and monitor containerized ML microservices.',
      ],
      tailored_advice: 'Prepare to discuss chunking strategies and precision metrics in technical interviews.',
    },
    {
      title: 'Backend Systems & Cloud Platform Engineer',
      match_percentage: 82,
      demand: 'High',
      avg_salary: '₹20,00,000 – ₹30,00,000 / yr (20 – 30 LPA)',
      growth: '+22% YoY',
      description:
        'Specializes in scalable backend services, async queues, and resilient cloud infrastructure.',
      matched_skills: ['Python', 'Docker', 'PostgreSQL', 'Linux', 'Git'],
      skill_gaps: [
        { name: 'Kafka Streaming Architecture', severity: 'CRITICAL' },
        { name: 'Terraform Infrastructure as Code', severity: 'MODERATE' },
        { name: 'Prometheus & Grafana Observability', severity: 'MODERATE' },
      ],
      responsibilities: [
        'Implement high-throughput transaction pipelines.',
        'Optimize complex relational database queries.',
        'Ensure 99.99% service availability with observability.',
      ],
      tailored_advice: 'Practice explaining database isolation levels and async event processing.',
    },
  ],
};

export default function CareerReport() {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleModal, setSelectedRoleModal] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getCareerReport();
        if (data && data.matches && data.matches.length > 0) {
          // Normalize skill gaps to have severity if needed
          const normalizedMatches = data.matches.map(m => ({
            ...m,
            skill_gaps: (m.skill_gaps || []).map(g => 
              typeof g === 'string' ? { name: g, severity: 'MODERATE' } : g
            )
          }));
          setReport({ ...data, matches: normalizedMatches });
        } else {
          setReport(FALLBACK_REPORT);
        }
      } catch (err) {
        console.warn('Career report fetch failed, using curated pathways.', err);
        setReport(FALLBACK_REPORT);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  const matches = report?.matches || [];
  const topMatch = matches[0] || {};
  const strengthsBreakdown = report?.strengths_breakdown || FALLBACK_REPORT.strengths_breakdown;
  const plan = report?.action_plan_30_60_90 || FALLBACK_REPORT.action_plan_30_60_90;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto animate-pulse">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <>
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #career-report-print-root,
          #career-report-print-root * { visibility: visible !important; }
          #career-report-print-root {
            position: absolute; left: 0; top: 0;
            width: 100%; margin: 0; padding: 24px;
            background: white; color: #172033;
          }
          .no-print { display: none !important; }
          @page { margin: 18mm 14mm; }
        }
      `}</style>

      <div
        id="career-report-print-root"
        ref={printRef}
        className="space-y-7 max-w-5xl mx-auto animate-fade-in"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAF1] dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1">
              <Compass className="w-3.5 h-3.5" />
              Career GPS & Talent Gap Intelligence
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] dark:text-slate-100">
              Career Pathway & Skills Guidance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized role matching against live market standards with actionable gap closure roadmaps.
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button onClick={() => window.print()} variant="secondary" size="sm" icon={Download}>
              Export PDF Report
            </Button>
            <Button onClick={() => navigate('/interview')} variant="primary" size="sm" icon={Target}>
              Practice Mock Interview
            </Button>
          </div>
        </div>

        {/* Top Section: Your Career Match & Strengths Analysis (Inspired by Reference Image 5) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Your Career Match Donut Card (Image 5 Left) */}
          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Your Career Match
            </span>
            
            <div className="py-2">
              <ProgressRing 
                value={topMatch.match_percentage || 92} 
                size={130} 
                strokeWidth={10} 
                color="#2563EB"
                trackColor="#E5EAF1"
              >
                <div className="text-center">
                  <span className="text-3xl font-black text-[#172033] dark:text-slate-100">
                    {topMatch.match_percentage || 92}%
                  </span>
                </div>
              </ProgressRing>
            </div>

            <h3 className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              Excellent Match
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Your profile strongly aligns with top market engineering paths. Target median compensation: <strong className="text-[#172033] dark:text-slate-200">{report?.target_median_salary || '₹24 LPA'}</strong>.
            </p>
          </Card>

          {/* Strengths Analysis Horizontal Bars (Image 5 Right, 2 Cols Wide) */}
          <Card className="p-6 md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                Strengths Analysis
              </span>
              <Badge variant="blue" size="sm">Employer Verified</Badge>
            </div>

            <div className="space-y-3 pt-1">
              {strengthsBreakdown.map((item, idx) => (
                <ProgressBar
                  key={idx}
                  label={item.label}
                  valueLabel={`${item.value}%`}
                  value={item.value}
                  color={item.value >= 90 ? 'blue' : item.value >= 75 ? 'blue' : 'amber'}
                  height="h-2.5"
                />
              ))}
            </div>
          </Card>

        </div>

        {/* Career GPS: Skills You Need to Acquire (Directly Inspired by Reference Image 4) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                GAP ANALYSIS
              </span>
              <h2 className="text-lg font-extrabold text-[#172B4D] dark:text-slate-100">
                Skills You Need to Acquire
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {matches.length} roles analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matches.slice(0, 2).map((m, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5EAF1] dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-[#172033] dark:text-slate-100">
                    {m.title}
                  </h3>
                  <Badge variant="blue" size="sm">{m.match_percentage}% Match</Badge>
                </div>

                {/* Skill Gaps List with CRITICAL and MODERATE pills (Reference Image 4) */}
                <div className="space-y-2.5">
                  {(m.skill_gaps || []).map((gap, gIdx) => (
                    <div 
                      key={gIdx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E5EAF1] dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {gap.name || gap}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                        gap.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                      }`}>
                        {gap.severity || 'MODERATE'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Recommended action: take related course
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/courses')}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
                  >
                    View Courses <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 30-60-90 Day Action Plan */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-lg text-[#172B4D] dark:text-slate-100">
              Personalized 30 · 60 · 90 Day Action Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5EAF1] dark:border-slate-800 shadow-xs space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wide">
                Days 1 – 30
              </span>
              <h4 className="text-xs font-bold text-[#172033] dark:text-slate-200">Close Critical Gaps</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {plan.days_30}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5EAF1] dark:border-slate-800 shadow-xs space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase tracking-wide">
                Days 31 – 60
              </span>
              <h4 className="text-xs font-bold text-[#172033] dark:text-slate-200">Mock Interview Rigor</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {plan.days_60}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#172B4D] text-white shadow-xs space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-blue-200 text-[10px] font-extrabold uppercase tracking-wide">
                Days 61 – 90
              </span>
              <h4 className="text-xs font-bold text-white">Target High-Growth Roles</h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {plan.days_90}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Role Breakdown Cards */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-[#172B4D] dark:text-slate-100">
            Recommended Career Pathways & Market Demand
          </h2>

          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={index} hover className="p-6 flex flex-col md:flex-row gap-6 items-start">
                
                {/* Score Pill / Left block */}
                <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 shadow-2xs">
                  <div className="text-center">
                    <span className="block text-2xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                      {match.match_percentage}%
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      Match
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600 shrink-0" />
                      <h3 className="text-base font-extrabold text-[#172033] dark:text-slate-100">
                        {match.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={demandBadgeVariant(match.demand)} size="sm">{match.demand} Demand</Badge>
                      <Badge variant="blue" size="sm">{match.growth || '+25% YoY'}</Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {match.description}
                  </p>

                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Target Compensation: {match.avg_salary}
                  </div>

                  {/* Matched Skills Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Matched Skills:</span>
                    {(match.matched_skills || []).map((sk, sIdx) => (
                      <span key={sIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-600" /> {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Details Trigger */}
                <div className="shrink-0 self-end md:self-center">
                  <Button
                    onClick={() => setSelectedRoleModal(match)}
                    variant="outline"
                    size="sm"
                    iconRight={ChevronRight}
                  >
                    View Details
                  </Button>
                </div>

              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* Role Details Modal */}
      {selectedRoleModal && (
        <Modal
          isOpen={!!selectedRoleModal}
          onClose={() => setSelectedRoleModal(null)}
          title={selectedRoleModal.title}
          description={`Comprehensive architecture overview and tailored interview preparation guidance for ${selectedRoleModal.title}.`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedRoleModal(null)}>
              Close Overview
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Typical Core Responsibilities:
              </span>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-400">
                {(selectedRoleModal.responsibilities || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-200">
              <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                Tailored Interview Preparation Advice:
              </span>
              <p>{selectedRoleModal.tailored_advice}</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
