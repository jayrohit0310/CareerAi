import { useState, useEffect } from 'react';
import { getCourseRecommendations } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Search,
  Star,
  Filter,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

/* Category metadata with refined SaaS accents */
const CATEGORY_META = {
  ai: {
    label: 'AI & Machine Learning',
    gradient: 'from-blue-700 via-indigo-800 to-slate-900',
    tag: 'Artificial Intelligence',
    badgeVariant: 'blue'
  },
  fullstack: {
    label: 'Full-Stack Development',
    gradient: 'from-blue-600 via-blue-800 to-slate-900',
    tag: 'Full-Stack Engineering',
    badgeVariant: 'blue'
  },
  cloud: {
    label: 'Cloud & DevOps',
    gradient: 'from-indigo-700 via-blue-900 to-slate-900',
    tag: 'Cloud & DevOps',
    badgeVariant: 'indigo'
  },
  backend: {
    label: 'Backend & Systems',
    gradient: 'from-slate-800 via-slate-900 to-black',
    tag: 'Backend Architecture',
    badgeVariant: 'slate'
  },
};

/* Platform logo via Google favicon service */
const PlatformLogo = ({ platform, size = 18 }) => {
  const domains = {
    'DeepLearning.AI': 'deeplearning.ai',
    'Coursera': 'coursera.org',
    'Udemy': 'udemy.com',
    'edX': 'edx.org',
    'DataCamp': 'datacamp.com',
    'Frontend Masters': 'frontendmasters.com',
    'LinkedIn Learning': 'linkedin.com',
    'Pluralsight': 'pluralsight.com',
    'Google': 'google.com',
    'IBM': 'ibm.com'
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
const StarRating = ({ rating, reviews = '12K reviews' }) => {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="flex items-center text-amber-400">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="ml-1 font-extrabold text-[#172033] dark:text-slate-200">{rating}</span>
      </div>
      <span className="text-slate-400 dark:text-slate-500">·</span>
      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{reviews}</span>
    </div>
  );
};

/* Verified platform search & link resolver */
const PLATFORM_SEARCH = {
  'Coursera':         (t) => `https://www.coursera.org/search?query=${encodeURIComponent(t)}`,
  'Udemy':            (t) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(t)}`,
  'edX':              (t) => `https://www.edx.org/search?q=${encodeURIComponent(t)}`,
  'DataCamp':         (t) => `https://www.datacamp.com/search?q=${encodeURIComponent(t)}`,
  'Frontend Masters': (t) => `https://frontendmasters.com/search/?q=${encodeURIComponent(t)}`,
  'DeepLearning.AI':  (t) => `https://www.deeplearning.ai/search/?q=${encodeURIComponent(t)}`,
  'LinkedIn Learning':(t) => `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(t)}`,
};

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
    return rawUrl;
  }
  const searchFn = PLATFORM_SEARCH[platform];
  return searchFn ? searchFn(title) : `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + platform + ' course')}`;
}

const defaultCourses = [
  {
    title: 'AI For Everyone & Prompt Engineering',
    platform: 'DeepLearning.AI',
    instructor: 'Andrew Ng',
    category: 'ai',
    level: 'Beginner',
    duration: '1-4 Weeks',
    rating: 4.8,
    reviews: '53K reviews',
    students: '120,000+',
    skills: ['AI Strategy', 'Prompt Patterns', 'LLMs', 'Generative AI'],
    reason: 'The industry benchmark for understanding AI foundations and prompt engineering in modern workflows.',
    tagBadge: 'Preview',
    url: 'https://www.deeplearning.ai/courses/ai-for-everyone/',
  },
  {
    title: 'LangChain for LLM Application Development',
    platform: 'DeepLearning.AI',
    instructor: 'Harrison Chase',
    category: 'ai',
    level: 'Intermediate',
    duration: '2-4 Weeks',
    rating: 4.9,
    reviews: '34K reviews',
    students: '90,000+',
    skills: ['LangChain', 'RAG', 'Vector DB', 'Prompt Engineering'],
    reason: 'Taught by LangChain creator — the fastest path to building production RAG and agentic AI architectures.',
    tagBadge: 'Free Trial',
    url: 'https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/',
  },
  {
    title: 'Full-Stack React & Next.js Architecture',
    platform: 'Frontend Masters',
    instructor: 'Brian Holt',
    category: 'fullstack',
    level: 'Intermediate',
    duration: '4-6 Weeks',
    rating: 4.8,
    reviews: '18K reviews',
    students: '80,000+',
    skills: ['React', 'Next.js', 'TypeScript', 'Server Components'],
    reason: 'Production-grade React and Server Component patterns with state optimization.',
    tagBadge: 'Featured',
    url: 'https://frontendmasters.com/courses/complete-react-v8/',
  },
  {
    title: 'Docker & Kubernetes: The Practical Cloud Guide',
    platform: 'Udemy',
    instructor: 'Maximilian Schwarzmüller',
    category: 'cloud',
    level: 'Intermediate',
    duration: '3-5 Weeks',
    rating: 4.7,
    reviews: '42K reviews',
    students: '180,000+',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Container Security'],
    reason: 'From containerizing microservices to deploying high-availability clusters.',
    tagBadge: 'Free Trial',
    url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/',
  },
  {
    title: 'Data Engineering & Distributed Systems Certificate',
    platform: 'Coursera',
    instructor: 'IBM Professional',
    category: 'backend',
    level: 'Advanced',
    duration: '1-3 Months',
    rating: 4.6,
    reviews: '28K reviews',
    students: '80,000+',
    skills: ['Apache Spark', 'Kafka', 'Airflow', 'ETL Pipelines'],
    reason: 'End-to-end data pipelines, streaming ingestion, and query optimization.',
    tagBadge: 'Professional',
    url: 'https://www.coursera.org/professional-certificates/ibm-data-engineer',
  },
  {
    title: 'System Design Interview – An Insider’s Guide',
    platform: 'Coursera',
    instructor: 'Alex Xu',
    category: 'backend',
    level: 'Advanced',
    duration: '4-8 Weeks',
    rating: 4.9,
    reviews: '64K reviews',
    students: '150,000+',
    skills: ['Distributed Cache', 'Sharding', 'Rate Limiting', 'Message Queues'],
    reason: 'Directly addresses architectural deep dives required in tier-1 tech interviews.',
    tagBadge: 'Top Match',
    url: 'https://www.coursera.org/search?query=System+Design',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Courses' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'cloud', label: 'Cloud & DevOps' },
  { id: 'backend', label: 'Backend Systems' },
];

/* Course Card (Inspired directly by Reference Image 2 Coursera Card) */
function CourseCard({ course }) {
  const meta = CATEGORY_META[course.category] || CATEGORY_META['fullstack'];

  return (
    <Card hover className="flex flex-col overflow-hidden border border-[#E5EAF1] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs transition-all duration-200">
      
      {/* Top Banner / Image Area */}
      <div className={`relative h-40 bg-gradient-to-tr ${meta.gradient} p-4 flex flex-col justify-between text-white overflow-hidden`}>
        <div className="flex items-center justify-between z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-bold tracking-wide uppercase">
            {meta.tag}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold">
            {course.tagBadge || 'Course'}
          </span>
        </div>

        {/* Course Title Preview on Banner */}
        <div className="z-10">
          <h4 className="text-base font-extrabold line-clamp-2 drop-shadow-xs">
            {course.title}
          </h4>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        {/* Provider / Instructor row */}
        <div className="flex items-center gap-2">
          <PlatformLogo platform={course.platform} size={20} />
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#172033] dark:text-slate-200 truncate block">
              {course.platform}
            </span>
            {course.instructor && (
              <span className="text-[11px] text-slate-400 block -mt-0.5 truncate">
                {course.instructor}
              </span>
            )}
          </div>
        </div>

        {/* Full Title */}
        <h3 className="text-sm font-bold text-[#172033] dark:text-slate-100 line-clamp-2 leading-snug">
          {course.title}
        </h3>

        {/* Skills You'll Gain */}
        {course.skills && course.skills.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Skills you'll gain:
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {course.skills.join(', ')}
            </p>
          </div>
        )}

        {/* Rating and Duration / Level */}
        <div className="pt-2 border-t border-[#E5EAF1] dark:border-slate-800 space-y-2">
          <StarRating rating={course.rating || 4.8} reviews={course.reviews || '24K reviews'} />
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{course.level} · Course · {course.duration}</span>
          </div>
        </div>

        {/* AI Recommendation Reason */}
        {course.reason && (
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-950 dark:text-blue-200 leading-relaxed">
            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Recommended for You:
            </span>
            {course.reason}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 mt-auto">
          <a
            href={course.url}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#172B4D] hover:bg-blue-600 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-2xs"
          >
            <span>Open Course</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </Card>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourseRecommendations();
        if (data && data.courses && data.courses.length > 0) {
          const merged = data.courses.map((c) => {
            const platform = c.platform || 'Coursera';
            const title = c.title || '';
            const safeUrl = resolveUrl(platform, title, c.url);
            return {
              category: 'fullstack',
              level: 'Intermediate',
              duration: '3-4 Weeks',
              rating: 4.8,
              reviews: '28K reviews',
              skills: [],
              ...c,
              url: safeUrl,
              platform,
              title,
            };
          });
          setCourses(merged);
        } else {
          setCourses(defaultCourses);
        }
      } catch (err) {
        console.warn('Backend courses endpoint unreachable, showing curated learning catalog', err);
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
    const matchesLevel = selectedLevel === 'all' || (c.level || '').toLowerCase().includes(selectedLevel);
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAF1] dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            Curated Upskilling Catalog
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] dark:text-slate-100">
            Recommended Courses & Certifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Targeted at bridging detected skill gaps and interview weaknesses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">
            {filteredCourses.length} Learning Pathways Available
          </Badge>
        </div>
      </div>

      {/* Filter & Search Toolbar (Reference Image 2: "Filter & Sort (1)", Topic, Level, Clear all) */}
      <Card className="p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="What do you want to learn? (e.g. LangChain, React, Kubernetes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-[#E5EAF1] dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs sm:text-sm text-[#172033] dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick Clear All Button */}
          {(searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLevel('all'); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 self-start md:self-center"
            >
              <RotateCcw className="w-3 h-3" /> Clear all filters
            </button>
          )}
        </div>

        {/* Filter Pills Row (Reference Image 2 style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-[#E5EAF1] dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Topic:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <span className="text-xs font-bold text-slate-400 ml-3 mr-1">Level:</span>
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs capitalize font-medium transition-colors ${
                selectedLevel === lvl
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </Card>

      {/* Course Catalog Grid (Reference Image 2: Grid of cards) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-[#E5EAF1] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 animate-pulse">
              <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <CourseCard key={idx} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try broadening your search keyword or clearing category filters."
          actionLabel="Reset Filters"
          onAction={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLevel('all'); }}
        />
      )}

    </div>
  );
}
