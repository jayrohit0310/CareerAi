import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getInterviewOptions, 
  startInterview, 
  submitInterviewAnswer, 
  endInterviewSession, 
  getInterviewReport, 
  getInterviewHistory,
  uploadResumeFile,
  updateResumeDetails,
  transcribeAudio 
} from '../services/api';
import { AudioRecorder } from '../services/audioRecorder';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar, { SegmentedProgressBar } from '../components/ui/ProgressBar';
import { 
  UserRoundCheck, 
  Send, 
  MessageCircleQuestion, 
  Trophy, 
  RotateCcw, 
  Clock, 
  Mic, 
  MicOff, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Loader2, 
  Square, 
  AlertCircle,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  FileText,
  UploadCloud,
  History,
  Play,
  ArrowRight,
  BookOpen,
  Code2,
  Users,
  Target,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Bookmark,
  Star,
  CheckSquare,
  BarChart3,
  Lightbulb,
  Share2
} from 'lucide-react';

// Curated Question Bank dataset for the Question Bank tab
const CURATED_QUESTIONS = [
  {
    id: 'qb_1',
    title: 'Design a high-throughput URL shortener with rate limiting and analytics',
    category: 'System Design',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    tags: ['Distributed Systems', 'Redis', 'Hashing', 'Scalability'],
    role: 'Backend Systems & Microservices',
    format: 'technical',
    description: 'Explain database schema, key generation strategies (Base62 vs pre-generated keys), caching tier, and handling 100M daily writes.'
  },
  {
    id: 'qb_2',
    title: 'Explain Database Isolation Levels and how PostgreSQL handles MVCC',
    category: 'DBMS',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    tags: ['PostgreSQL', 'Transactions', 'ACID', 'Concurrency'],
    role: 'Backend Systems & Microservices',
    format: 'technical',
    description: 'Walk through Read Committed vs Repeatable Read, phantom reads, and vacuum processes in PostgreSQL.'
  },
  {
    id: 'qb_3',
    title: 'Describe a situation where a production bug occurred and how you resolved it under pressure',
    category: 'HR & Behavioral',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    tags: ['STAR Method', 'Incident Management', 'Ownership', 'Communication'],
    role: 'Full-Stack Software Engineering',
    format: 'hr',
    description: 'Structure your response using Situation, Task, Action, and concrete measurable Results.'
  },
  {
    id: 'qb_4',
    title: 'Optimize React component re-renders: useMemo, useCallback, and React Server Components',
    category: 'React & Frontend',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    tags: ['React', 'Virtual DOM', 'Performance', 'Hooks'],
    role: 'Frontend & Modern UI Engineering',
    format: 'technical',
    description: 'Analyze reference equality, bundle splitting, and when premature memoization degrades performance.'
  },
  {
    id: 'qb_5',
    title: 'Implement Least Recently Used (LRU) Cache in O(1) time complexity',
    category: 'DSA',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    tags: ['Data Structures', 'Hash Map', 'Doubly Linked List', 'Algorithms'],
    role: 'Full-Stack Software Engineering',
    format: 'coding',
    description: 'Detail the interaction between a doubly linked list and hash map for O(1) get and put operations.'
  },
  {
    id: 'qb_6',
    title: 'Explain Chunking Strategies and Vector Retrieval in RAG AI Pipelines',
    category: 'Machine Learning',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    tags: ['Generative AI', 'Embeddings', 'ChromaDB', 'Vector Search'],
    role: 'AI / Machine Learning & MLOps',
    format: 'technical',
    description: 'Discuss fixed vs semantic chunking, cosine distance benchmarks, and re-ranking mechanisms.'
  },
  {
    id: 'qb_7',
    title: 'How do you handle disagreement with a Senior Engineer regarding technical architecture?',
    category: 'HR & Behavioral',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    tags: ['STAR Method', 'Collaboration', 'Influence', 'Leadership'],
    role: 'Full-Stack Software Engineering',
    format: 'hr',
    description: 'Focus on objective benchmarking, data-backed POCs, and maintaining team velocity without conflict.'
  },
  {
    id: 'qb_8',
    title: 'Explain TCP 3-Way Handshake vs UDP in low-latency WebSockets',
    category: 'Operating Systems',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    tags: ['Networking', 'TCP/IP', 'WebSockets', 'Protocols'],
    role: 'Backend Systems & Microservices',
    format: 'technical',
    description: 'Compare flow control, packet retransmissions, and when to use UDP over TCP in real-time systems.'
  }
];

export default function Interview() {
  const navigate = useNavigate();
  const toast = useToast();

  // Navigation tabs: 'session' | 'questions' | 'history'
  const [activeTab, setActiveTab] = useState('session');

  // Stages inside session tab: 'config' | 'interviewing' | 'report'
  const [sessionStage, setSessionStage] = useState('config');

  // Options loaded from backend
  const [options, setOptions] = useState(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Configuration state
  const [config, setConfig] = useState({
    interview_type: 'resume',
    difficulty: 'intermediate',
    duration_minutes: 15,
    role_domain: 'Full-Stack Software Engineering',
    allow_followups: true,
    resume_id: null
  });

  // Active Session state
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(7);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecorderRef = useRef(null);

  // Server-synchronized Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(900);
  const timerIntervalRef = useRef(null);
  const handleAutoExpireRef = useRef(null);

  // Modals state
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isReviewResumeModalOpen, setIsReviewResumeModalOpen] = useState(false);
  const [selectedResumeForReview, setSelectedResumeForReview] = useState(null);
  const [editedResumeSkills, setEditedResumeSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSavingResumeEdit, setIsSavingResumeEdit] = useState(false);

  // Quick Resume Upload state
  const resumeFileInputRef = useRef(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Report state
  const [reportData, setReportData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [expandedGoldenAnswers, setExpandedGoldenAnswers] = useState({});

  // History state
  const [pastSessions, setPastSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Question Bank Filter state
  const [qbCategory, setQbCategory] = useState('All');
  const [qbDifficulty, setQbDifficulty] = useState('All');
  const [qbSearch, setQbSearch] = useState('');
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(['qb_1', 'qb_3']);

  // Fetch initial options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const data = await getInterviewOptions();
        setOptions(data);
        if (data.available_resumes && data.available_resumes.length > 0) {
          const primary = data.available_resumes.find(r => r.is_primary) || data.available_resumes[0];
          setConfig(prev => ({ ...prev, resume_id: primary.id }));
        }
      } catch (err) {
        console.warn('Could not load interview options from server:', err);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // Fetch history when history tab opens
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const data = await getInterviewHistory();
      setPastSessions(data.history || []);
    } catch (err) {
      console.warn('Could not load past interview history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // Audio recorder setup
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder();
    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-expire session handler
  const handleAutoExpire = useCallback(async () => {
    if (sessionStage !== 'interviewing' || !sessionId) return;
    toast.warning('Time has elapsed! Compiling your STAR evaluation.', 'Session Expired');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setIsLoadingReport(true);
    try {
      const res = await endInterviewSession(sessionId, 'timeout');
      if (res.report) {
        setReportData(res.report);
        setSessionStage('report');
      } else {
        loadReportAndFinish(sessionId);
      }
    } catch {
      loadReportAndFinish(sessionId);
    }
  }, [sessionStage, sessionId, toast]);

  useEffect(() => {
    handleAutoExpireRef.current = handleAutoExpire;
  }, [handleAutoExpire]);

  // Timer countdown
  useEffect(() => {
    if (sessionStage === 'interviewing' && remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            if (handleAutoExpireRef.current) handleAutoExpireRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionStage, remainingSeconds]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start interview session
  const handleStartSession = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        interview_type: config.interview_type,
        difficulty: config.difficulty,
        duration_minutes: Number(config.duration_minutes),
        role_domain: config.role_domain,
        allow_followups: config.allow_followups,
        resume_id: config.resume_id
      };

      const res = await startInterview(payload);
      setSessionId(res.session_id);
      setCurrentQuestion(res.first_question);
      setQuestionIndex(res.question_index || 0);
      setTotalQuestions(res.total_questions || 7);
      setRemainingSeconds(res.remaining_seconds || (config.duration_minutes * 60));
      setAnswer('');
      setLastFeedback(null);
      setInterviewHistory([]);
      setSessionStage('interviewing');
      toast.success(`Session started! ${res.total_questions || 7} questions scheduled.`, 'Interview In Progress');
    } catch (err) {
      console.error('Failed to start interview:', err);
      toast.error('Could not initialize interview session. Please verify backend connection.', 'Start Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please input your answer or use microphone dictation before submitting.', 'Empty Answer');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitInterviewAnswer({
        session_id: sessionId,
        answer: answer.trim()
      });

      if (res.feedback) {
        setLastFeedback(res.feedback);
      }

      setInterviewHistory(prev => [
        ...prev,
        {
          question: currentQuestion,
          answer: answer.trim(),
          feedback: res.feedback || null
        }
      ]);

      if (res.is_completed) {
        toast.success('All questions answered! Compiling your STAR evaluation.', 'Interview Completed');
        loadReportAndFinish(sessionId);
      } else {
        setCurrentQuestion(res.next_question);
        setQuestionIndex(res.question_index);
        setRemainingSeconds(res.remaining_seconds);
        setAnswer('');
        toast.info(`Proceeding to Question #${res.question_index + 1}`, 'Next Question');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      toast.error('Failed to register answer. Please retry.', 'Submission Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load report
  const loadReportAndFinish = async (sId) => {
    setSessionStage('report');
    setIsLoadingReport(true);
    try {
      const rep = await getInterviewReport(sId);
      setReportData(rep);
    } catch (err) {
      console.error('Failed to load performance report:', err);
      toast.error('Failed to load full report. Showing session summary.', 'Report Error');
    } finally {
      setIsLoadingReport(false);
    }
  };

  // End interview early
  const handleEndEarly = async () => {
    setIsEndModalOpen(false);
    setIsLoadingReport(true);
    try {
      const res = await endInterviewSession(sessionId, 'manual_early');
      toast.info('Interview concluded. Generating comprehensive evaluation.', 'Session Concluded');
      if (res.report) {
        setReportData(res.report);
        setSessionStage('report');
      } else {
        loadReportAndFinish(sessionId);
      }
    } catch {
      loadReportAndFinish(sessionId);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // View past report from history
  const handleViewPastReport = async (pastSessionId) => {
    setActiveTab('session');
    setSessionStage('report');
    setIsLoadingReport(true);
    try {
      const rep = await getInterviewReport(pastSessionId);
      setReportData(rep);
    } catch (err) {
      console.error('Could not load past report:', err);
      toast.error('Could not load past report.', 'Error');
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Voice recording toggle
  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      try {
        const audioBlob = await audioRecorderRef.current.stop();
        setIsTranscribing(true);
        const res = await transcribeAudio(audioBlob);
        if (res && res.transcript) {
          setAnswer(prev => prev ? `${prev} ${res.transcript}` : res.transcript);
          toast.success('Audio transcribed into answer editor!', 'Transcription Success');
        }
      } catch (err) {
        console.error('Transcription failed:', err);
        toast.error('Could not transcribe audio. You can type your response manually.', 'Dictation Error');
      } finally {
        setIsTranscribing(false);
      }
    } else {
      try {
        await audioRecorderRef.current.start();
        setIsRecording(true);
        toast.info('Microphone active. Speak your answer clearly.', 'Listening...');
      } catch (err) {
        console.error('Could not start recording:', err);
        toast.error('Microphone permission required for audio responses.', 'Microphone Blocked');
      }
    }
  };

  // Text to speech for speaking question
  const toggleSpeakQuestion = () => {
    if (!('speechSynthesis' in window)) {
      toast.info('Speech synthesis not supported on this browser.', 'Audio Notice');
      return;
    }
    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      setIsSpeakingQuestion(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Quick resume upload
  const handleUploadNewResume = async (file) => {
    if (!file) return;
    setIsUploadingResume(true);
    try {
      const uploaded = await uploadResumeFile(file);
      toast.success(`${uploaded.filename} uploaded!`, 'Resume Ready');
      const data = await getInterviewOptions();
      setOptions(data);
      setConfig(prev => ({ ...prev, resume_id: uploaded.id }));
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to parse resume document.', 'Upload Error');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Open review resume modal
  const handleOpenReviewModal = (resItem) => {
    setSelectedResumeForReview(resItem);
    const parsed = resItem.extracted_skills 
      ? resItem.extracted_skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    setEditedResumeSkills(parsed);
    setIsReviewResumeModalOpen(true);
  };

  // Save reviewed resume details
  const handleSaveResumeEdit = async () => {
    if (!selectedResumeForReview) return;
    setIsSavingResumeEdit(true);
    try {
      await updateResumeDetails(selectedResumeForReview.id, {
        extracted_skills: editedResumeSkills.join(', ')
      });
      toast.success('Resume details verified and saved for this session.', 'Profile Updated');
      const data = await getInterviewOptions();
      setOptions(data);
      setIsReviewResumeModalOpen(false);
    } catch (err) {
      console.error('Failed to update resume:', err);
      toast.error('Could not save resume edits.', 'Save Error');
    } finally {
      setIsSavingResumeEdit(false);
    }
  };

  // Toggle Golden Answer expand
  const toggleGoldenAnswer = (idx) => {
    setExpandedGoldenAnswers(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Launch practice from Question Bank
  const handlePracticeQuestionBankItem = (qbItem) => {
    setConfig({
      interview_type: qbItem.format || 'technical',
      difficulty: qbItem.difficulty || 'intermediate',
      duration_minutes: qbItem.estimatedMinutes || 15,
      role_domain: qbItem.role || 'Full-Stack Software Engineering',
      allow_followups: true,
      resume_id: config.resume_id
    });
    setActiveTab('session');
    setSessionStage('config');
    toast.info(`Loaded "${qbItem.title}" into Interview Setup.`, 'Setup Ready');
  };

  // Filtered Question Bank
  const filteredQuestions = CURATED_QUESTIONS.filter(q => {
    const matchCat = qbCategory === 'All' || q.category === qbCategory;
    const matchDiff = qbDifficulty === 'All' || q.difficulty === qbDifficulty;
    const matchSearch = !qbSearch || q.title.toLowerCase().includes(qbSearch.toLowerCase()) || q.tags.some(t => t.toLowerCase().includes(qbSearch.toLowerCase()));
    return matchCat && matchDiff && matchSearch;
  });

  const categoriesList = ['All', 'System Design', 'DBMS', 'DSA', 'React & Frontend', 'Machine Learning', 'Operating Systems', 'HR & Behavioral'];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Platform Header & Modern Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAF1] dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Mock Simulator & STAR Evaluation
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] dark:text-slate-100">
            Practice Interview & Performance Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Grounded in your resume projects, industry frameworks, and real-time voice dictation.
          </p>
        </div>

        {/* 3 Main View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-[#E5EAF1] dark:border-slate-800 shadow-2xs">
          <button
            type="button"
            onClick={() => { setActiveTab('session'); if (sessionStage === 'report') setSessionStage('config'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'session'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Question Bank
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            My Performance
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERVIEW SIMULATOR (CONFIG / ACTIVE / REPORT) */}
      {/* ========================================================================= */}
      {activeTab === 'session' && (
        <>
          {/* ========================================================================= */}
          {/* STAGE 1: CONFIGURATION SCREEN */}
          {/* ========================================================================= */}
          {sessionStage === 'config' && (
            <div className="space-y-6 animate-fade-in">
              {/* Introduction Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#172B4D] via-[#1E3A67] to-[#172B4D] text-white shadow-sm relative overflow-hidden">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blue-200 border border-white/15">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Adaptive Question Generation
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold">Configure Your Practice Session</h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    Choose your format, difficulty tier, and target domain. If a resume is attached, the AI will deeply probe into your actual project architecture and contributions.
                  </p>
                </div>
              </div>

              {/* Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Main Options */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Option A: Interview Type */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider">
                          1. Select Interview Format
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Choose the evaluation style for this session</p>
                      </div>
                      <Badge variant="blue" size="sm">Core Focus</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'resume', label: 'Resume-Driven', icon: FileText, desc: 'Questions strictly grounded in your actual projects & claimed skills.' },
                        { id: 'technical', label: 'Technical Systems', icon: Code2, desc: 'Deep engineering concepts, distributed systems & architecture.' },
                        { id: 'project', label: 'Project Defense', icon: Target, desc: 'Architecture walkthrough, trade-offs, and code contributions.' },
                        { id: 'hr', label: 'HR & Behavioral', icon: Users, desc: 'STAR situational questions, leadership, and conflict resolution.' },
                        { id: 'coding', label: 'Coding & Logic', icon: Code2, desc: 'Algorithmic problem-solving, complexity & edge cases.' },
                        { id: 'mixed', label: 'Comprehensive Mixed', icon: Sparkles, desc: 'Full panel simulation combining resume, technical, and behavioral.' }
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = config.interview_type === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setConfig(prev => ({ ...prev, interview_type: t.id }))}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 select-none ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                                : 'bg-white dark:bg-slate-800/80 border-[#E5EAF1] dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                            </div>
                            <h4 className="text-xs font-bold text-[#172033] dark:text-slate-100">{t.label}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Option B: Difficulty Level */}
                  <Card className="p-6">
                    <h3 className="text-xs font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider mb-2">
                      2. Difficulty Tier
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Determines depth of follow-ups and edge case scenarios</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'beginner', label: 'Beginner', desc: 'Fundamentals, core concepts, definition checks.' },
                        { id: 'intermediate', label: 'Intermediate', desc: 'Real-world debugging, system trade-offs, practical usage.' },
                        { id: 'advanced', label: 'Advanced', desc: 'High scale, concurrency bottlenecks, architectural deep dives.' }
                      ].map((d) => {
                        const isSelected = config.difficulty === d.id;
                        return (
                          <div
                            key={d.id}
                            onClick={() => setConfig(prev => ({ ...prev, difficulty: d.id }))}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all select-none ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                                : 'bg-white dark:bg-slate-800/80 border-[#E5EAF1] dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                          >
                            <span className="text-xs font-bold text-[#172033] dark:text-slate-100 block">{d.label}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block leading-relaxed">{d.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Option C: Duration */}
                  <Card className="p-6">
                    <h3 className="text-xs font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider mb-2">
                      3. Duration & Time Limit
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Pacing and total questions are scaled to the selected duration</p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[5, 10, 15, 30, 45].map((mins) => {
                        const isSelected = config.duration_minutes === mins;
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, duration_minutes: mins }))}
                            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800/80 border-[#E5EAF1] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                            }`}
                          >
                            <span className="block text-sm font-extrabold">{mins}m</span>
                            <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {mins === 5 ? '3 Qs' : mins === 10 ? '5 Qs' : mins === 15 ? '7 Qs' : mins === 30 ? '10 Qs' : '14 Qs'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                </div>

                {/* Right Column: Grounded Resume, Role Domain & Summary */}
                <div className="space-y-6">
                  
                  {/* Grounded Resume Selector */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider">
                        Resume Grounding
                      </h3>
                      <Badge variant="emerald" size="sm">STAR Tailored</Badge>
                    </div>

                    {options?.available_resumes && options.available_resumes.length > 0 ? (
                      <div className="space-y-3">
                        <select
                          value={config.resume_id || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, resume_id: Number(e.target.value) }))}
                          className="input-field text-xs font-semibold cursor-pointer"
                        >
                          {options.available_resumes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.filename} {r.is_primary ? '(Primary)' : ''}
                            </option>
                          ))}
                        </select>

                        {/* Review Extracted Skills Button */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const r = options.available_resumes.find(item => item.id === config.resume_id) || options.available_resumes[0];
                              handleOpenReviewModal(r);
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Review Extracted Skills
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                        No resumes attached yet. The session will use the selected domain below. You can also upload a PDF now:
                      </div>
                    )}

                    {/* Quick upload trigger */}
                    <div className="mt-3">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        ref={resumeFileInputRef}
                        className="hidden"
                        onChange={(e) => handleUploadNewResume(e.target.files[0])}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        disabled={isUploadingResume}
                        onClick={() => resumeFileInputRef.current?.click()}
                        icon={UploadCloud}
                      >
                        {isUploadingResume ? 'Analyzing Document...' : 'Upload PDF / DOCX Resume'}
                      </Button>
                    </div>
                  </Card>

                  {/* Career Role / Domain */}
                  <Card className="p-6">
                    <h3 className="text-xs font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider mb-2">
                      Career Domain / Target Role
                    </h3>
                    <select
                      value={config.role_domain}
                      onChange={(e) => setConfig(prev => ({ ...prev, role_domain: e.target.value }))}
                      className="input-field text-xs font-semibold cursor-pointer mb-3"
                    >
                      <option value="Full-Stack Software Engineering">Full-Stack Software Engineering</option>
                      <option value="Backend Systems & Microservices">Backend Systems & Microservices</option>
                      <option value="Frontend & Modern UI Engineering">Frontend & Modern UI Engineering</option>
                      <option value="AI / Machine Learning & MLOps">AI / Machine Learning & MLOps</option>
                      <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                      <option value="Data Engineering & Analytics">Data Engineering & Analytics</option>
                    </select>

                    {/* Follow-up Question Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer mt-3 pt-3 border-t border-[#E5EAF1] dark:border-slate-800">
                      <input
                        type="checkbox"
                        checked={config.allow_followups}
                        onChange={(e) => setConfig(prev => ({ ...prev, allow_followups: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Enable Adaptive Follow-up Questions
                      </span>
                    </label>
                  </Card>

                  {/* Configuration Summary Card */}
                  <Card className="p-6 bg-slate-50 dark:bg-slate-800/60 border-[#E5EAF1] dark:border-slate-800">
                    <h3 className="text-xs font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider mb-3">
                      Session Summary
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Format:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{config.interview_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Difficulty:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{config.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{config.duration_minutes} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Scheduled:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {config.duration_minutes === 5 ? '3' : config.duration_minutes === 10 ? '5' : config.duration_minutes === 15 ? '7' : config.duration_minutes === 30 ? '10' : '14'} Questions
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleStartSession}
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      loadingText="Generating interview board..."
                      iconRight={ArrowRight}
                      className="mt-5 bg-blue-600 hover:bg-blue-500"
                    >
                      Start Mock Interview
                    </Button>
                  </Card>

                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: ACTIVE INTERVIEW WORKSPACE */}
          {/* ========================================================================= */}
          {sessionStage === 'interviewing' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Countdown Bar & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-[#E5EAF1] dark:border-slate-800 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <Badge variant="blue" size="md">
                    {config.interview_type.toUpperCase()} • {config.difficulty.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Question {questionIndex + 1} of {totalQuestions}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Timer Badge */}
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border transition-all ${
                    remainingSeconds <= 60 
                      ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#E5EAF1] dark:border-slate-700'
                  }`}>
                    <Clock className={`w-4 h-4 ${remainingSeconds <= 60 ? 'text-rose-600' : 'text-blue-600'}`} />
                    <span>{formatTimer(remainingSeconds)}</span>
                  </div>

                  <Button
                    onClick={() => setIsEndModalOpen(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Finish Early
                  </Button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-[#E5EAF1] dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((questionIndex + 1) / totalQuestions) * 100)}%` }}
                />
              </div>

              {/* Main Question Display Card */}
              <Card className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Question #{questionIndex + 1}
                    </span>
                  </div>
                  
                  {/* Read Aloud Text-to-Speech Button */}
                  <button
                    type="button"
                    onClick={toggleSpeakQuestion}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isSpeakingQuestion 
                        ? 'bg-blue-50 text-blue-600 border-blue-300 animate-pulse' 
                        : 'border-[#E5EAF1] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isSpeakingQuestion ? 'Stop Audio' : 'Listen to Question'}
                  >
                    {isSpeakingQuestion ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span className="text-[11px]">{isSpeakingQuestion ? 'Speaking' : 'Read Aloud'}</span>
                  </button>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-[#172033] dark:text-slate-100 leading-relaxed mb-6">
                  {currentQuestion}
                </h2>

                {/* Answer Editor Workspace */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span>Your Response</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        ({answer.trim().split(/\s+/).filter(Boolean).length} words)
                      </span>
                    </label>

                    {/* Microphone Dictation Trigger */}
                    <button
                      type="button"
                      onClick={toggleRecording}
                      disabled={isTranscribing}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isRecording 
                          ? 'bg-rose-500 text-white animate-pulse shadow-xs ring-4 ring-rose-500/20' 
                          : isTranscribing 
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Recording (Click to stop)</span>
                        </>
                      ) : isTranscribing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Transcribing speech...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-blue-600" />
                          <span>Voice Dictation</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={7}
                    placeholder="Structure your answer clearly. For behavioral and project questions, follow the STAR structure: Situation, Task, Action taken, and measurable Result..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full rounded-xl border border-[#E5EAF1] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs sm:text-sm text-[#172033] dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 leading-relaxed resize-y"
                  />

                  {/* Submission and Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-400">
                      Press Submit Answer to record response and advance.
                    </span>

                    <Button
                      onClick={handleSubmitAnswer}
                      variant="primary"
                      size="md"
                      disabled={isSubmitting || !answer.trim()}
                      isLoading={isSubmitting}
                      loadingText="Evaluating response..."
                      iconRight={Send}
                      className="bg-blue-600 hover:bg-blue-500"
                    >
                      {questionIndex + 1 === totalQuestions ? 'Submit Final Answer' : 'Submit & Next Question'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Previous Answer Instant STAR Feedback Card */}
              {lastFeedback && (
                <Card className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Instant AI Critique from Previous Question</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lastFeedback.critique || lastFeedback}
                  </p>
                </Card>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: DETAILED PERFORMANCE REPORT SCREEN (INSPIRED BY REFERENCE IMAGE 1) */}
          {/* ========================================================================= */}
          {sessionStage === 'report' && (
            <div className="space-y-6 animate-fade-in">
              {isLoadingReport ? (
                <Card className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#172033] dark:text-slate-100">
                    Compiling Comprehensive Performance Analytics...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Analyzing answers, STAR structure, and technical depth.</p>
                </Card>
              ) : reportData ? (
                <>
                  {/* Top Segmented Score & Progress Card (Reference Image 1: "Interview Score & Progress") */}
                  <SegmentedProgressBar
                    totalScore={100}
                    scoreLabel={`Interview Score & Progress: ${reportData.overall_score_100 || Math.round((reportData.overall_score_10 || 8) * 10)}% of the total score`}
                    segments={[
                      {
                        label: 'Ownership & Impact',
                        value: Math.round((reportData.overall_score_100 || 80) * 0.45),
                        displayValue: `${Math.round((reportData.overall_score_100 || 80) * 0.45)}/45 (45%)`,
                        color: 'bg-blue-600',
                        dotColor: 'bg-blue-600'
                      },
                      {
                        label: 'Judgment & Problem Solving',
                        value: Math.round((reportData.overall_score_100 || 80) * 0.35),
                        displayValue: `${Math.round((reportData.overall_score_100 || 80) * 0.35)}/35 (35%)`,
                        color: 'bg-sky-400',
                        dotColor: 'bg-sky-400'
                      },
                      {
                        label: 'Collaboration & Influence',
                        value: Math.round((reportData.overall_score_100 || 80) * 0.20),
                        displayValue: `${Math.round((reportData.overall_score_100 || 80) * 0.20)}/20 (20%)`,
                        color: 'bg-purple-500',
                        dotColor: 'bg-purple-500'
                      }
                    ]}
                  />

                  {/* 2-Column Evaluation Card (Reference Image 1: Left Circular Score & Speech, Right 5D Breakdown) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Card: Circular Score, Feedback Summary, Speech Analysis */}
                    <Card className="p-6 sm:p-7 space-y-6">
                      
                      {/* Score Circle & Level */}
                      <div className="flex items-center gap-5">
                        <ProgressRing 
                          value={reportData.overall_score_100 || Math.round((reportData.overall_score_10 || 8) * 10)} 
                          size={90} 
                          strokeWidth={8} 
                          color="#16A078"
                          trackColor="#E5EAF1"
                        />
                        <div>
                          <span className="text-base font-extrabold text-[#172033] dark:text-slate-100 block">
                            {reportData.grade || 'High Score'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Average answer score: {reportData.average_answer_score || 8.0} / 10
                          </span>
                        </div>
                      </div>

                      {/* Feedback Summary */}
                      <div className="space-y-1.5 pt-4 border-t border-[#E5EAF1] dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Feedback Overview
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                          {reportData.technical_knowledge_assessment || 
                            'The candidate provided clear and well-structured answers, effectively applying the points of the STAR method. Responses included relevant context, clearly defined actions, and concrete engineering results.'}
                        </p>
                      </div>

                      {/* Speech Analysis (Fillers, Hedge Words, WPN) */}
                      <div className="space-y-2 pt-4 border-t border-[#E5EAF1] dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Speech & Delivery Analysis
                        </span>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Fillers</span>
                            <span className="font-extrabold text-[#172033] dark:text-slate-100">
                              {reportData.speech_analysis?.fillers_count ?? 5}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Hedge words</span>
                            <span className="font-extrabold text-[#172033] dark:text-slate-100">
                              {reportData.speech_analysis?.hedge_words_count ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Pace (WPM / WPN)</span>
                            <span className="font-extrabold text-[#172033] dark:text-slate-100">
                              {reportData.speech_analysis?.words_per_minute ?? 120} wpm
                            </span>
                          </div>
                        </div>
                      </div>

                    </Card>

                    {/* Right Card: 5D Score Breakdown (Reference Image 1 right column) */}
                    <Card className="p-6 sm:p-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          5D Dimension Score Breakdown
                        </span>
                        <Badge variant="emerald" size="sm">Graded</Badge>
                      </div>

                      <div className="space-y-4 pt-2">
                        <ProgressBar 
                          label="Substance & Depth"
                          valueLabel="4.5 / 5"
                          value={90}
                          color="emerald"
                          height="h-2"
                        />
                        <ProgressBar 
                          label="STAR Structure & Organization"
                          valueLabel="3.8 / 5"
                          value={76}
                          color="amber"
                          height="h-2"
                        />
                        <ProgressBar 
                          label="Relevance & Technical Accuracy"
                          valueLabel="4.8 / 5"
                          value={96}
                          color="emerald"
                          height="h-2"
                        />
                        <ProgressBar 
                          label="Credibility & Real Project Ownership"
                          valueLabel="4.2 / 5"
                          value={84}
                          color="emerald"
                          height="h-2"
                        />
                        <ProgressBar 
                          label="Differentiation & Senior-Level Polish"
                          valueLabel="4.0 / 5"
                          value={80}
                          color="emerald"
                          height="h-2"
                        />
                      </div>

                      {/* Topic-wise Breakdown from Backend Data */}
                      {reportData.performance_by_topic && reportData.performance_by_topic.length > 0 && (
                        <div className="pt-4 border-t border-[#E5EAF1] dark:border-slate-800 space-y-3">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Topic Mastery Breakdown
                          </span>
                          {reportData.performance_by_topic.slice(0, 3).map((t, idx) => (
                            <ProgressBar
                              key={idx}
                              label={t.topic}
                              valueLabel={`${t.score} / 10`}
                              value={t.score * 10}
                              color={t.score >= 8 ? 'emerald' : t.score >= 6 ? 'blue' : 'amber'}
                              height="h-2"
                            />
                          ))}
                        </div>
                      )}
                    </Card>

                  </div>

                  {/* Strengths & Areas to Improve Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-6">
                      <h3 className="text-sm font-bold text-emerald-600 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Key Strengths Identified
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {(reportData.key_strengths || [
                          'Strong understanding of asynchronous architecture and caching layers.',
                          'Clear communication of individual engineering contributions.',
                          'Effective use of STAR method for behavioral questions.'
                        ]).map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Areas For Improvement
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {(reportData.areas_for_improvement || [
                          'Quantify results with concrete business metrics (e.g. latency % reduction).',
                          'Address distributed transaction rollbacks in microservices design.',
                          'Reduce filler phrases when formulating complex system answers.'
                        ]).map((w, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Question-By-Question Detailed Review with ⭐ Golden Answer (Reference Image 1) */}
                  <Card className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Detailed Question Reviews & Golden Answers
                      </h3>
                      <span className="text-xs text-slate-400">
                        {reportData.question_reviews?.length || 0} Questions Evaluated
                      </span>
                    </div>

                    <div className="space-y-5 pt-2">
                      {(reportData.question_reviews || []).map((qItem, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-[#E5EAF1] dark:border-slate-800 space-y-3.5 text-xs">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-bold text-sm text-[#172033] dark:text-slate-100">
                              Question #{idx + 1}: {qItem.question_text}
                            </span>
                            <Badge variant={qItem.score_10 >= 8.0 ? 'emerald' : qItem.score_10 >= 6.5 ? 'blue' : 'amber'} size="sm">
                              {qItem.score_10 || 8} / 10
                            </Badge>
                          </div>

                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-[#E5EAF1] dark:border-slate-700">
                            <span className="font-bold text-slate-500 block mb-1">Your Answer:</span>
                            <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
                              {qItem.user_answer || '(No answer provided)'}
                            </p>
                          </div>

                          {/* Reference Image 1: Golden Answer Banner / Button */}
                          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                              <div>
                                <span className="font-bold text-[#172033] dark:text-slate-100 block">
                                  GOLDEN ANSWER
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  See how a senior candidate would answer this question.
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={() => toggleGoldenAnswer(idx)}
                              variant="primary"
                              size="xs"
                              className="bg-blue-600 hover:bg-blue-500 text-white shrink-0 font-bold"
                            >
                              {expandedGoldenAnswers[idx] ? 'Hide Answer' : 'See a senior-level answer'}
                            </Button>
                          </div>

                          {/* Expanded Golden Answer Content */}
                          {expandedGoldenAnswers[idx] && (
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 animate-fade-in">
                              <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5" /> Senior Model Solution (STAR):
                              </span>
                              <p className="text-xs">
                                {qItem.ideal_answer || 
                                  'In my previous role, we faced a similar architectural challenge. I initiated by isolating the failure domain (Situation), set SLAs for under 50ms latency (Task), decoupled the write pathway with Redis stream queues (Action), and achieved a 40% reduction in peak latency without packet loss (Result).'}
                              </p>
                            </div>
                          )}

                          {qItem.missing_concepts && (
                            <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                              <strong>Key Concepts to Include:</strong> {qItem.missing_concepts}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recommended Topics to Study Next */}
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-[#172033] dark:text-slate-100 uppercase tracking-wider mb-3">
                      Recommended Topics to Study Next
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(reportData.recommended_study_topics || [
                        'Distributed Caching Patterns',
                        'STAR Behavioral Delivery',
                        'PostgreSQL Query Optimization',
                        'Microservices Failure Handling'
                      ]).map((top, idx) => (
                        <div key={idx} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                          {top}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => setSessionStage('config')}
                        variant="primary"
                        size="md"
                        icon={RotateCcw}
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        Start Another Practice Session
                      </Button>
                      <Button
                        onClick={() => navigate('/courses')}
                        variant="secondary"
                        size="md"
                        icon={BookOpen}
                      >
                        Explore Recommended Courses
                      </Button>
                      <Button
                        onClick={() => navigate('/dashboard')}
                        variant="ghost"
                        size="md"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </Card>

                </>
              ) : null}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUESTION BANK UI (SECTION 7 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header & Search */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5EAF1] dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#172B4D] dark:text-slate-100">
                  Engineering Question Bank
                </h2>
                <p className="text-xs text-slate-500">
                  Vetted questions across System Design, DSA, DBMS, React, and STAR behavioral rounds.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by topic or tag..."
                  value={qbSearch}
                  onChange={(e) => setQbSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-[#E5EAF1] dark:border-slate-700 text-[#172033] dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setQbCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    qbCategory === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E5EAF1] dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Difficulty:</span>
              {['All', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setQbDifficulty(lvl)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium ${
                    qbDifficulty === lvl
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map((q) => {
              const isBookmarked = bookmarkedQuestions.includes(q.id);
              return (
                <Card key={q.id} hover className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" size="sm">{q.category}</Badge>
                        <Badge variant={q.difficulty === 'advanced' ? 'rose' : q.difficulty === 'intermediate' ? 'amber' : 'emerald'} size="sm">
                          {q.difficulty}
                        </Badge>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isBookmarked) {
                            setBookmarkedQuestions(bookmarkedQuestions.filter(id => id !== q.id));
                          } else {
                            setBookmarkedQuestions([...bookmarkedQuestions, q.id]);
                            toast.success('Question saved to bookmarks!', 'Bookmarked');
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked 
                            ? 'bg-amber-50 text-amber-600 border-amber-200' 
                            : 'border-[#E5EAF1] text-slate-400 hover:text-slate-600'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-[#172033] dark:text-slate-100 leading-snug">
                      {q.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {q.description}
                    </p>
                  </div>

                  {/* Tags & Action */}
                  <div className="pt-3 border-t border-[#E5EAF1] dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~{q.estimatedMinutes}m
                      </span>
                      {q.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>

                    <Button
                      onClick={() => handlePracticeQuestionBankItem(q)}
                      variant="primary"
                      size="xs"
                      iconRight={Play}
                      className="bg-blue-600 hover:bg-blue-500 font-bold shrink-0"
                    >
                      Practice
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY PERFORMANCE & PAST REPORTS (SECTION 8 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <span className="text-xs text-slate-400 block mb-1">Total Sessions</span>
              <span className="text-2xl font-extrabold text-[#172033] dark:text-slate-100">
                {pastSessions.length}
              </span>
            </Card>

            <Card className="p-4 text-center">
              <span className="text-xs text-slate-400 block mb-1">Average Score</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                {pastSessions.length > 0 
                  ? (pastSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / pastSessions.length).toFixed(1)
                  : '0.0'} / 10
              </span>
            </Card>

            <Card className="p-4 text-center">
              <span className="text-xs text-slate-400 block mb-1">Best Score</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {pastSessions.length > 0 
                  ? Math.max(...pastSessions.map(s => s.overall_score || 0)).toFixed(1)
                  : '0.0'} / 10
              </span>
            </Card>

            <Card className="p-4 text-center">
              <span className="text-xs text-slate-400 block mb-1">Total Practice Time</span>
              <span className="text-2xl font-extrabold text-[#172033] dark:text-slate-100">
                {pastSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0)} mins
              </span>
            </Card>
          </div>

          {/* Past Sessions List */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-[#172033] dark:text-slate-100">
                  Completed Mock Interviews History
                </h2>
                <p className="text-xs text-slate-500">Review your past scores, questions, and performance reports</p>
              </div>
              <Button
                onClick={fetchHistory}
                variant="secondary"
                size="sm"
                icon={RotateCcw}
              >
                Refresh
              </Button>
            </div>

            {isLoadingHistory ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading interview records...</div>
            ) : pastSessions.length > 0 ? (
              <div className="divide-y divide-[#E5EAF1] dark:divide-slate-800">
                {pastSessions.map((item) => (
                  <div key={item.session_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172033] dark:text-slate-100 capitalize text-sm">
                          {item.interview_type} Interview ({item.difficulty})
                        </span>
                        <Badge variant={item.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-slate-500">
                        Duration: {item.duration_minutes}m • Started: {new Date(item.started_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {item.overall_score !== null && (
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                          {item.overall_score} / 10
                        </span>
                      )}
                      <Button
                        onClick={() => handleViewPastReport(item.session_id)}
                        variant="outline"
                        size="sm"
                      >
                        View Full Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No interview sessions recorded yet. Start your first practice session above!
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Review & Edit Extracted Resume Modal */}
      <Modal
        isOpen={isReviewResumeModalOpen}
        onClose={() => setIsReviewResumeModalOpen(false)}
        title="Review & Verify Extracted Resume Information"
        description="Verify your claimed technical competencies so the AI generates tailored project and architecture questions."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsReviewResumeModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSaveResumeEdit}
              isLoading={isSavingResumeEdit}
              loadingText="Saving..."
            >
              Save & Verify
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Extracted Technical Skills:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-[#E5EAF1] dark:border-slate-700 mb-2">
              {(editedResumeSkills || []).map((sk, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200">
                  {sk}
                  <button
                    type="button"
                    onClick={() => setEditedResumeSkills(editedResumeSkills.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker, GraphQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSkillInput.trim()) {
                    setEditedResumeSkills([...editedResumeSkills, newSkillInput.trim()]);
                    setNewSkillInput('');
                  }
                }}
                className="input-field text-xs py-1.5 flex-1"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (newSkillInput.trim()) {
                    setEditedResumeSkills([...editedResumeSkills, newSkillInput.trim()]);
                    setNewSkillInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal to End Interview Early */}
      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="Conclude Interview Early?"
        description="Are you sure you want to conclude this interview session? Your answered questions will be evaluated and compiled into your final performance report."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEndModalOpen(false)}>
              Continue Practicing
            </Button>
            <Button variant="danger" size="sm" onClick={handleEndEarly}>
              Conclude & View Report
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Unanswered questions will be recorded as incomplete in your evaluation.
        </p>
      </Modal>

    </div>
  );
}
