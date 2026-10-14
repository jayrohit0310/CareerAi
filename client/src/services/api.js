import axios from 'axios';

// Default to 8000 (standard local uvicorn port) with fallback support for 8080 (Docker port)
const DEFAULT_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: DEFAULT_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic port fallback interceptor:
// If request to port 8000 fails due to network error, retry once on port 8080, and vice versa.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest && !error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      const currentUrl = api.defaults.baseURL || DEFAULT_URL;

      let alternateUrl = null;
      if (currentUrl.includes(':8000')) {
        alternateUrl = currentUrl.replace(':8000', ':8080');
      } else if (currentUrl.includes(':8080')) {
        alternateUrl = currentUrl.replace(':8080', ':8000');
      }

      if (alternateUrl && alternateUrl !== currentUrl) {
        try {
          api.defaults.baseURL = alternateUrl;
          originalRequest.baseURL = alternateUrl;
          return await api(originalRequest);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (err, defaultMsg = 'An unexpected error occurred') => {
  if (!err) return defaultMsg;
  if (!err.response) {
    return 'Unable to connect to the backend server. Please verify that the backend is running.';
  }
  const detail = err.response.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(', ');
  }
  if (detail && typeof detail === 'object') {
    return detail.message || JSON.stringify(detail);
  }
  return defaultMsg;
};

export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};

export const signup = async (email, password) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateSkills = async (skills) => {
  const response = await api.put('/auth/skills', { skills });
  return response.data;
};

// --- New Pipeline Endpoints ---

export const getCareerMatches = async () => {
  const response = await api.get('/career/matches');
  return response.data;
};

export const getSalaryEstimate = async (role, experienceYears) => {
  const params = {};
  if (role) params.role = role;
  if (experienceYears !== undefined && experienceYears !== null) {
    params.experience_years = experienceYears;
  }
  const response = await api.get('/salary/estimate', { params });
  return response.data;
};

export const startInterview = async (config = {}) => {
  const payload = {
    resume_id: config.resume_id || null,
    interview_type: config.interview_type || 'resume',
    difficulty: config.difficulty || 'intermediate',
    duration_minutes: config.duration_minutes || 15,
    role_domain: config.role_domain || 'Full-Stack Software Engineering',
    allow_followups: config.allow_followups !== false
  };
  const response = await api.post('/interview/start', payload);
  return response.data;
};

export const submitInterviewAnswer = async (sessionId, questionIndex, answerText) => {
  const response = await api.post('/interview/submit-answer', {
    session_id: sessionId,
    question_index: questionIndex !== undefined ? questionIndex : 0,
    answer_text: answerText
  });
  return response.data;
};

export const getInterviewOptions = async () => {
  const response = await api.get('/interview/options');
  return response.data;
};

export const getSessionState = async (sessionId) => {
  const response = await api.get(`/interview/session/${sessionId}`);
  return response.data;
};

export const endInterviewSession = async (sessionId, reason = 'completed') => {
  const response = await api.post('/interview/end-session', {
    session_id: sessionId,
    reason: reason
  });
  return response.data;
};

export const getInterviewReport = async (sessionId) => {
  const response = await api.get(`/interview/report/${sessionId}`);
  return response.data;
};

export const getInterviewHistory = async () => {
  const response = await api.get('/interview/history');
  return response.data;
};

export const getInterviewAnalytics = async () => {
  const response = await api.get('/interview/analytics');
  return response.data;
};

// Resume management & review endpoints
export const uploadResumeFile = async (formData) => {
  const response = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getResumesList = async () => {
  const response = await api.get('/resume/list');
  return response.data;
};

export const getResumeDetails = async (resumeId) => {
  const response = await api.get(`/resume/${resumeId}`);
  return response.data;
};

export const updateResumeDetails = async (resumeId, updatedData) => {
  const response = await api.put(`/resume/${resumeId}`, updatedData);
  return response.data;
};

export const sendChatMessage = async (message) => {
  const response = await api.post('/chatbot/message', {
    message: message
  });
  return response.data;
};

export const getCourseRecommendations = async () => {
  const response = await api.get('/course/recommendations');
  return response.data;
};

export const getJobRecommendations = async (opportunityType = 'all') => {
  const params = {};
  if (opportunityType && opportunityType !== 'all') {
    params.opportunity_type = opportunityType;
  }
  const response = await api.get('/jobs/recommendations', { params });
  return response.data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'interview_answer.webm');
  const response = await api.post('/interview/transcribe-audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
