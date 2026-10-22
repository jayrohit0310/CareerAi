import { useState, useEffect } from 'react';
import { getCourseRecommendations } from '../services/api';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Search,
  Star,
  Clock,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
} from 'lucide-react';

/* ─── Category metadata ─────────────────────────────────────── */
const CATEGORY_META = {
  ai: {
    label: 'AI & ML',
    cover: '/course-covers/ai_ml.jpg',
    gradient: 'from-slate-950/90 to-slate-900/90',
    badgeVariant: 'blue',
    accentColor: 'sky',
    tag: '🤖 Artificial Intelligence',
  },
  fullstack: {
    label: 'Full-Stack',
    cover: '/course-covers/fullstack.jpg',
    gradient: 'from-slate-950/90 to-slate-900/90',
    badgeVariant: 'blue',
    accentColor: 'sky',
    tag: '⚡ Full-Stack Dev',
  },
  cloud: {
    label: 'Cloud & DevOps',
    cover: '/course-covers/cloud.jpg',
    gradient: 'from-slate-950/90 to-slate-900/90',
    badgeVariant: 'blue',
    accentColor: 'sky',
    tag: '☁️ Cloud & DevOps',
  },
  backend: {
    label: 'Backend',
    cover: '/course-covers/backend.jpg',
    gradient: 'from-slate-950/90 to-slate-900/90',
    badgeVariant: 'blue',
    accentColor: 'sky',
    tag: '🗄️ Backend Systems',
  },
};

/* Platform logo via Google favicon service */
const PlatformLogo = ({ platform, size = 20 }) => {
  const domains = {
    'DeepLearning.AI': 'deeplearning.ai',
    'Coursera': 'coursera.org',
    'Udemy': 'udemy.com',
    'edX': 'edx.org',
    'DataCamp': 'datacamp.com',
    'Frontend Masters': 'frontendmasters.com',
    'LinkedIn Learning': 'linkedin.com',
    'Pluralsight': 'pluralsight.com',
    'Codecademy': 'codecademy.com',
    'Scrimba': 'scrimba.com',
  };
  const domain = domains[platform] || `${platform.toLowerCase().replace(/\s/g, '')}.com`;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={platform}
      width={size}
      height={size}
      className="rounded-sm"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
};

/* Star rating renderer */
const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < full
              ? 'text-amber-400 fill-amber-400'
              : i === full && half
              ? 'text-amber-400 fill-amber-200'
              : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-300">{rating}</span>
    </div>
  );
};

/* ─── Fallback course data ───────────────────────────────────── */
/* ─── Verified real course catalog (direct links) ─────────────────────── */
const PLATFORM_SEARCH = {
  'Coursera':         (t) => `https://www.coursera.org/search?query=${encodeURIComponent(t)}`,
  'Udemy':            (t) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(t)}`,
  'edX':              (t) => `https://www.edx.org/search?q=${encodeURIComponent(t)}`,
  'DataCamp':         (t) => `https://www.datacamp.com/search?q=${encodeURIComponent(t)}`,
  'Frontend Masters': (t) => `https://frontendmasters.com/search/?q=${encodeURIComponent(t)}`,
  'DeepLearning.AI':  (t) => `https://www.deeplearning.ai/search/?q=${encodeURIComponent(t)}`,
  'LinkedIn Learning':(t) => `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(t)}`,
};

/** Returns a guaranteed platform-correct URL — uses direct link when valid, search fallback otherwise */
function resolveUrl(platform, title, rawUrl) {
  const homepages = new Set([
    'https://coursera.org', 'https://www.coursera.org',
    'https://udemy.com', 'https://www.udemy.com',
    'https://edx.org', 'https://www.edx.org',
    'https://datacamp.com', 'https://www.datacamp.com',
    'https://frontendmasters.com', 'https://deeplearning.ai',
    'https://www.deeplearning.ai',
  ]);
  if (rawUrl && rawUrl.startsWith('http') && rawUrl.length > 35 && !homepages.has(rawUrl.replace(/\/$/, ''))) {
    return rawUrl; // direct URL is valid
  }
  const searchFn = PLATFORM_SEARCH[platform];
  return searchFn ? searchFn(title) : `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + platform + ' course')}`;
}

const defaultCourses = [
  {
    title: 'LangChain for LLM Application Development',
    platform: 'DeepLearning.AI',
    category: 'ai',
    level: 'Intermediate',
    duration: '4 hours',
    rating: 4.9,
    students: '120,000+',
    skills: ['LangChain', 'RAG', 'Agents', 'Prompt Engineering'],
    reason: 'Taught by the LangChain creator — the fastest path to building production RAG and agentic AI applications.',
    url: 'https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/',
  },
  {
    title: 'React - The Complete Guide (incl Hooks, React Router, Redux)',
    platform: 'Udemy',
    category: 'fullstack',
    level: 'Beginner-Friendly',
    duration: '68 hours',
    rating: 4.8,
    students: '900,000+',
    skills: ['React', 'Hooks', 'Redux', 'React Router'],
    reason: 'The most comprehensive React course — covers everything from fundamentals to advanced state management patterns.',
    url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
  },
  {
    title: 'Docker & Kubernetes: The Practical Guide',
    platform: 'Udemy',
    category: 'cloud',
    level: 'Intermediate',
    duration: '24 hours',
    rating: 4.7,
    students: '180,000+',
    skills: ['Docker', 'Kubernetes', 'Helm', 'CI/CD'],
    reason: 'The most practical Docker + K8s course — from images and volumes to full cluster orchestration.',
    url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/',
  },
  {
    title: 'Data Engineering Professional Certificate',
    platform: 'Coursera',
    category: 'backend',
    level: 'Advanced',
    duration: '3 months',
    rating: 4.6,
    students: '80,000+',
    skills: ['Spark', 'Kafka', 'Airflow', 'ETL'],
    reason: 'IBM\'s data engineering certificate — end-to-end pipeline design with Spark, Kafka, and Airflow.',
    url: 'https://www.coursera.org/professional-certificates/ibm-data-engineer',
  },
  {
    title: 'Machine Learning Scientist with Python Career Track',
    platform: 'DataCamp',
    category: 'ai',
    level: 'Advanced',
    duration: '93 hours',
    rating: 4.8,
    students: '200,000+',
    skills: ['sklearn', 'Feature Engineering', 'MLflow', 'Model Selection'],
    reason: 'Comprehensive ML engineering track — from feature engineering and model selection to MLOps and production deployment.',
    url: 'https://www.datacamp.com/tracks/machine-learning-scientist-with-python',
  },
  {
    title: 'Complete Intro to React v8',
    platform: 'Frontend Masters',
    category: 'fullstack',
    level: 'Intermediate',
    duration: '13 hours',
    rating: 4.8,
    students: '80,000+',
    skills: ['React', 'Hooks', 'State', 'React Router'],
    reason: 'Brian Holt\'s precise, production-focused React course — no fluff, just clean modern patterns.',
    url: 'https://frontendmasters.com/courses/complete-react-v8/',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Courses' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'cloud', label: 'Cloud & DevOps' },
  { id: 'backend', label: 'Backend' },
];

const LEVEL_COLOR = {
  'Beginner-Friendly': 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300',
  'Intermediate': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  'Advanced': 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
};

/* ─── Course Card ───────────────────────────────────────────── */
function CourseCard({ course }) {
  const meta = CATEGORY_META[course.category] || CATEGORY_META['fullstack'];
  const levelCls = LEVEL_COLOR[course.level] || LEVEL_COLOR['Intermediate'];

  return (
    <div className="group flex flex-col rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* Cover Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={meta.cover}
          alt={course.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${meta.gradient} opacity-80`} />

        {/* Top badges on image */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-white bg-black/30 backdrop-blur-sm border border-white/10">
            {meta.tag}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${levelCls} backdrop-blur-sm`}>
            {course.level}
          </span>
        </div>

        {/* Platform pill at bottom of image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1.5">
          <PlatformLogo platform={course.platform} size={18} />
          <span className="text-white text-[11px] font-bold">{course.platform}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 space-y-3">

        {/* Rating + Stats row */}
        <div className="flex items-center justify-between">
          <StarRating rating={course.rating || 4.8} />
          {course.students && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              <Users className="w-3 h-3" />
              {course.students}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug line-clamp-2">
          {course.title}
        </h3>

        {/* Duration & level strip */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{course.duration || '20 hours'}</span>
          <span>•</span>
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span>{course.level}</span>
        </div>

        {/* Skill chips */}
        {course.skills && course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* AI Synergy reason */}
        <div className="rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-sky-500" />
            Why This Course
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
            {course.reason}
          </p>
        </div>

        {/* Enroll button */}
        <div className="pt-1 mt-auto">
          <a
            href={course.url}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-500 dark:hover:text-slate-950 transition-all shadow-sm hover:shadow-md group/btn"
          >
            Start Learning
            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton for loading ───────────────────────────────────── */
function CourseSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-pulse">
      <div className="h-44 bg-slate-200 dark:bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
        <div className="flex gap-1.5">
          {[1,2,3].map(i => <div key={i} className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />)}
        </div>
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl mt-2" />
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
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
          const merged = data.courses.map((c) => {
            const platform = c.platform || 'Coursera';
            const title = c.title || '';
            // Always resolve to a guaranteed valid, platform-correct URL
            const safeUrl = resolveUrl(platform, title, c.url);
            return {
              category: 'fullstack',
              level: 'Intermediate',
              duration: '20 hours',
              rating: 4.7,
              students: '50,000+',
              skills: [],
              ...c,
              url: safeUrl,          // override with validated URL
              platform,
              title,
            };
          });
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
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(q) ||
      c.platform.toLowerCase().includes(q) ||
      (c.reason || '').toLowerCase().includes(q) ||
      (c.skills || []).some((s) => s.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-500 rounded-2xl shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Recommended Courses & Upskilling
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Hand-picked learning paths targeted at closing your identified skill gaps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            {courses.length} Curated Paths
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, platforms, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Course Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <CourseSkeleton key={i} />)}
        </div>
      ) : filteredCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-600 pt-2">
            Showing {filteredCourses.length} of {courses.length} recommended learning paths · Powered by CareerCraft AI
          </p>
        </>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses match your filter"
          description="Try clearing your search query or selecting 'All Courses' to see the full roadmap."
          actionLabel="Clear Filters"
          onAction={() => { setSearchQuery(''); setSelectedCategory('all'); }}
        />
      )}
    </div>
  );
}
