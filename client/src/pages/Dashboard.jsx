import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api, updateSkills, getInterviewAnalytics, getInterviewHistory } from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressRing from '../components/ui/ProgressRing';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Mic, 
  BookOpen, 
  Briefcase, 
  Sparkles, 
  Plus, 
  X, 
  Target, 
  CheckCheck,
  GripVertical,
  RefreshCw,
  Award,
  Play,
  UserRoundCheck,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { user, setUser } = useOutletContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('Senior_Software_Engineer_Resume.pdf');
  
  // Drag-and-drop skills reordering state
  const [draggedSkillIndex, setDraggedSkillIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Mock interview analytics state
  const [interviewAnalytics, setInterviewAnalytics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const suggestedSkills = [
    'Python', 'React', 'FastAPI', 'Machine Learning', 
    'Docker', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'AWS', 'System Design'
  ];

  useEffect(() => {
    if (user?.extracted_skills) {
      const parsed = user.extracted_skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      setSkills(parsed);
    }
  }, [user]);

  useEffect(() => {
    const loadInterviewData = async () => {
      try {
        const [analytics, history] = await Promise.all([
          getInterviewAnalytics(),
          getInterviewHistory()
        ]);
        setInterviewAnalytics(analytics);
        setRecentInterviews((history.history || []).slice(0, 4));
      } catch (err) {
        console.warn('Could not load interview analytics:', err);
      }
    };
    loadInterviewData();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      toast.error('Please upload a valid PDF or DOCX resume document.', 'Invalid Format');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    setUploadStatus('Parsing document with AI...');
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const name = res.data.filename || file.name;
      setUploadedFileName(name);
      toast.success(`${name} parsed and skills extracted!`, 'Resume Processed');
      if (res.data.skills) {
        setSkills(res.data.skills);
        setUser(prev => ({ ...prev, extracted_skills: res.data.skills.join(',') }));
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to upload resume. Make sure backend is running.';
      toast.error(errMsg, 'Upload Error');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddSkill = async (skillToAdd) => {
    const s = (skillToAdd || customSkill).trim();
    if (!s) return;
    if (skills.some(existing => existing.toLowerCase() === s.toLowerCase())) {
      toast.info(`"${s}" is already in your skills list.`, 'Duplicate Skill');
      return;
    }
    const newSkills = [...skills, s];
    setSkills(newSkills);
    setCustomSkill('');
    setUser(prev => ({ ...prev, extracted_skills: newSkills.join(',') }));
    toast.success(`Added "${s}" to your profile.`, 'Skill Added');
    try {
      await updateSkills(newSkills);
    } catch (err) {
      console.warn('Could not sync skills to server:', err);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    setSkills(newSkills);
    setUser(prev => ({ ...prev, extracted_skills: newSkills.join(',') }));
    toast.info(`Removed "${skillToRemove}".`, 'Skill Removed');
    try {
      await updateSkills(newSkills);
    } catch (err) {
      console.warn('Could not sync skills to server:', err);
    }
  };

  const handleLoadSample = async () => {
    const sampleSkills = ['Python', 'FastAPI', 'React', 'Docker', 'Machine Learning', 'PostgreSQL', 'TypeScript'];
    setSkills(sampleSkills);
    setUser(prev => ({ ...prev, extracted_skills: sampleSkills.join(',') }));
    setUploadedFileName('Sample_FullStack_Engineer.pdf');
    toast.success('Loaded sample engineering candidate profile with 7 skills!', 'Sample Profile Loaded');
    try {
      await updateSkills(sampleSkills);
    } catch (err) {
      console.warn('Could not sync skills to server:', err);
    }
  };

  // Drag and drop reordering handlers
  const handleDragStart = (index, e) => {
    setDraggedSkillIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedSkillIndex(null);
    setDragOverIndex(null);
  };

  const handleDropSkill = async (dropIndex) => {
    if (draggedSkillIndex === null || draggedSkillIndex === dropIndex) {
      setDraggedSkillIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...skills];
    const [draggedItem] = reordered.splice(draggedSkillIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);

    setSkills(reordered);
    setUser(prev => ({ ...prev, extracted_skills: reordered.join(',') }));
    setDraggedSkillIndex(null);
    setDragOverIndex(null);
    toast.success(`Repositioned "${draggedItem}" in priority order.`, 'Order Updated');

    try {
      await updateSkills(reordered);
    } catch (err) {
      console.warn('Could not sync skills order to server:', err);
    }
  };

  const readinessScore = Math.min(100, Math.max(40, skills.length * 12 + (interviewAnalytics?.total_completed ? 15 : 0)));
  const userName = user?.email ? user.email.split('@')[0] : 'Candidate';

  return (
    <div className="space-y-7 animate-fade-in">
      {/* 1. Top Welcome Banner (Clean SaaS Hero) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172B4D] via-[#1E3A67] to-[#172B4D] border border-slate-700/60 p-6 sm:p-8 text-white shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/15 rounded-full text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI-Powered Career Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Your profile is synced. Practice STAR-structured mock interviews, analyze your skills readiness, and unlock benchmarked salaries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate('/interview')}
              variant="primary"
              size="md"
              icon={Mic}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
            >
              Start Practice Interview
            </Button>
            <Button
              onClick={handleLoadSample}
              variant="outline"
              size="md"
              icon={RefreshCw}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Load Sample Data
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Score */}
        <Card hover className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Readiness Score
            </span>
            <div className="text-2xl font-extrabold text-[#172033] dark:text-slate-100">
              {readinessScore}%
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Market Aligned
            </span>
          </div>
          <ProgressRing 
            value={readinessScore} 
            size={56} 
            strokeWidth={6} 
            color="#2563EB"
          />
        </Card>

        {/* Total Interviews */}
        <Card hover className="p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interviews Completed</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <UserRoundCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-[#172033] dark:text-slate-100">
              {interviewAnalytics?.total_completed || 0}
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {interviewAnalytics?.total_completed > 0 ? 'Active' : 'Get Started'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {interviewAnalytics?.total_completed > 0 ? `Avg: ${interviewAnalytics.average_score_10}/10 score` : 'STAR evaluation ready'}
          </p>
        </Card>

        {/* Identified Skills */}
        <Card hover className="p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Identified Skills</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-[#172033] dark:text-slate-100">
              {skills.length}
            </div>
            <Badge variant="emerald" size="sm">
              Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {skills.length > 0 ? 'Prioritized in talent stack' : 'Add skills to start'}
          </p>
        </Card>

        {/* Target Compensation */}
        <Card hover className="p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Benchmark</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-[#172033] dark:text-slate-100">
              ₹24 LPA+
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              Top 20%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Median Indian tech benchmark
          </p>
        </Card>
      </div>

      {/* 3. Main Multi-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        
        {/* Left Column (2 Cols Wide): Resume, Priority Skills & Interview Performance */}
        <div className="lg:col-span-2 space-y-6">

          {/* Continue Learning / Fast Track Banner (Inspired by Reference Image 3 Campus LMS) */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Recommended Session
                </span>
                <h3 className="text-lg font-bold text-white pt-1">
                  Full-Stack & Systems Architecture Interview
                </h3>
                <p className="text-xs text-blue-100">
                  Intermediate Difficulty • 15 Minutes • AI Real-time Audio & STAR Critique
                </p>
              </div>
              <Button
                onClick={() => navigate('/interview')}
                variant="black"
                size="md"
                iconRight={ArrowRight}
                className="shrink-0 bg-white text-blue-900 hover:bg-blue-50 border-transparent shadow-sm font-bold"
              >
                Start Simulator
              </Button>
            </div>
          </div>

          {/* Resume Upload & Draggable Priority Skills */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#172033] dark:text-slate-100">Resume & Talent Inventory</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PDF skill extractor with priority reordering</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={UploadCloud}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Upload Resume
              </Button>
            </div>

            {/* Drag & Drop Upload Dropzone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDropFile}
              className={`
                border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer
                ${
                  isDraggingFile 
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 scale-[1.01] shadow-xs' 
                    : isUploading 
                    ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20' 
                    : 'border-[#E5EAF1] dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud 
                className={`w-9 h-9 mx-auto mb-2 transition-transform ${
                  isUploading ? 'animate-bounce text-blue-600' : 'text-slate-400'
                }`} 
              />
              <p className="text-xs font-bold text-[#172033] dark:text-slate-200">
                {isUploading ? (uploadStatus || 'Parsing document with AI...') : isDraggingFile ? 'Drop your resume PDF here' : 'Drop your PDF resume or click to browse'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDF files up to 5MB
              </p>
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </div>

            {/* Active File Pill */}
            {uploadedFileName && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-[#E5EAF1] dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{uploadedFileName}</span>
                </div>
                <Badge variant="emerald" size="sm">Active</Badge>
              </div>
            )}

            {/* Draggable Skills Priority Manager */}
            <div className="mt-5 pt-5 border-t border-[#E5EAF1] dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider">
                    Prioritized Skills Stack
                  </h3>
                  <Badge variant="blue" size="sm">{skills.length}</Badge>
                </div>
                <span className="text-[11px] text-slate-400">Drag handle to reorder</span>
              </div>

              {/* Add Custom Skill Form */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. PyTorch, Kubernetes)..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="input-field text-xs py-2 px-3 flex-1"
                />
                <Button
                  onClick={() => handleAddSkill()}
                  disabled={!customSkill.trim()}
                  variant="primary"
                  size="sm"
                  icon={Plus}
                >
                  Add
                </Button>
              </div>

              {/* Skills Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar p-0.5">
                {skills.length > 0 ? (
                  skills.map((skill, index) => {
                    const isBeingDragged = draggedSkillIndex === index;
                    const isDropTarget = dragOverIndex === index;

                    return (
                      <div
                        key={skill}
                        draggable
                        onDragStart={(e) => handleDragStart(index, e)}
                        onDragOver={(e) => handleDragOver(index, e)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDropSkill(index)}
                        className={`
                          group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold
                          border transition-all duration-150 cursor-grab active:cursor-grabbing select-none
                          ${
                            isBeingDragged
                              ? 'opacity-40 scale-95 border-dashed border-blue-500 bg-blue-50/50'
                              : isDropTarget
                              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/60 scale-[1.02]'
                              : 'bg-white dark:bg-slate-800/80 border-[#E5EAF1] dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-600'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 shrink-0 transition-colors" />
                          <span className="truncate">{skill}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 group-hover:hidden">#{index + 1}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 rounded transition-colors"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 text-center sm:col-span-2">
                    No skills identified yet. Upload your resume or click suggestions below.
                  </p>
                )}
              </div>

              {/* Quick Add Suggestions */}
              <div className="mt-3.5 pt-3 border-t border-[#E5EAF1] dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Suggested Additions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.filter(s => !skills.includes(s)).slice(0, 6).map((skill, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSkill(skill)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Interview Preparation & Tier Mastery */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-bold text-[#172033] dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Interview Preparation & Tier Mastery
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Performance across difficulty levels with AI STAR critique
                </p>
              </div>
              <Button
                onClick={() => navigate('/interview')}
                variant="outline"
                size="sm"
                iconRight={ArrowRight}
              >
                Open Simulator
              </Button>
            </div>

            {interviewAnalytics && interviewAnalytics.total_completed > 0 ? (
              <div className="space-y-4">
                {/* 3 Difficulty Tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-[#E5EAF1] dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Beginner Tier
                    </span>
                    <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      {interviewAnalytics.difficulty_stats?.beginner?.avg_score || 0} / 10
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {interviewAnalytics.difficulty_stats?.beginner?.count || 0} sessions completed
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-[#E5EAF1] dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Intermediate Tier
                    </span>
                    <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      {interviewAnalytics.difficulty_stats?.intermediate?.avg_score || 0} / 10
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {interviewAnalytics.difficulty_stats?.intermediate?.count || 0} sessions completed
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-[#E5EAF1] dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Advanced Tier
                    </span>
                    <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      {interviewAnalytics.difficulty_stats?.advanced?.avg_score || 0} / 10
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {interviewAnalytics.difficulty_stats?.advanced?.count || 0} sessions completed
                    </span>
                  </div>
                </div>

                {/* Recent Interview History Feed */}
                {recentInterviews.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                      Recent Interview History
                    </h3>
                    <div className="space-y-2">
                      {recentInterviews.map((sess) => (
                        <div key={sess.session_id} className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E5EAF1] dark:border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                              {sess.interview_type} ({sess.difficulty})
                            </span>
                            <span className="text-slate-400 block text-[11px] mt-0.5">
                              {sess.started_at ? new Date(sess.started_at).toLocaleDateString() : 'Recent'} • {sess.duration_minutes}m duration
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {sess.overall_score !== null && (
                              <Badge variant={sess.overall_score >= 8.0 ? 'emerald' : 'blue'} size="sm">
                                {sess.overall_score} / 10
                              </Badge>
                            )}
                            <button
                              type="button"
                              onClick={() => navigate('/interview')}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-xs"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-[#E5EAF1] dark:border-slate-700 text-center">
                <Mic className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No mock interviews completed yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-4">
                  Practice tailored questions with real-time speech dictation, timer constraints, and instant STAR critique.
                </p>
                <Button
                  onClick={() => navigate('/interview')}
                  variant="primary"
                  size="sm"
                  icon={Play}
                >
                  Start First Practice Session
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: "Your Journey" & Profile Card (Inspired by Reference Image 3 Campus & Image 5) */}
        <div className="space-y-6">
          
          {/* Your Journey Card */}
          <Card className="p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Journey</span>
              <Badge variant="blue" size="sm">Active</Badge>
            </div>

            {/* Profile Avatar with Progress Ring */}
            <div className="flex justify-center my-3">
              <div className="relative">
                <ProgressRing 
                  value={readinessScore} 
                  size={104} 
                  strokeWidth={8} 
                  color="#2563EB"
                  trackColor="#E5EAF1"
                >
                  <div className="w-16 h-16 rounded-full bg-[#172B4D] text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </ProgressRing>
                <span className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] ring-2 ring-white dark:ring-slate-900">
                  {readinessScore}%
                </span>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-[#172033] dark:text-slate-100">
              {userName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target: Senior Full-Stack & AI Systems
            </p>

            {/* Earned Skills Pill Cloud */}
            <div className="mt-5 pt-4 border-t border-[#E5EAF1] dark:border-slate-800 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Skills in Inventory ({skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 8).map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#172033] dark:text-slate-300 text-xs font-medium"
                  >
                    {sk}
                  </span>
                ))}
                {skills.length > 8 && (
                  <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    +{skills.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Next Steps Checklist (Inspired by Image 5) */}
            <div className="mt-5 pt-4 border-t border-[#E5EAF1] dark:border-slate-800 text-left space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Action Checklist
              </span>
              
              <div 
                onClick={() => navigate('/interview')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#172033] dark:text-slate-200">Practice Mock Interview</p>
                  <p className="text-[10px] text-slate-400">STAR structured evaluation</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              <div 
                onClick={() => navigate('/career-report')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#172033] dark:text-slate-200">Analyze Skill Gaps</p>
                  <p className="text-[10px] text-slate-400">Career GPS roadmap</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              <div 
                onClick={() => navigate('/courses')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#172033] dark:text-slate-200">Targeted Courses</p>
                  <p className="text-[10px] text-slate-400">Close critical skill gaps</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          </Card>

          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              hover 
              onClick={() => navigate('/career-report')}
              className="p-4 cursor-pointer text-left group"
            >
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 w-fit mb-2 group-hover:scale-105 transition-transform">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#172033] dark:text-slate-100">Career Match</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Top 3 fit roles</p>
            </Card>

            <Card 
              hover 
              onClick={() => navigate('/results')}
              className="p-4 cursor-pointer text-left group"
            >
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 w-fit mb-2 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#172033] dark:text-slate-100">Salary Tool</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Market percentiles</p>
            </Card>

            <Card 
              hover 
              onClick={() => navigate('/jobs')}
              className="p-4 cursor-pointer text-left group"
            >
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 w-fit mb-2 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#172033] dark:text-slate-100">Job Matches</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Active postings</p>
            </Card>

            <Card 
              hover 
              onClick={() => navigate('/chat')}
              className="p-4 cursor-pointer text-left group"
            >
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 w-fit mb-2 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#172033] dark:text-slate-100">AI Coach</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">24/7 prep assistant</p>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
