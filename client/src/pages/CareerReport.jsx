import { useState, useEffect } from 'react';
import { getCareerMatches } from '../services/api';
import { Target, ChevronRight, Briefcase } from 'lucide-react';

export default function CareerReport() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getCareerMatches();
        setMatches(data.matches);
      } catch (err) {
        console.error('Failed to fetch career matches', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Career Matches</h1>
          <p className="mt-1 text-sm text-slate-500">Roles best suited for your extracted skills.</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-base p-6 flex gap-6 animate-pulse">
              <div className="w-16 h-16 bg-slate-200 rounded-full shrink-0"></div>
              <div className="flex-1 mt-2">
                <div className="h-5 bg-slate-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div key={index} className="card-base p-6 flex flex-col sm:flex-row gap-6 items-start hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
              
              <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-white shadow-sm ring-1 ring-slate-100">
                <div className="text-center">
                  <span className="block text-xl font-bold text-blue-600 leading-none">{match.match_percentage}%</span>
                  <span className="block text-[10px] font-semibold text-blue-400 uppercase mt-1">Match</span>
                </div>
              </div>

              <div className="flex-1 mt-1">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {match.title}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {match.description}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 self-center items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
