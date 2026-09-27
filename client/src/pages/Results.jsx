import { useState, useEffect } from 'react';
import { getSalaryEstimate } from '../services/api';
import { TrendingUp, DollarSign, BarChart3, Info } from 'lucide-react';

export default function Results() {
  const [salaryData, setSalaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSalaryEstimate();
        setSalaryData(data);
      } catch (err) {
        console.error('Failed to fetch salary estimate', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salary Estimator</h1>
          <p className="mt-1 text-sm text-slate-500">Market value estimation based on your skills.</p>
        </div>
      </div>
      
      {isLoading || !salaryData ? (
        <div className="card-base p-10 animate-pulse flex flex-col items-center">
          <div className="w-48 h-6 bg-slate-200 rounded mb-8"></div>
          <div className="w-64 h-16 bg-slate-200 rounded mb-8"></div>
          <div className="w-full flex justify-between px-10">
            <div className="w-24 h-10 bg-slate-200 rounded"></div>
            <div className="w-24 h-10 bg-slate-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="card-base overflow-hidden">
          <div className="p-8 text-center bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <BarChart3 className="w-64 h-64 absolute -bottom-10 -right-10" />
            </div>
            
            <h2 className="text-slate-300 font-medium mb-2 relative z-10">
              Estimated for role:
            </h2>
            <h3 className="text-2xl font-bold mb-8 relative z-10 text-emerald-400">
              {salaryData.role}
            </h3>
            
            <div className="flex items-center justify-center relative z-10">
              <span className="text-4xl font-light text-slate-400 mr-1">$</span>
              <span className="text-6xl font-bold tracking-tight">
                {salaryData.median_salary.toLocaleString()}
              </span>
            </div>
            <p className="text-slate-400 mt-2 relative z-10">Median Annual Salary</p>
          </div>
          
          <div className="bg-white p-8 border-t border-slate-200">
            <div className="flex justify-between items-center max-w-md mx-auto">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Low End (25th)</p>
                <p className="text-2xl font-semibold text-slate-900">
                  ${salaryData.min_salary.toLocaleString()}
                </p>
              </div>
              
              <div className="w-px h-12 bg-slate-200 mx-4"></div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">High End (75th)</p>
                <p className="text-2xl font-semibold text-slate-900">
                  ${salaryData.max_salary.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p>
                This estimate is based on the skills extracted from your resume and current market trends. Factors such as location, years of experience, and specific industry can significantly affect actual compensation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
