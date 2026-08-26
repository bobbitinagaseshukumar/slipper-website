import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://slipper-website.onrender.com/api'
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aurasole_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract response data and normalize error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong. Please check your internet connection.',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };

    // If 401 Unauthorized, notify or clear session if necessary
    if (customError.status === 401) {
      localStorage.removeItem('aurasole_token');
      if (customError.message && (customError.message.includes('expired') || customError.message.includes('logged out') || customError.message.includes('inactivity'))) {
        sessionStorage.setItem('aurasole_session_expired_msg', customError.message);
      }
      if (window.location.pathname.startsWith('/account')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
