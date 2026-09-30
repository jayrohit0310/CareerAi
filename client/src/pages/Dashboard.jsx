import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api, updateSkills } from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
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
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user, setUser } = useOutletContext();
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const suggestedSkills = [
    'Python', 'React', 'FastAPI', 'Machine Learning', 
    'Docker', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'AWS'
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

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setUploadStatus('Please upload a valid PDF file.');
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
      setUploadStatus(`Success: ${res.data.filename || file.name} parsed!`);
      if (res.data.skills) {
        setSkills(res.data.skills);
        setUser(prev => ({ ...prev, extracted_skills: res.data.skills.join(',') }));
      }
    } catch (err) {
      setUploadStatus(err.response?.data?.detail || 'Failed to upload resume. Make sure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddSkill = async (skillToAdd) => {
    const s = (skillToAdd || customSkill).trim();
    if (!s || skills.includes(s)) return;
    const newSkills = [...skills, s];
    setSkills(newSkills);
    setCustomSkill('');
    setUser(prev => ({ ...prev, extracted_skills: newSkills.join(',') }));
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
    try {
      await updateSkills(newSkills);
    } catch (err) {
      console.warn('Could not sync skills to server:', err);
    }
  };

  const handleLoadSample = async () => {
    const sampleSkills = ['Python', 'FastAPI', 'React', 'Docker', 'Machine Learning', 'SQL'];
    setSkills(sampleSkills);
    setUser(prev => ({ ...prev, extracted_skills: sampleSkills.join(',') }));
    setUploadStatus('Loaded sample engineering profile!');
    try {
      await updateSkills(sampleSkills);
    } catch (err) {
      console.warn('Could not sync skills to server:', err);
    }
  };

  const readinessScore = Math.min(100, Math.max(35, skills.length * 15));

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            AI Career Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to CareerCraft AI
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Upload your resume or specify your skills below to unlock instant career reports, interview practice, salary benchmarks, and targeted jobs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow-md text-sm transition-all"
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            Upload Resume
          </button>
          <button
            onClick={handleLoadSample}
            className="inline-flex items-center justify-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold px-4 py-3 rounded-xl border border-white/20 text-sm transition-all"
          >
            Try Sample Data
          </button>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Identified Skills</span>
            <CheckCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{skills.length}</div>
          <p className="text-xs text-slate-500 mt-1">
            {skills.length > 0 ? 'Extracted & verified' : 'Add skills to analyze'}
          </p>
        </div>

        <div className="card-base p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Profile Match Score</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{readinessScore}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${readinessScore}%` }}
            ></div>
          </div>
        </div>

        <div className="card-base p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Salary Potential</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">$120k+</div>
          <p className="text-xs text-slate-500 mt-1">Based on market median</p>
        </div>

        <div className="card-base p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interview Status</span>
            <Mic className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600">Ready</div>
          <p className="text-xs text-slate-500 mt-1">AI Mock interviewer active</p>
        </div>
      </div>

      {/* Main Grid: Left Upload & Right Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Resume & Skills */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-base p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Resume Parser</h2>
                <p className="text-xs text-slate-500">Auto-extract skills & experience</p>
              </div>
            </div>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/70 scale-[1.01]' 
                  : isUploading 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
              }`}
            >
              <UploadCloud className={`w-12 h-12 mx-auto mb-3 transition-transform ${isUploading ? 'animate-bounce text-blue-600' : 'text-slate-400'}`} />
              <p className="text-sm font-semibold text-slate-800 mb-1">
                {isUploading ? 'Analyzing resume with AI...' : 'Drag & drop your resume PDF'}
              </p>
              <p className="text-xs text-slate-500 mb-4">Supports PDF up to 5MB</p>
              
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="btn-secondary w-full py-2.5 text-sm font-medium"
              >
                Browse PDF File
              </button>
              
              {uploadStatus && (
                <div className={`mt-4 p-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold ${
                  uploadStatus.includes('Success') || uploadStatus.includes('Loaded') 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {(uploadStatus.includes('Success') || uploadStatus.includes('Loaded')) && <CheckCircle className="w-4 h-4 shrink-0" />}
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>

            {/* Quick Skills Management */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Manage Skills</span>
                <span className="text-xs font-normal text-slate-500">{skills.length} added</span>
              </h3>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a skill (e.g. Python)"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="input-field text-xs py-2 px-3 flex-1"
                />
                <button
                  onClick={() => handleAddSkill()}
                  disabled={!customSkill.trim()}
                  className="btn-primary py-2 px-3 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 min-h-[50px] max-h-48 overflow-y-auto p-1">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 group"
                    >
                      {skill}
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-400 hover:text-blue-700 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills listed yet. Add one above or click suggestions below.</p>
                )}
              </div>

              {/* Suggested quick chips */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Quick Add Suggestions</span>
                <div className="flex flex-wrap gap-1">
                  {suggestedSkills.filter(s => !skills.includes(s)).slice(0, 5).map((skill, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSkill(skill)}
                      className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Action Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Matches Banner */}
          <div className="card-base p-6 bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">AI Career Pathway Evaluation</h2>
                <p className="text-sm text-slate-500">Real-time analysis based on your skill inventory</p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Market Verified
              </span>
            </div>

            {skills.length > 0 ? (
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Top Match Ready</span>
                    <h3 className="text-emerald-950 font-extrabold text-lg">Senior Full-Stack & AI Systems Engineer</h3>
                    <p className="text-emerald-700 text-sm">
                      Your skill profile shows strong synergy with high-demand software & AI roles.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/career-report')} 
                    className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                  >
                    View Matches <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">Primary Focus</span>
                    <span className="text-sm font-bold text-slate-900">Software & AI</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">Core Competencies</span>
                    <span className="text-sm font-bold text-slate-900">{skills.slice(0, 3).join(', ') || 'N/A'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">Recommended Action</span>
                    <span className="text-sm font-bold text-blue-600">Practice Mock Interview</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">No skills identified yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Upload a PDF resume or click "Try Sample Data" above to view full AI career pathway analytics.</p>
              </div>
            )}
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Salary Estimator"
              badge="Updated"
              description="Get an AI estimate of your market compensation and percentile breakdown."
              onClick={() => navigate('/results')}
              colorClass="bg-indigo-50 text-indigo-600 border-indigo-100"
            />
            <ActionCard 
              icon={<Mic className="w-6 h-6" />}
              title="Mock AI Interviews"
              badge="Live Practice"
              description="Rehearse real behavioral and technical interview questions with instant AI feedback."
              onClick={() => navigate('/interview')}
              colorClass="bg-purple-50 text-purple-600 border-purple-100"
            />
            <ActionCard 
              icon={<BookOpen className="w-6 h-6" />}
              title="Course Recommendations"
              badge="Upskill"
              description="Discover hand-picked learning courses to fill the exact skill gaps on your resume."
              onClick={() => navigate('/courses')}
              colorClass="bg-amber-50 text-amber-600 border-amber-100"
            />
            <ActionCard 
              icon={<Briefcase className="w-6 h-6" />}
              title="Targeted Job Listings"
              badge="Hiring Now"
              description="Explore vetted job opportunities matched directly to your current skill set."
              onClick={() => navigate('/jobs')}
              colorClass="bg-rose-50 text-rose-600 border-rose-100"
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, badge, description, onClick, colorClass }) {
  return (
    <div 
      className="card-base p-6 flex flex-col hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group bg-white border border-slate-200" 
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl border ${colorClass}`}>
          {icon}
        </div>
        {badge && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 mt-1.5 mb-5 flex-1 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors mt-auto">
        Explore Tool <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}
