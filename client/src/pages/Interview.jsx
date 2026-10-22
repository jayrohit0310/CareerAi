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
  AlertTriangle
} from 'lucide-react';

export default function Interview() {
  const navigate = useNavigate();
  const toast = useToast();

  // Navigation tabs: 'session' | 'history'
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

  // Server-synchronized Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(900);
  const timerIntervalRef = useRef(null);
  const handleAutoExpireRef = useRef(null);

  // Modals state
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isReviewResumeModalOpen, setIsReviewResumeModalOpen] = useState(false);
  const [selectedResumeForReview, setSelectedResumeForReview] = useState(null);
  const [editedResumeSkills, setEditedResumeSkills] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSavingResumeEdit, setIsSavingResumeEdit] = useState(false);

  // Resume Upload inside config
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const resumeFileInputRef = useRef(null);

  // Voice recording & transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState(null);

  // Report state
  const [reportData, setReportData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // History state
  const [pastSessions, setPastSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Tips accordion
  const [showStarTips, setShowStarTips] = useState(false);

  const audioRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordedTextRef = useRef('');

  // 1. Load Interview Options & Resumes from Backend
  const fetchOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      const data = await getInterviewOptions();
      setOptions(data);
      if (data.available_resumes && data.available_resumes.length > 0) {
        setConfig(prev => ({ ...prev, resume_id: data.available_resumes[0].id }));
      }
    } catch (err) {
      console.warn('Failed to load interview options from server, using built-in defaults:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // 2. Fetch Interview History when history tab selected
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getInterviewHistory();
      setPastSessions(res.history || []);
    } catch (err) {
      console.warn('Could not fetch past interviews:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // 3. Authoritative Timer Effect
  useEffect(() => {
    if (sessionStage === 'interviewing') {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleAutoExpireRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionStage]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Start configured interview session
  const handleStartSession = async () => {
    setIsSubmitting(true);
    try {
      const startRes = await startInterview(config);
      setSessionId(startRes.session_id);
      setCurrentQuestion(startRes.first_question);
      setQuestionIndex(0);
      setTotalQuestions(startRes.total_questions || 6);
      setRemainingSeconds(startRes.duration_seconds || config.duration_minutes * 60);
      setIsTimeWarning(false);
      setAnswer('');
      setLastFeedback(null);
      setInterviewHistory([]);
      setSessionStage('interviewing');
      toast.success(
        `${startRes.difficulty.toUpperCase()} ${startRes.interview_type.toUpperCase()} interview initiated!`, 
        'Session Started'
      );
    } catch (err) {
      console.error('Failed to start interview session:', err);
      toast.error('Could not start interview. Verify that backend is running.', 'Start Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    if (isRecording) {
      await stopVoiceRecording();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    }

    setIsSubmitting(true);
    try {
      const res = await submitInterviewAnswer(sessionId, questionIndex, answer);
      
      const feedbackObj = {
        score: res.score,
        score100: res.score_100,
        strengths: res.strengths || res.feedback,
        improvements: res.improvements || 'Focus on quantifiable engineering outcomes.',
        missing_concepts: res.missing_concepts,
        ideal_answer: res.ideal_answer,
        disclaimer: res.disclaimer
      };
      setLastFeedback(feedbackObj);

      setInterviewHistory(prev => [
        ...prev,
        {
          qIndex: questionIndex + 1,
          question: currentQuestion,
          answer: answer,
          score: res.score,
          feedback: res.strengths || res.feedback
        }
      ]);

      if (res.is_completed) {
        toast.success('Interview complete! Preparing your detailed performance report...', 'Interview Finished');
        loadReportAndFinish(sessionId);
      } else {
        toast.info('Answer evaluated. Next question loaded.', 'Answer Recorded');
        setCurrentQuestion(res.next_question);
        setQuestionIndex(res.next_question_index);
        setAnswer('');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      toast.error('Failed to evaluate answer. Please try again.', 'Submission Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load report and transition
  const loadReportAndFinish = useCallback(async (sId) => {
    setIsLoadingReport(true);
    setSessionStage('report');
    try {
      const rep = await getInterviewReport(sId);
      setReportData(rep);
    } catch (err) {
      console.error('Failed to load performance report:', err);
      toast.error('Failed to load full report. Showing session summary.', 'Report Error');
    } finally {
      setIsLoadingReport(false);
    }
  }, [toast]);

  // Timer auto expiration
  const handleAutoExpire = useCallback(async () => {
    toast.warning('Time has expired! Finalizing all interview responses.', 'Time Up');
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
  }, [sessionId, toast, loadReportAndFinish]);

  useEffect(() => {
    handleAutoExpireRef.current = handleAutoExpire;
  }, [handleAutoExpire]);

  // End Interview Early
  const handleEndEarly = async () => {
    setIsEndModalOpen(false);
    setIsSubmitting(true);
    try {
      const res = await endInterviewSession(sessionId, 'early_termination');
      toast.info('Interview concluded early. Compiling your progress report.', 'Interview Concluded');
      if (res.report) {
        setReportData(res.report);
        setSessionStage('report');
      } else {
        loadReportAndFinish(sessionId);
      }
    } catch (err) {
      console.error('Failed to end interview:', err);
      loadReportAndFinish(sessionId);
    } finally {
      setIsSubmitting(false);
    }
  };

  // View specific past report from History
  const handleViewPastReport = async (pastSessionId) => {
    setIsLoadingReport(true);
    setActiveTab('session');
    setSessionStage('report');
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

  // Text-To-Speech read question aloud
  const handleToggleSpeakQuestion = () => {
    if (!('speechSynthesis' in window)) {
      toast.info('Text-to-speech is not supported in this browser.', 'Audio Notice');
      return;
    }
    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingQuestion(true);
    }
  };

  // Voice recording & transcription
  const startVoiceRecording = async () => {
    setRecordingError(null);
    recordedTextRef.current = '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        const baseText = answer.trim() ? answer.trim() + ' ' : '';
        recognition.onresult = (event) => {
          let liveTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            liveTranscript += event.results[i][0].transcript + ' ';
          }
          recordedTextRef.current = liveTranscript.trim();
          setAnswer(baseText + liveTranscript.trim());
        };
        recognition.onerror = (e) => {
          console.warn('Speech recognition notice:', e.error);
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init error:', err);
      }
    }

    try {
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
      }
      await audioRecorderRef.current.start();
      setIsRecording(true);
      setRecordingError(null);
      setRecordingSeconds(0);
      toast.info('Microphone recording started. Speak your answer now.', 'Voice Recording');

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recorder failed to start:', err);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      setRecordingError('Microphone access was denied or not detected.');
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = async () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
      speechRecognitionRef.current = null;
    }
    if (audioRecorderRef.current) {
      try {
        const audioBlob = await audioRecorderRef.current.stop();
        if (!recordedTextRef.current && audioBlob && audioBlob.size > 0) {
          setIsTranscribing(true);
          try {
            const data = await transcribeAudio(audioBlob);
            if (data && data.transcript) {
              setAnswer(prev => prev ? `${prev.trim()} ${data.transcript}` : data.transcript);
              toast.success('Audio transcribed successfully!', 'Transcribed');
            }
          } catch (transcribeErr) {
            console.warn('Audio transcription error:', transcribeErr);
            setRecordingError('Could not transcribe audio automatically. You can edit your answer manually.');
          } finally {
            setIsTranscribing(false);
          }
        }
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
    }
  };

  // Resume Upload handler in Config Screen
  const handleUploadNewResume = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      toast.error('Only PDF and DOCX resume files are supported.', 'Invalid File');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploadingResume(true);
    try {
      const res = await uploadResumeFile(formData);
      toast.success(`${res.filename} parsed successfully with ${res.skills?.length || 0} skills!`, 'Resume Uploaded');
      await fetchOptions();
      if (res.resume_id) {
        setConfig(prev => ({ ...prev, resume_id: res.resume_id }));
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      toast.error('Failed to parse resume document.', 'Upload Error');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Open Resume Review Modal
  const handleOpenReviewResume = () => {
    const currentResume = options?.available_resumes?.find(r => r.id === config.resume_id) || options?.available_resumes?.[0];
    if (currentResume) {
      setSelectedResumeForReview(currentResume);
      setEditedResumeSkills(currentResume.skills || []);
      setIsReviewResumeModalOpen(true);
    }
  };

  // Save reviewed & corrected resume info
  const handleSaveResumeEdit = async () => {
    if (!selectedResumeForReview) return;
    setIsSavingResumeEdit(true);
    try {
      await updateResumeDetails(selectedResumeForReview.id, {
        skills: editedResumeSkills
      });
      toast.success('Extracted skills and claims updated successfully!', 'Saved');
      setIsReviewResumeModalOpen(false);
      await fetchOptions();
    } catch (err) {
      console.error('Resume update error:', err);
      toast.error('Failed to save resume updates.', 'Save Error');
    } finally {
      setIsSavingResumeEdit(false);
    }
  };

  const progressPercent = Math.min(100, Math.round(((questionIndex + 1) / Math.max(totalQuestions, 1)) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Top Main Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl shadow-2xs">
            <UserRoundCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              AI Mock Interview Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Personalized, resume-grounded mock interviews with configurable difficulty and STAR feedback.
            </p>
          </div>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('session'); if (sessionStage === 'report') setSessionStage('config'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'session'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Interview Hub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Past Reports
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERVIEW HUB (CONFIG / ACTIVE / REPORT) */}
      {/* ========================================================================= */}
      {activeTab === 'session' && (
        <>
          {/* ========================================================================= */}
          {/* STAGE 1: CONFIGURATION SCREEN */}
          {/* ========================================================================= */}
          {sessionStage === 'config' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-purple-200 border border-white/15">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>Personalized Interview Engine</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">Configure Your Practice Session</h2>
                  <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                    Select your interview format, difficulty tier, and duration. If you have an uploaded resume, the AI will probe into your actual project architecture, tech choices, and claimed internships!
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
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          1. Interview Type
                        </h3>
                        {isLoadingOptions ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" /> Synchronizing options...
                          </span>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Select the evaluation style</p>
                        )}
                      </div>
                      <Badge variant="purple" size="sm">Core Focus</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'resume', label: 'Resume-Driven', icon: FileText, desc: 'Questions strictly grounded in your actual projects & claimed skills.' },
                        { id: 'technical', label: 'Technical Systems', icon: Code2, desc: 'Deep engineering concepts, distributed systems & algorithms.' },
                        { id: 'project', label: 'Project Defense', icon: Target, desc: 'Architecture walkthrough, trade-offs, and your code contributions.' },
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
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-150 select-none ${
                              isSelected
                                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{t.label}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Option B: Difficulty Level */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          2. Difficulty Level
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Controls question complexity and evaluation rubric</p>
                      </div>
                      <Badge variant="blue" size="sm">Grading Rigor</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { 
                          id: 'beginner', 
                          label: 'Beginner', 
                          color: 'emerald',
                          desc: 'Fundamental concepts, basic project walkthroughs, straightforward problem-solving.' 
                        },
                        { 
                          id: 'intermediate', 
                          label: 'Intermediate', 
                          color: 'blue',
                          desc: 'Applied architecture, practical trade-offs, debugging, production edge-cases.' 
                        },
                        { 
                          id: 'advanced', 
                          label: 'Advanced', 
                          color: 'purple',
                          desc: 'Scalability bottlenecks, distributed systems, deep conceptual stress-testing.' 
                        }
                      ].map((d) => {
                        const isSelected = config.difficulty === d.id;
                        return (
                          <div
                            key={d.id}
                            onClick={() => setConfig(prev => ({ ...prev, difficulty: d.id }))}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 select-none ${
                              isSelected
                                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={d.color} size="sm">{d.label}</Badge>
                              {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">{d.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Option C: Duration */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          3. Interview Duration & Time Limit
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Strictly enforced server timer</p>
                      </div>
                      <Badge variant="slate" size="sm">Time Management</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { minutes: 5, tag: 'Quick', questions: '~3 Qs' },
                        { minutes: 10, tag: 'Short', questions: '~5 Qs' },
                        { minutes: 15, tag: 'Standard', questions: '~7 Qs' },
                        { minutes: 30, tag: 'Extended', questions: '~10 Qs' },
                        { minutes: 45, tag: 'Full Mock', questions: '~14 Qs' }
                      ].map((dur) => {
                        const isSelected = config.duration_minutes === dur.minutes;
                        return (
                          <button
                            key={dur.minutes}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, duration_minutes: dur.minutes }))}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                            }`}
                          >
                            <span className="block text-base font-extrabold">{dur.minutes}m</span>
                            <span className={`block text-[10px] font-semibold ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                              {dur.tag}
                            </span>
                            <span className={`block text-[10px] mt-1 ${isSelected ? 'text-purple-200' : 'text-purple-600 dark:text-purple-400'}`}>
                              {dur.questions}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                </div>

                {/* Right Col: Resume Selection, Role & Summary */}
                <div className="space-y-6">
                  
                  {/* Resume Selector & Verification */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Target Resume
                      </h3>
                      {options?.available_resumes?.length > 0 && (
                        <button
                          type="button"
                          onClick={handleOpenReviewResume}
                          className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Review Data
                        </button>
                      )}
                    </div>

                    {options?.available_resumes && options.available_resumes.length > 0 ? (
                      <div className="space-y-3">
                        <select
                          value={config.resume_id || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, resume_id: Number(e.target.value) }))}
                          className="input-field text-xs font-semibold cursor-pointer"
                        >
                          {options.available_resumes.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.filename} ({r.skills?.length || 0} skills, {r.project_count || 0} projects)
                            </option>
                          ))}
                        </select>

                        <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                            Grounding Active:
                          </span>
                          The interviewer will ask about the specific projects, architecture decisions, and technologies in this resume.
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                        No resumes uploaded yet. The interview will use the selected domain below. You can also upload a PDF or DOCX resume right now:
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
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
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
                    <label className="flex items-center gap-2 cursor-pointer mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <input
                        type="checkbox"
                        checked={config.allow_followups}
                        onChange={(e) => setConfig(prev => ({ ...prev, allow_followups: e.target.checked }))}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Enable Adaptive Follow-up Questions
                      </span>
                    </label>
                  </Card>

                  {/* Configuration Summary Card */}
                  <Card className="p-6 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
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
                        <span className="text-slate-500">Estimated Questions:</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
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
                      className="mt-5 bg-purple-600 hover:bg-purple-500"
                    >
                      Start Mock Interview
                    </Button>
                  </Card>

                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: ACTIVE INTERVIEW SCREEN */}
          {/* ========================================================================= */}
          {sessionStage === 'interviewing' && (
            <div className="space-y-6">
              
              {/* Top Countdown Bar & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <Badge variant="purple" size="md">
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
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    <Clock className={`w-4 h-4 ${remainingSeconds <= 60 ? 'text-rose-600' : 'text-purple-600 dark:text-purple-400'}`} />
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
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Warning Banner when time <= 60 seconds */}
              {remainingSeconds <= 60 && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs text-rose-900 dark:text-rose-200 animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <strong className="font-bold block">Warning: Under 1 minute remaining!</strong>
                    <span>Wrap up your response. When time expires, your completed answers will be automatically finalized and submitted for evaluation.</span>
                  </div>
                </div>
              )}

              {/* Last Evaluation Feedback Card if available */}
              {lastFeedback && (
                <div className="p-6 rounded-3xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 shadow-sm animate-fade-in space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                          Score: {lastFeedback.score} / 10
                        </span>
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 block">AI STAR Feedback</span>
                      </div>
                    </div>
                    <Badge variant="emerald" size="sm">Graded</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <strong className="text-emerald-900 dark:text-emerald-200 block mb-0.5">Key Strength:</strong>
                      <span className="text-slate-700 dark:text-slate-300">{lastFeedback.strengths}</span>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <strong className="text-amber-900 dark:text-amber-200 block mb-0.5">Improvement Area:</strong>
                      <span className="text-slate-700 dark:text-slate-300">{lastFeedback.improvements}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Question Card */}
              <Card className="p-6 sm:p-8">
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                    <MessageCircleQuestion className="w-5 h-5" />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl rounded-tl-xs p-5 flex-1 shadow-2xs relative">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Interviewer Question • Q{questionIndex + 1}
                      </span>

                      {/* Text-To-Speech Button */}
                      <button
                        type="button"
                        onClick={handleToggleSpeakQuestion}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          isSpeakingQuestion 
                            ? 'bg-purple-600 text-white animate-pulse' 
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 border border-slate-200 dark:border-slate-600'
                        }`}
                        title={isSpeakingQuestion ? 'Stop reading' : 'Read question aloud'}
                      >
                        {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeakingQuestion ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {currentQuestion}
                    </h3>
                  </div>
                </div>

                {/* Live Audio Equalizer while recording */}
                {isRecording && (
                  <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
                      </span>
                      <div className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                        <span>Streaming voice input...</span>
                        <span className="font-mono text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
                          {formatTimer(recordingSeconds)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={stopVoiceRecording}
                      icon={Square}
                    >
                      Done Speaking
                    </Button>
                  </div>
                )}

                {isTranscribing && (
                  <div className="mb-4 p-3.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-3 animate-fade-in">
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                    <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                      Transcribing audio with Whisper AI...
                    </span>
                  </div>
                )}

                {recordingError && (
                  <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{recordingError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecordingError(null)}
                      className="font-bold underline hover:no-underline shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Answer Input Textarea */}
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div className="relative">
                    <textarea
                      className="input-field min-h-[170px] resize-y p-4 text-xs sm:text-sm leading-relaxed"
                      placeholder="Use the STAR method: Situation (context), Task (engineering goal), Action (technical decisions/algorithms/code), and Result (metrics and measurable outcome)... Type or click Voice Dictate to speak."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={isSubmitting || isTranscribing}
                    />

                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        disabled={isSubmitting || isTranscribing}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                          isRecording 
                            ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                            : 'bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isRecording ? 'Stop Recording' : 'Voice Dictate'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-slate-400 font-medium">
                      <span>Word count: {answer.trim() ? answer.trim().split(/\s+/).length : 0} words</span>
                    </div>

                    <Button 
                      type="submit" 
                      variant="primary"
                      size="md"
                      disabled={isSubmitting || isTranscribing || !answer.trim()}
                      isLoading={isSubmitting}
                      loadingText="Evaluating response..."
                      iconRight={Send}
                      className="bg-purple-600 hover:bg-purple-500"
                    >
                      Submit Answer
                    </Button>
                  </div>
                </form>

                {/* Expandable STAR Framework Tips Accordion */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowStarTips(!showStarTips)}
                    className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      STAR Technique Cheat Sheet: How to score 9.0+ on questions
                    </span>
                    {showStarTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showStarTips && (
                    <div className="mt-3 p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 animate-fade-in">
                      <div>
                        <strong className="text-purple-900 dark:text-purple-200 block font-bold mb-0.5">S - Situation:</strong>
                        Set the technical context, scale, and problem constraints concisely.
                      </div>
                      <div>
                        <strong className="text-purple-900 dark:text-purple-200 block font-bold mb-0.5">T - Task:</strong>
                        State your personal engineering objective or deliverable clearly.
                      </div>
                      <div>
                        <strong className="text-purple-900 dark:text-purple-200 block font-bold mb-0.5">A - Action:</strong>
                        Describe the exact frameworks, algorithms, data models, or code you implemented.
                      </div>
                      <div>
                        <strong className="text-purple-900 dark:text-purple-200 block font-bold mb-0.5">R - Result:</strong>
                        Highlight quantifiable outcomes (% reduction in latency, bug rate, business impact).
                      </div>
                    </div>
                  )}
                </div>

              </Card>

              {/* Questions Completed Timeline */}
              {interviewHistory.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    Answers Evaluated So Far
                  </h3>
                  <div className="space-y-2">
                    {interviewHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate mr-3">
                          Q{item.qIndex}: {item.question}
                        </span>
                        <Badge variant={item.score >= 8.0 ? 'emerald' : item.score >= 6.5 ? 'blue' : 'amber'} size="sm">
                          {item.score}/10
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: DETAILED PERFORMANCE REPORT SCREEN */}
          {/* ========================================================================= */}
          {sessionStage === 'report' && (
            <div className="space-y-6">
              {isLoadingReport ? (
                <Card className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Compiling Comprehensive Performance Analytics...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Analyzing answers, STAR structure, and technical depth.</p>
                </Card>
              ) : reportData ? (
                <>
                  {/* Big Hero Score Showcase Card */}
                  <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-xl">
                        <Badge variant="purple" size="md" className="bg-white/10 text-purple-200 border-white/20">
                          {reportData.difficulty?.toUpperCase()} • {reportData.interview_type?.toUpperCase()}
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-black">
                          Mock Interview Performance Report
                        </h2>
                        <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                          {reportData.technical_knowledge_assessment || 'Assessment completed.'}
                        </p>
                      </div>

                      {/* Score Circle Display */}
                      <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 flex flex-col items-center justify-center shrink-0 min-w-[170px] text-center">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                          {reportData.overall_score_10} <span className="text-2xl font-normal text-purple-300">/ 10</span>
                        </span>
                        <span className="text-xs font-bold text-purple-200 mt-1">
                          {reportData.overall_score_100}% Total Score
                        </span>
                        <div className="mt-2">
                          <Badge variant={reportData.grade_badge || 'blue'} size="sm">
                            {reportData.grade || 'Evaluated'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick KPI Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="p-4 text-center">
                      <span className="text-xs text-slate-400 block mb-1">Questions Attempted</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {reportData.questions_attempted} / {reportData.total_questions_configured}
                      </span>
                    </Card>

                    <Card className="p-4 text-center">
                      <span className="text-xs text-slate-400 block mb-1">Average Answer Score</span>
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {reportData.average_answer_score} / 10
                      </span>
                    </Card>

                    <Card className="p-4 text-center">
                      <span className="text-xs text-slate-400 block mb-1">Time Invested</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {formatTimer(reportData.total_time_spent_seconds || 0)}
                      </span>
                    </Card>

                    <Card className="p-4 text-center">
                      <span className="text-xs text-slate-400 block mb-1">Historical Comparison</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {reportData.historical_comparison?.score_change || 'Baseline'}
                      </span>
                    </Card>
                  </div>

                  {/* Performance by Topic Breakdown */}
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      Topic & Domain Mastery Breakdown
                    </h3>
                    <div className="space-y-3">
                      {(reportData.performance_by_topic || []).map((t, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-300">{t.topic}</span>
                            <span className="text-purple-600 dark:text-purple-400">{t.score} / 10</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, t.score * 10)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Key Strengths & Areas to Improve */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-6">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Identified Key Strengths
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {(reportData.key_strengths || []).map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        Areas For Improvement
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {(reportData.areas_for_improvement || []).map((w, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Question-By-Question Detailed Review */}
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      Question-By-Question Analysis & Ideal Answers
                    </h3>

                    <div className="space-y-4">
                      {(reportData.question_reviews || []).map((qItem, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              Question #{idx + 1}: {qItem.question_text}
                            </span>
                            <Badge variant={qItem.score_10 >= 8.0 ? 'emerald' : qItem.score_10 >= 6.5 ? 'blue' : 'amber'} size="sm">
                              {qItem.score_10 || 0} / 10
                            </Badge>
                          </div>

                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-slate-500 block mb-1">Your Answer:</span>
                            <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
                              {qItem.user_answer || '(Unanswered)'}
                            </p>
                          </div>

                          {qItem.ideal_answer && (
                            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60">
                              <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Model Ideal Answer:
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {qItem.ideal_answer}
                              </p>
                            </div>
                          )}

                          {qItem.missing_concepts && (
                            <div className="text-[11px] text-amber-800 dark:text-amber-300">
                              <strong>Missing Concepts:</strong> {qItem.missing_concepts}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recommended Study Topics & Next Practice Step */}
                  <Card className="p-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                      Recommended Topics to Study Next
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(reportData.recommended_study_topics || []).map((top, idx) => (
                        <div key={idx} className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold">
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
                        className="bg-purple-600 hover:bg-purple-500"
                      >
                        Start Another Practice Session
                      </Button>
                      <Button
                        onClick={() => navigate('/dashboard')}
                        variant="secondary"
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
      {/* TAB 2: INTERVIEW HISTORY & PAST REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Completed Mock Interviews
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
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pastSessions.map((item) => (
                <div key={item.session_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 capitalize text-sm">
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
                      <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                        {item.overall_score} / 10
                      </span>
                    )}
                    <Button
                      onClick={() => handleViewPastReport(item.session_id)}
                      variant="outline"
                      size="sm"
                    >
                      View Report
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
      )}

      {/* Review & Edit Extracted Resume Modal */}
      <Modal
        isOpen={isReviewResumeModalOpen}
        onClose={() => setIsReviewResumeModalOpen(false)}
        title="Review & Correct Extracted Resume Information"
        description="Verify that your claimed technical skills, projects, and experiences were parsed accurately before the AI interview board generates questions."
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
              Extracted Technical Skills & Competencies:
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Add or remove skills to ensure the interviewer asks about your true proficiencies.
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
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
        description="Are you sure you want to end this interview session? Your answered questions will be evaluated and compiled into your final performance report."
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
