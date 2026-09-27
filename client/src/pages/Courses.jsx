import { useState, useEffect } from 'react';
import { getCourseRecommendations } from '../services/api';
import { GraduationCap, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourseRecommendations();
        setCourses(data.courses);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recommended Courses</h1>
          <p className="mt-1 text-sm text-slate-500">AI-curated learning paths to fill your skill gaps.</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-base p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <div key={index} className="card-base p-6 flex flex-col hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 mb-3">
                    <BookOpen className="w-3.5 h-3.5 mr-1" /> {course.platform}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
                    {course.title}
                  </h3>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6 mt-auto">
                <p className="text-sm text-slate-600 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-800">Why take this?</strong> {course.reason}</span>
                </p>
              </div>

              <a 
                href={course.url} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-secondary w-full group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200"
              >
                View Course <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
