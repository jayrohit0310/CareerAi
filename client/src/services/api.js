import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// --- New Pipeline Endpoints ---

export const getCareerMatches = async () => {
  const response = await api.get('/career/matches');
  return response.data;
};

export const getSalaryEstimate = async () => {
  const response = await api.get('/salary/estimate');
  return response.data;
};

export const startInterview = async () => {
  const response = await api.post('/interview/start');
  return response.data;
};

export const submitInterviewAnswer = async (sessionId, answerText) => {
  const response = await api.post('/interview/submit-answer', {
    session_id: sessionId,
    answer_text: answerText
  });
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

export const getJobRecommendations = async () => {
  const response = await api.get('/jobs/recommendations');
  return response.data;
};
