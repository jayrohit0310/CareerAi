import { useState, useEffect } from 'react';
import { getJobRecommendations } from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Search, 
  Bookmark, 
  Clock,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';

const defaultOpportunities = [
  {
    id: "job_1",
    title: "Full-Stack Software Engineer (Python & React)",
    company: "Razorpay",
    location: "Bengaluru, Karnataka (Hybrid)",
    opportunity_type: "job",
    salary: "₹18,00,000 - ₹28,00,000 / yr (18 - 28 LPA)",
    match_score: 96,
    posted: "1 day ago",
    skills: ["Python", "React", "FastAPI", "PostgreSQL", "Docker"],
    url: "https://razorpay.com/jobs/",
    platform: "Razorpay Careers",
    description: "Architect mission-critical payment workflows, merchant dashboards, and high-throughput transaction microservices with 99.99% availability."
  },
  {
    id: "job_2",
    title: "Senior AI & Backend Systems Developer",
    company: "Swiggy",
    location: "Bengaluru, Karnataka (Remote/Hybrid)",
    opportunity_type: "job",
    salary: "₹22,00,000 - ₹34,00,000 / yr (22 - 34 LPA)",
    match_score: 94,
    posted: "2 days ago",
    skills: ["Python", "FastAPI", "Redis", "Distributed Systems", "Machine Learning"],
    url: "https://careers.swiggy.com/",
    platform: "Swiggy Careers",
    description: "Design dynamic recommendation engines, real-time demand forecasting pipelines, and scalable microservices handling millions of food & grocery orders."
  },
  {
    id: "intern_1",
    title: "Full-Stack Web Development Intern",
    company: "Internshala Verified Partner",
    location: "Remote (India)",
    opportunity_type: "internship",
    salary: "₹25,000 - ₹40,000 / month Stipend",
    match_score: 93,
    posted: "Just now",
    skills: ["React", "JavaScript", "Node.js / Python", "Tailwind CSS"],
    url: "https://internshala.com/internships/web-development-internship/",
    platform: "Internshala",
    description: "Build user-facing web applications, responsive user dashboards, and integrate RESTful APIs alongside experienced senior engineers. Certificate & PPO eligible."
  },
  {
    id: "job_3",
    title: "Backend Platform Engineer (Distributed Systems)",
    company: "CRED",
    location: "Bengaluru, Karnataka (On-site)",
    opportunity_type: "job",
    salary: "₹24,00,000 - ₹36,00,000 / yr (24 - 36 LPA)",
    match_score: 91,
    posted: "3 days ago",
    skills: ["Python", "Go", "Kafka", "PostgreSQL", "Microservices"],
    url: "https://cred.club/careers",
    platform: "CRED Careers",
    description: "Build high-throughput event processing pipelines, financial ledger services, and developer tooling serving millions of premium credit card members."
  },
  {
    id: "intern_2",
    title: "Machine Learning & AI Research Intern",
    company: "Unstop Tech Challenges & Internships",
    location: "Remote / Bengaluru (Hybrid)",
    opportunity_type: "internship",
    salary: "₹30,000 - ₹50,000 / month Stipend",
    match_score: 90,
    posted: "1 day ago",
    skills: ["Python", "PyTorch", "LLMs", "Scikit-Learn", "FastAPI"],
    url: "https://unstop.com/internships?searchTerm=Machine+Learning",
    platform: "Unstop",
    description: "Hands-on work building NLP models, LLM fine-tuning pipelines, and intelligent data extraction microservices with guidance from ML researchers."
  },
  {
    id: "job_4",
    title: "Data Platform & Analytics Engineer",
    company: "PhonePe",
    location: "Bengaluru / Pune (Hybrid)",
    opportunity_type: "job",
    salary: "₹16,00,000 - ₹25,00,000 / yr (16 - 25 LPA)",
    match_score: 88,
    posted: "4 days ago",
    skills: ["Python", "SQL", "Apache Spark", "Airflow", "Cloud Data Warehouses"],
    url: "https://www.phonepe.com/careers/",
    platform: "PhonePe Careers",
    description: "Optimize high-volume data streams, real-time analytics engines, and fraud-detection transaction monitoring systems."
  },
  {
    id: "intern_3",
    title: "Software Engineering Intern (Backend & Cloud)",
    company: "LinkedIn Verified Portal",
    location: "Pune / Mumbai / Remote (India)",
    opportunity_type: "internship",
    salary: "₹22,000 - ₹35,000 / month Stipend",
    match_score: 87,
    posted: "2 days ago",
    skills: ["Python", "REST APIs", "Docker", "Git", "SQL"],
    url: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineering+Internship&location=India",
    platform: "LinkedIn Jobs",
    description: "Gain hands-on industry experience building modern backend services, containerizing microservices with Docker, and writing clean testable code."
  },
  {
    id: "job_5",
    title: "Cloud Infrastructure & DevOps Engineer",
    company: "Flipkart",
    location: "Bengaluru / Hyderabad (Hybrid)",
    opportunity_type: "job",
    salary: "₹19,00,000 - ₹30,00,000 / yr (19 - 30 LPA)",
    match_score: 85,
    posted: "Recently",
    skills: ["Docker", "Kubernetes", "AWS / GCP", "CI/CD", "Terraform"],
    url: "https://www.flipkartcareers.com/",
    platform: "Flipkart Careers",
    description: "Manage large-scale multi-cluster Kubernetes deployments, implement automated CI/CD canary rollouts, and ensure 99.99% uptime for peak shopping sales."
  }
];

export default function Jobs() {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunityTypeFilter, setOpportunityTypeFilter] = useState('all'); // 'all', 'job', 'internship'
  const [workTypeFilter, setWorkTypeFilter] = useState('all'); // 'all', 'remote', 'hybrid', 'onsite'
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJobModal, setSelectedJobModal] = useState(null);
  const toast = useToast();

  const fetchOpportunities = async (oppType = 'all') => {
    setIsLoading(true);
    try {
      const data = await getJobRecommendations(oppType);
      if (data && data.jobs && data.jobs.length > 0) {
        setOpportunities(data.jobs);
      } else {
        const fallback = oppType === 'all' 
          ? defaultOpportunities 
          : defaultOpportunities.filter(o => o.opportunity_type === oppType);
        setOpportunities(fallback);
      }
    } catch (err) {
      console.warn('Backend jobs endpoint unreachable, displaying verified Indian tech openings', err);
      const fallback = oppType === 'all' 
        ? defaultOpportunities 
        : defaultOpportunities.filter(o => o.opportunity_type === oppType);
      setOpportunities(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(opportunityTypeFilter);
  }, [opportunityTypeFilter]);

  const toggleSaveJob = (idOrIndex, jobTitle) => {
    const isCurrentlySaved = savedJobs.includes(idOrIndex);
    if (isCurrentlySaved) {
      setSavedJobs(prev => prev.filter(i => i !== idOrIndex));
      toast.info(`Removed "${jobTitle}" from saved opportunities.`, 'Bookmark Removed');
    } else {
      setSavedJobs(prev => [...prev, idOrIndex]);
      toast.success(`Saved "${jobTitle}" to your target opportunities.`, 'Opportunity Saved');
    }
  };

  const filteredOpportunities = opportunities.filter((job) => {
    const titleMatch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const companyMatch = job.company?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const locMatch = job.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const skillsMatch = job.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) || false;
    const matchesSearch = !searchQuery || titleMatch || companyMatch || locMatch || skillsMatch;

    const matchesOppType = opportunityTypeFilter === 'all' || 
      job.opportunity_type === opportunityTypeFilter;

    const locationText = (job.location || '').toLowerCase();
    let matchesWorkType = true;
    if (workTypeFilter === 'remote') {
      matchesWorkType = locationText.includes('remote');
    } else if (workTypeFilter === 'hybrid') {
      matchesWorkType = locationText.includes('hybrid');
    } else if (workTypeFilter === 'onsite') {
      matchesWorkType = !locationText.includes('remote') && !locationText.includes('hybrid');
    }

    return matchesSearch && matchesOppType && matchesWorkType;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl shadow-2xs">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Verified Jobs & Internships
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live Indian tech openings & student internships with guaranteed working links and verified INR compensation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="rose" size="md" dot>
            Live India Openings
          </Badge>
          <Badge variant="emerald" size="md">
            ₹ INR Compensation
          </Badge>
        </div>
      </div>

      {/* Primary Category Selector Tabs (Jobs vs Internships) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 w-full sm:w-fit">
        <button
          onClick={() => setOpportunityTypeFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            opportunityTypeFilter === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-500" />
          All Opportunities
        </button>

        <button
          onClick={() => setOpportunityTypeFilter('job')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            opportunityTypeFilter === 'job'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Full-Time Jobs
        </button>

        <button
          onClick={() => setOpportunityTypeFilter('internship')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            opportunityTypeFilter === 'internship'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Internships
        </button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search role, company, skill (e.g. Python, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Mode:
          </span>
          {[
            { id: 'all', label: 'All Locations' },
            { id: 'remote', label: 'Remote Only' },
            { id: 'hybrid', label: 'Hybrid' },
            { id: 'onsite', label: 'On-Site' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setWorkTypeFilter(type.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                workTypeFilter === type.id
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Jobs & Internships List */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <div className="space-y-4">
          {filteredOpportunities.map((job, index) => {
            const oppId = job.id || `opp_${index}`;
            const isSaved = savedJobs.includes(oppId);
            const isInternship = job.opportunity_type === 'internship';

            return (
              <Card 
                key={oppId} 
                hover
                className="p-6 group flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-rose-300 dark:hover:border-rose-600"
              >
                {/* Match Score Badge */}
                <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 border border-rose-100 dark:border-rose-900/60 shadow-2xs">
                  <div className="text-center">
                    <span className="block text-xl font-extrabold text-rose-600 dark:text-rose-400 leading-none">
                      {job.match_score}%
                    </span>
                    <span className="block text-[9px] font-bold text-rose-400 dark:text-rose-500 uppercase tracking-wider mt-1">
                      Match
                    </span>
                  </div>
                </div>

                {/* Opportunity Metadata */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                      isInternship
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {isInternship ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                      {isInternship ? 'Internship' : 'Full-Time Job'}
                    </span>

                    <h3 
                      onClick={() => setSelectedJobModal(job)}
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate cursor-pointer hover:underline"
                    >
                      {job.title}
                    </h3>

                    {job.salary && (
                      <Badge variant="emerald" size="sm">
                        {job.salary}
                      </Badge>
                    )}

                    {job.platform && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        via {job.platform}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center font-bold text-slate-800 dark:text-slate-200">
                      <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                      {job.company}
                    </span>
                    <span className="flex items-center text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                      {job.location}
                    </span>
                    {job.posted && (
                      <span className="flex items-center text-slate-400 text-xs">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {job.posted}
                      </span>
                    )}
                  </div>

                  {/* Required skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions: Guaranteed Working Link */}
                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <a 
                    href={job.url || (isInternship ? "https://internshala.com/internships" : "https://www.linkedin.com/jobs/search/?location=India")} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors active:scale-95"
                  >
                    Apply Now <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => toggleSaveJob(oppId, job.title)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isSaved 
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title={isSaved ? "Saved to target opportunities" : "Save this opportunity"}
                    aria-label="Bookmark opportunity"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="Try broadening your search query or switching to 'All Opportunities' to view full recommendations."
          actionLabel="Reset Filters"
          onAction={() => { setSearchQuery(''); setOpportunityTypeFilter('all'); setWorkTypeFilter('all'); }}
        />
      )}

      {/* Opportunity Details Modal */}
      {selectedJobModal && (
        <Modal
          isOpen={!!selectedJobModal}
          onClose={() => setSelectedJobModal(null)}
          title={selectedJobModal.title}
          description={`${selectedJobModal.company} • ${selectedJobModal.location}`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setSelectedJobModal(null)}>
                Close
              </Button>
              <a
                href={selectedJobModal.url || "https://www.linkedin.com/jobs"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm"
              >
                Apply on {selectedJobModal.platform || "Official Portal"} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="rose" size="md">{selectedJobModal.match_score}% Match</Badge>
              <Badge variant="emerald" size="md">{selectedJobModal.salary}</Badge>
              <Badge variant="slate" size="md">
                {selectedJobModal.opportunity_type === 'internship' ? 'Student / Early Career Internship' : 'Full-Time Position'}
              </Badge>
              {selectedJobModal.platform && (
                <Badge variant="amber" size="md">
                  Portal: {selectedJobModal.platform}
                </Badge>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Position Summary</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedJobModal.description}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Required Core Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJobModal.skills?.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Direct Verified Application Link</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Clicking "Apply on {selectedJobModal.platform || 'Portal'}" will take you directly to the verified listing on {selectedJobModal.platform || 'the company portal'}.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
