import { useState, useEffect } from 'react';
import { getJobRecommendations } from '../services/api';
import { Briefcase, MapPin, Building2, ExternalLink } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobRecommendations();
        setJobs(data.jobs);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recommended Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">Job listings tailored to your parsed resume skills.</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-base p-6 animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div key={index} className="card-base p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-rose-300 hover:shadow-md transition-all group">
              
              <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100">
                <div className="text-center">
                  <span className="block text-lg font-bold text-rose-600 leading-none">{job.match_score}%</span>
                  <span className="block text-[10px] font-semibold text-rose-400 uppercase mt-1">Match</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                  {job.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-600">
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                    {job.company}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                    {job.location}
                  </span>
                </div>
              </div>

              <a 
                href={job.url} 
                target="_blank" 
                rel="noreferrer" 
                className="shrink-0 w-full sm:w-auto btn-primary bg-rose-600 hover:bg-rose-500 focus-visible:outline-rose-600"
              >
                Apply Now <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
