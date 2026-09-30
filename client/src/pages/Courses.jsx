import { useState, useEffect } from 'react';
import { getCourseRecommendations } from '../services/api';
import { 
  GraduationCap, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Star, 
  Clock, 
  CheckCircle,
  Filter
} from 'lucide-react';

export default function Courses() {
  const defaultCourses = [
    {
      title: "Building Production-Ready Generative AI Applications",
      platform: "DeepLearning.AI",
      category: "ai",
      level: "Intermediate",
      duration: "16 hours",
      rating: 4.9,
      reason: "Bridges critical skill gaps in LLM orchestration, prompt chains, vector embeddings, and evaluation metrics.",
      url: "https://www.deeplearning.ai"
    },
    {
      title: "Full Stack FastAPI, React & Docker Microservices",
      platform: "Coursera",
      category: "fullstack",
      level: "Intermediate",
      duration: "24 hours",
      rating: 4.8,
      reason: "Directly reinforces end-to-end web architecture using asynchronous Python backend and modern React.",
      url: "https://www.coursera.org"
    },
    {
      title: "Cloud Infrastructure & Kubernetes for Developers",
      platform: "Udemy",
      category: "cloud",
      level: "Advanced",
      duration: "20 hours",
      rating: 4.7,
      reason: "Prepares you for senior roles requiring container orchestration, Helm charts, and continuous deployment.",
      url: "https://www.udemy.com"
    },
    {
      title: "Distributed Systems & Scalable Database Architecture",
      platform: "edX",
      category: "backend",
      level: "Advanced",
      duration: "30 hours",
      rating: 4.9,
      reason: "Master caching with Redis, database sharding, and event-driven architectures with Kafka.",
      url: "https://www.edx.org"
    },
    {
      title: "Applied Machine Learning & MLOps with Python",
      platform: "DataCamp",
      category: "ai",
      level: "Beginner-Friendly",
      duration: "18 hours",
      rating: 4.8,
      reason: "Covers data preprocessing, model tracking with MLflow, and deploying inference APIs.",
      url: "https://www.datacamp.com"
    },
    {
      title: "Modern TypeScript & React Design Systems",
      platform: "Frontend Masters",
      category: "fullstack",
      level: "Intermediate",
      duration: "14 hours",
      rating: 4.9,
      reason: "Crucial for writing robust, type-safe enterprise UI components with clean architectures.",
      url: "https://frontendmasters.com"
    }
  ];

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourseRecommendations();
        if (data && data.courses && data.courses.length > 0) {
          const merged = data.courses.map((c, i) => ({
            ...defaultCourses[i % defaultCourses.length],
            ...c
          }));
          setCourses(merged);
        } else {
          setCourses(defaultCourses);
        }
      } catch (err) {
        console.warn('Backend courses endpoint unreachable, showing curated learning paths', err);
        setCourses(defaultCourses);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Recommended Courses & Upskilling</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Curated educational roadmaps targeted directly at closing your identified skill gaps.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Skills-Gap Aligned</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-base p-4 bg-white border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search courses, skills, platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-xs sm:text-sm bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'ai', label: 'AI & Machine Learning' },
            { id: 'fullstack', label: 'Full-Stack Web' },
            { id: 'cloud', label: 'Cloud & DevOps' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-base p-6 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-5/6"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <div 
              key={index} 
              className="card-base p-6 bg-white border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all flex flex-col group justify-between"
            >
              <div className="space-y-4">
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    {course.platform}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{course.rating || 4.8}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                  {course.title}
                </h3>

                {/* Course stats pill */}
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration || '20 hours'}
                  </span>
                  <span>•</span>
                  <span>{course.level || 'Intermediate'}</span>
                </div>

                {/* Why Take This Box */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <div className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Skill Gap Alignment:</span>
                  </div>
                  <p>{course.reason}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a 
                  href={course.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-secondary w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-colors shadow-2xs"
                >
                  Start Course <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-base p-12 text-center bg-white border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No courses match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting "All Courses".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="btn-primary mt-4 py-2 px-4 text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
