import { useState, useEffect } from 'react';
import { getCourseRecommendations } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { 
  GraduationCap, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Star, 
  Clock
} from 'lucide-react';

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

export default function Courses() {
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
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl shadow-2xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Recommended Courses & Upskilling
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Hand-picked educational roadmaps targeted directly at closing your identified skill gaps.
            </p>
          </div>
        </div>

        <Badge variant="amber" size="md" dot>
          Skills-Gap Aligned
        </Badge>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search courses, platforms, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'ai', label: 'AI & ML' },
            { id: 'fullstack', label: 'Full-Stack' },
            { id: 'cloud', label: 'Cloud & DevOps' },
            { id: 'backend', label: 'Backend' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <Card 
              key={index} 
              hover
              className="p-6 flex flex-col justify-between group hover:border-amber-300 dark:hover:border-amber-600"
            >
              <div className="space-y-4">
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="amber" size="sm">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course.platform}
                  </Badge>

                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{course.rating || 4.8}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {course.title}
                </h3>

                {/* Course stats pill */}
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration || '20 hours'}
                  </span>
                  <span>•</span>
                  <span>{course.level || 'Intermediate'}</span>
                </div>

                {/* Skill Gap Alignment Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Skill Synergy Target:</span>
                  </div>
                  <p>{course.reason}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <a 
                  href={course.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-amber-600 hover:text-white hover:border-amber-600 dark:hover:bg-amber-600 dark:hover:border-amber-600 transition-colors shadow-2xs group-hover:shadow-xs"
                >
                  Start Course Module <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses match your filter"
          description="Try clearing your search query or selecting 'All Courses' to see full roadmap modules."
          actionLabel="Clear Filters"
          onAction={() => { setSearchQuery(''); setSelectedCategory('all'); }}
        />
      )}
    </div>
  );
}
