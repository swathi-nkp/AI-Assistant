import axios from 'axios';

// Base backend URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('study_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired token / unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear invalid token
      localStorage.removeItem('study_token');
      localStorage.removeItem('study_user');
    }
    return Promise.reject(error);
  }
);

// 1. Auth API
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
};

// 2. Chat API
export const chatAPI = {
  getMode: () => API.get('/chats/mode'),
  getChats: () => API.get('/chats'),
  getChatById: (id) => API.get(`/chats/${id}`),
  createChat: (data) => API.post('/chats', data),
  addMessage: (id, data) => API.post(`/chats/${id}/messages`, data),
  deleteChat: (id) => API.delete(`/chats/${id}`),
};

// 3. Note Summarizer API
export const summaryAPI = {
  getSummaries: () => API.get('/summaries'),
  getSummaryById: (id) => API.get(`/summaries/${id}`),
  createSummary: (data) => API.post('/summaries', data),
  deleteSummary: (id) => API.delete(`/summaries/${id}`),
};

// 4. Quiz Generator API
export const quizAPI = {
  getQuizzes: () => API.get('/quizzes'),
  getQuizById: (id) => API.get(`/quizzes/${id}`),
  generateQuiz: (data) => API.post('/quizzes/generate', data),
  saveScore: (id, data) => API.put(`/quizzes/${id}/score`, data),
  deleteQuiz: (id) => API.delete(`/quizzes/${id}`),
};

// 5. User Profile API
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  updatePassword: (data) => API.put('/users/password', data),
};

export default API;
