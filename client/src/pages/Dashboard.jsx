import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  api, 
  updateSkills, 
  getInterviewAnalytics, 
  getInterviewHistory, 
  getResumesList,
  getResumeDetails,
  scanResume,
  setPrimaryResume,
  deleteResume
} from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
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
  Award,
  Play,
  UserRoundCheck,
  ChevronRight,
  FolderOpen,
  Trash2,
  GraduationCap
} from 'lucide-react';

export default function Dashboard() {
  const { user, setUser } = useOutletContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Resumes Vault & Scan States
  const [resumesList, setResumesList] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [activeResumeScan, setActiveResumeScan] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [selectedScanDossier, setSelectedScanDossier] = useState(null);
  
  // Drag-and-drop skills reordering state
  const [draggedSkillIndex, setDraggedSkillIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Mock interview analytics state
  const [interviewAnalytics, setInterviewAnalytics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
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

  // Load resumes and active scan
  const refreshResumesVault = useCallback(async () => {
    try {
      const resumesData = await getResumesList();
      const list = resumesData?.resumes || [];
      setResumesList(list);

      if (list.length > 0) {
        const primary = list.find(r => r.is_primary) || list[0];
        setActiveResumeId(primary.id);
        setUploadedFileName(primary.filename);

        // Fetch detailed scan dossier for primary resume
        try {
          const details = await getResumeDetails(primary.id);
          if (details?.scan_results) {
            setActiveResumeScan(details.scan_results);
            if (details.scan_results.skills && details.scan_results.skills.length > 0) {
              setSkills(details.scan_results.skills);
            }
          }
        } catch (detailErr) {
          console.warn('Could not load primary resume scan dossier:', detailErr);
        }
      } else {
        setActiveResumeId(null);
        setUploadedFileName('');
        setActiveResumeScan(null);
      }
    } catch (err) {
      console.warn('Could not load resumes vault:', err);
    }
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [analytics, history] = await Promise.allSettled([
          getInterviewAnalytics(),
          getInterviewHistory()
        ]);
        if (analytics.status === 'fulfilled') {
          setInterviewAnalytics(analytics.value);
        }
        if (history.status === 'fulfilled') {
          setRecentInterviews((history.value.history || []).slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not load dashboard interview data:', err);
      }
      await refreshResumesVault();
    };
    loadDashboardData();
  }, [refreshResumesVault]);

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
    setUploadStatus('Running one-time AI talent scan...');
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const name = res.data.filename || file.name;
      setUploadedFileName(name);
      setActiveResumeId(res.data.resume_id);
      
      if (res.data.scan_results) {
        setActiveResumeScan(res.data.scan_results);
      }

      if (res.data.skills) {
        setSkills(res.data.skills);
        setUser(prev => ({ ...prev, extracted_skills: res.data.skills.join(',') }));
      }

      toast.success(
        `One-time AI scan completed for ${name}! Recommendations synchronized across all modules.`,
        'Resume Processed & Calibrated'
      );
      await refreshResumesVault();
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to upload resume. Make sure backend is running.';
      toast.error(errMsg, 'Upload Error');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleTriggerScan = async (resumeId) => {
    if (!resumeId) return;
    setIsScanning(true);
    try {
      toast.info('Running AI talent scan across career pathways, courses, and salary...', 'Scanning Resume');
      const res = await scanResume(resumeId);
      if (res.scan_results) {
        setActiveResumeScan(res.scan_results);
        if (res.scan_results.skills) {
          setSkills(res.scan_results.skills);
          setUser(prev => ({ ...prev, extracted_skills: res.scan_results.skills.join(',') }));
        }
        toast.success(
          `AI Scan complete for ${res.filename}! All recommendations refreshed.`,
          'Scan Successful'
        );
      }
      await refreshResumesVault();
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Failed to run AI scan. Please verify backend connection.', 'Scan Failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSetPrimary = async (resumeId) => {
    try {
      const res = await setPrimaryResume(resumeId);
      toast.success(res.message || 'Active resume updated.', 'Active Resume Switched');
      await refreshResumesVault();
    } catch (err) {
      console.error('Set primary error:', err);
      toast.error('Could not switch active resume.', 'Switch Failed');
    }
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      toast.info('Resume document removed from vault.', 'Deleted');
      await refreshResumesVault();
    } catch (err) {
      console.error('Delete resume error:', err);
      toast.error('Failed to delete resume.', 'Delete Failed');
    }
  };

  const handleInspectResume = async (resumeId) => {
    try {
      const details = await getResumeDetails(resumeId);
      if (details.scan_results) {
        setSelectedScanDossier(details.scan_results);
      } else {
        toast.info('This resume has not been scanned yet. Running AI scan now...', 'Scanning');
        await handleTriggerScan(resumeId);
        const updated = await getResumeDetails(resumeId);
        setSelectedScanDossier(updated.scan_results);
      }
    } catch (err) {
      console.error('Inspect resume error:', err);
      toast.error('Could not load scan results.', 'Error');
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

  // Dynamic values driven directly by active resume scan results
  const readinessScore = activeResumeScan?.readiness_score 
    || (skills.length > 0 ? Math.min(100, Math.max(50, skills.length * 10 + 20)) : 0);

  const targetSalary = activeResumeScan?.salary_formatted 
    || (activeResumeScan?.salary_estimate?.median_salary ? `₹${Math.round(activeResumeScan.salary_estimate.median_salary / 100000)} LPA` : '₹18 - ₹26 LPA');

  const targetRole = activeResumeScan?.target_role || 'Full-Stack Software Engineer';
  const userName = user?.email ? user.email.split('@')[0] : 'Candidate';
  const activeResume = resumesList.find(r => r.id === activeResumeId) || resumesList.find(r => r.is_primary);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* 1. Top Welcome Banner (Clean SaaS Hero) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172B4D] via-[#1E3A67] to-[#172B4D] border border-slate-700/60 p-6 sm:p-8 text-white shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/15 rounded-full text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Resume-Calibrated Career Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {uploadedFileName 
                ? `Active Resume: ${uploadedFileName} • Target: ${targetRole}. All courses, career dossiers, job suggestions, and compensation benchmarks are personalized from your profile.`
                : 'Upload your resume below to initiate the one-time AI talent scan and calibrate your entire career acceleration portal.'}
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
            {resumesList.length > 0 && (
              <Button
                onClick={() => setIsVaultModalOpen(true)}
                variant="outline"
                size="md"
                icon={FolderOpen}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Resume Vault ({resumesList.length})
              </Button>
            )}
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
              {readinessScore > 0 ? `${readinessScore}%` : 'Pending'}
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> 
              {activeResumeScan ? 'AI Calibrated' : (skills.length > 0 ? 'Skills Aligned' : 'Upload Resume')}
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
              {uploadedFileName ? 'Resume Parsed' : 'Profile'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {skills.length > 0 ? 'Prioritized in talent stack' : 'Upload resume to extract'}
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
              {targetSalary}
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {activeResumeScan?.target_role ? 'Role Calibrated' : 'Market Aligned'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {activeResumeScan?.target_role ? `Calibrated for ${activeResumeScan.target_role}` : 'Median Indian tech benchmark'}
          </p>
        </Card>
      </div>

      {/* 3. Main Multi-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        
        {/* Left Column (2 Cols Wide): Resume, Priority Skills & Interview Performance */}
        <div className="lg:col-span-2 space-y-6">

          {/* Continue Learning / Fast Track Banner */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Recommended Session
                </span>
                <h3 className="text-lg font-bold text-white pt-1">
                  {targetRole} Simulator
                </h3>
                <p className="text-xs text-blue-100">
                  {activeResumeScan?.experience_years ? `${activeResumeScan.experience_years} Yrs Exp Tier • ` : ''}15 Minutes • AI Real-time Audio & STAR Critique
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

          {/* Resume Upload & Talent Inventory Vault */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#172033] dark:text-slate-100">Resume & Talent Inventory</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {resumesList.length > 0 
                      ? `${resumesList.length} resume document${resumesList.length > 1 ? 's' : ''} in your vault • One-time AI scan powered`
                      : 'Upload resume PDF to run the one-time talent intelligence scan'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {resumesList.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={FolderOpen}
                    onClick={() => setIsVaultModalOpen(true)}
                  >
                    Resume Vault ({resumesList.length})
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  icon={UploadCloud}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Upload Resume
                </Button>
              </div>
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
                {isUploading ? (uploadStatus || 'Running one-time AI talent scan...') : isDraggingFile ? 'Drop your resume PDF here' : 'Drop your PDF resume or click to browse'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                One upload executes a comprehensive scan across career matches, courses, jobs, and salary
              </p>
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </div>

            {/* Active Resume & One-Time Scan Card */}
            {activeResume && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-blue-200/70 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs mt-0.5 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                        {activeResume.filename}
                      </span>
                      <Badge variant="emerald" size="sm">Active Primary</Badge>
                      {activeResumeScan?.target_role && (
                        <Badge variant="blue" size="sm" className="hidden sm:inline-flex">
                          {activeResumeScan.target_role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> One-time AI scan calibrated
                      </span>
                      <span>•</span>
                      <span>{skills.length} skills</span>
                      <span>•</span>
                      <span>{targetSalary}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Sparkles}
                    onClick={() => handleTriggerScan(activeResume.id)}
                    disabled={isScanning}
                  >
                    {isScanning ? 'Scanning...' : 'Re-Scan AI'}
                  </Button>
                  {activeResumeScan && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => setSelectedScanDossier(activeResumeScan)}
                    >
                      View Scan Results
                    </Button>
                  )}
                  {resumesList.length > 1 && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setIsVaultModalOpen(true)}
                    >
                      Switch
                    </Button>
                  )}
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Beginner</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {interviewAnalytics.difficulty_breakdown?.beginner?.total || 0} Sessions
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Avg Score: {interviewAnalytics.difficulty_breakdown?.beginner?.average_score ? `${interviewAnalytics.difficulty_breakdown.beginner.average_score}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/20">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">Intermediate</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {interviewAnalytics.difficulty_breakdown?.intermediate?.total || 0} Sessions
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Avg Score: {interviewAnalytics.difficulty_breakdown?.intermediate?.average_score ? `${interviewAnalytics.difficulty_breakdown.intermediate.average_score}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-purple-200/60 bg-purple-50/40 dark:bg-purple-950/20">
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">Advanced</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {interviewAnalytics.difficulty_breakdown?.advanced?.total || 0} Sessions
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Avg Score: {interviewAnalytics.difficulty_breakdown?.advanced?.average_score ? `${interviewAnalytics.difficulty_breakdown.advanced.average_score}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                {recentInterviews.length > 0 && (
                  <div className="pt-3 border-t border-[#E5EAF1] dark:border-slate-800">
                    <span className="text-xs font-bold text-[#172033] dark:text-slate-200 block mb-2">Recent Sessions</span>
                    <div className="space-y-2">
                      {recentInterviews.map((sess) => (
                        <div 
                          key={sess.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E5EAF1] dark:border-slate-800 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                              {sess.role_domain || 'General Tech'} ({sess.difficulty})
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {new Date(sess.started_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={sess.overall_score >= 80 ? 'emerald' : 'blue'} size="sm">
                              {sess.overall_score ? `${Math.round(sess.overall_score)}%` : 'In Progress'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-[#E5EAF1] dark:border-slate-800">
                <Play className="w-8 h-8 mx-auto text-blue-500 mb-2 opacity-80" />
                <h3 className="text-xs font-bold text-[#172033] dark:text-slate-200">No mock interviews recorded yet</h3>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
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

        {/* Right Column: "Your Journey" & Profile Card */}
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
              Target: {targetRole}
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

            {/* Next Steps Checklist */}
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
                  <p className="text-xs font-bold text-[#172033] dark:text-slate-200">Analyze Career Dossier</p>
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
              <p className="text-[10px] text-slate-400 mt-0.5">Top fit roles</p>
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
              <p className="text-[10px] text-slate-400 mt-0.5">Market benchmarks</p>
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
              <p className="text-[10px] text-slate-400 mt-0.5">Verified postings</p>
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

      {/* MODAL 1: Resume Vault & Management Modal */}
      <Modal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        title="Resume Vault & Intelligence Vault"
        description="Switch your active resume, check previous scan results, or upload additional resumes."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 pt-2">
          {/* Upload Another Resume button */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-[#E5EAF1] dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Another Resume Document</p>
              <p className="text-[11px] text-slate-400">PDF format supported • Automatically triggers one-time AI scan</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={UploadCloud}
              disabled={isUploading}
              onClick={() => modalFileInputRef.current?.click()}
            >
              {isUploading ? 'Uploading & Scanning...' : 'Upload New'}
            </Button>
            <input 
              type="file" 
              accept="application/pdf"
              className="hidden" 
              ref={modalFileInputRef}
              onChange={(e) => {
                handleFileUpload(e.target.files[0]);
              }}
            />
          </div>

          {/* List of resumes */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto no-scrollbar">
            {resumesList.length > 0 ? (
              resumesList.map((r) => {
                const isCurrent = r.is_primary || r.id === activeResumeId;
                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                        : 'border-[#E5EAF1] dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {r.filename}
                            </span>
                            {isCurrent && <Badge variant="emerald" size="sm">Active Primary</Badge>}
                            {r.target_role && <Badge variant="blue" size="sm">{r.target_role}</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                            <span>Uploaded {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently'}</span>
                            <span>•</span>
                            <span>{r.skills?.length || 0} skills</span>
                            {r.readiness_score && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-emerald-600">{r.readiness_score}% Readiness</span>
                              </>
                            )}
                            {r.target_salary && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-purple-600">{r.target_salary}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {!isCurrent && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleSetPrimary(r.id)}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleInspectResume(r.id)}
                        >
                          Scan Results
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={Sparkles}
                          disabled={isScanning}
                          onClick={() => handleTriggerScan(r.id)}
                          title="Run AI scan on this resume"
                        >
                          Re-Scan
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteResume(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No resumes uploaded yet. Upload a resume to populate your vault.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Scan Results Dossier Modal */}
      <Modal
        isOpen={!!selectedScanDossier}
        onClose={() => setSelectedScanDossier(null)}
        title="One-Time AI Scan Results Dossier"
        description="Comprehensive talent intelligence synchronized across courses, jobs, and career reports."
        maxWidth="max-w-2xl"
      >
        {selectedScanDossier && (
          <div className="space-y-5 pt-2 text-xs">
            {/* Top Score & Target Role Header */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-blue-200/60 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                  Target Calibrated Role
                </span>
                <h3 className="text-base font-extrabold text-[#172033] dark:text-white">
                  {selectedScanDossier.target_role || 'Software Engineer'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Candidate: {selectedScanDossier.candidate_name || 'Candidate'} • {selectedScanDossier.experience_years || 2} Years Experience Level
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Readiness Match
                </span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedScanDossier.readiness_score || 85}%
                </div>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block mt-0.5">
                  {selectedScanDossier.salary_formatted || '₹18 - ₹24 LPA'}
                </span>
              </div>
            </div>

            {/* Career Matches */}
            {selectedScanDossier.career_matches && selectedScanDossier.career_matches.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  Top Career Role Matches
                </h4>
                <div className="space-y-2">
                  {selectedScanDossier.career_matches.slice(0, 3).map((match, i) => (
                    <div 
                      key={i}
                      className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-[#E5EAF1] dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{match.title}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{match.description}</span>
                      </div>
                      <Badge variant="blue" size="sm">{match.match_percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Courses Snippet */}
            {selectedScanDossier.courses && selectedScanDossier.courses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    Courses Calibrated for this Resume ({selectedScanDossier.courses.length})
                  </h4>
                  <button 
                    onClick={() => { setSelectedScanDossier(null); navigate('/courses'); }}
                    className="text-blue-600 text-[11px] font-bold hover:underline"
                  >
                    View in Courses →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScanDossier.courses.slice(0, 2).map((c, i) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-[#E5EAF1] dark:border-slate-700">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{c.platform} • {c.level || 'Intermediate'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Openings Snippet */}
            {selectedScanDossier.jobs && selectedScanDossier.jobs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    Opportunities Matched ({selectedScanDossier.jobs.length})
                  </h4>
                  <button 
                    onClick={() => { setSelectedScanDossier(null); navigate('/jobs'); }}
                    className="text-blue-600 text-[11px] font-bold hover:underline"
                  >
                    View in Jobs →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScanDossier.jobs.slice(0, 2).map((j, i) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-[#E5EAF1] dark:border-slate-700">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{j.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{j.company} • {j.salary || 'Competitive'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Skills Chips */}
            {selectedScanDossier.skills && selectedScanDossier.skills.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-2">
                  Verified Skills in this Resume ({selectedScanDossier.skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
                  {selectedScanDossier.skills.map((s, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
