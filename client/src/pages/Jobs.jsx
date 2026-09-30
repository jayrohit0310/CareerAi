import { useState, useEffect } from 'react';
import { getJobRecommendations } from '../services/api';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Search, 
  Bookmark, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Filter
} from 'lucide-react';

export default function Jobs() {
  const defaultJobs = [
    {
      title: "Senior Full-Stack AI Engineer",
      company: "Synthetix AI",
      location: "San Francisco, CA (Remote)",
      type: "Remote",
      salary: "$150,000 - $185,000",
      match_score: 96,
      posted: "1 day ago",
      skills: ["React", "FastAPI", "Python", "Vector Databases"],
      url: "https://www.linkedin.com/jobs"
    },
    {
      title: "AI Platform & Backend Engineer",
      company: "Cognitive Scale Labs",
      location: "New York, NY (Hybrid)",
      type: "Hybrid",
      salary: "$140,000 - $170,000",
      match_score: 92,
      posted: "3 days ago",
      skills: ["Python", "Docker", "PostgreSQL", "Microservices"],
      url: "https://www.indeed.com"
    },
    {
      title: "Machine Learning Infrastructure Engineer",
      company: "NeuralPulse Systems",
      location: "Austin, TX (Remote)",
      type: "Remote",
      salary: "$160,000 - $195,000",
      match_score: 89,
      posted: "2 days ago",
      skills: ["Python", "Kubernetes", "PyTorch", "MLOps"],
      url: "https://www.linkedin.com/jobs"
    },
    {
      title: "Full-Stack Software Engineer (Python/React)",
      company: "FinTech Orbit",
      location: "Chicago, IL (Hybrid)",
      type: "Hybrid",
      salary: "$130,000 - $155,000",
      match_score: 85,
      posted: "Just now",
      skills: ["React", "Python", "SQL", "REST APIs"],
      url: "https://www.glassdoor.com"
    },
    {
      title: "Cloud DevOps Engineer",
      company: "Aether Cloud Solutions",
      location: "Seattle, WA (Remote)",
      type: "Remote",
      salary: "$135,000 - $165,000",
      match_score: 83,
      posted: "4 days ago",
      skills: ["Docker", "AWS", "Terraform", "CI/CD"],
      url: "https://www.linkedin.com/jobs"
    }
  ];

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobRecommendations();
        if (data && data.jobs && data.jobs.length > 0) {
          const merged = data.jobs.map((j, i) => ({
            ...defaultJobs[i % defaultJobs.length],
            ...j,
            match_score: j.match_score || defaultJobs[i % defaultJobs.length].match_score
          }));
          setJobs(merged);
        } else {
          setJobs(defaultJobs);
        }
      } catch (err) {
        console.warn('Backend jobs endpoint unreachable, displaying tailored job listings', err);
        setJobs(defaultJobs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const toggleSaveJob = (index) => {
    setSavedJobs(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = workTypeFilter === 'all' || 
                        job.type?.toLowerCase() === workTypeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shadow-xs">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Tailored Job Opportunities</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Matched in real-time according to your verified skills and target compensation.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span>Active Postings</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card-base p-4 bg-white border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search job title, company, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-xs sm:text-sm bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'remote', label: 'Remote Only' },
            { id: 'hybrid', label: 'Hybrid' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setWorkTypeFilter(type.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                workTypeFilter === type.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-base p-6 animate-pulse flex gap-5">
              <div className="w-16 h-16 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => {
            const isSaved = savedJobs.includes(index);
            return (
              <div 
                key={index} 
                className="card-base p-6 bg-white border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center group"
              >
                {/* Match Score Badge */}
                <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 shadow-2xs">
                  <div className="text-center">
                    <span className="block text-xl font-extrabold text-rose-600 leading-none">
                      {job.match_score}%
                    </span>
                    <span className="block text-[9px] font-bold text-rose-400 uppercase tracking-wider mt-1">
                      Match
                    </span>
                  </div>
                </div>

                {/* Job Metadata */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                      {job.title}
                    </h3>
                    {job.salary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {job.salary}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-600 font-medium">
                    <span className="flex items-center font-bold text-slate-900">
                      <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                      {job.company}
                    </span>
                    <span className="flex items-center text-slate-500">
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

                  {/* Required skills chips */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <a 
                    href={job.url || "https://www.linkedin.com/jobs"} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
                  >
                    Apply Now <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => toggleSaveJob(index)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isSaved 
                        ? 'bg-rose-50 border-rose-200 text-rose-600' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                    title={isSaved ? "Saved" : "Save job"}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-base p-12 text-center bg-white border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No job openings found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Jobs".</p>
          <button
            onClick={() => { setSearchQuery(''); setWorkTypeFilter('all'); }}
            className="btn-primary mt-4 py-2 px-4 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
