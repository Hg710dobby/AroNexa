import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://aronexa.onrender.com";

console.log("API URL:", API_BASE_URL);
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateLocation: (lat, lng) => api.post(`/users/location?latitude=${lat}&longitude=${lng}`),
};

// Triage APIs
export const triageAPI = {
  textTriage: (data) => api.post('/triage/text', data),
  voiceTriage: (data) => {
    const formData = new FormData();
    formData.append('symptoms_text', data.symptoms_text);
    formData.append('language', data.language || 'english');
    if (data.latitude) formData.append('latitude', data.latitude);
    if (data.longitude) formData.append('longitude', data.longitude);
    return api.post('/triage/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getHistory: () => api.get('/triage/history'),
  getDetail: (id) => api.get(`/triage/history/${id}`),
};

// Hospital APIs
export const hospitalAPI = {
  getNearby: (lat, lng, radius = 500) =>
    api.get(`/hospitals/nearby?latitude=${lat}&longitude=${lng}&radius_km=${radius}`),
  getById: (id) => api.get(`/hospitals/${id}`),
  seedHospitals: () => api.post('/hospitals/seed'),
};

// Medicine APIs
export const medicineAPI = {
  getRecommendations: (condition) => api.get(`/medicines/recommend?condition=${condition}`),
  getInfo: (name) => api.get(`/medicines/info/${name}`),
  checkInteractions: (med1, med2) =>
    api.get(`/medicines/interactions?medicine1=${med1}&medicine2=${med2}`),
};

// Report APIs
export const reportAPI = {
  upload: (file, documentType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    return api.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get('/reports/'),
  getById: (id) => api.get(`/reports/${id}`),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getTriageTrends: () => api.get('/admin/triage-trends'),
  getPatients: (skip = 0, limit = 50) =>
    api.get(`/admin/patients?skip=${skip}&limit=${limit}`),
  getPatientDetail: (id) =>
    api.get(`/admin/patients/${id}`),
  getVillageStats: () =>
    api.get('/admin/village-stats'),

  // 👇 NEW API
  getEmergency: () =>
    api.get('/admin/emergency'),
  updateFollowup: (id, status) =>
  api.put(`/admin/patients/${id}/followup?status=${status}`),
};
export default api;