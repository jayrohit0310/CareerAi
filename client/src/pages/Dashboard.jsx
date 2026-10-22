import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api, updateSkills, getInterviewAnalytics, getInterviewHistory } from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
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
  Activity,
  RefreshCw,
  Award,
  AlertTriangle,
  Play
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
    'Docker', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'AWS', 'Kubernetes'
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
    setUploadStatus('');
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

  // Drag and drop reordering handlers for skills
  const handleDragStart = (index, e) => {
    setDraggedSkillIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or custom drag preview
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
    toast.success(`Repositioned "${draggedItem}" in your priority list.`, 'Order Updated');

    try {
      await updateSkills(reordered);
    } catch (err) {
      console.warn('Could not sync skills order to server:', err);
    }
  };

  const readinessScore = Math.min(100, Math.max(35, skills.length * 14));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 dark:bg-[#0b0f19] border border-slate-800 p-7 sm:p-9 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-950/60 border border-sky-800/60 rounded-full text-xs font-semibold text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI Career Copilot Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.email ? user.email.split('@')[0] : 'Engineer'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Your talent intelligence dashboard is synced. Upload an updated resume or adjust your prioritized skills below to unlock new role matches, mock questions, and benchmarked salaries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="md"
              icon={UploadCloud}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md border-transparent"
            >
              Upload PDF Resume
            </Button>
            <Button
              onClick={handleLoadSample}
              variant="outline"
              size="md"
              icon={RefreshCw}
              className="text-white border-slate-700 hover:bg-slate-800/80"
            >
              Try Sample Data
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card hover className="p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Identified Skills</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{skills.length}</div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center">
              +3 verified ↑
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {skills.length > 0 ? 'Extracted & prioritized' : 'Add skills to analyze'}
          </p>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Profile Match Score</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">{readinessScore}%</div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
              Strong
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div 
              className="bg-sky-500 h-2 rounded-full transition-all duration-700" 
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Target Compensation</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">₹24 LPA+</div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
              Top 20%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Median benchmark for skills</p>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Interview Mastery</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {interviewAnalytics?.total_completed > 0 ? `${interviewAnalytics.average_score_10}/10` : 'Ready'}
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
              {interviewAnalytics?.total_completed > 0 ? `${interviewAnalytics.total_completed} Done` : 'Configurable'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {interviewAnalytics?.total_completed > 0 ? 'Avg Mock Interview Score' : 'STAR Evaluation enabled'}
          </p>
        </Card>
      </div>

      {/* Main Grid: Left Upload & Draggable Skills, Right Insights & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Drag & Drop Resume and Draggable Skills */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Resume Parser</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">PDF skill & experience extractor</p>
              </div>
            </div>
            
            {/* High-Fidelity Drag & Drop Zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDropFile}
              className={`
                border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer
                ${
                  isDraggingFile 
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 scale-[1.02] shadow-lg ring-4 ring-blue-500/10' 
                    : isUploading 
                    ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative inline-block mb-3">
                <UploadCloud 
                  className={`w-12 h-12 mx-auto transition-transform duration-200 ${
                    isUploading ? 'animate-bounce text-blue-600' : isDraggingFile ? 'scale-110 text-blue-600' : 'text-slate-400 dark:text-slate-500'
                  }`} 
                />
                {isDraggingFile && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                )}
              </div>

              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                {isUploading ? (uploadStatus || 'Parsing document with AI...') : isDraggingFile ? 'Drop your PDF right here!' : 'Drag & drop your resume PDF'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Click or drop files up to 5MB (PDF only)
              </p>
              
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              
              <Button 
                variant="secondary"
                size="sm"
                fullWidth
                disabled={isUploading}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse PDF File
              </Button>
            </div>

            {/* Uploaded File Pill Indicator */}
            {skills.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{uploadedFileName}</span>
                </div>
                <Badge variant="emerald" size="sm">Active</Badge>
              </div>
            )}

            {/* Draggable Skills Management Section */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Talent Inventory</span>
                  <Badge variant="blue" size="sm">{skills.length}</Badge>
                </h3>
                <span className="text-[10px] text-slate-400">Drag to reorder</span>
              </div>

              {/* Add Custom Skill Form */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add skill (e.g. PyTorch)..."
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
                />
              </div>

              {/* Smooth Draggable Skills Chips Container */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto p-1 no-scrollbar">
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
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xs'
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
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic p-3 text-center">
                    No skills registered. Upload your resume or click suggestions below.
                  </p>
                )}
              </div>

              {/* Quick Add Suggested Chips */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
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
        </div>

        {/* Right Column: AI Analysis & Quick Action Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Matches Highlights Banner */}
          <Card className="p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Career Pathway Evaluation</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Real-time matching against high-demand industry profiles</p>
              </div>
              <Badge variant="blue" size="md" dot>
                Market Verified
              </Badge>
            </div>

            {skills.length > 0 ? (
              <div className="space-y-5">
                <div className="bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Top Match Ready</span>
                    <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-lg sm:text-xl">
                      Senior Full-Stack & AI Systems Engineer
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Your skill inventory shows a 94% compatibility with modern generative AI and cloud engineering architectures.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/career-report')} 
                    variant="primary"
                    size="md"
                    className="shrink-0 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                    iconRight={ArrowRight}
                  >
                    View Matches
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Primary Focus</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Software & AI</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Top Verified Skills</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate block">
                      {skills.slice(0, 3).join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Recommended Next Step</span>
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400 truncate block">
                      Take Mock Interview
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No skills identified yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Upload a PDF resume or click "Try Sample Data" to activate AI career reports.</p>
              </div>
            )}
          </Card>

          {/* AI Mock Interview Mastery & History Section */}
          <Card className="p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-sky-500" />
                  Interview Preparation & Performance Mastery
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Track your evaluation scores, difficulty progression, and weak topic improvements
                </p>
              </div>
              <Button
                onClick={() => navigate('/interview')}
                variant="primary"
                size="sm"
                iconRight={ArrowRight}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
              >
                Launch Simulator
              </Button>
            </div>

            {interviewAnalytics && interviewAnalytics.total_completed > 0 ? (
              <div className="space-y-5">
                {/* 3 Difficulty Level Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Beginner Tier
                    </span>
                    <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
                      {interviewAnalytics.difficulty_stats?.beginner?.avg_score || 0} / 10
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {interviewAnalytics.difficulty_stats?.beginner?.count || 0} sessions completed
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Intermediate Tier
                    </span>
                    <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
                      {interviewAnalytics.difficulty_stats?.intermediate?.avg_score || 0} / 10
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {interviewAnalytics.difficulty_stats?.intermediate?.count || 0} sessions completed
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Advanced Tier
                    </span>
                    <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
                      {interviewAnalytics.difficulty_stats?.advanced?.avg_score || 0} / 10
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {interviewAnalytics.difficulty_stats?.advanced?.count || 0} sessions completed
                    </span>
                  </div>
                </div>

                {/* Weak Topics & Next Recommended Practice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2 flex items-center gap-1.5 text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5" /> Frequent Focus Areas Identified:
                    </span>
                    {interviewAnalytics.weak_topics?.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                        {interviewAnalytics.weak_topics.map((wt, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500">•</span>
                            <span>{wt}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 italic">No recurring weaknesses detected. Great job!</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs">
                    <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                      Suggested Next Practice Session:
                    </span>
                    <p className="text-purple-700 dark:text-purple-300 mb-3 font-semibold">
                      {interviewAnalytics.recommended_next_session?.label || '15-Min Intermediate Mock'}
                    </p>
                    <Button
                      onClick={() => navigate('/interview')}
                      variant="primary"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-500 text-xs"
                    >
                      Start Recommended Session
                    </Button>
                  </div>
                </div>

                {/* Recent Interview History Feed */}
                {recentInterviews.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Recent Interview Sessions
                    </h3>
                    <div className="space-y-2">
                      {recentInterviews.map((sess) => (
                        <div key={sess.session_id} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                              {sess.interview_type} ({sess.difficulty})
                            </span>
                            <span className="text-slate-400 block text-[11px]">
                              {sess.started_at ? new Date(sess.started_at).toLocaleDateString() : 'Recent'} • {sess.duration_minutes}m
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {sess.overall_score !== null && (
                              <Badge variant={sess.overall_score >= 8.0 ? 'emerald' : 'purple'} size="sm">
                                {sess.overall_score} / 10
                              </Badge>
                            )}
                            <button
                              type="button"
                              onClick={() => navigate('/interview')}
                              className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
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
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <Mic className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No mock interviews completed yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-4">
                  Test your engineering knowledge against custom time limits, configure beginner to advanced difficulties, and receive STAR feedback grounded in your resume.
                </p>
                <Button
                  onClick={() => navigate('/interview')}
                  variant="primary"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500"
                  icon={Play}
                >
                  Start First Practice Session
                </Button>
              </div>
            )}
          </Card>


          {/* Action Grid: 4 Modern Interactive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InteractiveActionCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Salary Benchmark"
              badge="Updated"
              description="Calculate your market value percentile across experience levels, tech hubs, and verified skills."
              onClick={() => navigate('/results')}
              colorClass="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/60"
            />
            <InteractiveActionCard 
              icon={<Mic className="w-6 h-6" />}
              title="AI Mock Interviews"
              badge="Voice Practice"
              description="Rehearse real technical & behavioral questions with real-time speech dictation and STAR feedback."
              onClick={() => navigate('/interview')}
              colorClass="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/60"
            />
            <InteractiveActionCard 
              icon={<BookOpen className="w-6 h-6" />}
              title="Targeted Courses"
              badge="Upskilling"
              description="Discover hand-picked educational modules specifically aligned to close your detected skill gaps."
              onClick={() => navigate('/courses')}
              colorClass="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/60"
            />
            <InteractiveActionCard 
              icon={<Briefcase className="w-6 h-6" />}
              title="Curated Job Listings"
              badge="Active Postings"
              description="Explore vetted positions matching your exact skill profile, compensation target, and work type."
              onClick={() => navigate('/jobs')}
              colorClass="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/60"
            />
          </div>

          {/* Recent Activity Timeline Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" />
                Recent System Activity
              </h3>
              <span className="text-xs text-slate-400">Real-time sync</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Resume parsed and evaluated</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Identified {skills.length} competencies ready for market matching.</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">Just now</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200">AI Career Coach primed</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Contextual advisor available 24/7 for interview coaching.</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">1h ago</span>
              </div>
            </div>
          </Card>
          
        </div>
      </div>
    </div>
  );
}

function InteractiveActionCard({ icon, title, badge, description, onClick, colorClass }) {
  return (
    <Card 
      hover 
      onClick={onClick}
      className="p-6 flex flex-col cursor-pointer group hover:border-sky-400 dark:hover:border-sky-600 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl border ${colorClass} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
        {badge && (
          <Badge variant="blue" size="sm">
            {badge}
          </Badge>
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-5 flex-1 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors mt-auto">
        Explore Tool <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Card>
  );
}
